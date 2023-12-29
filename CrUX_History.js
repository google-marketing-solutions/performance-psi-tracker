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


/**
 * Constructs a POST request for the Chrome User Experience Report History API.
 * It is the same as the CrUX History, just the endpoint is different. 
 *
 * @param {string} url The URL or Origin to query the CrUX History API for.
 * @param {string} deviceType The type of device ('MOBILE' or 'DESKTOP').
 * @param {string} mode Indicates whether to use 'URL' or 'Origin' for the query.
 * @return {Object} An object representing the POST request to be made.
 * @throws Will throw an error if inputs are invalid or the API key is missing or invalid.
 */
function newCrUXHistoryRequest(url, deviceType, mode) {
  // Input validation
  if (typeof url !== 'string' || url.trim() === '') {
    throw new Error('Invalid URL/Origin: Must be a non-empty string.');
  }
  if (!['MOBILE', 'DESKTOP'].includes(deviceType)) {
    throw new Error('Invalid device type: Must be "MOBILE" or "DESKTOP".');
  }
  if (!['URL', 'Origin'].includes(mode)) {
    throw new Error('Invalid mode: Must be "URL" or "Origin".');
  }

  // Map 'MOBILE' to 'PHONE' for CrUX API
  const deviceMap = new Map([
    ['MOBILE', 'PHONE'],
    ['DESKTOP', 'DESKTOP'], //'DESKTOP' remains 'DESKTOP'
  ]);
  const cruxDeviceType = deviceMap.get(deviceType);

  // Retrieve and validate the API key from cell B5
  const apiKey = CONFIG_SHEET.getRange('B5').getValue();
  if (typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error('Missing or invalid API Key: Ensure your API key is in cell B5.');
  }

  // Construct the payload based on the mode
  let payload = {};
  if (mode === 'URL') {
    payload = {
      url: url,
      formFactor: cruxDeviceType,
    };
  } else if (mode === 'Origin') {
    payload = {
      origin: url,
      formFactor: cruxDeviceType,
    };
  }

  // Construct the POST request details
  const postRequest = {
    url: 'https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?key=' + apiKey,
    method: 'POST',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return postRequest;
}

// Example usage
function newCrUXHistoryRequestDemo() {
  try {
    const url = 'https://www.example.com'; // Replace with the actual URL/Origin
    const deviceType = 'MOBILE'; // or 'DESKTOP'
    const mode = 'URL'; // or 'Origin'
    const postRequest = generateCrUXRequest(url, deviceType, mode);
    console.log('Constructed POST Request:', postRequest);
  } catch (error) {
    console.error('Test Failed:', error);
  }
}