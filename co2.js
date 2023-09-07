/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* exported getCO2eqPerByte */

/**
 * Environment-wide variable that will be overridden by the IIFE import.
 */
let CO2Library;

/**
 * Imports the CO2 library using eval().
 *
 * Note: eval() is a security risk, only used due to AS limitations.
 */
function importCO2Library() {
  if (typeof CO2Library !== 'undefined') return;
  try {
    eval(
        UrlFetchApp
            .fetch(
                'https://cdn.jsdelivr.net/npm/@tgwf/CO2@latest/dist/iife/index.js')
            .getContentText());
    CO2Library = CO2;
  } catch (error) {
    Logger.log(error);
  }
}

/**
 * Checks whether the given URL is hosted on a green hosting provider.
 *
 * @param {string} url The URL to check.
 * @return {boolean} True if the URL is hosted on a green hosting provider,
 *     false otherwise.
 */
function checkGreenHosting(url) {
  const hostname = url.split('/')[2];
  const responseRaw = UrlFetchApp.fetch(
      `https://api.thegreenwebfoundation.org/greencheck/${hostname}`);
  const response = JSON.parse(responseRaw);
  return response.green;
}

/**
 * Calculates the CO2eq per byte for the given number of bytes and URL.
 *
 * @param {number} totalBytes The total number of bytes.
 * @param {string} [url] The URL to check. If specified, the calculation will
 *     take into account whether the URL is hosted on a green hosting provider.
 * @return {number} Estimated grams of CO2eq per byte.
 */
function getCO2eqPerByte(totalBytes, url = '') {
  if (typeof CO2Library === 'undefined') {
    importCO2Library();
  }
  // If the URL is specified, we check whether TGWF has data on type
  let isGreenHosting = false;
  if (typeof url !== 'undefined') {
    isGreenHosting = checkGreenHosting(url);
  }
  // Then we proceed with the calculation
  const CO2Calculation = new CO2Library.CO2(); // eslint-disable-line new-cap
  return CO2Calculation.perByte(totalBytes, isGreenHosting);
}
