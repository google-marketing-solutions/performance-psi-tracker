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
 * Runs a series of unit tests for the NewPSIRequest function to validate its behavior.
 */
function runAllTestsNewPSIRequest() {
    // Save the current API key to restore it after tests
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const apiKeyCell = 'B5';
    const originalApiKey = sheet.getRange(apiKeyCell).getValue();

    // Define your test API key values
    const validApiKey = 'valid-api-key'; // replace with a real or dummy 'valid' key
    const invalidApiKey = ''; // typically an empty or malformatted key

    // Set a valid API key for testing
    sheet.getRange(apiKeyCell).setValue(validApiKey);
    SpreadsheetApp.flush(); // Apply changes immediately

    // Run tests with various inputs
    testValidInputNewPSIRequest();
    testInvalidURLNewPSIRequest();
    testInvalidDeviceTypeNewPSIRequest();
    testInvalidApiKeyNewPSIRequest(invalidApiKey);

    // Restore the original API key
    sheet.getRange(apiKeyCell).setValue(originalApiKey);
    SpreadsheetApp.flush();
}

/**
 * Test with valid URL and device type.
 */
function testValidInputNewPSIRequest() {
    const url = 'https://www.example.com';
    const deviceType = 'MOBILE';
    try {
        const requestUrl = newPSIRequest(url, deviceType);
        assert(requestUrl.url.includes('example.com'), 'Valid Input Test: URL not included in request.');
        assert(requestUrl.url.includes('MOBILE'), 'Valid Input Test: Device type not included in request.');
        console.log('Valid Input Test Passed');
    } catch (e) {
        console.error('Valid Input Test Failed:', e);
    }
}

/**
 * Test with invalid URL.
 */
function testInvalidURLNewPSIRequest() {
    try {
        newPSIRequest('', 'MOBILE');
        console.error('Invalid URL Test Failed: No error thrown for invalid URL.');
    } catch (e) {
        assert(e.message.includes('Invalid URL'), 'Invalid URL Test: Incorrect error message for invalid URL.');
        console.log('Invalid URL Test Passed');
    }
}

/**
 * Test with invalid device type.
 */
function testInvalidDeviceTypeNewPSIRequest() {
    try {
        newPSIRequest('https://www.example.com', 'INVALID_DEVICE_TYPE');
        console.error('Invalid Device Type Test Failed: No error thrown for invalid device type.');
    } catch (e) {
        assert(e.message.includes('Invalid device type'), 'Invalid Device Type Test: Incorrect error message for invalid device type.');
        console.log('Invalid Device Type Test Passed');
    }
}

/**
 * Test with invalid API Key.
 * @param {string} invalidApiKey - The API key to test with.
 */
function testInvalidApiKeyNewPSIRequest(invalidApiKey) {
    // Set the invalid API key
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const apiKeyCell = 'B5';
    sheet.getRange(apiKeyCell).setValue(invalidApiKey);
    SpreadsheetApp.flush(); // Apply changes immediately

    try {
        newPSIRequest('https://www.example.com', 'MOBILE');
        console.error('Invalid API Key Test Failed: No error thrown for invalid API key.');
    } catch (e) {
        assert(e.message.includes('Missing or invalid API Key'), 'Invalid API Key Test: Incorrect error message for invalid API key.');
        console.log('Invalid API Key Test Passed');
    }
}