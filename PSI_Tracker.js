/**
 * @copyright 2025 Google LLC
 *
 * @fileoverview This file is the core of the Performance PSI tracker project.
 * This file must be deployed to an appropriate Google Sheet to be used, along with the other files
 * in the project.
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

// Hard coded cells to read config values
const COLUMN_STATUS = 9; // We'll write the results (✅, ❌, ...) on the I col
const CONFIG_SAVE_SCREENSHOT_CELL = 'C18';
const CONFIG_NUMBER_URL_PER_BATCH_CELL = 'C19';
const CONFIG_EXECUTION_MODE_BOOLEAN = 'C20';
const CONFIG_TIME_BETWEEN_BATCHES_CELL = 'C21';
const CONFIG_INPUT_DATA_RANGE = 'E2:J';

// Define constants for each sheet in the spreadsheet for easy reference
const SS = SpreadsheetApp.getActiveSpreadsheet();
const SCREENSHOT_SHEET = SS.getSheetByName('Screenshots');
const FIELD_SHEET = SS.getSheetByName('Fields');
const RESULT_SHEET = SS.getSheetByName('Results');
const GREEN_DOMAIN_SHEET = SS.getSheetByName('Green Domains (GWF)');
const CONFIG_SHEET = SS.getSheetByName('Config');
const DEBUG_SHEET = SS.getSheetByName('Debug');
const ACCESSIBILITY_SHEET = SS.getSheetByName('Accessibility');
const SUSTAINABILITY_SHEET = SS.getSheetByName('Sustainability');

const RESULT_SHEET_HEADER = RESULT_SHEET.getRange('1:1').getValues()[0];
const GREEN_DOMAIN_HEADER = GREEN_DOMAIN_SHEET.getRange('1:1').getValues()[0];
const ACCESSIBILITY_SHEET_HEADER =
  ACCESSIBILITY_SHEET.getRange('1:1').getValues()[0];
const SUSTAINABILITY_SHEET_HEADER =
  SUSTAINABILITY_SHEET.getRange('1:1').getValues()[0];
const TIME_BETWEEN_BATCHES = CONFIG_SHEET.getRange(
  CONFIG_TIME_BETWEEN_BATCHES_CELL,
).getValue();
const NUMBER_OF_URLS_PER_BATCH = +CONFIG_SHEET.getRange(
  CONFIG_NUMBER_URL_PER_BATCH_CELL,
).getValue();

// Individual API call functions to perform tasks based on the type of API.
function callPSIAPI() {
  performTasks('PSI API');
}
function callCrUX() {
  performTasks('CrUX');
}
function callCrUXHistory() {
  performTasks('CrUX History');
}
function callGreenDomain() {
  performTasks('Green Domain');
}
function callAccessibility() {
  performTasks('Accessibility');
}
function callSustainability() {
  performTasks('Sustainability');
}

// Batch functions designed to be triggered at specific times or intervals for batch processing.
function runBatchPSI() {
  runBatch('PSI API');
}
function runBatchPSIWithScreenshots() {
  runBatch('PSI API', true);
}
function runBatchCrUXHistory() {
  runBatch('CrUX History');
}
function runBatchCrUX() {
  runBatch('CrUX');
}
function runBatchGreenDomain() {
  runBatch('Green Domain');
}
function runBatchAccessibility() {
  runBatch('Accessibility');
}
function runBatchSustainability() {
  runBatch('Sustainability');
}

/**
 * Main task performer for API calls. Depending on the API selected and additional settings like
 * screenshot saving, this function coordinates warnings, batch execution, and trigger setups.
 *
 * @param {string=} api - The type of API to call.
 */
function performTasks(api = 'PSI API') {
  // Confirmations for potential data collection by third parties, abort if user declines
  if (api === 'Green Domain' && showConfirmationModalCallGWF()) {
    return;
  }
  if (api === 'Sustainability' && showConfirmationModalSustainability()) {
    return;
  }

  // Provide a visual indication that initialization is happening.
  toast(
    'Initializing',
    'Removing previous executions and setting a blank state',
  );

  // Initialization, resetting the values of the sheets
  initURLStatus();

  // Get information on whether or not we should save screenshots
  const saveScreenshot = Boolean(
    CONFIG_SHEET.getRange(CONFIG_SAVE_SCREENSHOT_CELL).getValue(),
  );

  // Get information about which mode we should work on
  const executionModeBoolean = Boolean(
    CONFIG_SHEET.getRange(CONFIG_EXECUTION_MODE_BOOLEAN).getValue(),
  );
  const executionMode = executionModeBoolean ? 'TRIGGER' : 'SERIAL';

  // Run batches
  switch (executionMode) {
    // Default execution mode: queries run one after the other and might timeout
    case 'SERIAL':
      while (runBatch(api, saveScreenshot)) {}
      toast('Done', 'Finished');
      break;
    // Batch execution mode: queries run every TIME_BETWEEN_BATCHES minutes in batch
    case 'TRIGGER':
      removeBatchTriggers();
      const methodAPIMap = new Map([
        ['PSI API', 'runBatchPSI'],
        ['CrUX', 'runBatchCrUX'],
        ['CrUX History', 'runBatchCrUXHistory'],
        ['Green Domain', 'runBatchGreenDomain'],
        ['Accessibility', 'runBatchAccessibility'],
        ['Sustainability', 'runBatchSustainability'],
      ]);
      const triggerName = methodAPIMap.get(api);
      if (api === 'PSI API' && saveScreenshot === true) {
        triggerName = 'runBatchPSIWithScreenshots';
      }
      ScriptApp.newTrigger(triggerName)
        .timeBased()
        .everyMinutes(TIME_BETWEEN_BATCHES)
        .create();
      runBatch(api, saveScreenshot);
      break;
  }
}

/**
 * Initializes the URL status in the CONFIG_SHEET. This function resets URLs to "⏳". It also clears
 * any notes from previous runs and ensures that only active URLs are marked for processing.
 */
function initURLStatus() {
  removeBatchTriggers();

  const values = CONFIG_SHEET.getRange(CONFIG_INPUT_DATA_RANGE).getValues();

  for (const [index, row] of values.entries()) {
    const [, url, , , active] = row;
    const statusCell = CONFIG_SHEET.getRange(index + 2, COLUMN_STATUS + 1);
    statusCell.setValue('');
    statusCell.setNote('');

    if (!url || !active) {
      continue;
    }

    statusCell.setValue('⏳');
  }

  SpreadsheetApp.flush();
}

/**
 * Runs a batch of API calls based on the specified API type.
 * This function aggregates URLs from the CONFIG_SHEET and sends them to the appropriate API. It is
 * responsible for managing the batch process, sending requests, and handling the results.
 * The script
 *  - iterates through the provided URLs,
 *  - determines the device type,
 *  - constructs the request,
 *  - sends the batch,
 *  - and then parses the results.
 * @param {string=} api - The API type to call. Supported types are PSI, CrUX, CrUX History, Green
 *    Domain, Accessibility, and Sustainability.
 * @param {boolean=} saveScreenshot - Flag to determine if screenshots should be saved. Applicable
 *    to only PSI API.
 * @return {boolean} Indicates whether there are more URLs to process (for continuous batch
 *    processing).
 */
function runBatch(api = 'PSI API', saveScreenshot = false) {
  toast('Batch', 'Reading URLs');
  const batch = prepareBatchForProcessing();
  toast('Batch', 'Sending a batch with ' + batch.length + ' URL(s)');
  const urls = constructBatchUrls(api, batch);

  let fetch = [];
  try {
    fetch = UrlFetchApp.fetchAll(urls);
  } catch (error) {
    for (row of urls) {
      logErrorToSheet(row.id, error);
    }
  }
  toast('Received data', 'Parsing information - Check the results sheets');

  const parsedData = parseResults(fetch, batch);
  const fields = getFieldDefinitionsForAPI(api);
  const extractedData = extractData(parsedData, batch, fields, api);

  for (row of extractedData) {
    saveExtractedDataToSheet(api, row);
  }
  if (saveScreenshot) {
    saveScreenshotData(parsedData, batch);
  }

  SpreadsheetApp.flush();

  if (batch.length >= NUMBER_OF_URLS_PER_BATCH) {
    return true; // Continue with more batches.
  }

  removeBatchTriggers();
  return false;
}

/**
 * Prepares a batch of URLs for processing from the CONFIG_SHEET based on specified criteria.
 * It iterates through each configuration, filtering out inactive or irrelevant URLs, and aggregates
 * the ones marked for processing into a batch. This function aims to manage and streamline the
 * process of identifying and preparing URLs for subsequent API calls.
 *
 * @returns {!Array<!Object>} An array of objects, each containing details necessary for processing
 *    the respective URL.
 */
function prepareBatchForProcessing() {
  const values = CONFIG_SHEET.getRange(CONFIG_INPUT_DATA_RANGE).getValues();
  const batch = [];

  for (const [index, row] of values.entries()) {
    const [label, url, device, urlOrOrigin, active, status] = row;
    if (!url || !active) {
      continue;
    }

    if (status === '⏳') {
      CONFIG_SHEET.getRange(index + 2, COLUMN_STATUS + 1).setValue('🔃');

      if (
        device.toLowerCase().includes('mobile') ||
        device.toLowerCase().includes('phone')
      ) {
        batch.push({
          id: index,
          label: label,
          url: url,
          device: 'MOBILE',
          urlOrOrigin: urlOrOrigin,
        });
      }

      if (device.toLowerCase().includes('desktop')) {
        batch.push({
          id: index,
          label: label,
          url: url,
          device: 'DESKTOP',
          urlOrOrigin: urlOrOrigin,
        });
      }

      if (batch.length >= NUMBER_OF_URLS_PER_BATCH) {
        break;
      }
    }
  }

  return batch;
}

/**
 * Constructs URLs for batch processing based on the API type and details of each URL in the batch.
 * This function is central to preparing the API calls by dynamically creating the endpoint URLs
 * based on the provided API type.
 *
 * @param {string} api The API type to call. Supported types include "PSI", "CrUX",
 *    "CrUX History", "Green Domain", "Accessibility", and"Sustainability".
 * @param {!Array<!Object>} batch Details of each URL in the batch, including the URL, device, and
 *    origin. Each element in the array is an object with id, label, url, device, and origin
 *    properties.
 * @returns {!Array<!Object>} An array of URLs constructed for the batch processing. These are
 *    either the URL strings or full request objects depending on the needs of the specific API.
 */
function constructBatchUrls(api, batch) {
  let urls = [];
  switch (api) {
    case 'PSI API': // PageSpeed Insights
      urls = batch.map(d => newPSIRequest(d.url, d.device));
      break;
    case 'CrUX': // Chrome User Experience
      urls = batch.map(d => newCrUXRequest(d.url, d.device, d.urlOrOrigin));
      break;
    case 'CrUX History': // Chrome User Experience History
      urls = batch.map(d =>
        newCrUXHistoryRequest(d.url, d.device, d.urlOrOrigin),
      );
      break;
    case 'Green Domain': // Green Web Foundation's Green Domain
      urls = batch.map(d => newGWFRequest(d.url));
      break;
    case 'Accessibility': // Accessibility
      urls = batch.map(d => newPSIRequest(d.url, 'MOBILE'));
      break;
    case 'Sustainability': // Sustainability
      urls = batch.map(d => newPSIRequest(d.url, 'MOBILE'));
      break;
  }

  return urls;
}

/**
 * Retrieves the JSON results from API responses runs JSON.parse on them.
 *
 * @param {!Array<!HTTPResponse>} fetch The array of HTTP responses from the API, which includes the
 *    data to be parsed.
 * @param {!Array<!Object>} batch The batch of requests used to fetch the responses. This is only
 *    used to create error messages for requests that failed.
 * @return {!Array<!Object>} The parsed content of the responses.
 */
function parseResults(fetch, batch) {
  const parsedData = [];
  for (const [index, response] of fetch.entries()) {
    let content;
    try {
      content = JSON.parse(response.getContentText());
    } catch (e) {
      logErrorToSheet(batch[index].id, e);
      parsedData.push('No content');
      continue;
    }

    if (content.error) {
      logErrorToSheet(batch[index].id, content.error);
      parsedData.push('Content error');
      continue;
    }
    parsedData.push(content);
  }
  return parsedData;
}

/**
 * Parses results from API responses. It utilizes the FIELD_SHEET to determine which data to extract
 * and organizes the results into the respective result sheet. This function is essential for
 * converting the raw API responses into a structured format that can be used for analysis or
 * reporting.
 *
 * @param {!Array<!Object>} data The array of HTTP responses from the API, which includes the data
 *    already parsed.
 * @param {!Array<!Object>} batch The current batch of data being processed, which includes details
 *    for each URL in the batch.
 * @param {!Array<!Object>} fields The fields to extract from the response. Fields are made up of
 *    two parts - the name (name) and a JS expression (expression) that will be evaluated to extract
 *    the data.
 * @param {string} api The API type that was called. It determines how the data should be parsed and
 *    which fields are relevant.
 *
 * @return {!Array<!Object>} an array of objects used to populate the result sheets
 */
function extractData(data, batch, fields, api) {
  const extractedData = [];
  for (const [index, response] of data.entries()) {
    if (
      response === '' ||
      response === 'No content' ||
      response === 'Content error'
    ) {
      continue;
    }

    const request = batch[index];
    const newRow = {
      Date: new Date().toISOString().slice(0, 10), // Include the date when the data was processed.
      Label: request.label, // Include any label that was provided with the URL.
      URL: request.url, // The URL itself.
      Device: request.device, // The device type used for the request.
      'URL / Origin': request.urlOrOrigin, // Indicates whether URL-level or Origin-level data was requested.
      rowID: request.id, // Index of the request
    };

    fields.forEach(field => {
      try {
        // The green_domains variable is available to the user-defined expressions.
        let green_domains = [];
        if (api === 'Sustainability') {
          greenDomains = GREEN_DOMAIN_SHEET.getRange('F2:J')
            .getValues()
            .filter(d => d[4] == true)
            .map(d => d[0]);
        }
        // The response is referred to as 'content' in the user-defined expressions.
        const content = response;
        // urlOrOrigin is also made available to the user-defined expressions.
        const urlOrOrigin = request.urlOrOrigin;
        newRow[field.name] = eval(field.expression);
      } catch (e) {
        Logger.log(e);
        DEBUG_SHEET.appendRow([
          newRow['Date'],
          newRow['Label'],
          newRow['URL'],
          newRow['Device'],
          newRow['URL / Origin'],
          e,
        ]);
      }
    });

    Logger.log(newRow);
    if (api !== 'CrUX History') {
      extractedData.push(newRow);
    }
    // Specific method for CrUX History to allow for back-filling.
    else if ('Date' in newRow) {
      // We will build an new dict for each date
      for (const [index, date] of newRow['Date'].entries()) {
        const rowForCruxHistory = {};
        for (const key in newRow) {
          // The new dict is either the index-value of the arrays
          if (Array.isArray(newRow[key]) && newRow[key].length > 0) {
            rowForCruxHistory[key] = newRow[key][index];
          }
          // Or the value itself (ex: URL)
          else {
            rowForCruxHistory[key] = newRow[key];
          }
        }
        rowForCruxHistory['Date'] = date;
        extractedData.push(rowForCruxHistory);
      }
    }
  }
  return extractedData;
}

/**
 * Retrieves and formats field definitions for the specified API from the FIELD_SHEET. This includes
 * the name of each field, the method it applies to, and the expression used to extract data.
 *
 * @param {string} api The API type that was called.
 *
 * @return {!Array<!Object>} An array of field definition objects.
 */
function getFieldDefinitionsForAPI(api) {
  const range = FIELD_SHEET.getRange(1, 1, FIELD_SHEET.getLastRow(), 3);
  const values = range.getValues();

  return values
    .filter(row => row[0] === api)
    .map(row => ({
      method: row[0],
      name: row[1],
      expression: row[2],
    }));
}

/**
 * Logs an error message to the specified sheet for a particular row. This function is used for
 * tracking errors encountered during the processing of each URL in the batch.
 *
 * @param {number} rowId The row identifier where the error should be logged, corresponding to the
 *    URL's row.
 * @param {string} errorMessage The error message to be logged.
 */
function logErrorToSheet(rowId, errorMessage) {
  const cell = CONFIG_SHEET.getRange(rowId + 2, COLUMN_STATUS + 1);
  cell.setNote('Error: ' + JSON.stringify(errorMessage));
  cell.setValue('❌');
}

/**
 * Changes the status of the current row to "DONE"
 *
 * @param {number} rowId The row identifier where the error should be logged, corresponding to the
 *    URL's row.
 */
function setCompletedStatus(rowId) {
  const cell = CONFIG_SHEET.getRange(rowId + 2, COLUMN_STATUS + 1);
  cell.setNote('');
  cell.setValue('✅');
}

/**
 * Saves extracted data for a URL to the appropriate result sheet based on the API type. This
 * function is used after parsing the API response to organize and store the extracted data in a
 * structured manner.
 *
 * @param {string} api The API type that was called. It determines which result sheet to use.
 * @param {!Object} extractedData The data extracted from the API response for a single URL.
 */
function saveExtractedDataToSheet(api, extractedData) {
  const sheetMap = new Map([
    ['PSI API', {resultSheet: RESULT_SHEET, resultHeader: RESULT_SHEET_HEADER}],
    ['CrUX', {resultSheet: RESULT_SHEET, resultHeader: RESULT_SHEET_HEADER}],
    [
      'CrUX History',
      {resultSheet: RESULT_SHEET, resultHeader: RESULT_SHEET_HEADER},
    ],
    [
      'Green Domain',
      {resultSheet: GREEN_DOMAIN_SHEET, resultHeader: GREEN_DOMAIN_HEADER},
    ],
    [
      'Accessibility',
      {
        resultSheet: ACCESSIBILITY_SHEET,
        resultHeader: ACCESSIBILITY_SHEET_HEADER,
      },
    ],
    [
      'Sustainability',
      {
        resultSheet: SUSTAINABILITY_SHEET,
        resultHeader: SUSTAINABILITY_SHEET_HEADER,
      },
    ],
  ]);

  const sheetInfo = sheetMap.get(api);
  const dataRow = [];

  for (const header of sheetInfo.resultHeader) {
    if (header in extractedData) {
      dataRow.push(extractedData[header]);
    } else {
      dataRow.push('');
    }
  }

  const resultSheet = sheetInfo.resultSheet;
  resultSheet.appendRow(dataRow);
  setCompletedStatus(extractedData.rowID);
}

/**
 * Saves screenshot data provided as part of the API response. This function is used when the task
 * involves capturing screenshots, typically for visual comparison or records. The screenshot is
 * inserted directly into the sheet.
 *
 * @param {!Array<!Object>} parsedData The parsed results of the audits a screenshot should be
 *    extracted from.
 * @param {!Array<!Object>} batch The batch of audits used to create the result data.
 *
 */
function saveScreenshotData(parsedData, batch) {
  for (const [index, content] of parsedData.entries()) {
    let screenshotRow = [
      new Date().toISOString().slice(0, 16),
      batch[index].label,
      batch[index].url,
      batch[index].device,
      batch[index].urlOrOrigin,
    ];

    try {
      const finalScreenshot =
        content.lighthouseResult.audits[
          'final-screenshot'
        ].details.data.toString();
      screenshotRow.push(finalScreenshot);
    } catch (error) {
      screenshotRow.push('');
    }

    try {
      const thumbnails = content.lighthouseResult.audits[
        'screenshot-thumbnails'
      ].details.items.map(d => d.data.toString());
      screenshotRow = screenshotRow.concat(thumbnails);
    } catch (error) {
      screenshotRow.push('');
    }

    SCREENSHOT_SHEET.appendRow(screenshotRow);
  }
}
