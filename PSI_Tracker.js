/**
 * Copyright 2023 Google LLC
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
 * This file is the core of the Performance PSI tracker project. This file must
 * be deployed to an appropriate Google Sheet to be used, along with the other
 * files in the project.
 */


const SCREENSHOT_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Screenshots")
const FIELD_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Fields")
const RESULT_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Results")
const CONFIG_SHEET = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config")
const RESULT_SHEET_HEADER = RESULT_SHEET.getRange("1:1").getValues()

/**
 * Parse URLs from the "Config" tab and sends it to the selected API
 */
function callPSIAPI() {
  performTasks("PSI")
}


/**
 * Call performTasks with the screenshot boolean turned to on
 */
function callPSIAPIWithScreenshots() {
  performTasks("PSI", true)
}

/**
 * Call performTasks just for the CrUX API
 */
function callCrUX() {
  performTasks("CrUX")
}

/**
 * Call performTasks for CrUX History
 */
function callCrUXHistory() {
  performTasks("CrUX History")
}



/**
 * Simple runBatch function to be called by trigger
 */
function runBatchPSI() {
  runBatch("PSI")
}


/**
 * Simple runBatch function to be called by trigger
 */
function runBatchPSIWithScreenshots() {
  runBatch("PSI", true)
}


/**
 * Simple runBatch function to be called by trigger
 */
function runBatchCrUXHistory() {
  runBatch("CrUX History")
}


/**
 * Simple runBatch function to be called by trigger
 */
function runBatchCrUX() {
  runBatch("CrUX")
}




/**
 * Parse URLs from the "Config" tab and sends it to the selected API
 */
function performTasks(api = "PSI", save_screenshot = false) {
    // Add the loading symbols 
    initURLStatus();
    // Run batches
    const execution_mode_boolean = CONFIG_SHEET.getRange("B24").getValue();
    const execution_mode = execution_mode_boolean ? "TRIGGER" : "SERIAL";
    // Default execution mode: queries run one after the other and might timoute
    if(execution_mode == "SERIAL"){
      while(runBatch(api, save_screenshot)){
          Logger.log("Batch done")
      }
      toast("Done","Finished")
    }
    // Advanced mode with triggers
    else if(execution_mode == "TRIGGER"){
      removeBatchTriggers();
      SpreadsheetApp.flush();
      const TIME_BETWEEN_BATCHES = CONFIG_SHEET.getRange("B27").getValue();
      if(api == "PSI" && save_screenshot == true){
        ScriptApp.newTrigger('runBatchPSIWithScreenshots')
          .timeBased()
          .everyMinutes(TIME_BETWEEN_BATCHES)
          .create();
      }
      else if(api == "PSI" && save_screenshot == false){
        ScriptApp.newTrigger('runBatchPSI')
          .timeBased()
          .everyMinutes(TIME_BETWEEN_BATCHES)
          .create();
      }
      else if(api == "CrUX"){
        ScriptApp.newTrigger('runBatchCrUX')
          .timeBased()
          .everyMinutes(TIME_BETWEEN_BATCHES)
          .create();
      }
      else if(api == "CrUX History"){
        ScriptApp.newTrigger('runBatchCrUXHistory')
          .timeBased()
          .everyMinutes(TIME_BETWEEN_BATCHES)
          .create();
      }
      runBatch(api, save_screenshot);
    }
}


const COLUMN_STATUS = 8;

/**
 * Sets a clear state for the program, changing the "Status" column of all valid URLs to "⏳", waiting to be parsed
 */
function initURLStatus() {
    toast("Initialising","Removing previous executions and setting a blank state");
    removeBatchTriggers();
    let sheet = CONFIG_SHEET;
    let last_row = sheet.getLastRow();
    let last_column = sheet.getLastColumn();
    let values = sheet.getRange(1, 1, last_row, last_column).getValues();
    // Go line by line of all URLs and change value and note
    for (let i = 1; i < values.length; i++) {
        const url = values[i][4];
        const active = values[i][7]; //G
        sheet.getRange(i+1,COLUMN_STATUS+1).setValue("")
        sheet.getRange(i+1,COLUMN_STATUS+1).setNote("")
        // Skip empty lines
        if(url == "" || url == null || url == undefined){continue;}
        if(!active){continue;}
        sheet.getRange(i+1,COLUMN_STATUS+1).setValue("⏳")
    }
    SpreadsheetApp.flush();
}

/**
 * Run Batch, reads the number of URLs to send to the API and runs a batch of them
 */
function runBatch(api = "PSI", save_screenshot = false){
    let sheet = CONFIG_SHEET;
    let NUMBER_OF_URLS_PER_BATCH = +sheet.getRange("B21").getValue();
    let last_row = sheet.getLastRow();
    let last_column = sheet.getLastColumn();
    let values = sheet.getRange(1, 1, last_row, last_column).getValues();

    // STEP 1: Create a batch of NUMBER_OF_URLS_PER_BATCH URL
    let batch = [];
    for (let i = 1; i < values.length; i++) {

        // Read the values from column D to H
        const label = values[i][3];  //D
        const url = values[i][4];    //E
        const device = values[i][5]; //F
        const origin = values[i][6]; //G
        const active = values[i][7]; //G
        const status = values[i][COLUMN_STATUS]; //H
        
        // Skip empty content
        if(url == "" || url == null || url == undefined){continue;}
        if(!active){continue;}

        // Add the line to the current batch
        if(status == "⏳"){
            // Mark the status as being worked on
            sheet.getRange(i+1,COLUMN_STATUS+1).setValue("🔃")
            // Check if "Mobile" or "Phone" was requested
            if(device.toLowerCase().indexOf("mobile") != -1 || device.toLowerCase().indexOf("phone") != -1){
                batch.push({id:i, label:label, url:url, device:"MOBILE", origin:origin});
            }
            // Check if "Desktop" was requested
            if(device.toLowerCase().indexOf("desktop") != -1){
                batch.push({id:i, label:label, url:url, device:"DESKTOP", origin:origin});
            }
            // Break if we went over the number of maximum URLs per batch (±1)
            if(batch.length >= NUMBER_OF_URLS_PER_BATCH){break;}
        }
    }

    // STEP 2: Send the batch to the API
    toast("Batch","Sending " + JSON.stringify(batch));
    // Use newPSIRequest to make GET requests to the API, for the PSI API they look like this:
    // https://googleapis.com/pagespeedonline/v5/runPagespeed?key=API_KEY&category=ACCESSIBILITY&category=BEST_PRACTICES&category=PERFORMANCE&category=PWA&category=SEO&strategy=MOBILE&url=http://web.dev
    let urls = [];
    if(api == "PSI"){urls = batch.map(d=>(newPSIRequest(d.url,d.device)))}
    if(api == "CrUX"){urls = batch.map(d=>(newCrUXRequest(d.url,d.device, d.origin)))}
    if(api == "CrUX History"){urls = batch.map(d=>(newCrUXHistoryRequest(d.url,d.device, d.origin)))}
    Logger.log(urls)

    // Use UrlFetchApp to GET those URLs in a batch
    let fetch = UrlFetchApp.fetchAll(urls);
    
    // STEP 3: Parse the output
    toast("Received data", "Parsing information - Check the Results sheet")
    parseResults(api, fetch, batch, sheet, save_screenshot);

    SpreadsheetApp.flush();
    // STEP 4: If there are more URLs to run, cycle through this function again 
    toast("Done","Batch finished")
    if(batch.length >= NUMBER_OF_URLS_PER_BATCH){
        return true;
    }
    // if not, we exit and finish the program
    removeBatchTriggers();
    return false;
}

/**
 * To parse the results from the PSI API, we rely on the tab "Fields" that are going to contain the functions to run
 */
function parseResults(api, fetch, batch, sheet, save_screenshot = false){
    // STEP 1: We retrieve the fields we want to extract from the JSON from the tab "Fields"
    // They are made of the following elements:
    // 1. A "Method", which corresponds to the current API being run (here we will focus only on PSI API)
    // 2. A "Field" which is the name of the field calculated and will match the "Results" tab
    // 3. A "Data" which contains the way to access the information from the "content" field from the response
    // Example: "LH Version" reads `content["lighthouseResult"]["lighthouseVersion"]` to read the Lighthouse version from the API
    let sheet_fields = FIELD_SHEET;
    let sheet_fields_last_row = sheet_fields.getLastRow();
    let fields = sheet_fields.getRange(1, 1, sheet_fields_last_row, 3).getValues();
    fields = fields.map(d=>{
        return {
            "method": d[0],
            "field": d[1],
            "data": d[2]
        }
    })
    // We only focus on the fields matching the PSI API method
    if(api == "PSI"){fields = fields.filter(d=>d.method == "PSI API")}
    if(api == "CrUX"){fields = fields.filter(d=>d.method == "CrUX")}
    if(api == "CrUX History"){fields = fields.filter(d=>d.method == "CrUX History")}

    // STEP 2: We iterate through all the fields
    for (let i = 0; i < fetch.length; i++) {
        // Indicate that we worked on that row in the Config tab
        sheet.getRange(batch[i].id+1,COLUMN_STATUS+1).setValue("✅")
        // Read and parse the data for that specific cakk
        const data = fetch[i];
        Logger.log(data)
        let content = {};
        // Try to parse the answer from the API
        try{
          content = JSON.parse(data);
        }
        // If an error occurs (ex: HTML returned instead of JSON), throw it here
        catch(e){
          sheet.getRange(batch[i].id+1,COLUMN_STATUS+1).setValue("🟥")
          sheet.getRange(batch[i].id+1,COLUMN_STATUS+1).setNote("Error " + e.toString() + "\n\nFull error:\n" + JSON.stringify(data));
        }
        Logger.log(content)
        // If an error occured, flagged it in the Config tab, under the Status
        if(content["error"]){
            sheet.getRange(batch[i].id+1,COLUMN_STATUS+1).setValue("❌")
            sheet.getRange(batch[i].id+1,COLUMN_STATUS+1).setNote("Error " + JSON.stringify(content["error"]))
        }
        else{
            // Build a dic that will contain all the extracted information
            let output = {
              "Date": new Date().toISOString().slice(0, 10),
              "Label": batch[i].label,
              "URL": batch[i].url,
              "Device": batch[i].device,
              "URL / Origin": batch[i].origin
            };
            // Iterate through all the fields and eval the function to get their respective values, adding them to the dic
            for (let j = 0; j < fields.length; j++) {
                try{
                    // Origin field is used in some calls to know if there was no URL-level data and we reverted to Origin level
                    let origin = batch[i].origin;
                    // Eval the formula, for example "content["lighthouseResult"]["lighthouseVersion"]"
                    let value = eval(fields[j].data)
                    // Add it to our dic
                    output[fields[j].field] = value
                }
                catch(e){
                    // If error, write it in placce
                    output[fields[j].field] = "Error " + JSON.stringify(e.toString())
                }
            }
            Logger.log(output);
            
            // STEP 3. We build the new row based on what we read on the Results first line
            if(api == "PSI"){
              let sheet_results = RESULT_SHEET;
              let results_header = RESULT_SHEET_HEADER;
              // We translate the dic output to an array row based on indexes found in "Results"
              let array = [];
              // Go through all the Dimensions listed in the header and build the array
              for (let k = 0; k < results_header[0].length; k++){
                let dimension = results_header[0][k];
                if(dimension in output){
                  array.push(output[dimension])
                }
                else{
                  array.push("No data")
                }
              }
              // Append the array at the end of "Results"
              sheet_results.appendRow(array)
            }
            else if(api == "CrUX"){
              let sheet_results = RESULT_SHEET;
              let results_header = RESULT_SHEET_HEADER;
              // We translate the dic output to an array row based on indexes found in "Results"
              let array = [];
              // Go through all the Dimensions listed in the header and build the array
              for (let k = 0; k < results_header[0].length; k++){
                let dimension = results_header[0][k];
                if(dimension in output){
                  array.push(output[dimension])
                }
                else{
                  array.push("")
                }
              }
              // Append the array at the end of "Results"
              sheet_results.appendRow(array)
            }
            else if(api == "CrUX History"){
              if("Date" in output){
                for(entry = 0; entry < output["Date"].length; entry++){
                  let sheet_results = RESULT_SHEET;
                  let results_header = RESULT_SHEET_HEADER;
                  // We translate the dic output to an array row based on indexes found in "Results"
                  let array = [];
                  // Go through all the Dimensions listed in the header and build the array
                  for (let k = 0; k < results_header[0].length; k++){
                    let dimension = results_header[0][k];
                    if(["Label", "URL", "Device", "URL / Origin"].indexOf(dimension) != -1 && dimension in output){
                      array.push(output[dimension])
                    }
                    else if(dimension in output){
                      array.push(output[dimension][entry])
                    }
                    else{
                      array.push("")
                    }
                  }
                  // Append the array at the end of "Results"
                  sheet_results.appendRow(array)
                }
              }
            }

            // STEP 4. SCREENSHOTS
            if(save_screenshot){
              let array_screenshot = [
                new Date().toISOString().slice(0, 16),
                batch[i].label,
                batch[i].url,
                batch[i].device,
                batch[i].origin
              ]

              // Get final screenshot
              array_screenshot.push(content.lighthouseResult.audits["final-screenshot"].details.data.toString())
              // Get Thumbnails information
              array_screenshot = array_screenshot.concat(content.lighthouseResult.audits["screenshot-thumbnails"].details.items.map(d=>d.data.toString()))
              Logger.log(array_screenshot)
              // Save blobs ("data:....")
              let sheet_screenshots = SCREENSHOT_SHEET
              sheet_screenshots.appendRow(array_screenshot);
              SpreadsheetApp.flush();
              last_screenshot_row = sheet_screenshots.getLastRow();
              // Try to create imgages over cell - this was actually a bad idea, it freezes the spreadsheet
              // for(let k = 5; k < array_screenshot.length; k++){
              //   let icb = SpreadsheetApp.newCellImage();
              //   icb.setSourceUrl(array_screenshot[k]);
              //   icb.setAltTextTitle(array_screenshot[k]);
              //   let ic = icb.build();
              //   sheet_screenshots.getRange(last_screenshot_row, k+10+2).setValue(ic);
              // }
            }
        }
    }
}