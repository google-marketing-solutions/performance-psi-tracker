/**
 * Copyright 2022 Google LLC
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
 * @fileoverview This file provides functions and global variables used
 * throughout the solution.
 */

// Global variables used throughout the solution.
const HOW_TO_TAB = 'How to Use';
const SITES_TAB = 'Sites';
const TEMP_QUEUE_TAB = 'Queue';
const RESULTS_TAB = 'Results';
const ALERTS_TAB = 'Alerts';
const TESTS_PER_BATCH = 8;

/**
 * Converts a numerical sheets column index to A1 Notation.
 *
 * @param {number} column The column to convert.
 * @return {string} The converted A1 Notation index.
 */
function columnIndexToLetter(column) {
  const MAX_CHARACTERS_A1N = 26;
  const ASCII_UPPERCASE_A = 65;
  let letter = '';
  while (column > 0) {
    const temp = (column - 1) % MAX_CHARACTERS_A1N;
    letter = String.fromCharCode(temp + ASCII_UPPERCASE_A) + letter;
    column = (column - temp - 1) / MAX_CHARACTERS_A1N;
  }
  return letter;
}

/**
 * Converts an A1 Notation sheets column index to a numerical one.
 *
 * @param {string} letter The A1 Notation index to convert.
 * @return {number} The converted numerical index.
 */
function letterToColumnIndex(letter) {
  const MAX_CHARACTERS_A1N = 26;
  const ASCII_BEFORE_UPPERCASE_A = 64;
  let column = 0;
  const length = letter.length;
  for (let i = 0; i < length; i++) {
    column += (letter.charCodeAt(i) - ASCII_BEFORE_UPPERCASE_A) *
        Math.pow(MAX_CHARACTERS_A1N, length - i - 1);
  }
  return column;
}


/**
 * Gets reference to sheet by name, creating it if needed
 */
function getSheet(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
  if (sheet == null) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet()
    sheet.setName(name)
  }
  return sheet;
}