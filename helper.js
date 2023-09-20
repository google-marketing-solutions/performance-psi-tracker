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
  let last_row = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Results").getLastRow();
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Results").deleteRows(3,last_row+1-3)
  last_row = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Screenshots").getLastRow();
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Screenshots").deleteRows(3,last_row+1-3)
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









