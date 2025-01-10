/**
 * @copyright 2023 Google LLC
 *
 * @fileoverview
 * The functions used to query the Pagespeed Insights API.
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
 *
 */

/**
 * Generates a GET request URL for the PageSpeed Insights API.
 *
 * @param {string} url The URL to analyze with the PSI API.
 * @param {string} deviceType The type of device to simulate ('MOBILE' or 'DESKTOP').
 * @return {string} The complete URL for the PSI API GET request.
 * @throws Will throw an error if inputs are invalid or the API key is missing or invalid.
 */
function newPSIRequest(url, deviceType) {
  // Validate the URL to ensure Sheets row objects aren't being passed
  if (typeof url !== 'string' || url.trim() === '') {
    throw new Error('Invalid URL: URL must be a non-empty string.');
  }
  const validDeviceTypes = ['MOBILE', 'DESKTOP'];
  if (!validDeviceTypes.includes(deviceType)) {
    throw new Error(
      `Invalid device type: Must be one of ${validDeviceTypes.join(', ')}.`,
    );
  }

  // Retrieve and validate the API key from cell B5
  const apiKey = CONFIG_SHEET.getRange('B5').getValue();
  if (typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error(
      'Missing or invalid API Key: Ensure your API key is in cell B5.',
    );
  }

  const endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  let parameters = `?url=${encodeURIComponent(url)}&strategy=${deviceType}&key=${apiKey}`;
  parameters +=
    '&category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=PWA&category=SEO';

  const getRequest = {
    url: endpoint + parameters,
    method: 'GET',
    muteHttpExceptions: true,
  };

  return getRequest;
}

exports.newPSIRequest = newPSIRequest;
