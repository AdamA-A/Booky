class LibrarySearch {
    overdriveInstance;
    resultContainerSelector;
    query;
    libraryResults;
    constructor(useLibby) {
        if (useLibby) {
            this.overdriveInstance = OverDrive.getLibbyInstance();
            this.resultContainerSelector = "#libbyLibrarySearch .searchResults";
        } else {
            this.overdriveInstance = OverDrive.getSoraInstance();
            this.resultContainerSelector = "#soraLibrarySearch .searchResults";
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
            <button data-library-website-id="${library.websiteId}" onclick="addLibbyLibrary(this)">Add Lib.</button></div>`;
        });
        newHTML = newHTML.join('');
        librariesResultContainer.innerHTML = newHTML;
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