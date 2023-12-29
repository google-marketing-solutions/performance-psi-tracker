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
 * Runs a series of unit tests for the newCrUXRequest function to validate its behavior.
 */
function runCrUXAPIRequestTests() {
    // Save the current API key to restore it after tests
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const apiKeyCell = 'B5';
    const originalApiKey = sheet.getRange(apiKeyCell).getValue();
    const testApiKey = 'test-api-key'; // replace with a dummy API key for testing

    // Set the test API key
    sheet.getRange(apiKeyCell).setValue(testApiKey);
    SpreadsheetApp.flush(); // Apply changes immediately

    // Define tests
    testValidRequestCrUXApiRequest();
    testInvalidUrlCrUXApiRequest();
    testInvalidDeviceTypeCrUXApiRequest();
    testInvalidModeCrUXApiRequest();

    // Restore the original API key
    sheet.getRange(apiKeyCell).setValue(originalApiKey);
    SpreadsheetApp.flush();
}

/**
 * Test the function with valid inputs.
 */
function testValidRequestCrUXApiRequest() {
    const url = 'https://www.example.com';
    const deviceType = 'MOBILE';
    const mode = 'URL';
    try {
        const postRequest = newCrUXRequest(url, deviceType, mode);
        assert(postRequest.url.includes('chromeuxreport.googleapis.com'), 'POST request URL is incorrect.');
        assert(postRequest.method === 'POST', 'HTTP method is not POST.');
        assert(postRequest.payload.includes('https://www.example.com'), 'Payload does not include correct URL.');
        assert(postRequest.muteHttpExceptions === true, 'muteHttpExceptions should be true.');
        console.log('Test Valid Request Passed');
    } catch (error) {
        console.error('Test Valid Request Failed:', error);
    }
}

/**
 * Test the function with an invalid URL.
 */
function testInvalidUrlCrUXApiRequest() {
    const deviceType = 'MOBILE';
    const mode = 'URL';
    try {
        newCrUXRequest('', deviceType, mode);
        console.error('Test Invalid URL Failed: No error thrown for invalid URL.');
    } catch (error) {
        assert(error.message.includes('Invalid URL/Origin'), 'Error message does not correctly indicate invalid URL/Origin.');
        console.log('Test Invalid URL Passed');
    }
}

/**
 * Test the function with an invalid device type.
 */
function testInvalidDeviceTypeCrUXApiRequest() {
    const url = 'https://www.example.com';
    const mode = 'URL';
    try {
        newCrUXRequest(url, 'INVALID_DEVICE', mode);
        console.error('Test Invalid Device Type Failed: No error thrown for invalid device type.');
    } catch (error) {
        assert(error.message.includes('Invalid device type'), 'Error message does not correctly indicate invalid device type.');
        console.log('Test Invalid Device Type Passed');
    }
}

/**
 * Test the function with an invalid mode.
 */
function testInvalidModeCrUXApiRequest() {
    const url = 'https://www.example.com';
    const deviceType = 'MOBILE';
    try {
        newCrUXRequest(url, deviceType, 'INVALID_MODE');
        console.error('Test Invalid Mode Failed: No error thrown for invalid mode.');
    } catch (error) {
        assert(error.message.includes('Invalid mode'), 'Error message does not correctly indicate invalid mode.');
        console.log('Test Invalid Mode Passed');
    }
}
