/**
 * @copyright 2023 Google LLC
 *
 * @fileoverview Functions to make Green Web Foundation API calls.
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
 * Constructs a GET request for checking if a domain is green using The Green Web Foundation's API.
 *
 * @param {string} url The URL to check for green hosting.
 * @return {!Object} An object representing the GET request to be made.
 * @throws Will throw an error if the URL is invalid or there's an issue with extracting the domain.
 */
function newGWFRequest(url) {
  // Validate the URL
  if (typeof url !== 'string' || url.trim() === '') {
    throw new Error('Invalid URL: Must be a non-empty string.');
  }

  if (!URL.canParse(url)) {
    url = 'https://' + url;
  }
  const parsedURL = URL.parse(url);
  if (!parsedURL || parsedURL.origin === 'null') {
    throw new Error('Invalid URL: Could not extract domain.');
  }
  const domain = parsedURL.hostname;

  // Construct the GET request details for The Green Web Foundation's API
  const getRequest = {
    url: `https://api.thegreenwebfoundation.org/api/v3/greencheck/${domain}`,
    method: 'GET', // Specifying the method for clarity
    muteHttpExceptions: true, // Set to true to handle HTTP errors gracefully
  };

  return getRequest;
}

exports.newGWFRequest = newGWFRequest;
