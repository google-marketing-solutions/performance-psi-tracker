/**
 * @copyright 2023 Google LLC
 *
 * @fileoverview Tests for the PSI_Call function
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

const PSI_Call = require('./PSI_Call');

describe('PSI_Call newPSIRequest', () => {
  const apiKey = 'fakeapikey';
  const psiURL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  const fixedParams =
    '&category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=PWA&category=SEO';

  beforeEach(() => {
    const fakeConfigSheet = jasmine.createSpyObj('Sheet', [
      'getRange',
      'getValue',
    ]);
    fakeConfigSheet.getRange.and.returnValue(fakeConfigSheet);
    fakeConfigSheet.getValue.and.returnValue(apiKey);
    jasmine.getGlobal().CONFIG_SHEET = fakeConfigSheet;
  });

  it('returns a correct URL with valid parameters for MOBILE', () => {
    const url = 'https://example.com';
    const deviceType = 'MOBILE';

    const wantedURL = `${psiURL}?url=${encodeURIComponent(url)}&strategy=${deviceType}&key=${apiKey}${fixedParams}`;
    const want = {
      url: wantedURL,
      method: 'GET',
      muteHttpExceptions: true,
    };
    const got = PSI_Call.newPSIRequest(url, deviceType);
    expect(got).toEqual(want);
  });

  it('returns a correct URL with valid parameters for DESKTOP', () => {
    const url = 'https://example.com';
    const deviceType = 'DESKTOP';

    const wantedURL = `${psiURL}?url=${encodeURIComponent(url)}&strategy=${deviceType}&key=${apiKey}${fixedParams}`;
    const want = {
      url: wantedURL,
      method: 'GET',
      muteHttpExceptions: true,
    };
    const got = PSI_Call.newPSIRequest(url, deviceType);
    expect(got).toEqual(want);
  });

  it('throws an error with an empty URL', () => {
    expect(() => {
      PSI_Call.newPSIRequest('', 'MOBILE');
    }).toThrow();
  });

  it('throws an error with an invalid device type', () => {
    expect(() => {
      PSI_Call.newPSIRequest('https://example.com', 'NOT_VALID');
    }).toThrow();
  });

  it('throws an error when the API key is empty', () => {
    jasmine.getGlobal().CONFIG_SHEET.getValue.and.returnValue('');
    expect(() => {
      PSI_Call.newPSIRequest('https://example.com', 'MOBILE');
    }).toThrow();
  });
});
