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
 * Generates a GET request URL for the PageSpeed Insights API.
 *
 * @param {string} url The URL to analyze with the PSI API.
 * @param {string} deviceType The type of device to simulate ('MOBILE' or 'DESKTOP').
 * @return {string} A string of the complete URL for the PSI API GET request.
 * @throws Will throw an error if inputs are invalid or the API key is missing or invalid.
 */
function newPSIRequest(url, deviceType) {
  // Validate the URL
  if (typeof url !== 'string' || url.trim() === '') {
    throw new Error('Invalid URL: URL must be a non-empty string.');
  }

  // Validate the device type
  const validDeviceTypes = ['MOBILE', 'DESKTOP'];
  if (!validDeviceTypes.includes(deviceType)) {
    throw new Error(`Invalid device type: Must be one of ${validDeviceTypes.join(', ')}.`);
  }

  // Retrieve and validate the API key from cell B5
  const apiKey = CONFIG_SHEET.getRange('B5').getValue();
  if (typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error('Missing or invalid API Key: Ensure your API key is in cell B5.');
  }

  // Construct the PSI API request URL
  const endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  let parameters = `?url=${encodeURIComponent(url)}&strategy=${deviceType}&key=${apiKey}`;
  parameters += "&category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=PWA&category=SEO";

  // Construct the GET request details
  const getRequest = {
    url: endpoint + parameters,
    method: 'GET', // Specifying the method for clarity
    muteHttpExceptions: true // Set to true to handle HTTP errors gracefully
  };

  return getRequest;
}

// Example usage:
function testNewPSIRequest() {
  try {
    const url = 'https://www.example.com'; // Replace with the actual URL
    const deviceType = 'MOBILE'; // or 'DESKTOP'
    const requestUrl = newPSIRequest(url, deviceType);
    console.log(requestUrl); // Logs the full API request URL
  } catch (error) {
    console.log(error.message);
  }
}