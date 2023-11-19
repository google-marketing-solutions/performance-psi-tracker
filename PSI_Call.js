/**
 * Create a PSI request (GET)
 */
function newPSIRequest(url, device) {
  const PSI_KEY = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Config")
    .getRange("B6")
    .getValue();
  const PSI_API_ENDPOINT =
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?";
  let endpoint_url = PSI_API_ENDPOINT;
  endpoint_url += "key=" + PSI_KEY;
  endpoint_url +=
    "&category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=PWA&category=SEO";
  endpoint_url += "&strategy=" + device;
  endpoint_url += "&url=" + url;
  return {
    url: endpoint_url,
    muteHttpExceptions: true,
  };
}

/**
 * Showcase how the newPSIRequest function works to be tested from the Apps Script UI
 */
function newPSIRequestDemo() {
  Logger.log(newPSIRequest("http://web.dev.com", "MOBILE"));
}
