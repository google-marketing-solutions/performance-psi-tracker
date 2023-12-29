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
 * Runs a series of unit tests for the newGWFRequest function.
 */
function runTestsNewGWFRequest() {
    // Define test cases
    const testCases = [
        {
            url: 'https://www.example.com',
            expectedDomain: 'example.com'
        },
        {
            url: 'http://subdomain.example.com',
            expectedDomain: 'subdomain.example.com'
        },
        {
            url: 'https://www.example.com/path?query=123',
            expectedDomain: 'example.com'
        },
        {
            url: 'example.com:8080',
            expectedDomain: 'example.com'
        },
        {
            url: 'ftp://example.com',
            expectedDomain: 'ftp' // Not the best behaviour, but better than an error
        },
        {
            url: '', // Empty string
            expectedError: 'Invalid URL: Must be a non-empty string.'
        },
        {
            url: 'justastring',
            expectedDomain: 'justastring'
        },
        {
            url: 'http://example.com',
            expectedDomain: 'example.com'
        },
        {
            url: 'https://example.com/this is/path',
            expectedDomain: 'example.com'
        }
    ];

    // Run each test case
    testCases.forEach((testCase, index) => {
        try {
            const getRequest = newGWFRequest(testCase.url);
            if (testCase.expectedError) {
                console.error(`Test ${index + 1} Failed: Expected error for URL: ${testCase.url}`);
            } else {
                assert(getRequest.url.includes(testCase.expectedDomain), `Test ${index + 1}: Expected domain not found in GET request URL.`);
                console.log(`Test ${index + 1} Passed for URL: ${testCase.url}`);
            }
        } catch (error) {
            if (testCase.expectedError) {
                assert(error.message.includes(testCase.expectedError), `Test ${index + 1}: Unexpected error message. Expected: ${testCase.expectedError}. Got: ${error.message}`);
                console.log(`Test ${index + 1} Passed for expected error with URL: ${testCase.url}`);
            } else {
                console.error(`Test ${index + 1} Failed for URL: ${testCase.url}:`, error);
            }
        }
    });
}