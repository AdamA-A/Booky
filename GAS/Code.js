// Change with each deployment
const DEPLOYMENTS = {
  "Index": {
    "fileName": "Index",
    "url": "https://script.google.com/macros/s/AKfycbyvmRXQ_KJJ76MAU6C93fVjM0fIbchVYrRDh9vPrZnECADkfRfEXbzV-xnX8dDp5Mqv/exec",
    "deploymentId": "AKfycbyvmRXQ_KJJ76MAU6C93fVjM0fIbchVYrRDh9vPrZnECADkfRfEXbzV-xnX8dDp5Mqv"
  },
  "Content": {
    "fileName": "Content",
    "url": "https://script.google.com/macros/s/AKfycbwMDdOKSeE7gJj1ZO9PtxpuizPAJUOyZqQcfhoNWXcPJoT_7G6dI96l-6LCCLAlrvX8/exec",
    "deploymentId": "AKfycbwMDdOKSeE7gJj1ZO9PtxpuizPAJUOyZqQcfhoNWXcPJoT_7G6dI96l-6LCCLAlrvX8"
  }
}
const CURRENTLY_DEPLOYING = DEPLOYMENTS.Content;
/* Do not change the below */
const FAVICON_URL = "https://i.imgur.com/N1r2dp3.png";
const ERRS = {
  0: "Couldn't find last page."
};
function doGet(e) {
  var template = HtmlService.createTemplateFromFile(CURRENTLY_DEPLOYING.fileName)
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setFaviconUrl(FAVICON_URL);
  return template;
}
function code_main() {
  Logger.log(Session.getActiveUser().getEmail())
}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}
function err(code) {
  console.error(ERRS[code]);
  return code;
}