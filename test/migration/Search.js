class LibrarySearch {
    overdriveInstance;
    resultContainerSelector;
    query;
    libraryResults;
    btnOnclick;
    constructor(useLibby) {
        if (useLibby) {
            this.overdriveInstance = OverDrive.getLibbyInstance();
            this.resultContainerSelector = "#libbyLibrarySearch .searchResults";
            this.btnOnclick = "Search.libbyLibraries.toggleLibrary(this);";
        } else {
            this.overdriveInstance = OverDrive.getSoraInstance();
            this.resultContainerSelector = "#soraLibrarySearch .searchResults";
            this.btnOnclick = "Search.soraLibraries.toggleLibrary(this);";
        }
        this.libraryResults = {};
    }
    async sendQuery(query) {
        this.query = query;
        this.libraryResults = {};
        var results = await this.overdriveInstance.fetchLibraries(query);
        var librariesResultContainer = document.querySelector(this.resultContainerSelector);
        var newHTML = results.map((library) => {
            this.libraryResults[library.websiteId] = library;
            return `<div class="libraryResult"><img src="${library.logo}">
            <div class="libraryResultInfo">
            <h4>${library.name}</h4>
              <p>${library.locationName}<br>${library.address}<br>${library.city}, ${library.region} ${library.countryCode}<br>(1 of ${library.branchIds.length} branches)</p>
              </div>
            <button data-library-website-id="${library.websiteId}" data-added="false" onclick="${this.btnOnclick}">Add Lib.</button></div>`;
        });
        newHTML = newHTML.join('');
        librariesResultContainer.innerHTML = newHTML;
    }
    toggleLibrary(btn) {
        var libraryWebsiteId = btn.getAttribute("data-library-website-id");
        var library = this.libraryResults[libraryWebsiteId];
        var added = btn.getAttribute("data-added");
        if (added == "true") {
            this.overdriveInstance.removeLibrary(library);
            btn.setAttribute("data-added", "false");
            btn.textContent = "Add Lib.";
        } else {
            this.overdriveInstance.addLibrary(library);
            btn.setAttribute("data-added", "true");
            btn.textContent = "Remove Lib.";
        }
    }
}
class BookSearch {
    //
}
class Search {
    static libbyLibraries = new LibrarySearch(true);
    static soraLibraries = new LibrarySearch(false);
    constructor() {}
}