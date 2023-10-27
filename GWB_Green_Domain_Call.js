/**
 * Create a Green Web Foundation Green Domain GET to get the data from the Database
 * Details: https://datasets.thegreenwebfoundation.org/daily_snapshot/greendomain
 */
function newGWFRequest(url="web.dev.com"){
    Logger.log(url)
    let regex = new RegExp(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img);
    let origin_regex = "";
    try{
      origin_regex = regex.exec(url)[1]
    }
    catch(e){
      throw "Error in newGWFRequest"
    }
    Logger.log(origin_regex)

    const GWF_ENDPOINT = "https://api.thegreenwebfoundation.org/api/v3/greencheck/";
    let endpoint_url = GWF_ENDPOINT;
    endpoint_url += origin_regex
    return {
    'url': endpoint_url,
    'muteHttpExceptions': true,
  }
}
