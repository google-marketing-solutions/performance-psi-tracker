/**
 * @copyright 2023 Google LLC
 *
 * @fileoverview Tests for the GWF_Call functions.
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

const GWF_Call = require('./GWF_Call');

describe('GWF_Call newGWFRequest', () => {
  it('returns a correct request for valid parameters', () => {
    const testCases = [
      {
        url: 'https://www.example.com',
        expectedDomain: 'example.com',
      },
      {
        url: 'http://subdomain.example.com',
        expectedDomain: 'subdomain.example.com',
      },
      {
        url: 'https://www.example.com/path?query=123',
        expectedDomain: 'www.example.com',
      },
      {
        url: 'ftp://example.com',
        expectedDomain: 'example.com',
      },
      {
        url: 'justastring',
        expectedDomain: 'justastring',
      },
      {
        url: 'http://example.com',
        expectedDomain: 'example.com',
      },
      {
        url: 'https://example.com/this is/path',
        expectedDomain: 'example.com',
      },
      {
        url: 'https:///example.com',
        expectedDomain: 'example.com',
      },
    ];

    for (const t of testCases) {
      const got = GWF_Call.newGWFRequest(t.url);
      expect(got.url)
        .withContext(`URL -> ${t.url}, Domain -> ${t.expectedDomain}`)
        .toContain(t.expectedDomain);
    }
  });

  it('throws an error when passed an invalid domain', () => {
    const testCases = ['', 'example.com:8080', 'https@user:pass://example.com'];

    for (const t of testCases) {
      expect(() => {
        GWF_Call.newGWFRequest(t);
      })
        .withContext(t)
        .toThrow();
    }
  });
});
