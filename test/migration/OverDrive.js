class OverDrive {
    // JS-Equivalent of a private constructor
    static #isInternalConstructing = false;
    constructor(overdriveType) {
        if (!OverDrive.#isInternalConstructing) {
            throw new TypeError("OverDrive is not constructable");
        }
        OverDrive.#isInternalConstructing = false;
        // More initialization logic
        if (overdriveType == "libby") {
            this.#useLibby = true;
        } else if (overdriveType == "sora") {
            this.#useLibby = false;
        } else {
            throw new TypeError("overdriveType must equal 'libby' or 'sora'");
        }
    }
    // Instances
    static #libbyInstance;
    static #soraInstance;
    static #createInstance(type) {
        OverDrive.#isInternalConstructing = true;
        return new OverDrive(type);
    }
    static getLibbyInstance() {
        return OverDrive.#libbyInstance ? OverDrive.#libbyInstance : OverDrive.#libbyInstance = OverDrive.#createInstance("libby");
    }

    static getSoraInstance() {
        return OverDrive.#soraInstance ? OverDrive.#soraInstance : OverDrive.#soraInstance = OverDrive.#createInstance("sora");
    }

    #useLibby; // Defined in constructor
    static #FORMATS = { "ebook": "ebook-kindle,ebook-overdrive,ebook-epub-adobe,ebook-pdf-adobe,ebook-kobo,ebook-overdrive-provisional,ebook-media-do", "audiobook": "audiobook-overdrive,audiobook-mp3,audiobook-overdrive-provisional", "magazine": "magazine-overdrive" };

    #cachedUserLibraries = []; // Defined when altering libraries

    // Sora-specific ones are: ebook-overdrive-provisional,audiobook-overdrive-provisional,ebook-media-do
    async overdrive_main() {
        // var libs = [this.fetchLibraries("noble")[2]];
        var libs = await this.fetchLibraries("revere");
        // return console.log(libs.map(d => d.logo))
        console.log(JSON.stringify(await this.fetchBooks("shadow and bone", libs), null, 2));
    }
    async addLibrary(library) {
        this.#cachedUserLibraries.push(library);
    }
    async removeLibraryWithWebsiteId(libraryWebsiteId) {
        const indexOfLibrary = this.#cachedUserLibraries.findIndex(library => library.websiteId == libraryWebsiteId);
        if (indexOfLibrary > -1) {
            this.#cachedUserLibraries.splice(indexOfLibrary, 1);
        }
    }
    hasLibraryWithWebsiteId(libraryWebsiteId) {
        return this.#cachedUserLibraries.some(library => {
            return library.websiteId == libraryWebsiteId;
        })
    }
    async updateGASLibraries() {
        if (this.#useLibby) {
            await GAS.setLibbyLibraries(this.#cachedUserLibraries);
        } else {
            await GAS.setSoraLibraries(this.#cachedUserLibraries);
        }
    }
    static async fetchBooks(searchQuery, formats, specificInstance/* = OverDrive.getLibbyInstance().#cachedUserLibraries*/) {
        if (!formats) {
            formats = ["ebook", "audiobook", "magazine"];
        }
        var libraries;
        if (specificInstance instanceof OverDrive) {
            libraries = specificInstance.#cachedUserLibraries;
        } else {
            libraries = OverDrive.getLibbyInstance().#cachedUserLibraries.concat(OverDrive.getSoraInstance().#cachedUserLibraries);
        }
        const groupBooksById = (books) => {
            return books.reduce((result, book) => {
                let match = result.find((r) => r.id === book.id)
                if (!match) {
                    match = {
                        id: book.id,
                        author: book.firstCreatorName,
                        title: book.title,
                        image: book.covers.cover150Wide ? book.covers.cover150Wide.href : null,
                        sample: book.sample ? book.sample.href : null,
                        sortOrder: book.sortOrder,
                        type: book.type.name,
                        items: []
                    }
                    if (book.detailedSeries) {
                        match.detailedSeries = {
                            series: book.detailedSeries.seriesName,
                            seriesPosition: book.detailedSeries.readingOrder
                        }
                    }
                    result.push(match)
                }
                const bookData = {
                    availableCopies: book.availableCopies,
                    estimatedWaitDays: book.estimatedWaitDays,
                    href: `https://${book.usingLibby ? "libby" : "sora"}app.com/${book.usingLibby ? "search" : "library"}/${book.library}/search/query-${book.title}/page-1/${book.id}`,
                    holdsCount: book.holdsCount,
                    library: book.library,
                    libraryName: book.libraryName,
                    usingLibby: book.usingLibby,
                    isAvailable: book.isAvailable,
                    ownedCopies: book.ownedCopies
                }
                match.items.push(bookData)
                return result;
            }, []);
        }

        const consolidateBookSearchResults = (results, libraries) => {
            const items = results.map((libraryResults, libraryIndex) => libraryResults.items.map((item, sortOrder) => {
                item.library = libraries[libraryIndex].fulfillmentId
                item.libraryName = libraries[libraryIndex].name
                item.usingLibby = libraries[libraryIndex].usingLibby
                item.sortOrder = sortOrder
                return item
            }))
            const allBookResults = [].concat.apply([], items)

            const sortFn = (a, b) => {
                if (a.isAvailable === b.isAvailable) {
                    return (a.estimatedWaitDays || 10000) - (b.estimatedWaitDays || 10000)
                } else {
                    return b.isAvailable - a.isAvailable
                }
            }
            const grouped = groupBooksById(allBookResults).map(book => {
                book.items = book.items.sort(sortFn)
                return book
            })
            return grouped
        }
        const findBook = (library, query, format) => {
            const cleanedQuery = encodeURIComponent(query.trim())
            let formatsAll = format.map(formatType => OverDrive.#FORMATS[formatType])
            return (`https://thunder.api.overdrive.com/v2/libraries/${library.fulfillmentId}/media?query=${cleanedQuery}&format=${formatsAll.join()}&page=1&perPage=20`)
        }
        const findBooks = async (searchTerm, libraries, format) => {
            var urlList = libraries.map(library => findBook(library, searchTerm, format));
            const results = await Fetcher.fetchAll(urlList, "json");
            // TODO Use string similarity (https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely) to sort sora and libby results together (since sora is just appended to libby unless book id's happen to match)
            return consolidateBookSearchResults(results, libraries);
        }
        const books = await findBooks(searchQuery, libraries, formats)
        return books;
    }
    // Adopted from https://libbysearch.com
    // useLibby: true = libby libraries, false = sora libraries
    async fetchLibraries(searchTerm = "revere") {
        var rawFetch = await fetch("https://libraryfinder.api.overdrive.com/v2/branches/search", {
            'method': 'post',
            "headers": {
                "content-type": "application/json",
            },
            'body': JSON.stringify({
                "query": {
                    "q": searchTerm,
                    "options": {
                        "minimumMatch": {
                            "percentage": "100%"
                        },
                        "ambiguousPostalCode": {
                            "autoResolve": true,
                            "defaultCountryCode": "US",
                            "ipAddress": "me"
                        }
                    }
                },
                "filters": {
                    "type": (this.#useLibby ? "Public Library" : "School Library")
                },
                "include": [
                    "systems"
                ],
                "limit": 30
            })
        }).then(response => response.json());
        var json = rawFetch;
        var libraries = json.branches
            .filter((branch) => branch.systems.length > 0)
            .map((branch) => {
                return {
                    id: branch.systems[0].id,
                    locationName: branch.name,
                    address: branch.address,
                    city: branch.city,
                    region: branch.region,
                    country: branch.country,
                    countryCode: branch.countryCode,
                    fulfillmentId: branch.systems[0].fulfillmentId,
                    name: branch.systems[0].name,
                    logo: branch?.systems[0]?.styling?.logos?.at(0)?.sourceUrl,
                    branchIds: branch.systems[0].branchIds,
                    websiteId: branch.systems[0].websiteId,
                    usingLibby: this.#useLibby
                }
            })
            .filter((value, index, self) => {
                return index === self.findIndex((t) => t.id === value.id)
            }
            );
        return libraries;
    }
}