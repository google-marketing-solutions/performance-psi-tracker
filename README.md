Copyright 2024 Google LLC

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

Demo:
https://docs.google.com/spreadsheets/d/1yEJEykmgPnz8YIKBlXZFFwlt8F7uFxAhZOEs-EBQKOE/edit?resourcekey=0-hR6O3nPoOo5y10dSLXJjrw#gid=0

[Latest: https://docs.google.com/spreadsheets/d/1RIJRfXYX0acXO0WTMjH8aQxMmdLqT1Qg5ZhNcn3hV6M/edit?usp=sharing]

## Summary

A simple solution for measuring and reporting on website performance based on 
[Pagespeed Insights](https://developers.google.com/speed/docs/insights/v5/about)
(PSI).

## Why?

Tracking web performance changes and improvement can be hard for advertisers
whose teams have heterogeneous needs and objectives. Making the business case
to license a third-party tool can be daunting and setting up many of the
open-source solutions is beyond a marketing or CRO team's comfort zone, and out
of the remit of most development teams.

## What?

A free, straightforward solution to track real user metrics from the [Chrome
User Experience Report](https://developer.chrome.com/docs/crux/) (CrUX) and
synthetic data from [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)
using only Google Sheets to fetch data and store the results. No code required.

## Get Started

### Getting a Pagespeed Insights API Key

A prerequisite of using this solution is having an API key for Pagespeed
Insights. Pagespeed Insights is used to get both the CrUX and Lighthouse data
the solution is based on. Although it will work a few times without an API key,
you will quickly see errors instead of performance data without one.

To get a key:

1.  In your browser, open
[https://developers.google.com/speed/docs/insights/v5/get-started](https://developers.google.com/speed/docs/insights/v5/get-started). 
2.  Under **[Acquiring and using an API key](https://developers.google.com/speed/docs/insights/v5/get-started#APIKey)**,
  click the blue button labeled _Get a Key_. 
3.  In the dialog that opens, either select an existing Google Cloud project or 
  create a new one dedicated to the tracker. 
4.  Agree to the Terms and Conditions, and then click **NEXT** to create the API
  key. 
5.  Once the key is created, click the **SHOW KEY** button to reveal your API
  key. 
6.  Use the copy icon to copy your API key to the clip board. You can also find
  the key in the [_APIs & Services_ section](https://console.cloud.google.com/apis/credentials)
  of the Google Cloud Console for the project you chose.

### Setting up the Tracker

Once you have your API key for PSI, make a copy of
https://docs.google.com/spreadsheets/d/1Ip5w-d4et3I6l59qqz2RI0MKPAsG6Bf_BpVD-o7KVkc/edit#gid=0
and follow the instructions on the config tab.

[Latest: https://docs.google.com/spreadsheets/d/1RIJRfXYX0acXO0WTMjH8aQxMmdLqT1Qg5ZhNcn3hV6M/edit?usp=sharing]

