class LibrarySearch {
    overdriveInstance;
    resultContainerSelector;
    query;
    libraryResults = {};
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
            let alreadyAdded = this.overdriveInstance.hasLibraryWithWebsiteId(library.websiteId);
            this.libraryResults[library.websiteId] = library;
            return `<div class="libraryResult"><img src="${library.logo}">
            <div class="libraryResultInfo">
            <h4>${library.name}</h4>
              <p>${library.locationName}<br>${library.address}<br>${library.city}, ${library.region} ${library.countryCode}<br>(1 of ${library.branchIds.length} branches)</p>
              </div>
            <button data-library-website-id="${library.websiteId}" data-added="${alreadyAdded}" onclick="${this.btnOnclick}">${alreadyAdded ? "Remove Lib." : "Add Lib."}</button></div>`;
        });
        newHTML = newHTML.join('');
        librariesResultContainer.innerHTML = newHTML;
    }
    toggleLibrary(btn) {
        var libraryWebsiteId = btn.getAttribute("data-library-website-id");
        var library = this.libraryResults[libraryWebsiteId];
        var added = btn.getAttribute("data-added");
        if (added == "true") {
            this.overdriveInstance.removeLibraryWithWebsiteId(libraryWebsiteId);
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
    // Set by constructor
    toSearchLibby;
    toSearchSora;
    toSearchEpubpub;

    // Used within class
    results; // // An array of books set by sendQuery

    constructor(toSearchLibby, toSearchSora, toSearchEpubpub) {
        this.toSearchLibby = toSearchLibby;
        this.toSearchSora = toSearchSora;
        this.toSearchEpubpub = toSearchEpubpub;
    }
    async #searchOverdrive(query) {
        var books = [];
        // Search OverDrive
        if (this.toSearchLibby || this.toSearchSora) {
            if (this.toSearchLibby && this.toSearchSora) { // Search both Libby and Sora libraries
                books = await OverDrive.fetchBooks(query);
            } else if (this.toSearchLibby) { // Search Libby libraries
                books = await OverDrive.fetchBooks(query, null, OverDrive.getLibbyInstance());
            } else { // Search Sora libraries
                books = await OverDrive.fetchBooks(query, null, OverDrive.getSoraInstance());
            }
        }
        return books;
    }
    async #searchOpenlibrary(query) {
        const cleanedQuery = encodeURIComponent(query.trim());
        var possibleBooks = []; // Although I could get more than one book, I decided to set the limit to one in the openlibrary api because it is quicker. Perhaps support for more books will be added in the future

        // Search OpenLibrary, to check later for EpubPub
        if (this.toSearchEpubpub) {
            // Documentation at https://openlibrary.org/dev/docs/api/search
            var openLibraryResults = await window.fetch(`https://openlibrary.org/search.json?title=${cleanedQuery}&fields=title,author_name&limit=1&mode=everything`).then(response => response.json()).catch(this.#openLibraryFetchErrorHandler);
            let docs = openLibraryResults?.docs;
            // If an error hasn't occured,
            if (docs !== undefined) {
                // Ensure query results are accurate
                if (!(docs.length > 0)) {
                    openLibraryResults = await window.fetch(`https://openlibrary.org/search.json?q=${cleanedQuery}&fields=title,author_name&limit=1&mode=everything`).then(response => response.json()).catch(this.#openLibraryFetchErrorHandler);
                    docs = openLibraryResults?.docs;
                }
                // Again, make sure an error hasn't occured on the retry
                if (docs !== undefined) {
                    if (docs.length > 0) {
                        var openLibraryBook = docs[0];
                        possibleBooks.push({ 'title': openLibraryBook.title, 'author': openLibraryBook.author_name[0] });
                    }
                }
            }
        }
        return possibleBooks;
    }
    #openLibraryFetchErrorHandler(error) {
        console.error("An error occured while fetching the Open Library book search query. The error is: \n" + error.name + ": " + error.message);
        return {};
    }
    from(toSearchLibby, toSearchSora, toSearchEpubpub) {
        this.toSearchLibby = toSearchLibby;
        this.toSearchSora = toSearchSora;
        this.toSearchEpubpub = toSearchEpubpub;
        return this;
    }
    async sendQuery(query) {
        Book.clearBookInstances();
        var books = [];
        var possibleEpubPubBooks = []; // To be filled with books similar to the query (book titles in lower case because they will be transcribed to a lowercased URL later)

        // Search for both OverDrive and EpubPub at (almost) the same time
        var [overdriveBooks, openlibraryBooks] = await Promise.all([this.#searchOverdrive(query), this.#searchOpenlibrary(query)]);

        // Add the possible book(s) if it's not already in the list provided by Overdrive
        for (var possibleBook of openlibraryBooks) {
            if (!(overdriveBooks.some(book => {
                return book.author.toLowerCase() == possibleBook.author.toLowerCase() && book.title.toLowerCase() == possibleBook.title.toLowerCase()
            }))) {
                possibleEpubPubBooks.push(possibleBook);
            }
        }

        // Search EPUB for only the books already found
        books = overdriveBooks.concat(possibleEpubPubBooks);
        if (this.toSearchEpubpub) {
            var epubVersions = await EpubPub.fetchEpubVersions(books);
            for (let i in epubVersions) {
                books[i]["epubVersion"] = epubVersions[i];
            }
        } else {
            books = books.map(book => {
                book["epubVersion"] = { "exists": false };
                return book;
            })
        }

        // Render books
        var renderedBooks = books.map(book => (new Book(book)).rendered);
        document.querySelector(".bookList").innerHTML = renderedBooks.join('');
        this.results = books;
    }
}
class Search {
    static libbyLibraries = new LibrarySearch(true);
    static soraLibraries = new LibrarySearch(false);
    static books = new BookSearch(true, true, false);
    constructor() { }
}
test();
async function test() {
    var libby = OverDrive.getLibbyInstance();
    var libbyLibraries = await libby.fetchLibraries("noble");
    libby.addLibrary(libbyLibraries[0]);
    var sora = OverDrive.getSoraInstance();
    var soraLibraries = await sora.fetchLibraries("noble");
    sora.addLibrary(soraLibraries[0]);
    var search = Search.books;
    console.log("Start searching...");
    console.time("Searching")
    await search.sendQuery("the 39 clues");
    console.timeEnd("Searching");
    Book.openBigBookPreview(document.querySelector("div[data-book-instance-id]"));
}