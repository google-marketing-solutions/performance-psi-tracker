let CRUX_HISTORY_API_ENDPOINT = "https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?";
/**
 * Create a CrUX History Request (POST) ready to be fetched
 */
function newCrUXHistoryRequest(url,device, origin){
    const CRUX_KEY = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config").getRange("B6").getValue();
    let post_request = {
      'url': CRUX_HISTORY_API_ENDPOINT + "key=" + CRUX_KEY,
      'method' : 'post',
      'payload' : {
        'formFactor': device=="MOBILE"?"PHONE":"DESKTOP",
        // 'origin': url.toString()
      },
      'muteHttpExceptions': true
    }
    if(origin == "URL"){post_request["payload"]["url"] = url.toString()}
    if(origin == "Origin"){post_request["payload"]["origin"] = url.toString()}
    return post_request
}


let CRUX_API_ENDPOINT = "https://chromeuxreport.googleapis.com/v1/records:queryRecord?";
/**
 * Create a CrUX Request (POST) ready to be fetched
 */
function newCrUXRequest(url,device, origin){
    const CRUX_KEY = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config").getRange("B6").getValue();
    let post_request = {
      'url': CRUX_API_ENDPOINT + "key=" + CRUX_KEY,
      'method' : 'post',
      'payload' : {
        'formFactor': device=="MOBILE"?"PHONE":"DESKTOP",
        // 'origin': url.toString()
      },
      'muteHttpExceptions': true
    }
    if(origin == "URL"){post_request["payload"]["url"] = url.toString()}
    if(origin == "Origin"){post_request["payload"]["origin"] = url.toString()}
    return post_request
}
