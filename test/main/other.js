var cur = 3;
var changes = ["bookyFullBackground", "middleBookyForeground", "highBookyForeground", "highBookyForeground2", "topLeftBooky"];
const nameToScene = ["blank", "login", "libby", "sora", "book"];
let menuCheckbox = document.getElementById("menu");
var bookyBackground = document.getElementById('bookyBackground');
var bookyForeground = document.getElementById('bookyForeground');
var bookyContent = document.getElementById('bookyContent');
var curBookyBottom = 0;
var fixContentHeightInterval = { "interval": setInterval(fixContentHeight), "keepRunning": true };
// window.onload = () => {bookyForeground.style.backgroundColor = "green"}
function sceneChange(button = document.getElementById("bme")) {
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
sceneChange();
function changeSceneTo(place) {
    menuCheckbox.checked = false;
    if (nameToScene[cur] == place) {return;}
    sceneChange();
    changeSceneTo(place);
}