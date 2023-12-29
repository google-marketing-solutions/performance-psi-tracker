/**
 * Copyright 2023 Google LLC
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


// Hardcoded cells to read config values
const COLUMN_STATUS = 9; // We'll write the results (✅, ❌, ...) on the I col
const CONFIG_SAVE_SCREENSHOT_CELL = "C18";
const CONFIG_NUMBER_URL_PER_BATCH_CELL = "C19";
const CONFIG_EXECUTION_MODE_BOOLEAN = "C20";
const CONFIG_TIME_BETWEEN_BATCHES_CELL = "C21";
const CONFIG_INPUT_DATA_RANGE = "E2:J";

// Define constants for each sheet in the spreadsheet for easy reference
const SS = SpreadsheetApp.getActiveSpreadsheet();
const SCREENSHOT_SHEET = SS.getSheetByName("Screenshots");
const FIELD_SHEET = SS.getSheetByName("Fields");
const RESULT_SHEET = SS.getSheetByName("Results");
const GREEN_DOMAIN_SHEET = SS.getSheetByName("Green Domains (GWF)");
const CONFIG_SHEET = SS.getSheetByName("Config");
const DEBUG_SHEET = SS.getSheetByName("Debug");
const ACCESSIBILITY_SHEET = SS.getSheetByName("Accessibility");
const SUSTAINABILITY_SHEET = SS.getSheetByName("Sustainability");

const RESULT_SHEET_HEADER = RESULT_SHEET.getRange("1:1").getValues()[0];
const GREEN_DOMAIN_HEADER = GREEN_DOMAIN_SHEET.getRange("1:1").getValues()[0];
const ACCESSIBILITY_SHEET_HEADER = ACCESSIBILITY_SHEET.getRange("1:1").getValues()[0];
const SUSTAINABILITY_SHEET_HEADER = SUSTAINABILITY_SHEET.getRange("1:1").getValues()[0];
const TIME_BETWEEN_BATCHES = CONFIG_SHEET.getRange(CONFIG_TIME_BETWEEN_BATCHES_CELL).getValue();
const NUMBER_OF_URLS_PER_BATCH = +CONFIG_SHEET.getRange(CONFIG_NUMBER_URL_PER_BATCH_CELL).getValue();

// Individual API call functions to perform tasks based on the type of API. Each function passes specific parameters to the performTasks function.
function callPSIAPI() { performTasks("PSI API") }
function callCrUX() { performTasks("CrUX") }
function callCrUXHistory() { performTasks("CrUX History") }
function callGreenDomain() { performTasks("Green Domain") }
function callAccessibility() { performTasks("Accessibility") }
function callSustainability() { performTasks("Sustainability") }

// Batch functions designed to be triggered at specific times or intervals for batch processing.
function runBatchPSI() { runBatch("PSI API") }
function runBatchPSIWithScreenshots() { runBatch("PSI API", true) }
function runBatchCrUXHistory() { runBatch("CrUX History") }
function runBatchCrUX() { runBatch("CrUX") }
function runBatchGreenDomain() { runBatch("Green Domain") }
function runBatchAccessibility() { runBatch("Accessibility") }
function runBatchSustainability() { runBatch("Sustainability") }

/**
 * Main task performer for API calls. Depending on the API selected and additional settings like screenshot saving, 
 * this function coordinates warnings, batch execution, and trigger setups.
 * @param {string} api - The type of API to call.
 * @param {boolean} save_screenshot - Indicates whether to save screenshots (specific to certain APIs).
 */
function performTasks(api = "PSI API") {
  // Confirmations for potential data collection by third parties, abort if user declines
  if (api === "Green Domain" && showConfirmationModalCallGWF()) { return; }
  if (api === "Sustainability" && showConfirmationModalSustainability()) { return; }

  // Provide a visual indication that initialization is happening. This is part of user feedback.
  toast("Initializing", "Removing previous executions and setting a blank state");

  // Initialization, reseting the values of the sheets
  initURLStatus();

  // Get information on whether or not we should save screenshots
  const save_screenshot = Boolean(
    CONFIG_SHEET.getRange(CONFIG_SAVE_SCREENSHOT_CELL).getValue()
  );

  // Get information about which mode we should work on
  const execution_mode_boolean = Boolean(
    CONFIG_SHEET.getRange(CONFIG_EXECUTION_MODE_BOOLEAN).getValue()
  );
  const execution_mode = execution_mode_boolean ? "TRIGGER" : "SERIAL";

  // Run batches
  switch (execution_mode) {
    // Default execution mode: queries run one after the other and might timeout
    case "SERIAL":
      while (runBatch(api, save_screenshot)) { }
      toast("Done", "Finished");
      break;
    // Batch execution mode: queries run every TIME_BETWEEN_BATCHES minutes in batch
    case "TRIGGER":
      removeBatchTriggers();
      const methodAPIMap = new Map([
        ["PSI API", "runBatchPSI"]
        ["CrUX", "runBatchCrUX"]
        ["CrUX History", "runBatchCrUXHistory"]
        ["Green Domain", "runBatchGreenDomain"]
        ["Accessibility", "runBatchAccessibility"]
        ["Sustainability", "runBatchSustainability"]
      ]);
      const triggerName = methodAPIMap.get(api);
      if (api === "PSI API" && save_screenshot === true) {
        triggerName = "runBatchPSIWithScreenshots";
      }
      ScriptApp.newTrigger(triggerName)
        .timeBased()
        .everyMinutes(TIME_BETWEEN_BATCHES)
        .create();
      runBatch(api, save_screenshot);
      break;
  }
}

/**
 * Initializes the URL status in the CONFIG_SHEET. This function resets URLs to "⏳".
 * It also clears any notes from previous runs and ensures
 * that only active URLs are marked for processing.
 */
function initURLStatus() {
  // Remove any triggers that might have been set from previous batch executions to avoid overlapping runs.
  removeBatchTriggers();

  // Define the sheet and range to work with.
  const values = CONFIG_SHEET.getRange(CONFIG_INPUT_DATA_RANGE).getValues();

  // Iterate through each row (i.e., each URL configuration) in the configuration sheet.
  for (const [index, row] of values.entries()) {
    // Extract the URL and 'Active' status from the row, destructuring.
    const [, url, , , active] = row;

    // Clear any previous value or note in the 'Status' column for this row.
    const statusCell = CONFIG_SHEET.getRange(index + 2, COLUMN_STATUS + 1);
    statusCell.setValue("");
    statusCell.setNote("");

    // Skip updating the status if the URL is empty or the row is marked as inactive.
    if (!url || !active) {
      continue;
    }

    // Set the status to "⏳" indicating that this URL is waiting to be processed.
    statusCell.setValue("⏳");
  }

  // Ensure all changes are applied to the sheet immediately. This is particularly important in scenarios with batch operations, as the values will be read directly
  SpreadsheetApp.flush();
}

/**
 * Runs a batch of API calls based on the specified API type. 
 * This function aggregates URLs from the CONFIG_SHEET and sends them to the appropriate API. 
 * It is responsible for managing the batch process, sending requests, and handling the results 
 * The script 
 *  - iterates through the provided URLs, 
 *  - determines the device type, 
 *  - constructs the request, 
 *  - sends the batch, 
 *  - and then parses the results.
 * @param {string} api - The API type to call. Supported types are PSI, CrUX, CrUX History, Green Domain, Accessibility, and Sustainability.
 * @param {boolean} save_screenshot - Flag to determine if screenshots should be saved. 
 * Applicable to only PSI API.
 * @returns {boolean} Indicates whether there are more URLs to process (for continuous batch processing).
 */
function runBatch(api = "PSI API", save_screenshot = false) {
  // Read URLs from the Config Sheets.
  toast("Batch", "Reading URLs");
  const batch = prepareBatchForProcessing();

  // Inform the user about the batch being sent to the API.
  toast("Batch", "Sending a batch with " + batch.length + " URL(s)");
  // Construct URLs for the API requests based on the selected API and batch details.
  const urls = constructBatchUrls(api, batch);

  // Use UrlFetchApp to send all the constructed URLs in a batch.
  let fetch = [];
  try {
    fetch = UrlFetchApp.fetchAll(urls);
  }
  catch (error) {
    for (row of urls) {
      logErrorToSheet(row.id, error)
    }
  }

  // Inform the user that data has been received and is being parsed.
  toast("Received data", "Parsing information - Check the results sheets");

  // Parse the results from the API calls and handle the data.
  const parsedData = parseResults(fetch, batch);

  // Retrieve fields that define how to extract data from the responses for the specific API being used.
  // These definitions are stored in a FIELD_SHEET.
  const fields = getFieldDefinitionsForAPI(api);

  // Extract data from the parsed information matching those fields
  const extractedData = extractData(parsedData, batch, fields, api);

  // Save the extracted data to the appropriate result sheet based on the API type.
  for (row of extractedData) {
    saveExtractedDataToSheet(api, row);
  }

  // If screenshots are to be saved and the API response includes screenshot data, handle that.
  if (save_screenshot) {
    saveScreenshotData(parsedData, batch);
  }

  // Ensure all changes are applied immediately to the spreadsheet.
  SpreadsheetApp.flush();

  // Determine if there are more URLs to process by checking the size of the current batch.
  // If more batches are needed, indicate to continue processing.
  if (batch.length >= NUMBER_OF_URLS_PER_BATCH) {
    return true; // Continue with more batches.
  }

  // If all URLs have been processed, clean up by removing any remaining triggers and finish.
  removeBatchTriggers();

  return false; // Indicate that processing is complete.
}



/**
 * Prepares a batch of URLs for processing from the CONFIG_SHEET based on specified criteria.
 * It iterates through each configuration, filtering out inactive or irrelevant URLs, and aggregates
 * the ones marked for processing into a batch. This function aims to manage and streamline the process
 * of identifying and preparing URLs for subsequent API calls.
 *
 * @returns {Array} An array of objects, each containing details necessary for processing the respective URL.
 */
function prepareBatchForProcessing() {
  // Retrieve all rows of data from the CONFIG_SHEET based on a defined data range.
  const values = CONFIG_SHEET.getRange(CONFIG_INPUT_DATA_RANGE).getValues();

  // Initialize an empty array to hold the URLs that will be processed in this batch.
  let batch = [];

  // Iterate through all the rows in the CONFIG_SHEET to identify URLs to be included in the batch.
  for (const [index, row] of values.entries()) {
    // Extract relevant information from each row.
    const [label, url, device, urlOrOrigin, active, status] = row;

    // Skip processing if the URL is empty or the row is marked as inactive.
    // This ensures that only relevant and active URLs are considered for batch processing.
    if (!url || !active) {
      continue;
    }

    // Check if the URL is marked as waiting for processing (status = "⏳").
    if (status === "⏳") {
      // Update the status in the CONFIG_SHEET to indicate that this URL is now being processed ("🔃").
      CONFIG_SHEET.getRange(index + 2, COLUMN_STATUS + 1).setValue("🔃");

      // Determine if the device type matches "Mobile" or "Phone" and add the URL to the batch.
      if (device.toLowerCase().includes("mobile") || device.toLowerCase().includes("phone")) {
        batch.push({
          id: index,
          label: label,
          url: url,
          device: "MOBILE",
          urlOrOrigin: urlOrOrigin
        });
      }

      // Similarly, check if the device type includes "Desktop" and add the URL to the batch for desktop processing.
      if (device.toLowerCase().includes("desktop")) {
        batch.push({
          id: index,
          label: label,
          url: url,
          device: "DESKTOP",
          urlOrOrigin: urlOrOrigin
        });
      }

      // Stop adding URLs to the batch once the maximum number per batch is reached.
      // This is to ensure manageable batch sizes and to prevent overwhelming the APIs or script execution limits.
      if (batch.length >= NUMBER_OF_URLS_PER_BATCH) {
        break;
      }
    }
  }

  // Return the prepared batch of URLs, each with its details necessary for further processing.
  return batch;
}

/**
 * Constructs URLs for batch processing based on the API type and details of each URL in the batch. This function is central to preparing the API calls by dynamically creating the endpoint URLs based on the provided API type.
 * @param {string} api - The API type to call. Supported types include "PSI", "CrUX", "CrUX History", "Green Domain", "Accessibility", and "Sustainability".
 * @param {Array} batch - Details of each URL in the batch, including the URL, device, and origin. Each element in the array is an object with id, label, url, device, and origin properties.
 * @returns {Array} An array of URLs constructed for the batch processing. These are not just the URL strings but potentially full request objects depending on the needs of the specific APIs.
 */
function constructBatchUrls(api, batch) {
  let urls = []; // Initialize an empty array to hold all the constructed URLs or request objects.

  // Switch statement to handle different API types. Each case should construct the API call appropriately.
  switch (api) {
    case "PSI API": // PageSpeed Insights
      urls = batch.map((d) => newPSIRequest(d.url, d.device));
      break;
    // Add cases for other API types with similar logic.
    case "CrUX": // Chrome User Experience
      urls = batch.map((d) => newCrUXRequest(d.url, d.device, d.urlOrOrigin));
      break;
    case "CrUX History": // Chrome User Experience History
      urls = batch.map((d) => newCrUXHistoryRequest(d.url, d.device, d.urlOrOrigin));
      break;
    case "Green Domain": // Green Web Foundation's Green Domain
      urls = batch.map((d) => newGWFRequest(d.url));
      break;
    case "Accessibility": // Accessibility
      urls = batch.map((d) => newPSIRequest(d.url, "MOBILE"));
      break;
    case "Sustainability": // Sustainability
      urls = batch.map((d) => newPSIRequest(d.url, "MOBILE"));
      break;
  }

  // Return the array of constructed URLs or request objects, ready for batch processing.
  return urls;
}



/**
 * Parses results from API responses. 
 *
 * @param {HTTPResponse[]} fetch - The array of HTTP responses from the API, which includes the data to be parsed.
 */
function parseResults(fetch, batch) {
  let parsedData = [];
  // Loop through each response in the fetch array. Each response corresponds to a URL in the batch.
  for (const [index, response] of fetch.entries()) {
    // Attempt to parse the response data. If parsing fails, log an error and continue to the next response.
    let content;
    try {
      content = JSON.parse(response.getContentText());
    } catch (e) {
      // Log an error that parsing the response failed.
      logErrorToSheet(batch[index].id, e)
      parsedData.push("No content");
      continue;
    }

    // If the content contains an error (e.g., from the API response), log it and continue to the next response.
    if (content.error) {
      logErrorToSheet(batch[index].id, content.error)
      parsedData.push("Content error");
      continue;
    }

    // Push the extracted data to the array
    parsedData.push(content);
  }
  return parsedData;
}



/**
 * Parses results from API responses. It utilizes the FIELD_SHEET to determine which data to extract
 * and organizes the results into the respective result sheet. This function is essential for converting
 * the raw API responses into a structured format that can be used for analysis or reporting.
 *
 * @param {string} api - The API type that was called. It determines how the data should be parsed and which fields are relevant.
 * @param {Array} data - The array of HTTP responses from the API, which includes the data already parsed
 * @param {Array} batch - The current batch of data being processed, which includes details for each URL in the batch.
 */
function extractData(data, batch, fields, api) {
  let extractedData = [];
  // Loop through each response in the fetch array. Each response corresponds to a URL in the batch.
  for (const [index, response] of data.entries()) {
    // Skip empty responses
    if (response === "" || response === "No content" || response === "Content error") {
      continue;
    }

    // Prepare an object to hold the extracted data for this URL.
    const request = batch[index];
    let newRow = {
      "Date": new Date().toISOString().slice(0, 10), // Include the date when the data was processed.
      "Label": request.label, // Include any label that was provided with the URL.
      "URL": request.url, // The URL itself.
      "Device": request.device, // The device type used for the request.
      "URL / Origin": request.urlOrOrigin, // Indicates whether URL-level or Origin-level data was requested.,
      "rowID": request.id // Index of the request
    };

    // Extract data for each field defined in the FIELD_SHEET.
    fields.forEach(field => {
      try {
        // Evaluate the extraction expression provided for this field and add the result to the extractedData object.
        // Values read in the eval section: content, urlOrOrigin
        const urlOrOrigin = request.urlOrOrigin;
        const content = response;
        // Add green_domains variable to be read by the items
        let green_domains = [];
        if (api === "Sustainability") {
          green_domains = GREEN_DOMAIN_SHEET
            .getRange("F2:J")
            .getValues()
            .filter(d => d[4] == true)
            .map(d => d[0])
        }
        newRow[field.name] = eval(field.expression);
      } catch (e) {
        Logger.log(e)
        // If there's an error during extraction, log it and continue to the next field.
        DEBUG_SHEET.appendRow([newRow["Date"], newRow["Label"], newRow["URL"], newRow["Device"], newRow["URL / Origin"], e])
      }
    });

    Logger.log(newRow);
    // Push the extracted data to the array
    if (api !== "CrUX History") {
      extractedData.push(newRow);
    }
    // Specific method for CrUX History
    else if ("Date" in newRow) {
      // We will build an new dict for each date 
      for (const [index, date] of newRow["Date"].entries()) {
        let rowForCruxHistory = {}
        for (let key in newRow) {
          // The new dict is either the index-value of the arrays
          if (Array.isArray(newRow[key]) && newRow[key].length > 0) {
            rowForCruxHistory[key] = newRow[key][index]
          }
          // Or the value itself (ex: URL)
          else {
            rowForCruxHistory[key] = newRow[key]
          }
        }
        rowForCruxHistory["Date"] = date;
        extractedData.push(rowForCruxHistory);
      }
    }
  }
  return extractedData;
}

/**
 * Retrieves and formats field definitions for the specified API from the FIELD_SHEET.
 * This includes the name of each field, the method it applies to, and the expression used to extract data.
 * @param {string} api - The API type that was called.
 * @returns {Array} An array of field definition objects.
 */
function getFieldDefinitionsForAPI(api) {
  // Fetch the entire range of field definitions from the FIELD_SHEET.
  const range = FIELD_SHEET.getRange(1, 1, FIELD_SHEET.getLastRow(), 3);
  const values = range.getValues();

  // Filter and format the field definitions based on the current API type.
  return values
    .filter(row => row[0] === api) // Include only rows for the current API.
    .map(row => ({
      method: row[0],
      name: row[1],
      expression: row[2],
    }));
}

/**
 * Logs an error message to the specified sheet for a particular row. This function is used for tracking errors
 * encountered during the processing of each URL in the batch.
 * 
 * @param {number} rowId - The row identifier where the error should be logged, corresponding to the URL's row.
 * @param {string} errorMessage - The error message to be logged.
 */
function logErrorToSheet(rowId, errorMessage) {
  // Select the cell in the COLUMN_STATUS column for the specific row and set its value to the error message.
  const cell = CONFIG_SHEET.getRange(rowId + 2, COLUMN_STATUS + 1);
  cell.setNote("Error: " + JSON.stringify(errorMessage));
  cell.setValue("❌");
}


/**
 * Changes the status of the current row to "DONE"
 * 
 * @param {number} rowId - The row identifier where the error should be logged, corresponding to the URL's row.
 */
function setCompletedStatus(rowId) {
  // Select the cell in the COLUMN_STATUS column for the specific row and set its value to the error message.
  const cell = CONFIG_SHEET.getRange(rowId + 2, COLUMN_STATUS + 1);
  cell.setNote("");
  cell.setValue("✅");
}



/**
 * Saves extracted data for a URL to the appropriate result sheet based on the API type. This function is used
 * after parsing the API response to organize and store the extracted data in a structured manner.
 * 
 * @param {string} api - The API type that was called. It determines which result sheet to use.
 * @param {Object} extractedData - The data extracted from the API response for a single URL.
 */
function saveExtractedDataToSheet(api, extractedData) {
  // Determine the appropriate result sheet based on the API type.
  const sheetMap = new Map([
    ["PSI API", { resultSheet: RESULT_SHEET, resultHeader: RESULT_SHEET_HEADER }],
    ["CrUX", { resultSheet: RESULT_SHEET, resultHeader: RESULT_SHEET_HEADER }],
    ["CrUX History", { resultSheet: RESULT_SHEET, resultHeader: RESULT_SHEET_HEADER }],
    ["Green Domain", { resultSheet: GREEN_DOMAIN_SHEET, resultHeader: GREEN_DOMAIN_HEADER }],
    ["Accessibility", { resultSheet: ACCESSIBILITY_SHEET, resultHeader: ACCESSIBILITY_SHEET_HEADER }],
    ["Sustainability", { resultSheet: SUSTAINABILITY_SHEET, resultHeader: SUSTAINABILITY_SHEET_HEADER }],
  ]);

  // Retrieve the sheet information (sheet and header) for the current API from the map.
  const sheetInfo = sheetMap.get(api);

  // Initialize an array to hold the row data that will be appended to the result sheet.
  const dataRow = [];

  // Iterate over each column header for the result sheet. The headers define the expected structure of the data row.
  for (const header of sheetInfo.resultHeader) {
    // Check if the extracted data contains a value for this header. If so, add it to the data row.
    if (header in extractedData) {
      dataRow.push(extractedData[header]);
    }
    // If the extracted data does not contain a value for this header, append an empty string to maintain the structure.
    else {
      dataRow.push("");
    }
  }

  const resultSheet = sheetInfo.resultSheet;
  // Append the new row of extracted data to the result sheet.
  resultSheet.appendRow(dataRow);
  setCompletedStatus(extractedData.rowID);
}

/**
 * Saves screenshot data provided as part of the API response. This function is used when the task involves
 * capturing screenshots, typically for visual comparison or records.
 * 
 * @param {Object} screenshotData - The screenshot data to be saved, typically a URL or binary data.
 */
function saveScreenshotData(parsedData, batch) {
  // Loop throough all the data
  for (const [index, content] of parsedData.entries()) {

    // Create an array to store screenshot data
    let array_screenshot = [
      new Date().toISOString().slice(0, 16),
      batch[index].label,
      batch[index].url,
      batch[index].device,
      batch[index].urlOrOrigin
    ];

    // Get final screenshot
    try {
      const finalScreenshot = content.lighthouseResult.audits["final-screenshot"].details.data.toString();
      array_screenshot.push(finalScreenshot)
    }
    catch (error) {
      array_screenshot.push("")
    }

    // Get Thumbnails information
    try {
      const thumbnails = content.lighthouseResult.audits["screenshot-thumbnails"].details.items.map(d => d.data.toString())
      array_screenshot = array_screenshot.concat(thumbnails);
    }
    catch (error) {
      array_screenshot.push("")
    }

    // Append data to the Screenshot sheet
    SCREENSHOT_SHEET.appendRow(array_screenshot);
  }
}
