/**
 * @copyright 2023 Google LLC
 *
 * @fileoverview Integration tests for the Performance PSI Tracker.
 * These tests must be run from the App Script editor and be attached to an
 * appropriately formatted Google Sheet.
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
 * This file is the core of the Performance PSI tracker project. This file must
 * be deployed to an appropriate Google Sheet to be used, along with the other
 * files in the project.
 */

/**
 * Test PSI Tracker inner mechanisms
 */
function runTestsPSITracker() {
  setDefaultValues();
  testConstantValues();
  testinitURLStatus();
  testprepareBatchForProcessing();
  testconstructBatchUrls();
  testgetFieldDefinitionsForAPI();
}

/**
 * For test purposes, reset the spreadsheet to some default values.
 */
function setDefaultValues() {
  CONFIG_SHEET.getRange("B5").setValue('API_KEY_GOES_HERE')
  CONFIG_SHEET.getRange("E2:J").clearContent();
  CONFIG_SHEET.getRange("E2:J14").setValues(JSON.parse('[["Example","","","","",""],["Web.dev Domain","https://web.dev/","Mobile","Origin",true,""],["Web.dev Vitals Listing","https://web.dev/learn-web-vitals/","Mobile","URL",true,""],["Web.dev LCP info","https://web.dev/lcp/","Mobile","URL",true,""],["Web.dev FID info","https://web.dev/fid/","Desktop","URL",true,""],["Web.dev CLS info","https://web.dev/cls/","Mobile and Desktop","URL",true,""],["","","","","",""],["URLs with errors (tests)","","","","",""],["CrUX not found + LH Error","https://www.laredoute.fr/content/1-piece-3-looks--comment-adopter-la-tendance-combat-boots-/","Mobile","Origin",true,""],["Malformed URL","abc","Desktop","URL",true,""],["Missing INP in CrUX","https://www.backmarket.fr/fr-fr/l/bons-plans-galaxy-reconditionne/886af690-095c-4344-8230-2def8fb473a4","Desktop","Origin",true,""],["Google Sorry","https://www.google.com/sorry/","Desktop","Origin",true,""],["Marie Error","https://www.renefurtererusa.com/","Mobile","URL",true,""]]'));
  SpreadsheetApp.flush();
}

function testConstantValues() {
  console.log('Starting Constant Value tests')
  console.assert(COLUMN_STATUS === 9, 'COLUMN_STATUS ❌');
  console.assert(CONFIG_SAVE_SCREENSHOT_CELL === 'C18', 'CONFIG_SAVE_SCREENSHOT_CELL ❌');
  console.assert(CONFIG_NUMBER_URL_PER_BATCH_CELL === 'C19', 'CONFIG_NUMBER_URL_PER_BATCH_CELL ❌');
  console.assert(CONFIG_EXECUTION_MODE_BOOLEAN === 'C20', 'CONFIG_EXECUTION_MODE_BOOLEAN ❌');
  console.assert(CONFIG_TIME_BETWEEN_BATCHES_CELL === 'C21', 'CONFIG_TIME_BETWEEN_BATCHES_CELL ❌');
  console.assert(CONFIG_SHEET.getRange(CONFIG_INPUT_DATA_RANGE).getValues()[0][0] === 'Example', 'CONFIG_INPUT_DATA_RANGE ❌');
  console.assert(SCREENSHOT_SHEET.getRange('A:A').getValues()[0][0] === 'Date', 'SCREENSHOT_SHEET ❌');
  console.assert(FIELD_SHEET.getRange('A:A').getValues()[0][0] === 'Method', 'FIELD_SHEET ❌');
  console.assert(RESULT_SHEET.getRange('A:A').getValues()[0][0] === 'Date', 'RESULT_SHEET ❌');
  console.assert(GREEN_DOMAIN_SHEET.getRange('A:A').getValues()[0][0] === 'Date', 'GREEN_DOMAIN_SHEET ❌');
  console.assert(CONFIG_SHEET.getRange('E:E').getValues()[0][0] === 'Label', 'CONFIG_SHEET ❌');
  console.assert(DEBUG_SHEET.getRange('A:A').getValues()[0][0] === 'Date', 'DEBUG_SHEET ❌');
  console.assert(ACCESSIBILITY_SHEET.getRange('A:A').getValues()[0][0] === 'Date', 'ACCESSIBILITY_SHEET ❌');
  console.assert(SUSTAINABILITY_SHEET.getRange('A:A').getValues()[0][0] === 'Date', 'SUSTAINABILITY_SHEET ❌');
  console.assert(RESULT_SHEET_HEADER[0] === 'Date', 'RESULT_SHEET_HEADER ❌');
  console.assert(GREEN_DOMAIN_HEADER[0] === 'Date', 'GREEN_DOMAIN_HEADER ❌');
  console.assert(ACCESSIBILITY_SHEET_HEADER[0] === 'Date', 'ACCESSIBILITY_SHEET_HEADER ❌');
  console.assert(SUSTAINABILITY_SHEET_HEADER[0] === 'Date', 'SUSTAINABILITY_SHEET_HEADER ❌');
  console.assert(TIME_BETWEEN_BATCHES === '-', 'TIME_BETWEEN_BATCHES ❌');
  console.assert(NUMBER_OF_URLS_PER_BATCH === 20, 'NUMBER_OF_URLS_PER_BATCH ❌');
  console.log('Constant Value tests complete');
}

function testinitURLStatus() {
  console.log('Staring initURLStatus tests');
  // Set values in cells for tests
  const values = CONFIG_SHEET.getRange('J2:J').getValues();
  CONFIG_SHEET.getRange('J2:J').setValues(values.map((d, p) => [p]));
  CONFIG_SHEET.getRange('J2:J').setNotes(values.map((d, p) => [p]));
  SpreadsheetApp.flush();

  initURLStatus();
  console.assert(CONFIG_SHEET.getRange('J2').getValue() === '', 'Init URL Fail: Cell is not empty');
  console.assert(CONFIG_SHEET.getRange('J2').getNote() === '', 'Init URL Fail: Cell is not empty');
  SpreadsheetApp.flush();
  console.log('initURLStatus tests complete');
}

function testprepareBatchForProcessing() {
  console.log('Starting Batch Preparation tests');
  setDefaultValues();
  const values = CONFIG_SHEET.getRange('J2:J').getValues();
  CONFIG_SHEET.getRange('J2:J').setValues(values.map((d, p) => ['⏳']));

  const batch = prepareBatchForProcessing();
  console.assert(batch.length === 11, 'Unexpected number of URLs in batch');
  console.assert(batch[0]['label'] === 'Web.dev Domain', 'Unexpected value for Label');
  console.assert(batch[0]['id'] === 1, 'Unexpected value for ID');
  console.assert(batch[0]['url'] === 'https://web.dev/', 'Unexpected value for URL');
  console.assert(batch[0]['device'] === 'MOBILE', 'Unexpected value for Device');
  console.assert(batch[0]['urlOrOrigin'] === 'Origin', 'Unexpected value for Origin');
  console.log('prepareBatchForProcessing tests complete');

}

function testconstructBatchUrls() {
  console.log('Starting constructBatchUrls tests');
  const testCases = [
    {
      name: 'General Test',
      api: 'PSI API',
      batch: JSON.parse(
        '[{"id":1,"label":"Web.dev Domain","url":"https://web.dev/","device":"MOBILE","urlOrOrigin":"Origin"},{"id":2,"label":"Web.dev Vitals Listing","url":"https://web.dev/learn-web-vitals/","device":"MOBILE","urlOrOrigin":"URL"},{"id":3,"label":"Web.dev LCP info","url":"https://web.dev/lcp/","device":"MOBILE","urlOrOrigin":"URL"}]',
      ),
      expectedFirstURL:
        'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https%3A%2F%2Fweb.dev%2F&strategy=MOBILE&key=API_KEY_GOES_HERE',
    },
    {
      name: 'CrUX Test',
      api: 'CrUX',
      batch: JSON.parse(
        '[{"id":1,"label":"Web.dev Domain","url":"https://web.dev/","device":"MOBILE","urlOrOrigin":"Origin"},{"id":2,"label":"Web.dev Vitals Listing","url":"https://web.dev/learn-web-vitals/","device":"MOBILE","urlOrOrigin":"URL"},{"id":3,"label":"Web.dev LCP info","url":"https://web.dev/lcp/","device":"MOBILE","urlOrOrigin":"URL"}]',
      ),
      expectedMethod: 'POST',
      expectedPayloadString:
        '{"origin":"https://web.dev/","formFactor":"PHONE"}',
    },
    {
      name: 'CrUX History Test',
      api: 'CrUX History',
      batch: JSON.parse(
        '[{"id":1,"label":"Web.dev Domain","url":"https://web.dev/","device":"MOBILE","urlOrOrigin":"Origin"},{"id":2,"label":"Web.dev Vitals Listing","url":"https://web.dev/learn-web-vitals/","device":"MOBILE","urlOrOrigin":"URL"},{"id":3,"label":"Web.dev LCP info","url":"https://web.dev/lcp/","device":"MOBILE","urlOrOrigin":"URL"}]',
      ),
      expectedMethod: 'POST',
      expectedPayloadString:
        '{"origin":"https://web.dev/","formFactor":"PHONE"}',
    },
    {
      name: 'Green Domain Test',
      api: 'Green Domain',
      batch: JSON.parse(
        '[{"id":1,"label":"Web.dev Domain","url":"https://web.dev/","device":"MOBILE","urlOrOrigin":"Origin"},{"id":2,"label":"Web.dev Vitals Listing","url":"https://web.dev/learn-web-vitals/","device":"MOBILE","urlOrOrigin":"URL"},{"id":3,"label":"Web.dev LCP info","url":"https://web.dev/lcp/","device":"MOBILE","urlOrOrigin":"URL"}]',
      ),
      expectedMethod: 'GET',
      expectedURLDict:
        'https://api.thegreenwebfoundation.org/api/v3/greencheck/web.dev',
    },
    {
      name: 'Accessibility Test',
      api: 'Accessibility',
      batch: JSON.parse(
        '[{"id":1,"label":"Web.dev Domain","url":"https://web.dev/","device":"MOBILE","urlOrOrigin":"Origin"},{"id":2,"label":"Web.dev Vitals Listing","url":"https://web.dev/learn-web-vitals/","device":"MOBILE","urlOrOrigin":"URL"},{"id":3,"label":"Web.dev LCP info","url":"https://web.dev/lcp/","device":"MOBILE","urlOrOrigin":"URL"}]',
      ),
      expectedFirstURL:
        'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https%3A%2F%2Fweb.dev%2F&strategy=MOBILE&key=API_KEY_GOES_HERE',
    },
    {
      name: 'Sustainability',
      api: 'Sustainability',
      batch: JSON.parse(
        '[{"id":1,"label":"Web.dev Domain","url":"https://web.dev/","device":"MOBILE","urlOrOrigin":"Origin"},{"id":2,"label":"Web.dev Vitals Listing","url":"https://web.dev/learn-web-vitals/","device":"MOBILE","urlOrOrigin":"URL"},{"id":3,"label":"Web.dev LCP info","url":"https://web.dev/lcp/","device":"MOBILE","urlOrOrigin":"URL"}]',
      ),
      expectedFirstURL:
        'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https%3A%2F%2Fweb.dev%2F&strategy=MOBILE&key=API_KEY_GOES_HERE',
    },
  ];

  for (const [index, testCase] of testCases.entries) {
    try {
      const urls = constructBatchUrls(testCase.api, testCase.batch);
      if (testCase.expectedError) {
        console.error(`Test ${index + 1} Failed: Expected error for API: ${testCase.api}`);
        continue;
      }
      console.assert(urls.length === testCase.batch.length, `Test ${index + 1}: Number of URLs not matching.`);
      if (testCase.expectedMethod) {
        console.assert(urls[0].method === testCase.expectedMethod, `Test ${index + 1}: Expected Method not found in Construct.`);
      }
      if (testCase.expectedFirstURL) {
        console.assert(urls[0] === testCase.expectedFirstURL, `Test ${index + 1}: Expected URL not found in Construct.`);
      }
      if (testCase.expectedPayloadString) {
        console.assert(urls[0].payload === testCase.expectedPayloadString, `Test ${index + 1}: Expected payload not found in Construct.`);
      }
      if (testCase.expectedURLDict) {
        console.assert(urls[0].url === testCase.expectedURLDict, `Test ${index + 1}: Expected URL not found in Construct.`);
      }
    } catch (error) {
      if (testCase.expectedError) {
        console.assert(error.message.includes(testCase.expectedError), `Test ${index + 1}: Unexpected error message. Expected: ${testCase.expectedError}. Got: ${error.message}`);
      } else {
        console.error(`Test ${index + 1} Failed for API: ${testCase.api}:`, error);
      }
    }
  }
  console.log('constructBatchUrls tests complete')
}

function testgetFieldDefinitionsForAPI() {
  console.log('Starting getFieldDefinitionsForAPI tests');
  const testCases = [
    {
      api: 'PSI API',
      numberOfFields: 30,
    },
    {
      api: 'CrUX',
      numberOfFields: 7,
    },
    {
      api: 'CrUX History',
      numberOfFields: 8,
    },
    {
      api: 'Green Domain',
      numberOfFields: 22,
    },
    {
      api: 'Accessibility',
      numberOfFields: 75,
    },
    {
      api: 'Sustainability',
      numberOfFields: 5,
    },
  ];

  for (const [index, testCase] of testCases.entries) {
    const fields = getFieldDefinitionsForAPI(testCase.api);
    console.assert(fields.length === testCase.numberOfFields, `Test ${index + 1}: Number of Fields not matching.`);
  }
  console.log('getFieldDefinitionsForAPI tests complete');
}

function testparseResults() {
  console.log('Starting result parsing tests');
  const testCases = [
    {
      api: 'PSI API',
      dummyData: [getDummyData()],
      dummyInput: [
        {
          id: 0,
          label: 'label',
          url: 'web.dev',
          device: 'MOBILE',
          urlOrOrigin: 'URL',
        },
      ],
      valueToRead: 'CrUX LCP',
      expectedOutput: 5025,
    },
    {
      api: 'PSI API',
      dummyData: [getDummyData()],
      dummyInput: [
        {
          id: 0,
          label: 'label',
          url: 'web.dev',
          device: 'MOBILE',
          urlOrOrigin: 'URL',
        },
      ],
      valueToRead: 'LH Version',
      expectedOutput: '11.0.0',
    },
  ];

  for (const [index, testCase] of testCases.entries) {
    const fields = getFieldDefinitionsForAPI(testCase.api);
    const results = extractData(testCase.dummyData, testCase.dummyInput, fields);
    console.assert(results[testCase.valueToRead] === testCase.expectedOutput, `Test ${index + 1}: Unexpected output.`);
  }
}

/**
 * Returns a simplify version of a Lighthouse audit for test purposes
 */
function getDummyData() {
  return {
    "id": "https://web.dev/",
    "loadingExperience": {
      "id": "https://web.dev/",
      "metrics": {
        "CUMULATIVE_LAYOUT_SHIFT_SCORE": {
          "percentile": 8,
        },
        "EXPERIMENTAL_TIME_TO_FIRST_BYTE": {
          "percentile": 2427
        },
        "FIRST_CONTENTFUL_PAINT_MS": {
          "percentile": 4065
        },
        "FIRST_INPUT_DELAY_MS": {
          "percentile": 150
        },
        "INTERACTION_TO_NEXT_PAINT": {
          "percentile": 405
        },
        "LARGEST_CONTENTFUL_PAINT_MS": {
          "percentile": 5025
        }
      },
      "overall_category": "SLOW",
      "initial_url": "https://web.dev/"
    },
    "originLoadingExperience": {
      "id": "https://web.dev",
      "metrics": {
        "CUMULATIVE_LAYOUT_SHIFT_SCORE": {
          "percentile": 8
        },
        "EXPERIMENTAL_TIME_TO_FIRST_BYTE": {
          "percentile": 2406
        },
        "FIRST_CONTENTFUL_PAINT_MS": {
          "percentile": 3985
        },
        "FIRST_INPUT_DELAY_MS": {
          "percentile": 141
        },
        "INTERACTION_TO_NEXT_PAINT": {
          "percentile": 411
        },
        "LARGEST_CONTENTFUL_PAINT_MS": {
          "percentile": 4698
        }
      },
      "overall_category": "SLOW",
      "initial_url": "https://web.dev/"
    },
    "lighthouseResult": {
      "requestedUrl": "https://web.dev/",
      "finalUrl": "https://web.dev/",
      "mainDocumentUrl": "https://web.dev/",
      "finalDisplayedUrl": "https://web.dev/",
      "lighthouseVersion": "11.0.0"
    }
  }
}
