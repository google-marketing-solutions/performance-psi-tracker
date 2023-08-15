// See example template https://docs.google.com/spreadsheets/d/1EzG8wBt2cYvzApEBDBkCZuXg_b9jjQdnKJXtw0-H72E/edit#gid=4
this.DEVELOPER_TOKEN = ''
this.ACCOUNTS_MATRIX = 'accountDataMatrix'
this.LANDINGS_TAB = 'Landing Pages'
this.isResumed = false

function getGoogleAdsPages() {
    this.start = Date.now()
    var startIndex = 0
    DEVELOPER_TOKEN = getDevToken()
    var accountDataSheet = getSheet(ACCOUNTS_MATRIX)
    var cidsArray;
    if (isResumed) {
        startIndex = getIndex()
        cidsArray = accountDataSheet.getDataRange().getValues()   
    } else {
        var cids = getCIDs()
        cidsArray = cids.map((cid) => {
          return cid.replaceAll('-', '')
        })
    }
    var data = getUrls(startIndex, cidsArray)
    saveToSheet(data)
}

/**
 * Reads CIDs from the Sheet.
 *
 * If no string is found in the appropriate cell, an alert is shown in the
 * sheet.
 *
 * @return {!Array<(string)>} parents Parent names array
 */
function getCIDs() {
    const sheet = getSheet(HOW_TO_TAB)
    const parentsString = /** @type {string} */ (
        sheet.getRange('A7').getValue().valueOf()
    )
    if (!parentsString.trim()) {
        SpreadsheetApp.getUi().alert('Please enter account IDs')
        throw new Error('Account IDs to query must be set to use this tool.')
    }
    var cids = parentsString.split(',')
    cids = cids.map((cid) => cid.trim())
    return cids
}

function getDevToken() {
  const sheet = getSheet(HOW_TO_TAB)
  const tokenString = /** @type {string} */ (
      sheet.getRange('A9').getValue().valueOf()
  )
  if (!tokenString.trim()) {
      SpreadsheetApp.getUi().alert('Please enter Google Ads Dev Token')
      throw new Error('Google Ads Dev Token must be set to use this tool.')
  }
  return tokenString.trim()
}

function getUrls(startIndex, cidsArray) {
  var data = new Array()
  for (i = startIndex; i < cidsArray.length; i++) {
    try {
      if (!timeLeft()) {
        console.log('Timeout soon, saving progress, index = ' + i)
        saveIndex(i)
        scheduleResume()
        return data
      }
      var cid = cidsArray[i]
      console.log(
        `${Math.round(
          (i / cidsArray.length) * 100
        )}% - Processing ${i} out of ${cidsArray.length} accounts`
      )
      var accountLPs = queryGAdsAPI(cid)
      if (accountLPs.length != 0) {
        data.push(...makeRows(accountLPs))
      }
    } catch (error) {
      console.log('cid: ' + cid + ': ' + error)
    }
  }
  return data
}

function queryGAdsAPI(exID) {
    try {
        var request = {
            // 'page_size': 5,
            query: "SELECT customer.id, campaign.id, ad_group.id, landing_page_view.resource_name, metrics.clicks, metrics.conversions, metrics.cost_micros, metrics.conversions_value, metrics.speed_score, metrics.mobile_friendly_clicks_percentage, landing_page_view.unexpanded_final_url, customer.currency_code, segments.device \
            FROM landing_page_view \
            WHERE segments.date DURING LAST_30_DAYS AND segments.device='MOBILE' \
            AND landing_page_view.unexpanded_final_url not like '%youtube.com%' \
            AND landing_page_view.unexpanded_final_url not like '%intent://%' \
            AND landing_page_view.unexpanded_final_url not like '%ios-app://%'\
            AND landing_page_view.unexpanded_final_url not like '%android-app://%' \
            AND landing_page_view.unexpanded_final_url not like '%play.google.com%'\
            AND landing_page_view.unexpanded_final_url not like '%itunes.apple.com%'\
            AND landing_page_view.unexpanded_final_url not like '%apps.apple.com%' \
            ORDER BY metrics.cost_micros DESC LIMIT 15",
            customer_id: exID,
        }
        var response = GoogleAdsApi.post(
            'https://googleads.googleapis.com/v13/customers/' +
                exID +
                '/googleAds:search',
            JSON.stringify(request)
        )
        // console.log(response.toString()) //Uncomment for debugging
    } catch (error) {
      throw new Error(error)
    }
    var result = new Array()
    response = JSON.parse(response.toString())
    if (response.results != null) {
        for (var r of response.results) {
            result.push(r)
        }
    }
    return result
}

function makeRows(accountLPs) {
  var result = new Array()
  accountLPs.forEach((page) => {
    var cleanedUrl = cleanUrl(page.landingPageView?.unexpandedFinalUrl)
    var resName = page.landingPageView.resourceName
    var parts = resName.split('/')
    var pageId = parts[parts.length - 1]
    var pageRow = [
      page.customer.id,
      page.campaign.id,
      page.adGroup.id,
      pageId,
      cleanedUrl,
      '', // reserved for origin
      new Date().toISOString().slice(0, 10),
      '', // (reserved for cost in USD)
      page.metrics.clicks,
      page.metrics.speedScore,
      page.metrics.conversions,
      page.metrics.conversionsValue,
      '', // (reserved for CVR)
      '', // (reserved for ROAS)
      '', // (reserved for CPA)
      '', // (reserved for CPC)
      page.metrics.costMicros / 1000000,
      page.customer.currencyCode,
    ]
    result.push(pageRow)
  })
  return result
}

/**
 * Cleans URLs exctracted from Google Ads API
 */
function cleanUrls() {
    const sheet = SpreadsheetApp.getActive().getSheetByName(SITES_TAB)
    var length = sheet.getDataRange().getLastRow()
    var urlsRange = sheet.getRange(2, 1, length)
    var data = urlsRange.getValues()
    data.forEach((row) => {
        row[0] = cleanUrl(row[0])
    })
    urlsRange.setValues(data)
}

function cleanUrl(urlString) {
    const regex = /{[^}]*}/g
    const noCurliesUrl = urlString.replaceAll(regex, '')
    const urlWithoutParams = noCurliesUrl.split('?')[0]
    return urlWithoutParams
}

function saveToSheet(data) {
  if (data.length === 0) {
    console.log('No data to save, exit')
    return
  }
  const sheet = getSheet(LANDINGS_TAB)
  var row = sheet.getDataRange().getLastRow() + 1
  var newRange = sheet.getRange(row, 1, data.length, data[0].length)
  newRange.setValues(data)

  // TODO: set column ID by title, until then shift as changing columns order
  var originRange = sheet.getRange(row, 6, data.length)
  var a1UrlCell = originRange.offset(0, -1).getA1Notation()
  var a1UrlColumn = a1UrlCell.replace(/[0-9]/g, '') // Extract column letter
  var formula = '=REGEXEXTRACT(' + a1UrlColumn + ',"^(https?://[^/]+)")'
  Logger.log(formula)
  originRange.setFormulaR1C1(formula)

  // TODO: set column ID by title, until then shift as changing columns order
  var costUsdRange = sheet.getRange(row, 8, data.length)
  costUsdRange.setFormulaR1C1(
    '=IF(R[0]C[10]="USD", R[0]C[9], GOOGLEFINANCE(CONCATENATE("CURRENCY:",R[0]C[10],"USD"))*R[0]C[9])'
  )
  costUsdRange.setFontFamily('Google Sans Mono')

  // TODO: set column ID by title, until then shift as changing columns order
  var calculatedFieldsRange = sheet.getRange(row, 13, data.length, 4)
  var formulas = ['=C[-2]/C[-4]', 'C[-2]/C[3]', 'C[-7]/C[-4]', 'C[-8]/C[-7]']
  var formulasGrid = new Array()
  for (i = 0; i < data.length; i++) {
    formulasGrid.push(formulas)
  }
  calculatedFieldsRange.setFormulasR1C1(formulasGrid)
  costUsdRange.setFontFamily('Google Sans Mono')
}

/**
 * Getting GoogleAdsAPI access enabled/allowed requires a few extra steps.
 * Need to create a Google Ads Developer Token for the relevant customer hierarchy.
 * Need to create a Google Cloud Platform project in google.com org.
 * Need to set up "OAuth Consent Screen" (just set name of app and set to 'Internal').
 * Need to do "Resources > Cloud Platform Project..." and update project number.
 * To share outside Google, may need to update org or OAuth Consent Screen.
 * Also, your account must have direct access to the account in question (ICS permissions do not work).
 */
var GoogleAdsApi = {
    get requestHeaders() {
        return {
            'developer-token': DEVELOPER_TOKEN,
            Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
        }
    },
    get: function (url) {
        var options = {
            headers: this.requestHeaders,
        }
        return UrlFetchApp.fetch(url, options)
    },
    post: function (url, request) {
        var options = {
            method: 'post',
            headers: this.requestHeaders,
            contentType: 'application/json',
            payload: request,
            muteHttpExceptions: true
        }
        return UrlFetchApp.fetch(url, options)
    },
}
