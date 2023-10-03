Copyright 2023 Google LLC

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

<img src="/imgs/psi_tracker_screenshot.webp" alt="Screenshot of the Performance PSI Tracker" width="40%" >

* [About the Performance PSI Tracker](#about-the-performance-psi-tracker)
* [Setting up the Tracker](#setting-up-the-tracker)
    - [Getting a PSI API Key](#getting-a-psi-key)
    - [Configuring the Tracker](#configuring-the-tracker)
    - Finalizing the Setup
* Using the Performance PSI Tracker
* Visualizing your Metrics
* Advanced Configuration

## About the Performance PSI Tracker

The Performance PSI Tracker is a simple, straightforward solution for measuring
and reporting on website performance metrics, focusing on the
[Core Web Vitals](https://web.dev/vitals). The solution uses Google Sheets for
configuration and storing results, so there's no coding or deployment needed to
get started.

All of the metrics are provided by the 
[Pagespeed Insights](https://developers.google.com/speed/docs/insights/v5/about)
(PSI) service. PSI runs 
[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)
on your website for synthetic metrics and fetches data from the
[Chrome User Experience Report](https://developer.chrome.com/docs/crux/) (CrUX)
to provide real user metrics.

## Setting up the Tracker

### Getting a PSI API Key

A prerequisite for using this solution is having an API key for Pagespeed
Insights. Although it will work a few times without an API key, you will quickly
see errors instead of performance data without one.

To get a key:

1. In your browser, open
[https://developers.google.com/speed/docs/insights/v5/get-started](https://developers.google.com/speed/docs/insights/v5/get-started). 
1.  Under **[Acquiring and using an API key](https://developers.google.com/speed/docs/insights/v5/get-started#APIKey)**,
  click the blue button labeled _Get a Key_. 
1.  In the dialog that opens, either select an existing Google Cloud project or 
  create a new one dedicated to the tracker. 
  <img src="/imgs/api_key_step_1.webp" alt="Enabling the Pagespeed Insights API dialog" width="30%">
1.  Agree to the Terms and Conditions, and then click **NEXT** to create the API
  key. 
1.  Once the key is created, click the **SHOW KEY** button to reveal your API
  key. 
  <img src="/imgs/api_key_step_2.webp" alt="You're all set dialog after generating a PSI API key" width="30%">
1.  Use the copy icon to copy your API key to the clip board. You can also find
  the key in the [_APIs & Services_ section](https://console.cloud.google.com/apis/credentials)
  of the Google Cloud Console for the project you chose.
  
> [!IMPORTANT] The API key you created can be used for _any_ Google API. It is
> suggested that you restrict the key to specific APIs (namely, Pagespeed
> Insights) for better security.

### Configuring the Tracker

The first step to configure the tracker is making a copy of the sheet, which you
can find here &#129046;
[https://docs.google.com/spreadsheets/d/1yEJEykmgPnz8YIKBlXZFFwlt8F7uFxAhZOEs-EBQKOE/view?resourcekey=0-hR6O3nPoOo5y10dSLXJjrw#gid=0](https://docs.google.com/spreadsheets/d/1yEJEykmgPnz8YIKBlXZFFwlt8F7uFxAhZOEs-EBQKOE/view?resourcekey=0-hR6O3nPoOo5y10dSLXJjrw#gid=0)

To make a copy, select the **Make a copy** item from the _File_ menu. The
related App Script file, that the copy dialog warns about, is necessary for the
solution to work.

The steps to configure the tracker are outlined on the _Config_ tab of the
Sheet. More detailed instructions follow:

1.  Paste the API key you created before starting into cell B6, below the label
_API Key for PSI+CrUX (necessary for CrUX and for automated PSI)_. 
<img src="/imgs/config_step_1.webp" alt="Screenshot of the cell in the tracker for the PSI API key with a red arrow pointing at it." width="25%">
1. In the cells on the right of the sheet, enter the details of the websites
   you want to track. The columns have the following uses:
     * **Label** - a free-text label to help tell URLs apart. It can also be used
     in reports as a filter.
     * **URL** - the actual URL to track. Be sure to include the `https` or
     `http` at the start.
     * **Device** - the device type to use with Lighthouse and when querying
     CrUX. The options are "Mobile", "Desktop", or "Mobile and Desktop". Using
     any other values will result in the URL not being sent to PSI and the
     status never changing from 🔃.
     * **URL/Origin** - whether to query CrUX for data for the specific URL or
     for the entire origin. The options are "URL" or "Origin". Any other values
     will result in no CrUX data being saved for the URL.
     * **Active** - a checkbox to signal whether the URL should be sent to
     PSI. When adding a new row, you can copy the checkbox from the row above.
     * **Status** - shows which state the tracker is in with regards to the URL
     in that row. This is updated by the tracker, and doesn't need to be set
     manually.
1. Click the **Authorize script** button. If a pop-up is shown, review the
   permissions being requested and then authorize the app to run on your behalf.
1. Click the **Call PSI API** button to test your configuration. This should
   result in a number of toasts being shown at the bottom right of the sheet,
   with the final toast saying to check the results sheet.
<img src="/imgs/psi_tracker_toast.webp" alt="Google Sheets notification toast saying 'Received Data. Parsing information - Check the Results sheet'." width="25%">
1. If the Results sheet is properly populated after clicking the **Call PSI API** button, click the **Set PSI daily trigger** button to start daily measurement.

Following those steps should result in the Results tab being updated daily with new performance metrics. The rest of the settings on the sheet are for advanced users and detailed below.

