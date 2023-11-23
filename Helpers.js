/**
 * Add a toast on the bottom right corner indicating status
 */
function toast(title, description) {
  SpreadsheetApp.getActive().toast(description, title, -1);
}

/**
 * Shows a demo toast in the UI to demonstrate how the modal looks
 */
function toastDemo() {
  toast("Message", "Description");
}

/**
 * Dummy function to be able to click the Initialize button (UX feedback that having to double click to activate the features is suboptimal)
 */
function initialise() {
  toast("Initialised", "Done");
}

/**
 * Sets the trigger to run the tracker every day.
 *
 */
function setDailyTrigger() {
  deleteTriggers("callPSIAPI");
  const triggerId =
    PropertiesService.getDocumentProperties().getProperty("triggerId");
  if (!triggerId) {
    const trigger = ScriptApp.newTrigger("callPSIAPI")
      .timeBased()
      .everyDays(1)
      .create();
    PropertiesService.getDocumentProperties().setProperty(
      "triggerId",
      trigger.getUniqueId()
    );
  }
  toast("PSI Trigger", "Done");
}

/**
 * Sets the trigger to run the CrUX API every day.
 *
 */
function setCrUXDailyTrigger() {
  deleteTriggers("callCrUX");
  const triggerId =
    PropertiesService.getDocumentProperties().getProperty("triggerId");
  if (!triggerId) {
    const trigger = ScriptApp.newTrigger("callCrUX")
      .timeBased()
      .everyDays(1)
      .create();
    PropertiesService.getDocumentProperties().setProperty(
      "triggerId",
      trigger.getUniqueId()
    );
  }
  toast("CrUX Trigger", "Done");
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
      name: "Authorize script",
      functionName: "initialise",
    },
    {
      name: "Call PSI API",
      functionName: "callPSIAPI",
    },
    {
      name: "Set daily trigger",
      functionName: "setDailyTrigger",
    },
    {
      name: "Run CrUX History",
      functionName: "callCrUXHistory",
    },
    {
      name: "Call PSI/Screenshots",
      functionName: "callPSIAPIWithScreenshots",
    },
  ];
  SpreadsheetApp.getActive().addMenu("PSI Tracker", menuEntries);
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
function removeBatchTriggers() {
  deleteTriggers("runBatch");
  deleteTriggers("runBatchPSI");
  deleteTriggers("runBatchPSIWithScreenshots");
  deleteTriggers("runBatchCrUXHistory");
  deleteTriggers("runBatchCrUX");
}

/**
 * Get a simple value for tests
 */
function quickTestForValue() {
  Logger.log(
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName("Config")
      .getRange("B26")
      .getValue()
  );
}

/**
 * Resets the Spreadsheet to default values
 */
function resetURLsToDefault() {
  SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Config")
    .getRange("D2:I")
    .deleteCells(SpreadsheetApp.Dimension.ROWS);
  SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Config")
    .getRange("D2:H7")
    .setValues(
      SpreadsheetApp.getActiveSpreadsheet()
        .getSheetByName("web.dev Websites")
        .getRange("A2:E7")
        .getValues()
    );
}

/**
 * Delete all the data in Results tab
 */
function deleteData() {
  const sheets = [
    "Results",
    "Screenshots",
    "Debug",
    "Accessibility",
    "Green Domains (GWF)",
    "Sustainability",
  ];
  for (const sheet_name of sheets){
    const last_row = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(sheet_name)
      .getLastRow();
    if (last_row >= 5) {
      SpreadsheetApp.getActiveSpreadsheet()
        .getSheetByName(sheet_name)
        .deleteRows(3, last_row + 1 - 3);
    }
  }
}

/**
 * Show a confirmation modal indicating that we will call a 3P.
 * User can Proceed "YES" or Abord "NO" when asked if they want to proceed
 */
function showConfirmationModalCallGWF() {
  const ui = SpreadsheetApp.getUi(); // Same variations.
  const result = ui.alert(
    "Please confirm",
    "Carbon's usage will be done through the use of services such as the Green Web Foundation’s Green Web Dataset. Those calls will send queries to The Green Web Foundation's dataset of green domains containing the information in this spreadsheet. Check https://developers.thegreenwebfoundation.org/api/greencheck/v3/check-single-domain/ for details. Do you still want to proceed?",
    ui.ButtonSet.YES_NO
  );

  // Process the user's response.
  if (result === ui.Button.YES) {
    // User clicked "Yes".
    // ui.alert('Confirmation received.');
    return false;
  } else {
    // User clicked "No" or X in the title bar.
    ui.alert("Permission denied. Aborting");
    return true;
  }
}

/**
 * Show a confirmation modal indicating that we will call a 3P if the API is Green Domains
 */
function showConfirmationModalSustainability() {
  const ui = SpreadsheetApp.getUi(); // Same variations.
  const result = ui.alert(
    "Please confirm",
    "Carbon's usage will be done through the use of services such as CO2.js. This action will run the different models in CO2.js taking into account the results of PSI Tracker. Please run Green Domains API first otherwise the model will assume that the domains are not green hosted. Do you want to continue?",
    ui.ButtonSet.YES_NO
  );

  // Process the user's response.
  if (result === ui.Button.YES) {
    // User clicked "Yes".
    // ui.alert('Confirmation received.');
    return false;
  } else {
    // User clicked "No" or X in the title bar.
    ui.alert("Permission denied. Aborting");
    return true;
  }
}

/**
 * For each URLs correctly executed, remove the "Active" status, handy to perform only the URLs that failed.
 */
function uncheckDoneURLs() {
  toast(
    "Removing checks where we have a ✅ sign",
    "Removing succesful previous executions."
  );
  removeBatchTriggers();
  const sheet = CONFIG_SHEET;
  const last_row = sheet.getLastRow();
  const last_column = sheet.getLastColumn();
  const values = sheet.getRange(1, 1, last_row, last_column).getValues();
  // Go line by line of all URLs and change value and note
  for (let i = 1; i < values.length; i++) {
    const done = values[i][8];
    if (done === "✅") {
      sheet.getRange(i + 1, COLUMN_STATUS).setValue("");
    }
  }
  SpreadsheetApp.flush();
}
