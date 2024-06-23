async function searchLibby(query) {
    var libby = OverDrive.getLibbyInstance();
    var results = await libby.fetchLibraries(query);
    var librariesResultContainer = document.querySelector("#libbyLibrarySearch .searchResults");
    var newHTML = results.map((library) => {
        return `<div class="libraryResult"><img src="${library.logo}">
            <div class="libraryResultInfo">
              <h4>${library.name}</h4>
              <p>${library.locationName}<br>${library.address}<br>${library.city}, ${library.region} ${library.countryCode}<br>(1 of ${library.branchIds.length} branches)</p>
            </div>
            <button data-library="${Encoding.encode(library)}" onclick="addLibbyLibrary(this)">Add Lib.</button></div>`;
    });
    newHTML = newHTML.join('');
    librariesResultContainer.innerHTML = newHTML;
}
async function searchLibbyNew(query) {
    await Search.libbyLibraries.sendQuery(query);
}
async function searchSora(query) {
    var sora = OverDrive.getSoraInstance();
    var results = await sora.fetchLibraries(query);
    var librariesResultContainer = document.querySelector("#soraLibrarySearch .searchResults");
    var newHTML = results.map((library) => {
        return `<div class="libraryResult"><img src="${library.logo}">
            <div class="libraryResultInfo">
              <h4>${library.name}</h4>
              <p>${library.locationName}<br>${library.address}<br>${library.city}, ${library.region} ${library.countryCode}<br>(1 of ${library.branchIds.length} branches)</p>
            </div>
            <button data-library="${Encoding.encode(library)}" onclick="addSoraLibrary(this)">Add Lib.</button></div>`;
    });
    newHTML = newHTML.join('');
    librariesResultContainer.innerHTML = newHTML;
}
async function addLibbyLibrary(btn) {
    var libby = OverDrive.getLibbyInstance();
    var encodedLibrary = btn.getAttribute("data-library");
    var library = Encoding.decode(encodedLibrary);
    libby.addLibrary(library);
    btn.textContent = "Remove Lib.";
    btn.setAttribute("onclick", "removeLibbyLibrary(this)")
}
async function removeLibbyLibrary(btn) {
    var libby = OverDrive.getLibbyInstance();
    var encodedLibrary = btn.getAttribute("data-library");
    var library = Encoding.decode(encodedLibrary);
    libby.removeLibrary(library);
    btn.textContent = "Add Lib.";
    btn.setAttribute("onclick", "addLibbyLibrary(this)")
}
async function addSoraLibrary(btn) {
    var sora = OverDrive.getSoraInstance();
    var encodedLibrary = btn.getAttribute("data-library");
    var library = Encoding.decode(encodedLibrary);;
    sora.addLibrary(library);
    btn.textContent = "Remove Lib.";
    btn.setAttribute("onclick", "removeSoraLibrary(this)")
}
async function removeSoraLibrary(btn) {
    var sora = OverDrive.getLibbyInstance();
    var encodedLibrary = btn.getAttribute("data-library");
    var library = Encoding.decode(encodedLibrary);
    sora.removeLibrary(library);
    btn.textContent = "Add Lib.";
    btn.setAttribute("onclick", "addSoraLibrary(this)")
}
/* <div class="libraryResult">
            <img src="https://thunder.cdn.overdrive.com/logos/crushed/2864.png?1">
            <div class="libraryResultInfo">
              <h4>NOBLE VERY LONG NAME GOES HERE</h4>
              <p>Wharton County Library<br>1920 N Fulton St<br>Wharton, Texas US<br>(1 of 14 branches)</p>
            </div>
            <button>Add Library</button>
          </div>
          {
    "id": 1554,
    "locationName": "Revere Public Library",
    "address": "179 Beach St",
    "city": "Revere",
    "region": "Massachusetts",
    "country": "United States",
    "countryCode": "US",
    "fulfillmentId": "noble",
    "name": "NOBLE: North of Boston Library Exchange",
    "logo": "https://thunder.cdn.overdrive.com/logos/crushed/1554.png?1",
    "branchIds": [
        43479,
        43861,
        44870,
        45495,
        45593,
        46137,
        46169,
        48102,
        48250,
        48360,
        48505,
        48548,
        49825,
        49843,
        49943,
        50393,
        50451,
        50769,
        50770,
        50898,
        51584,
        51684,
        52187,
        52795,
        113413,
        118877,
        44432,
        48549,
        61598,
        105913,
        106007,
        120015,
        124321,
        204682
    ],
    "websiteId": 327,
    "usingLibby": true
}
    */