/**
 * @copyright 2023 Google LLC
 *
 * @fileoverview Helper functions used by the PSI Tracker
 *
 * @license
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
 * Show a confirmation modal indicating that we will call the Green Web Foundation's API.
 * User can Proceed "YES" or Abort "NO" when asked if they want to proceed
 *
 * @return {boolean} Whether the call should be cancelled.
 */
function showConfirmationModalCallGWF() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.alert(
    'Please confirm',
    "Carbon's usage will be done through the use of services such as the Green Web Foundation’s "
      + "Green Web Dataset. Those calls will send queries to The Green Web Foundation's dataset of "
      + "green domains containing the information in this spreadsheet. Check "
      + "https://developers.thegreenwebfoundation.org/api/greencheck/v3/check-single-domain/ for "
      + "details. Do you still want to proceed?",
    ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (result == ui.Button.YES) {
    return false;
  } else {
    ui.alert('Permission denied. Aborting');
    return true;
  }
}

/**
 * Show a confirmation modal indicating that we will make a Green Domains API call.
 *
 * @returns {boolean} Whether the call should be cancelled.
 */
function showConfirmationModalSustainability() {
  var ui = SpreadsheetApp.getUi(); // Same variations.
  var result = ui.alert(
    'Please confirm',
    "Carbon's usage will be done through the use of services such as CO2.js. This action will run "
      + "the different models in CO2.js taking into account the results of PSI Tracker. Please run "
      + "Green Domains API first otherwise the model will assume that the domains are not green "
      + "hosted. Do you want to continue?",
    ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (result == ui.Button.YES) {
    return false;
  } else {
    ui.alert('Permission denied. Aborting');
    return true;
  }
}

/**
 * Removes triggers by handler function.
 *
 * Given a function name, all triggers that execute said function when fired will be removed from
 * the AppScript project.
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
 * Remove all of the Batch Triggers that may be set by the solution.
 */
function removeBatchTriggers() {
  deleteTriggers('runBatch');
  deleteTriggers('runBatchPSI');
  deleteTriggers('runBatchPSIWithScreenshots');
  deleteTriggers('runBatchCrUXHistory');
  deleteTriggers('runBatchCrUX');
}

/**
 * Add a toast on the bottom right corner with the given title and descriptive text.
 *
 * @param {string} title The title for the toast.
 * @param {string} description The text to be used in the body of the toast.
 */
function toast(title, description) {
  SpreadsheetApp.getActive().toast(description, title, -1);
}

/**
 * Dummy function to be able to click the Initialize button.
 *
 * Just clicking the start item results in the user needing to authorize the solution and then click
 * again to actually have it start. This allows authorization before clicking start.
 */
function initialise() {
  toast("Initialized", "Done")
}

/**
 * Sets the trigger to run the tracker every day.
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
  toast("PSI Trigger", "Done")
}



/**
 * Sets the trigger to run the CrUX API every day.
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
  toast("CrUX Trigger", "Done")
}

/**
 * For test purposes, restart the spreadsheet's URL to default values
 */
function setDefaultValues() {
  // Logger.log(JSON.stringify(CONFIG_SHEET.getRange("E2:J14").getValues()));
  CONFIG_SHEET.getRange("E2:J").clearContent();
  CONFIG_SHEET.getRange("E2:J14").setValues(JSON.parse('[["Example","","","","",""],["Web.dev Domain","https://web.dev/","Mobile","Origin",true,""],["Web.dev Vitals Listing","https://web.dev/learn-web-vitals/","Mobile","URL",true,""],["Web.dev LCP info","https://web.dev/lcp/","Mobile","URL",true,""],["Web.dev FID info","https://web.dev/fid/","Desktop","URL",true,""],["Web.dev CLS info","https://web.dev/cls/","Mobile and Desktop","URL",true,""],["","","","","",""],["URLs with errors (tests)","","","","",""],["CrUX not found + LH Error","https://www.laredoute.fr/content/1-piece-3-looks--comment-adopter-la-tendance-combat-boots-/","Mobile","Origin",true,""],["Malformed URL","abc","Desktop","URL",true,""],["Missing INP in CrUX","https://www.backmarket.fr/fr-fr/l/bons-plans-galaxy-reconditionne/886af690-095c-4344-8230-2def8fb473a4","Desktop","Origin",true,""],["Google Sorry","https://www.google.com/sorry/","Desktop","Origin",true,""],["Marie Error","https://www.renefurtererusa.com/","Mobile","URL",true,""]]'));
  SpreadsheetApp.flush();
}

