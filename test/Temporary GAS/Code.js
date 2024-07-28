// Run client function with arguments upon POST request
function doPost(e) {
  let body = JSON.parse(e.postData.contents);
  let functionName = body["functionName"];
  let functionArguments = body["functionArguments"];
  let functionResult = executeFunctionByName(functionName, this, functionArguments);
  let resultStringified = JSON.stringify(functionResult);
  return ContentService.createTextOutput(resultStringified).setMimeType(ContentService.MimeType.JSON);
}
// Adapted from: https://stackoverflow.com/a/359910
function executeFunctionByName(functionName, context, args) {
  // Prevent infinite recursions
  if (functionName == "executeFunctionByName") {
    return;
  }
  var namespaces = functionName.split(".");
  var func = namespaces.pop();
  for (var i = 0; i < namespaces.length; i++) {
    context = context[namespaces[i]];
  }
  return context[func].apply(context, args);
}