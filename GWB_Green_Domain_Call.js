/**
 * Create a Green Web Foundation Green Domain GET to get the data from the Database
 * Details: https://datasets.thegreenwebfoundation.org/daily_snapshot/greendomain
 */
function newGWFRequest(url){
  if(url === ""){
    throw "Error in newGWFRequest, URL is empty"
  }
  Logger.log(url)
  let regex = new RegExp(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img);
  let origin_regex = "";
  try{
    origin_regex = regex.exec(url)[1]
  }
  catch(e){
    throw "Error in newGWFRequest"
  }
  const GWF_ENDPOINT = "https://api.thegreenwebfoundation.org/api/v3/greencheck/";
  return {
  'url': GWF_ENDPOINT += origin_regex,
  'muteHttpExceptions': true,
}
}


/**
* A simple demo function to verify from GWB_Green_Domain_Call.gs that we are getting the expected answer.
* Logging the content locally using Logger.log to verify that it is matching expectations/
* Result should be {url=https://api.thegreenwebfoundation.org/api/v3/greencheck/web.dev.com, muteHttpExceptions=true}
*/
function newGWFRequestDemo(){
const url = "web.dev.com";
let request = newGWFRequest(url)
Logger.log(request);
}