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
They also do not want to have to pay for anything to get started.

## Solution

Performance PSI Tracker is a simple, straightforward solution for simple
pagespeed tracking. It uses a Google Sheets with App Script and a Data Studio
Dashboard template to allow users to enter the URLs to track and visualise
the results.

## Deploying

The code files need to be copied into an AppScript project attached to a Google
Sheet.

You will also need a Pagespeed Insights API key to use the solution. You can get one on the [Pagespeed Insights documentation site](https://developers.google.com/speed/docs/insights/v5/get-started).

## Examples 
Example Dashboard:
https://datastudio.google.com/reporting/3491d840-6456-41a2-a912-ba35c6b44a53/preview

[Update February 2023 - Beta] Revamped Dashboard: https://lookerstudio.google.com/u/0/reporting/fbc4c1df-3766-417a-8ed3-1a10186e08fa/page/jQ9DD/preview

Example Spreadsheet:
https://docs.google.com/spreadsheets/d/1i_5fiSpbkU3CG9h4MwGzSxchh3Ji6s8Mj0uDQykRoWM/copy

Presentation on how to set everything up:
https://docs.google.com/presentation/d/1RMd1q1qyW02Ac0DcSk4VvVfiW6OY3O6a3U8_ESUgSio/edit?usp=sharing


## Main Functions (for testing):

File            | Function
--------------- | ---------------------------------------------------------
helper.gs       | cloneSiteSheet (required when running a whole new report)
helper.gs       | runBatchFromQueue (generating a report)
sendAlerts.gs   | checkBudgets (independently check budgets)
sendAlerts.gs   | alertUsers (independently send out emails)
