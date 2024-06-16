/* Change the below for each ebook */
const FOLDER_ID_TO_EXPORT_EPUB_TO = "17B08-41056AiL95yB1Fa_Uk1XaZ8ZHgZ"; // epub file will be put in the folder with the inputted id. Current folder is at: https://drive.google.com/drive/folders/17B08-41056AiL95yB1Fa_Uk1XaZ8ZHgZ?usp=drive_link

function epubPub_main(epubFileName = "ruin-and-rising-by-leigh-bardugo.epub", parentFolder = DriveApp.getFolderById(FOLDER_ID_TO_EXPORT_EPUB_TO), spreadUrl = "https://spread.epub.pub/epub/5a51abd37412f4000781b287") {
  var publicEpubFileName = epubFileName;
  var mimetypeBlob = Utilities.newBlob("application/epub+zip", "application/octet-stream", "mimetype");
  var metaFolderBlob = Utilities.newBlob("<?xml version=\"1.0\"?>\n<container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">\n   <rootfiles>\n      <rootfile full-path=\"OEBPS/content.opf\" media-type=\"application/oebps-package+xml\"/>\n      \n   </rootfiles>\n</container>\n    ", "text/xml", "META-INF/container.xml");
  // Get the file content.opf from its ACTUAL url
  var contentUrl = getContentUrl(spreadUrl);
  return Logger.log(contentUrl);
  var realInfo = contentUrl.substring(contentUrl.indexOf("asset.epub.pub/epub/") + 20);
  epubFileName = realInfo.substring(0, realInfo.indexOf('/'));
  var oebpsUrlInsert = realInfo.substring(epubFileName.length + 1, realInfo.indexOf("content.opf"));
  var fetchContent = getFetch(contentUrl);
  var contentBlob = fetchContent.getBlob().setName("OEBPS/content.opf");
  var txt = fetchContent.getContentText();
  let document = XmlService.parse(txt);
  let root = document.getRootElement();
  let manifest = elmntsWithName(root.getChildren(), "manifest")[0];
  var hrefs = getHREFs(manifest.getChildren()); // thanks to https://stackoverflow.com/a/77247681
  var blobs = getOtherBlobs(hrefs, "https://asset.epub.pub/epub/" + epubFileName + "/" + oebpsUrlInsert);
  blobs.push(mimetypeBlob);
  blobs.push(metaFolderBlob);
  blobs.push(contentBlob);
  var zipped = Utilities.zip(blobs, publicEpubFileName);
  parentFolder.createFile(zipped);
}
function getHREFs(elmnts) {
  var arr = elmnts;
  let att;
  return arr.reduce((a, o) => ((att = o.getAttribute("href")) && a.push(att.getValue()), a), []);
}
function elmntsWithName(elmnts, name) {
  var arr = elmnts;
  var att = "";
  return arr.filter(o => (att = o.getName()) && att == name);
}
function getOtherBlobs(paths, epubAndOebpsUrl) {
  var blobs = UrlFetchApp.fetchAll(paths.map((path) => { return epubAndOebpsUrl + path; })).map((fetch, i) => { return fetch.getBlob().setName("OEBPS/" + paths[i]); });
  return blobs;
}
function getFetch(url) {
  return UrlFetchApp.fetch(url, {
    muteHttpExceptions: true
  });
}
function getContentUrl(spreadUrl) {
  var $ = Cheerio.load(getFetch(spreadUrl).getContentText());
  return $("#assetUrl").attr("value");
}