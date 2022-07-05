Copyright 2022 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

 
# Performance PSI Tracker

## Problem

Many people require a lightweight solution for tracking their page performance.
They also do not want to have to pay for anything to get started. The solutions
currently available are either too complex for non-technical users (e.g. [AutoWebPerf](https://github.com/GoogleChromeLabs/AutoWebPerf)
or sitespeed.io) or too expensive (e.g. speedcurve, calibre, etc.)

## Solution

Performance PSI Tracker is a simple, straightforward solution for simple
pagespeed tracking. It uses a Google Sheets with App Script and a Data Studio
Dashboard template to allow users to enter the URLs to track and visualise
the results.

## Deploying

The code files need to be copied into an AppScript project attached to a Google
Sheet.

Example Dashboard:
https://datastudio.google.com/c/u/0/reporting/4fda7297-8fa3-461a-965f-71767beb17ae/page/VgD/preview

Example Spreadsheet:
https://docs.google.com/spreadsheets/d/1jHtFEYXbUzUyRkmkXI7THk8ZQHUwAd9tn4E0QL8gF7w/copy

## Main Functions (for testing):

File            | Function
--------------- | ---------------------------------------------------------
helper.gs       | cloneSiteSheet (required when running a whole new report)
helper.gs       | runBatchFromQueue (generating a report)
sendAlerts.gs   | checkBudgets (independently check budgets)
sendAlerts.gs   | alertUsers (independently send out emails)
