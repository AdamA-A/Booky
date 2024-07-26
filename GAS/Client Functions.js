// These functions are to be run from the client side
function client_fetchAllWithMutedExceptions(urlWithParametersObjects) {
    return JSON.stringify(UrlFetchApp.fetchAll(urlWithParametersObjects));
}