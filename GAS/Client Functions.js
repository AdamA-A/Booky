// These functions are to be run from the client side
function client_fetchAllWithMutedExceptions(urlWithParametersObjects = ["https://www.epub.pub/book/ruin-and-rising-by-leigh-bardugo", "https://www.epub.pub/book/ruin-and-rising-by-leigh-bardugo"]) {
    /*Logger.log("To fetch:")
    let fetched = UrlFetchApp.fetchAll(urlWithParametersObjects);
    Logger.log(fetched)
    Logger.log("JSON Stringified:")
    let stringified = JSON.stringify(fetched.map(x => x.getContentText()));
    Logger.log(stringified);
    return stringified; */
    return UrlFetchApp.fetchAll(urlWithParametersObjects).map(x => {return {"code": x.getResponseCode(), "text": x.getContentText()}});
}