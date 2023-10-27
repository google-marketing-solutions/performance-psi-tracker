/**
 * Add a toast on the bottom right corner indicating status
 */
function toast(title="Message", description="Description"){
  SpreadsheetApp.getActive().toast(description, title, -1);
}


/**
 * Dummy function to be able to click the Initialize button (UX feedback that having to double click to activate the features is suboptimal)
 */
function initialise(){
  toast("Initialised","Done")
}

/**
 * Sets the trigger to run the tracker every day.
 *
 */
function setDailyTrigger() {
  deleteTriggers('callPSIAPI');
  const triggerId = PropertiesService.getDocumentProperties().getProperty('triggerId');
  if (!triggerId) {
    const trigger = ScriptApp.newTrigger('callPSIAPI')
                        .timeBased()
                        .everyDays(1)
                        .create();
    PropertiesService.getDocumentProperties().setProperty(
        'triggerId', trigger.getUniqueId());
  }
  toast("Trigger","Done")
}



/**
 * Sets the trigger to run the CrUX API every day.
 *
 */
function setCrUXDailyTrigger() {
  deleteTriggers('callCrUX');
  const triggerId = PropertiesService.getDocumentProperties().getProperty('triggerId');
  if (!triggerId) {
    const trigger = ScriptApp.newTrigger('callCrUX')
                        .timeBased()
                        .everyDays(1)
                        .create();
    PropertiesService.getDocumentProperties().setProperty(
        'triggerId', trigger.getUniqueId());
  }
  toast("Trigger","Done")
}


/**
 * Builds the main menu when opening the spreadsheet.
 *
 * The entry to set the daily trigger is needed, as the permissions aren't
 * ready to set a trigger directly in the onOpen event.
 */
function onOpen() {
  const menuEntries = [
    {
      name: 'Authorize script',
      functionName: 'initialise',
    },
    {
      name: 'Call PSI API',
      functionName: 'callPSIAPI',
    },
    {
      name: 'Set daily trigger',
      functionName: 'setDailyTrigger',
    },
    {
      name: 'Run CrUX History',
      functionName: 'callCrUXHistory',
    },
    {
      name: 'Call PSI/Screenshots',
      functionName: 'callPSIAPIWithScreenshots',
    }
  ];
  SpreadsheetApp.getActive().addMenu('PSI Tracker', menuEntries);
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
 * Remove Batch Triggers
 */
function removeBatchTriggers(){
  deleteTriggers('runBatch');
  deleteTriggers('runBatchPSI');
  deleteTriggers('runBatchPSIWithScreenshots');
  deleteTriggers('runBatchCrUXHistory');
  deleteTriggers('runBatchCrUX');
}


/**
 * Get a simple value for tests
 */
function quickTestForValue(){
  Logger.log(SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config").getRange("B26").getValue())
}



/**
 * Resets the Spreadsheet to default values
 */
function resetURLsToDefault(){
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config").getRange("D2:I").deleteCells(SpreadsheetApp.Dimension.ROWS)
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config").getRange("D2:H7").setValues(SpreadsheetApp.getActiveSpreadsheet().getSheetByName("web.dev Websites").getRange("A2:E7").getValues());
}

/**
 * Delete all the data in Results tab
 */
function deleteData(){
  // // Results
  // let last_row = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Results").getLastRow();
  // SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Results").deleteRows(3,last_row+1-3)
  // // Screenshots
  // last_row = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Screenshots").getLastRow();
  // SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Screenshots").deleteRows(3,last_row+1-3)

  let sheets = ["Results", "Screenshots", "Debug", "Accessibility", "Green Domains (GWF)", "Sustainability"]
  for(let i = 0; i < sheets.length; i++){
    let sheet_name = sheets[i]
    let last_row = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_name).getLastRow();
    if(last_row >= 5){
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_name).deleteRows(3,last_row+1-3)
    }
  }

}

/**
 * Helper to understand the time it takes the Spreadsheet to flush
 */
function timePerformance() {
  var startTime = new Date();
  // Trigger a change in the sheet, for example, write to a cell
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Results').getRange('G2').setValue(Math.random());
  SpreadsheetApp.flush(); // Apply all pending changes immediately
  var endTime = new Date();
  
  var executionTime = endTime - startTime;
  Logger.log("Execution Time: " + executionTime + " ms");
  toast("Execution Time: " + executionTime + " ms");
}



/**
 * Show an alert that we will call a 3P if the API is Green Domains
 */
function showAlertCallGWF() {
  var ui = SpreadsheetApp.getUi(); // Same variations.
  var result = ui.alert(
     'Please confirm',
     "Carbon's usage will be done through the use of services such as the Green Web Foundation’s Green Web Dataset. Those calls will send queries to The Green Web Foundation's dataset of green domains containing the information in this spreadsheet. Check https://developers.thegreenwebfoundation.org/api/greencheck/v3/check-single-domain/ for details. Do you still want to proceed?",
      ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (result == ui.Button.YES) {
    // User clicked "Yes".
    // ui.alert('Confirmation received.'); 
    return false;
  } else {
    // User clicked "No" or X in the title bar.
    ui.alert('Permission denied. Aborting'); 
    return true;
  }
}



/**
 * Show an alert that we will call a 3P if the API is Green Domains
 */
function showAlertSustainability() {
  var ui = SpreadsheetApp.getUi(); // Same variations.
  var result = ui.alert(
     'Please confirm',
     "Carbon's usage will be done through the use of services such as CO2.js. This action will run the different models in CO2.js taking into account the results of PSI Tracker. Please run Green Domains API first otherwise the model will assume that the domains are not green hosted. Do you want to continue?",
      ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (result == ui.Button.YES) {
    // User clicked "Yes".
    // ui.alert('Confirmation received.'); 
    return false;
  } else {
    // User clicked "No" or X in the title bar.
    ui.alert('Permission denied. Aborting'); 
    return true;
  }
}







