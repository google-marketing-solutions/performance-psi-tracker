/**
 * @copyright 2023 Google LLC
 *
 * @fileoverview Tests for the CrUX_History functions.
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

const CrUX_History = require('./CrUX_History');

describe('CrUX_History newCrUXHistoryRequest', () => {
  const testURL = 'https://example.com';
  const apiKey = 'fakeapikey';

  const baseRequest = {
    url: `https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?key=${apiKey}`,
    method: 'POST',
    payload: {},
    muteHttpExceptions: true,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  beforeEach(() => {
    const fakeConfigSheet = jasmine.createSpyObj('Sheet', [
      'getRange',
      'getValue',
    ]);
    fakeConfigSheet.getRange.and.returnValue(fakeConfigSheet);
    fakeConfigSheet.getValue.and.returnValue(apiKey);
    jasmine.getGlobal().CONFIG_SHEET = fakeConfigSheet;
  });

  it('returns a correct request with valid parameters', () => {
    const testData = [
      {
        formFactor: 'MOBILE',
        mode: 'URL',
        wantedPayload: {url: testURL, formFactor: 'PHONE'},
      },
      {
        formFactor: 'MOBILE',
        mode: 'Origin',
        wantedPayload: {origin: testURL, formFactor: 'PHONE'},
      },
      {
        formFactor: 'DESKTOP',
        mode: 'URL',
        wantedPayload: {url: testURL, formFactor: 'DESKTOP'},
      },
      {
        formFactor: 'DESKTOP',
        mode: 'Origin',
        wantedPayload: {origin: testURL, formFactor: 'DESKTOP'},
      },
    ];

    const want = baseRequest;
    for (const t of testData) {
      want.payload = JSON.stringify(t.wantedPayload);
      expect(CrUX_History.newCrUXHistoryRequest(testURL, t.formFactor, t.mode))
        .withContext(`${t.formFactor} : ${t.mode}`)
        .toEqual(want);
    }
  });

  it('throws when passed an empty URL', () => {
    expect(() => {
      CrUX_History.newCrUXHistoryRequest('', 'MOBILE', 'URL');
    }).toThrow();
  });

  it('throws when passed an invalid device type', () => {
    expect(() => {
      CrUX_History.newCrUXHistoryRequest(testURL, 'INVALID_DEVICE', 'URL');
    }).toThrow();
  });

  it('throws when the API key is empty', () => {
    jasmine.getGlobal().CONFIG_SHEET.getValue.and.returnValue('');
    expect(() => {
      CrUX_History.newCrUXHistoryRequest(testURL, 'MOBILE', 'URL');
    }).toThrow();
  });
});
