/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * This file is the core of the Performance PSI tracker project. This file must
 * be deployed to an appropriate Google Sheet to be used, along with the other
 * files in the project.
 */

/**
 * @typedef {{
 *            error: {message: string}} |
 *            {lighthouseResult: !Object, loadingExperience: !Object}}
 */
let PsiResult;

/**
 * Builds the main menu when opening the spreadsheet.
 *
 * The entry to set the daily trigger is needed, as the permissions aren't
 * ready to set a trigger directly in the onOpen event.
 */
function onOpen() {
  const menuEntries = [
    {
      name: 'Run tests manually',
      functionName: 'runPerfTracker',
    },
    {
      name: 'Start daily tests',
      functionName: 'setDailyTrigger',
    },
  ];
  SpreadsheetApp.getActive().addMenu('PSI Tracker', menuEntries);
}

/**
 * Sets the trigger to run the tracker every day.
 *
 */
function setDailyTrigger() {
  const triggerId =
      PropertiesService.getDocumentProperties().getProperty('triggerId');
  if (!triggerId) {
    const trigger = ScriptApp.newTrigger('runPerfTracker')
                        .timeBased()
                        .everyDays(1)
                        .create();
    PropertiesService.getDocumentProperties().setProperty(
        'triggerId', trigger.getUniqueId());
  }
}

/**
 * Reads PSI API Key from the Sheet.
 *
 * If no string is found in the appropriate cell, an alert is shown in the
 * sheet.
 *
 * @return {string} the API Key to use with PSI.
 */
function getPsiApiKey() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(HOW_TO_TAB);
  const key =
      /** @type {string} */ ((sheet.getRange('A5').getValue()).valueOf());
  if (!key.trim()) {
    SpreadsheetApp.getUi().alert('Please enter your API Key');
    throw new Error('The PSI API key must be set to use this tool.');
  }
  return key;
}
/**
 * Copies the tests tab to create the queue used in the tests.
 */
function cloneSitesSheet() {
  const activeSheet = SpreadsheetApp.getActive();
  const old = activeSheet.getSheetByName(TEMP_QUEUE_TAB);
  if (old) {
    activeSheet.deleteSheet(old);
  }
  const queue = activeSheet.getSheetByName(SITES_TAB).copyTo(activeSheet);
  queue.setName(TEMP_QUEUE_TAB);
  queue.hideSheet();
}

/**
 * Creates the timed trigger to run tests from queue.
 *
 * @param {number} seconds The number seconds after the current time to set the
 *    trigger for.
 */
function setTrigger(seconds) {
  ScriptApp.newTrigger('runBatchFromQueue')
      .timeBased()
      .after(seconds * 1000)
      .create();
}

/**
 * Removes triggers by handler function.
 *
 * Given a function name, all triggers execute said function when fired will be
 * removed from the AppScript project.
 *
 * @param {string} functionName The name of the function run by the trigger.
 */
function deleteTriggers(functionName) {
  for (const trigger of ScriptApp.getProjectTriggers() ?? []) {
    if (trigger.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(trigger);
    }
  }
}

/**
 * Triggers the tests and outputs the results to the Sheet.
 */
function runBatchFromQueue() {
  const urlSettings = getURLSettings();
  const responses = submitTests(urlSettings);
  const sheet = SpreadsheetApp.getActive().getSheetByName(RESULTS_TAB);
  const today = new Date().toISOString().slice(0, 10);
  // There should be one response for each row of urlSettings.
  for (let i = 0; i < responses.length; i++) {
    const url = urlSettings[i][0];     // A
    const label = urlSettings[i][1];   // B
    const device = urlSettings[i][2];  // C

    const budgets = createBudget(urlSettings[i]);

    const content =
        /** @type {!PsiResult} */ (JSON.parse(responses[i].getContentText()));
    if (content.error) {
      sheet.appendRow([url, label, device]);
      const note = `${content.error.message}\n\n` +
          'If this error persists, investigate the cause by running the ' +
          'URL manually via ' +
          'https://developers.google.com/speed/pagespeed/insights/';
      addNote(note, '#fdf6f6');  // light red background
    } else {
      const results = parseResults(content, budgets);
      const resultsData = [url, label, device, today, ...results.data];
      sheet.appendRow(resultsData);
      if (!results.crux_data) {
        addNote(
            'Not enough CrUX data.\n\nThe CrUX Report does not have ' +
            'enough data for this URL or domain.');
      } else if (results.origin_fallback) {
        addNote(
            'Not enough CrUX data.\n\nThe CrUX Report does not have ' +
            'enough data for this URL and it fell back to showing data ' +
            'for the origin.');
      }
    }
  }
  alertUsers();
}

/**
 * Creates a budgets map for the given row of the URL settings array.
 *
 * @param {!Array<(string | number)>} urlSettings The url settings
 *     array.
 * @return {!Map<string, !Map<string, number>>} The budget values in an object.
 */
function createBudget(urlSettings) {
  // The keys in budgets are used to index the objects returned from PSI,
  // which is why they are named as they are. The order they are defined here
  // is also the order they are inserted into the sheet, so it must not be
  // changed.
  const categories = new Map();
  categories.set('performance', urlSettings[3]);     // D
  categories.set('accessibility', urlSettings[4]);   // E
  categories.set('best-practices', urlSettings[5]);  // F
  categories.set('pwa', urlSettings[6]);             // G
  categories.set('seo', urlSettings[7]);             // H

  const audits = new Map();
  audits.set('server-response-time', urlSettings[8]);       // I
  audits.set('first-contentful-paint', urlSettings[9]);     // J
  audits.set('speed-index', urlSettings[10]);               // K
  audits.set('largest-contentful-paint', urlSettings[11]);  // L
  audits.set('interactive', urlSettings[12]);               // M
  audits.set('total-blocking-time', urlSettings[13]);       // N
  audits.set('cumulative-layout-shift', urlSettings[14]);   // O

  const assets = new Map();
  assets.set('total', urlSettings[15]);        // P
  assets.set('script', urlSettings[16]);       // Q
  assets.set('image', urlSettings[17]);        // R
  assets.set('stylesheet', urlSettings[18]);   // S
  assets.set('document', urlSettings[19]);     // T
  assets.set('font', urlSettings[20]);         // U
  assets.set('other', urlSettings[21]);        // V
  assets.set('media', urlSettings[22]);        // W
  assets.set('third-party', urlSettings[23]);  // X

  const crux = new Map();
  crux.set('FIRST_CONTENTFUL_PAINT_MS', urlSettings[24]);      // Y
  crux.set('LARGEST_CONTENTFUL_PAINT_MS', urlSettings[25]);    // Z
  crux.set('FIRST_INPUT_DELAY_MS', urlSettings[26]);           // AA
  crux.set('CUMULATIVE_LAYOUT_SHIFT_SCORE', urlSettings[27]);  // AB

  const budget = new Map();
  budget.set('categories', categories);
  budget.set('audits', audits);
  budget.set('assets', assets);
  budget.set('crux', crux);
  return budget;
}

/**
 * Reads and then deletes rows from the from queue.
 *
 * @return {!Array<!Array<(string | number)>>} An array with all the settings
 *     for each URL.
 */
function getURLSettings() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(TEMP_QUEUE_TAB);
  const lastColumn = sheet.getLastColumn() - 1;
  let lastRow = sheet.getLastRow() - 1;
  if (lastRow > TESTS_PER_BATCH) {
    lastRow = TESTS_PER_BATCH;
    setTrigger(100);
    sheet.insertRowsAfter(sheet.getMaxRows(), TESTS_PER_BATCH);
  }
  const range = sheet.getRange(2, 1, lastRow, lastColumn);
  const settings =
      /** @type {!Array<!Array<(string | number)>>} */ (range.getValues());
  sheet.deleteRows(2, lastRow);
  return settings;
}
/**
 * Builds the fetch URLs for PSI and submits them in parallel.
 *
 * The format of a request to PSI is documented here:
 * https://developers.google.com/speed/docs/insights/v5/reference/pagespeedapi/runpagespeed#request
 *
 * @param {!Array<!Array<(string | number)>>} settings The URL settings for
 *     all
 *    tests.
 * @return {!Array<!GoogleAppsScript.URL_Fetch.HTTPResponse>} All the responses
 *     from PSI.
 */
function submitTests(settings) {
  const key = getPsiApiKey();
  const categories = 'category=ACCESSIBILITY' +
      '&category=BEST_PRACTICES' +
      '&category=PERFORMANCE' +
      '&category=PWA' +
      '&category=SEO';
  const serverURLs = settings.map(
      ([url, unused, device]) => ({
        url: `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${
            categories}&strategy=${device}&url=${url}&key=${key}`,
        muteHttpExceptions: true,
      }));
  const responses = UrlFetchApp.fetchAll(serverURLs);
  return responses;
}

/**
 * Parses the response from PSI and prepares it for the sheet.
 *
 * The format of the response from PSI is documented here:
 * https://developers.google.com/speed/docs/insights/v5/reference/pagespeedapi/runpagespeed#response
 * 
 * @param {!PsiResult} content The
 *     lighthouseResult object returned from PSI to parse.
 * @param { !Map<string, !Map<string, number>> } budgets The performance budgets
 *     for the test.
 * @return {{data: !Array<number | string>, crux_data: boolean, origin_fallback:
 *     boolean}} Post-processed data as an array and flags for how the CrUX data
 *     was reported.
 */
function parseResults(content, budgets) {
  const allResults = {
    data: [],
    crux_data: false,
    origin_fallback: false,
  };
  const {lighthouseResult, loadingExperience} = content;
  const version = lighthouseResult['lighthouseVersion'];
  const categories = [];
  budgets.get('categories').forEach((budget, category) => {
    const score = lighthouseResult['categories'][category]['score'] * 100;
    categories.push(score, budget, score - budget);
  });
  const audits = [];
  budgets.get('audits').forEach((budget, audit) => {
    const metric = lighthouseResult['audits'][audit]['numericValue'];
    audits.push(metric, budget, budget - metric);
  });
  let assetsObject = {
    "total":{},
    "script":{},
    "image":{},
    "stylesheet":{},
    "document":{},
    "font":{},
    "other":{}
  }
  try{
    assetsObject["total"].transferSize = lighthouseResult["audits"]["network-requests"]["details"]["items"].reduce((a,b)=>a+b.transferSize,0)
    assetsObject["script"].transferSize = lighthouseResult["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Script").reduce((a,b)=>a+b.transferSize,0)
    assetsObject["image"].transferSize = lighthouseResult["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Image").reduce((a,b)=>a+b.transferSize,0)
    assetsObject["stylesheet"].transferSize = lighthouseResult["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Stylesheet").reduce((a,b)=>a+b.transferSize,0)
    assetsObject["document"].transferSize = lighthouseResult["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Document").reduce((a,b)=>a+b.transferSize,0)
    assetsObject["font"].transferSize = lighthouseResult["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Font").reduce((a,b)=>a+b.transferSize,0)
    assetsObject["other"].transferSize = lighthouseResult["audits"]["network-requests"]["details"]["items"]
      .filter(d=>["Document","Stylesheet","Font","Image","Script"].indexOf(d["resourceType"]) == -1)
      .reduce((a,b)=>a+b.transferSize,0)
    assetsObject["total"].requestCount = lighthouseResult["audits"]["network-requests"]["details"]["items"].length
    assetsObject["script"].requestCount = lighthouseResult["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Script").length
    assetsObject["image"].requestCount = lighthouseResult["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Image").length
    assetsObject["stylesheet"].requestCount = lighthouseResult["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Stylesheet").length
    assetsObject["document"].requestCount = lighthouseResult["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Document").length
    assetsObject["font"].requestCount = lighthouseResult["audits"]["network-requests"]["details"]["items"].filter(d=>d["resourceType"] == "Font").length
    assetsObject["other"].requestCount = lighthouseResult["audits"]["network-requests"]["details"]["items"]
      .filter(d=>["Document","Stylesheet","Font","Image","Script"].indexOf(d["resourceType"]) == -1)
      .length
  }
  catch(e){
    Logger.log('Error on parsing lighthouseResult["audits"]["network-requests"]["details"]["items"]')
  }

  const assets = [];
  budgets.get('assets').forEach((budget, assetType) => {
    try{
      const transferSize = assetsObject[assetType]['transferSize'] / 1024;
      assets.push(
          transferSize, budget, budget - transferSize,
          assetsObject[assetType]['requestCount']);
    }
    catch(e){
      assets.push("", "", "", "")
    }
  });
  const crux = [];
  if (loadingExperience['metrics']) {
    allResults.crux_data = true;
    crux.push(loadingExperience['overall_category']);
    budgets.get('crux').forEach((budget, metricName) => {
      if (loadingExperience['metrics'][metricName]) {
        const metric = loadingExperience['metrics'][metricName];
        let percentile = metric['percentile'];
        if (metricName === 'CUMULATIVE_LAYOUT_SHIFT_SCORE') {
          percentile = percentile / 100;
        }
        crux.push(
            percentile, budget, budget - percentile, metric['category'],
            metric['distributions'][0]['proportion'],
            metric['distributions'][1]['proportion'],
            metric['distributions'][2]['proportion']);
      } else {
        crux.push(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        );  // filler for the sheet if the metric isn't there
      }
    });
    // If there's insufficient field data for the page, the API responds with
    // origin-level field data and origin_fallback = true.
    if (loadingExperience['origin_fallback']) {
      allResults.origin_fallback = true;
    }
  }
  allResults.data = [...categories, ...audits, ...assets, version, ...crux];
  return allResults;
}

/**
 * Attaches an info note to the current last row of the sheet.
 *
 * @param {string} note The note to add.
 * @param {?string=} formatColor The background color of the note in rgb
 *     hex. The default null value leaves the color as is.
 */
function addNote(note, formatColor = null) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(RESULTS_TAB);
  const lastRow = sheet.getLastRow();
  sheet.getRange(`${lastRow}:${lastRow}`).setBackground(formatColor);
  sheet.getRange(`D${lastRow}`).setNote(note);
}