/**
 * Copyright 2021 Google LLC
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
 * @fileoverview Main file for the Performance PSI Tracker solution. The
 * runPerfTracker function is attached to a menu item in the Sheet used to drive
 * the performance tracking.
 */

/**
  * Creates a new test queue and sets the trigger to run the tests.
  */
function runPerfTracker() {
  // Creates queue
  cloneSitesSheet();

  // Deletes previously finished triggers
  deleteTriggers('runBatchFromQueue');

  // The trigger is set to 5 seconds from now so that running the function 
  // manually doesn't block the sheet.
  setTrigger(5);
}