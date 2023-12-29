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
 * Constructs a GET request for checking if a domain is green using The Green Web Foundation's API.
 *
 * @param {string} url The URL to check for green hosting.
 * @return {Object} An object representing the GET request to be made.
 * @throws Will throw an error if the URL is invalid or there's an issue with extracting the domain.
 */
function newGWFRequest(url) {
  // Validate the URL
  if (typeof url !== 'string' || url.trim() === '') {
    throw new Error('Invalid URL: Must be a non-empty string.');
  }

  // Extract the domain using a regex
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/;
  // Regex explanation: this pattern aims to capture the domain name from a given URL by:
  // Allowing for the 'http' or 'https' protocols, but not requiring them (https?:\/\/?).
  // Allowing for credentials but not requiring them ([^@\n]+@?).
  // Optionally matching 'www.' but not capturing it ((?:www\.)?).
  // Capturing the domain or subdomain up to a colon, slash, or end of line (([^:\/\n?]+)).
  const match = url.match(regex);
  if (!match || !match[1]) {
    throw new Error('Invalid URL: Could not extract domain.');
  }
  const domain = match[1];

  // Construct the GET request details for The Green Web Foundation's API
  const getRequest = {
    url: `https://api.thegreenwebfoundation.org/api/v3/greencheck/${domain}`,
    method: 'GET', // Specifying the method for clarity
    muteHttpExceptions: true // Set to true to handle HTTP errors gracefully
  };

  return getRequest;
}

// Example usage
function newGWFRequestDemo() {
  try {
    const url = 'http:///errortripleslash.com'; // Replace with the actual URL
    const getRequest = newGWFRequest(url);
    console.log('Constructed GET Request:', getRequest);
  } catch (error) {
    console.error('Test Failed:', error);
  }
}
