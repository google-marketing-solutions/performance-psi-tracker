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
 * @fileoverview Manages sending email alerts for exceeded tracked budgets
 */

/**
 * @typedef {{label: string, url: string, budgets: !Array<{budgetLabel: string,
*     budgetDiff: number}>}}
*/
let BudgetReport;

/**
* Matches possible metric budget names to alert to their corresponding column
* in A1 Notation on the Results Sheet.
* @dict
*/
const BUDGET_DIFF_MATRIX = {
 'LH Performance Budget': 'G',
 'LH Accessibility Budget': 'J',
 'LH Best Practices Budget': 'M',
 'LH PWA Budget': 'P',
 'LH SEO Budget': 'S',
 'LH TTFB Budget': 'V',
 'LH FCP': 'Y',
 'LH Speed Index Budget': 'AB',
 'LH LCP Budget': 'AE',
 'LH TTI Budget': 'AH',
 'LH TBT Budget': 'AK',
 'LH CLS Budget': 'AN',
 'LH TTFB Budget': 'AQ',
 'LH Size Budget': 'AQ',
 'LH Script Budget': 'AU',
 'LH Image Budget': 'AY',
 'LH Stylesheet Budget': 'BC',
 'LH Document Budget': 'BG',
 'LH Font Budget': 'BK',
 'LH Other Budget': 'BO',
 'LH Media Budget': 'BS',
 'LH Third-party Budget': 'BW',
 'CrUX FCP Budget': 'CC',
 'CrUX LCP Budget': 'CJ',
 'CrUX FID Budget': 'CQ',
 'CrUX INP Budget': 'CX',
 'CrUX CLS Budget': 'DE',
 'CrUX TTFB Budget': 'DL',
};

/**
* Retrieves the user list from the spreadsheet and filters those users that are
* currently not active for the alerts, or that have no email information.
*
* @return {!Array<string>} Array of emails addresses from active users.
*/
function getActiveUserEmails() {
 const alertsSheet = SpreadsheetApp.getActive().getSheetByName(ALERTS_TAB);
 const emailsRange = `A2:B${alertsSheet.getLastRow()}`;
 const emailsValues = /** @type {!Array<string>} */ (
     alertsSheet.getRange(emailsRange).getValues());
 const emails = emailsValues.filter((row) => `${row[0]}`.trim() && row[1])
                    .flatMap((row) => row[0]);
 return emails;
}

/**
* Generates the body of the email to be sent as an alert, based on the existing
* budgets that have been exceeded. It currently only communicates the values of
* the collected budgets into the report.
*
* @param {!Array<!BudgetReport>} exceededBudgetReports Array of reports on URLs
*     that had an exceeded budget out of the latest results from the PSI
*     tracker to be included on an email alert.
* @return {string} Message to be sent by the email alert service.
*/
function generateAlertMessage(exceededBudgetReports) {
 let message = 'The following budgets have been exceeded:\n\n';
 for (const exceededBudgetReport of exceededBudgetReports) {
   message += `Label: ${exceededBudgetReport.label}\n`;
   message += `URL: ${exceededBudgetReport.url}\n`;
   for (const exceededBudget of exceededBudgetReport.budgets) {
     message += `    - Budget: ${exceededBudget.budgetLabel}, Diff: ${
         exceededBudget.budgetDiff}\n\n`;
   }
 }
 return message;
}

/**
* Helper function to email a given address. The subject is pre-defined as per
* the constant 'subject', and only modifiable here until more personalisation
* is implemented.
*
* @param {string} email Email addresss to notify.
* @param {string} message Body of the email notification to send.
*/
function sendEmailAlert(email, message) {
 if (!email || !message) return;
 const subject =
     'PSI Performance Tracker: Some of your PSI budgets have been exceeded.';
 MailApp.sendEmail(email, subject, message);
}

/**
* Sends email alerts to active users depending on whether there have been PSI
* performance budgets exceeded on last check in the active spreadsheet.
*/
function alertUsers() {
 const exceededBudgets = checkBudgets();
 if (!exceededBudgets.length) return;
 const emails = getActiveUserEmails();
 const message = generateAlertMessage(exceededBudgets);
 for (const email of emails) {
   sendEmailAlert(email, message);
 }
}

/**
* Returns an array of budget metric names that are subject to a budget alert
* based on their active status on the spreadsheet. This array can be empty.
*
* @return {!Array<string>} Array of metric names that have an active budget.
*/
function getActiveBudgets() {
 const alertsSheet = SpreadsheetApp.getActive().getSheetByName(ALERTS_TAB);
 const activeBudgetsRange = `D2:E${alertsSheet.getLastRow()}`;
 const activeBudgetsValues =
     /** @type {!Array<string>} */ (
         alertsSheet.getRange(activeBudgetsRange).getValues());
 const metrics = activeBudgetsValues.filter((row) => row[0] && row[1])
                     .flatMap((row) => row[0]);
 return metrics;
}

/**
* Builds an array of exceeded budgets based on the metrics that have an active
* budget  and the latest results collected on the spreadsheet. This report
* includes a subset of the row that has exceeded the set budget: the label,
* URL, and an array of 'budget' objects containing the name of the metric
* exceeded and the difference. These budgets are only included if the
* difference between the budget and the measurement is negative or zero, and no
* budget reports will be added to the final array if there are no budget
* differences to report. As a note, registered in bug b/233459462 currently the
* creation of results is incorrect for budgets that would expect results to be
* higher than the actual number.
*
* @return {!Array<!BudgetReport>} budgetReports Array of reports on URLs that
*     had an exceeded budget out of the latest results from the PSI tracker to
*     be included on an email alert.
*/
function checkBudgets() {
 const activeBudgets = getActiveBudgets();
 const latestResults = getLatestResults();
 const budgetReports = [];
 for (const result of latestResults) {
   const /** !BudgetReport */ budgetReport = {
     label: '',
     url: '',
     budgets: [],
   };
   for (const budgetLabel of activeBudgets) {
     const columnIndex = letterToColumnIndex(BUDGET_DIFF_MATRIX[budgetLabel]);
     const budgetDiff = parseFloat(result[columnIndex - 1]);
     if (budgetDiff >= 0) continue;
     budgetReport.budgets.push(
         {budgetLabel: budgetLabel, budgetDiff: budgetDiff});
   }
   if (!budgetReport.budgets.length) continue;
   budgetReport.label = `${result[1]}`;
   budgetReport.url = `${result[0]}`;
   budgetReports.push(budgetReport);
 }
 return budgetReports;
}

/**
* Returns the latest set of results based on URL.
*
* Retrieves in reverse chronological order order each row of results (starting
* indices for getRange start at 1) and adds them to an array of latest results
* until it finds a duplicate.
*
* It assumes that each URL will be unique per test iteration, using an array to
* track whether a result has been processed or not. If it finds a label that
* existed previously, it considers the result retrieval process as complete and
* stops processing.
*
* The resulting array cannot be null, but it can be empty.
*
* @return {!Array<!Array<number|string>>} Array containing the rows with the
*     latest results for each url as stored in the spreadsheet.
*/
function getLatestResults() {
 const resultsSheet = SpreadsheetApp.getActive().getSheetByName(RESULTS_TAB);
 const lastRow = resultsSheet.getLastRow();
 const lastColumn = resultsSheet.getLastColumn();
 const results = [];
 const includedResults = [];
 for (let currentRow = lastRow; currentRow > 0; currentRow--) {
   const result =
       resultsSheet.getRange(currentRow, 1, 1, lastColumn).getValues();
   const resultUrl = result[0][0];
   if (includedResults.includes(resultUrl)) break;
   results.push(result[0]);
   includedResults.push(resultUrl);
 }
 return results;
}
