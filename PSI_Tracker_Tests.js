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
 * Test PSI Tracker inner mechanisms
 */
function runTestsPSITracker() {
    testConstantValues();
    testinitURLStatus();
    testprepareBatchForProcessing();
    testconstructBatchUrls();
    testgetFieldDefinitionsForAPI();
}


function testConstantValues() {
    try {
        assert(COLUMN_STATUS === 9);
        console.log("COLUMN_STATUS ✅");
    } catch (error) {
        console.log("COLUMN_STATUS ❌", error);
    }
    try {
        assert(CONFIG_SAVE_SCREENSHOT_CELL === "C18");
        console.log("CONFIG_SAVE_SCREENSHOT_CELL ✅");
    } catch (error) {
        console.log("CONFIG_SAVE_SCREENSHOT_CELL ❌", error);
    }
    try {
        assert(CONFIG_NUMBER_URL_PER_BATCH_CELL === "C19");
        console.log("CONFIG_NUMBER_URL_PER_BATCH_CELL ✅");
    } catch (error) {
        console.log("CONFIG_NUMBER_URL_PER_BATCH_CELL ❌", error);
    }
    try {
        assert(CONFIG_EXECUTION_MODE_BOOLEAN === "C20");
        console.log("CONFIG_EXECUTION_MODE_BOOLEAN ✅");
    } catch (error) {
        console.log("CONFIG_EXECUTION_MODE_BOOLEAN ❌", error);
    }
    try {
        assert(CONFIG_TIME_BETWEEN_BATCHES_CELL === "C21");
        console.log("CONFIG_TIME_BETWEEN_BATCHES_CELL ✅");
    } catch (error) {
        console.log("CONFIG_TIME_BETWEEN_BATCHES_CELL ❌", error);
    }
    try {
        assert(CONFIG_SHEET.getRange(CONFIG_INPUT_DATA_RANGE).getValues()[0][0] === "Example");
        console.log("CONFIG_INPUT_DATA_RANGE ✅");
    } catch (error) {
        console.log("CONFIG_INPUT_DATA_RANGE ❌", error);
    }
    // try{
    //   assert(SS === XYZ); 
    //   console.log("SS ✅");
    // } catch(error) {
    //   console.log("SS ❌", error);
    // }
    try {
        assert(SCREENSHOT_SHEET.getRange("A:A").getValues()[0][0] === "Date");
        console.log("SCREENSHOT_SHEET ✅");
    } catch (error) {
        console.log("SCREENSHOT_SHEET ❌", error);
    }
    try {
        assert(FIELD_SHEET.getRange("A:A").getValues()[0][0] === "Method");
        console.log("FIELD_SHEET ✅");
    } catch (error) {
        console.log("FIELD_SHEET ❌", error);
    }
    try {
        assert(RESULT_SHEET.getRange("A:A").getValues()[0][0] === "Date");
        console.log("RESULT_SHEET ✅");
    } catch (error) {
        console.log("RESULT_SHEET ❌", error);
    }
    try {
        assert(GREEN_DOMAIN_SHEET.getRange("A:A").getValues()[0][0] === "Date");
        console.log("GREEN_DOMAIN_SHEET ✅");
    } catch (error) {
        console.log("GREEN_DOMAIN_SHEET ❌", error);
    }
    try {
        assert(CONFIG_SHEET.getRange("E:E").getValues()[0][0] === "Label");
        console.log("CONFIG_SHEET ✅");
    } catch (error) {
        console.log("CONFIG_SHEET ❌", error);
    }
    try {
        assert(DEBUG_SHEET.getRange("A:A").getValues()[0][0] === "Date");
        console.log("DEBUG_SHEET ✅");
    } catch (error) {
        console.log("DEBUG_SHEET ❌", error);
    }
    try {
        assert(ACCESSIBILITY_SHEET.getRange("A:A").getValues()[0][0] === "Date");
        console.log("ACCESSIBILITY_SHEET ✅");
    } catch (error) {
        console.log("ACCESSIBILITY_SHEET ❌", error);
    }
    try {
        assert(SUSTAINABILITY_SHEET.getRange("A:A").getValues()[0][0] === "Date");
        console.log("SUSTAINABILITY_SHEET ✅");
    } catch (error) {
        console.log("SUSTAINABILITY_SHEET ❌", error);
    }
    try {
        assert(RESULT_SHEET_HEADER[0] === "Date");
        console.log("RESULT_SHEET_HEADER ✅");
    } catch (error) {
        console.log("RESULT_SHEET_HEADER ❌", error);
    }
    try {
        assert(GREEN_DOMAIN_HEADER[0] === "Date");
        console.log("GREEN_DOMAIN_HEADER ✅");
    } catch (error) {
        console.log("GREEN_DOMAIN_HEADER ❌", error);
    }
    try {
        assert(ACCESSIBILITY_SHEET_HEADER[0] === "Date");
        console.log("ACCESSIBILITY_SHEET_HEADER ✅");
    } catch (error) {
        console.log("ACCESSIBILITY_SHEET_HEADER ❌", error);
    }
    try {
        assert(SUSTAINABILITY_SHEET_HEADER[0] === "Date");
        console.log("SUSTAINABILITY_SHEET_HEADER ✅");
    } catch (error) {
        console.log("SUSTAINABILITY_SHEET_HEADER ❌", error);
    }
    try {
        assert(TIME_BETWEEN_BATCHES === "-");
        console.log("TIME_BETWEEN_BATCHES ✅");
    } catch (error) {
        console.log("TIME_BETWEEN_BATCHES ❌", error);
    }
    try {
        assert(NUMBER_OF_URLS_PER_BATCH === 20);
        console.log("NUMBER_OF_URLS_PER_BATCH ✅");
    } catch (error) {
        console.log("NUMBER_OF_URLS_PER_BATCH ❌", error);
    }
}

function testinitURLStatus() {
    // Set values in cells for tests
    const values = CONFIG_SHEET.getRange("J2:J").getValues();
    CONFIG_SHEET.getRange("J2:J").setValues(values.map((d, p) => [p]))
    CONFIG_SHEET.getRange("J2:J").setNotes(values.map((d, p) => [p]))
    SpreadsheetApp.flush();
    try {
        initURLStatus();
        assert(CONFIG_SHEET.getRange("J2").getValue() === "", "Init URL Fail: Cell is not empty")
        assert(CONFIG_SHEET.getRange("J2").getNote() === "", "Init URL Fail: Cell is not empty")
        console.log("initURLStatus Test Success")
    } catch (error) {
        console.log("initURLStatus Failed ❌", error)
    }
    SpreadsheetApp.flush();
}

function testprepareBatchForProcessing() {
    // Set test environment 
    setDefaultValues();

    // Set "⏳" value for all statuses
    const values = CONFIG_SHEET.getRange("J2:J").getValues();
    CONFIG_SHEET.getRange("J2:J").setValues(values.map((d, p) => ["⏳"]));

    // Get data
    try {
        const batch = prepareBatchForProcessing();
        assert(batch.length === 11, "Unexpected number of URLs in batch")
        assert(batch[0]["label"] === "Web.dev Domain", "Unexpected value for Label")
        assert(batch[0]["id"] === 1, "Unexpected value for ID")
        assert(batch[0]["url"] === "https://web.dev/", "Unexpected value for URL")
        assert(batch[0]["device"] === "MOBILE", "Unexpected value for Device")
        assert(batch[0]["urlOrOrigin"] === "Origin", "Unexpected value for Origin")
        console.log("prepareBatchForProcessing Test Success")
        Logger.log(JSON.stringify(batch))
    } catch (error) {
        console.log("prepareBatchForProcessing Failed ❌", error)
    }
}

function testconstructBatchUrls() {
    // Define test cases
    const testCases = [
        {
            name: "General Test",
            api: 'PSI API',
            batch: JSON.parse('[{"id":1,"label":"Web.dev Domain","url":"https://web.dev/","device":"MOBILE","urlOrOrigin":"Origin"},{"id":2,"label":"Web.dev Vitals Listing","url":"https://web.dev/learn-web-vitals/","device":"MOBILE","urlOrOrigin":"URL"},{"id":3,"label":"Web.dev LCP info","url":"https://web.dev/lcp/","device":"MOBILE","urlOrOrigin":"URL"}]'),
            expectedFirstURL: "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https%3A%2F%2Fweb.dev%2F&strategy=MOBILE&key=AIzaSyD3USgyXF_cq5JeiIqvEeeLeYFf_qjXe7o"
        },
        {
            name: "CrUX Test",
            api: 'CrUX',
            batch: JSON.parse('[{"id":1,"label":"Web.dev Domain","url":"https://web.dev/","device":"MOBILE","urlOrOrigin":"Origin"},{"id":2,"label":"Web.dev Vitals Listing","url":"https://web.dev/learn-web-vitals/","device":"MOBILE","urlOrOrigin":"URL"},{"id":3,"label":"Web.dev LCP info","url":"https://web.dev/lcp/","device":"MOBILE","urlOrOrigin":"URL"}]'),
            expectedMethod: 'POST',
            expectedPayloadString: '{\"origin\":\"https://web.dev/\",\"formFactor\":\"PHONE\"}'
        },
        {
            name: "CrUX History Test",
            api: 'CrUX History',
            batch: JSON.parse('[{"id":1,"label":"Web.dev Domain","url":"https://web.dev/","device":"MOBILE","urlOrOrigin":"Origin"},{"id":2,"label":"Web.dev Vitals Listing","url":"https://web.dev/learn-web-vitals/","device":"MOBILE","urlOrOrigin":"URL"},{"id":3,"label":"Web.dev LCP info","url":"https://web.dev/lcp/","device":"MOBILE","urlOrOrigin":"URL"}]'),
            expectedMethod: 'POST',
            expectedPayloadString: '{\"origin\":\"https://web.dev/\",\"formFactor\":\"PHONE\"}'
        },
        {
            name: "Green Domain Test",
            api: 'Green Domain',
            batch: JSON.parse('[{"id":1,"label":"Web.dev Domain","url":"https://web.dev/","device":"MOBILE","urlOrOrigin":"Origin"},{"id":2,"label":"Web.dev Vitals Listing","url":"https://web.dev/learn-web-vitals/","device":"MOBILE","urlOrOrigin":"URL"},{"id":3,"label":"Web.dev LCP info","url":"https://web.dev/lcp/","device":"MOBILE","urlOrOrigin":"URL"}]'),
            expectedMethod: 'GET',
            expectedURLDict: "https://api.thegreenwebfoundation.org/api/v3/greencheck/web.dev"
        },
        {
            name: "Accessibility Test",
            api: 'Accessibility',
            batch: JSON.parse('[{"id":1,"label":"Web.dev Domain","url":"https://web.dev/","device":"MOBILE","urlOrOrigin":"Origin"},{"id":2,"label":"Web.dev Vitals Listing","url":"https://web.dev/learn-web-vitals/","device":"MOBILE","urlOrOrigin":"URL"},{"id":3,"label":"Web.dev LCP info","url":"https://web.dev/lcp/","device":"MOBILE","urlOrOrigin":"URL"}]'),
            expectedFirstURL: "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https%3A%2F%2Fweb.dev%2F&strategy=MOBILE&key=AIzaSyD3USgyXF_cq5JeiIqvEeeLeYFf_qjXe7o"
        },
        {
            name: "Sustainability",
            api: 'Sustainability',
            batch: JSON.parse('[{"id":1,"label":"Web.dev Domain","url":"https://web.dev/","device":"MOBILE","urlOrOrigin":"Origin"},{"id":2,"label":"Web.dev Vitals Listing","url":"https://web.dev/learn-web-vitals/","device":"MOBILE","urlOrOrigin":"URL"},{"id":3,"label":"Web.dev LCP info","url":"https://web.dev/lcp/","device":"MOBILE","urlOrOrigin":"URL"}]'),
            expectedFirstURL: "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https%3A%2F%2Fweb.dev%2F&strategy=MOBILE&key=AIzaSyD3USgyXF_cq5JeiIqvEeeLeYFf_qjXe7o"
        }
    ];

    // Run each test case
    testCases.forEach((testCase, index) => {
        try {
            const urls = constructBatchUrls(testCase.api, testCase.batch)
            if (testCase.expectedError) {
                console.error(`Test ${index + 1} Failed: Expected error for API: ${testCase.api}`);
            } else {
                assert(urls.length === testCase.batch.length, `Test ${index + 1}: Number of URLs not matching.`);
                if (testCase.expectedMethod) {
                    assert(urls[0].method === testCase.expectedMethod, `Test ${index + 1}: Expected Method not found in Construct.`);
                }
                if (testCase.expectedFirstURL) {
                    assert(urls[0] === testCase.expectedFirstURL, `Test ${index + 1}: Expected URL not found in Construct.`);
                }
                if (testCase.expectedPayloadString) {
                    assert(urls[0].payload === testCase.expectedPayloadString, `Test ${index + 1}: Expected payload not found in Construct.`);
                }
                if (testCase.expectedURLDict) {
                    assert(urls[0].url === testCase.expectedURLDict, `Test ${index + 1}: Expected URL not found in Construct.`);
                }
                console.log(`Test ${index + 1} Passed for API: ${testCase.api}`);
            }
        } catch (error) {
            if (testCase.expectedError) {
                assert(error.message.includes(testCase.expectedError), `Test ${index + 1}: Unexpected error message. Expected: ${testCase.expectedError}. Got: ${error.message}`);
                console.log(`Test ${index + 1} Passed for expected error with URL: ${testCase.api}`);
            } else {
                console.error(`Test ${index + 1} Failed for API: ${testCase.api}:`, error);
            }
        }
    });
}

function testgetFieldDefinitionsForAPI() {
    // Define test cases
    const testCases = [
        {
            api: 'PSI API',
            numberOfFields: 30
        },
        {
            api: 'CrUX',
            numberOfFields: 7
        },
        {
            api: 'CrUX History',
            numberOfFields: 8
        },
        {
            api: 'Green Domain',
            numberOfFields: 22
        },
        {
            api: 'Accessibility',
            numberOfFields: 75,
        },
        {
            api: 'Sustainability',
            numberOfFields: 5
        },
    ];

    // Run each test case
    testCases.forEach((testCase, index) => {
        try {
            const fields = getFieldDefinitionsForAPI(testCase.api)
            if (testCase.expectedError) {
                console.error(`Test ${index + 1} Failed: Expected error for API: ${testCase.api}`);
            } else {
                assert(fields.length === testCase.numberOfFields, `Test ${index + 1}: Number of Fields not matching.`);
                console.log(`Test ${index + 1} Passed for API: ${testCase.api}`);
            }
        } catch (error) {
            if (testCase.expectedError) {
                assert(error.message.includes(testCase.expectedError), `Test ${index + 1}: Unexpected error message. Expected: ${testCase.expectedError}. Got: ${error.message}`);
                console.log(`Test ${index + 1} Passed for expected error with URL: ${testCase.api}`);
            } else {
                console.error(`Test ${index + 1} Failed for API: ${testCase.api}:`, error);
            }
        }
    });

}


function testparseResults() {
    // Define test cases
    const testCases = [
        {
            api: 'PSI API',
            dummyData: [getDummyData()],
            dummyInput: [{ "id": 0, "label": "label", "url": "web.dev", "device": "MOBILE", "urlOrOrigin": "URL" }],
            valueToRead: "CrUX LCP",
            expectedOutput: 5025,
        },
        {
            api: 'PSI API',
            dummyData: [getDummyData()],
            dummyInput: [{ "id": 0, "label": "label", "url": "web.dev", "device": "MOBILE", "urlOrOrigin": "URL" }],
            valueToRead: "LH Version",
            expectedOutput: "11.0.0",
        }
    ];

    // Run each test case
    testCases.forEach((testCase, index) => {
        try {
            const fields = getFieldDefinitionsForAPI(testCase.api);
            const results = extractData(testCase.dummyData, testCase.dummyInput, fields);
            Logger.log(testCase)
            Logger.log(fields)
            Logger.log(results)
            if (testCase.expectedError) {
                console.error(`Test ${index + 1} Failed: Expected error for API: ${testCase.api}`);
            } else {
                assert(results[testCase.valueToRead] === testCase.expectedOutput, `Test ${index + 1}: Unexpected output.`);
                console.log(`Test ${index + 1} Passed for API: ${testCase.api}`);
            }
        } catch (error) {
            if (testCase.expectedError) {
                assert(error.message.includes(testCase.expectedError), `Test ${index + 1}: Unexpected error message. Expected: ${testCase.expectedError}. Got: ${error.message}`);
                console.log(`Test ${index + 1} Passed for expected error with URL: ${testCase.api}`);
            } else {
                console.error(`Test ${index + 1} Failed for API: ${testCase.api}:`, error);
            }
        }
    });

}