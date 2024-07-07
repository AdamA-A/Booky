// https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/HD_transparent_picture.png/1024px-HD_transparent_picture.png
// https://www.epub.pub/images/apple-touch-icon.png?20191128
// https://soraapp.com/assets/wishbone/11.6.1/assets/images/turbo-ios-icon-180.png
// https://libbyapp.com/dewey-16.7.1/inc/images/libby-icon-ios-180.png
// https://ssl.gstatic.com/docs/script/css/add-ons.css
// https://img2.od-cdn.com/ImageType-150/2390-1/{62922068-4F45-415E-818B-B5AE3F3A2697}IMG150.JPG
var cur = 3;
var changes = ["bookyFullBackground", "middleBookyForeground", "highBookyForeground", "highBookyForeground2", "topLeftBooky"];
var bookyBackground = document.getElementById('bookyBackground');
var bookyForeground = document.getElementById('bookyForeground');
var bookyContent = document.getElementById('bookyContent');
var curBookyBottom = 0;
var fixContentHeightInterval = { "interval": setInterval(fixContentHeight), "keepRunning": true };
// window.onload = () => {bookyForeground.style.backgroundColor = "green"}
function sceneChange(button) {
    console.log(`replacing scene ${cur}: ${changes[cur]}`);
    bookyBackground.classList.remove(changes[cur]);
    cur = (cur + 1) % (changes.length);
    if (changes[cur] == "topLeftBooky") {
        fixContentHeightInterval.keepRunning = false;
        clearInterval(fixContentHeightInterval.interval);
        fixContentHeightInterval.interval = false;
        bookyContent.style.top = "";
    } else if (fixContentHeightInterval.interval === false) {
        fixContentHeightInterval.keepRunning = true;
        fixContentHeightInterval.interval = setInterval(fixContentHeight);
    }
    bookyBackground.classList.add(changes[cur]);
    console.log(`with scene ${cur}: ${changes[cur]}`);
    button.textContent = changes[cur];
}
function fixContentHeight() {
    if (fixContentHeightInterval.keepRunning) {
        curBookyBottom = bookyForeground.getBoundingClientRect().bottom;
        bookyContent.style.top = curBookyBottom + "px";
    }
}
function other(button) {
    var toClone = document.querySelector(changes[cur] == "highBookyForeground" ? "#libbyLibrarySearch .libraryResult" : (changes[cur] == "topLeftBooky" ? "#bookSearch .bookContainer" : "#soraLibrarySearch .libraryResult"));
    for (var i = 0; i < 1; i++) {
        toClone.parentNode.appendChild(toClone.cloneNode(true));
    }
}
sceneChange(document.getElementById("bme"))