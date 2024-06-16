// Sora-specific ones are: ebook-overdrive-provisional,audiobook-overdrive-provisional,ebook-media-do
var FORMATS = { "ebook": "ebook-kindle,ebook-overdrive,ebook-epub-adobe,ebook-pdf-adobe,ebook-kobo,ebook-overdrive-provisional,ebook-media-do", "audiobook": "audiobook-overdrive,audiobook-mp3,audiobook-overdrive-provisional", "magazine": "magazine-overdrive" };
function overdrive_main() {
  // var libs = [fetchLibraries("noble")[2]];
  var libs = fetchLibraries("revere", true);
  return Logger.log(libs.map(d => d.logo))







  Logger.log(JSON.stringify(fetchBooks("shadow and bone", libs, true), null, 2));
}
function fetchBooks(searchQuery = "siege and storm", libraries = [fetchLibraries("noble")[2]], useLibby = true, formats = ["ebook", "audiobook", "magazine"]) {
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
        href: `https://${useLibby ? "libby" : "sora"}app.com/${useLibby ? "search" : "library"}/${book.library}/search/query-${book.title}/page-1/${book.id}`,
        holdsCount: book.holdsCount,
        library: book.library,
        libraryName: book.libraryName,
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
    let formatsAll = format.map(formatType => FORMATS[formatType])
    return (`https://thunder.api.overdrive.com/v2/libraries/${library.fulfillmentId}/media?query=${cleanedQuery}&format=${formatsAll.join()}&page=1&perPage=20`)
  }
  const findBooks = (searchTerm, libraries, format) => {
    var urlList = libraries.map(library => findBook(library, searchTerm, format));
    const results = UrlFetchApp.fetchAll(urlList).map((fetch) => { return JSON.parse(fetch.getContentText()) });
    debugger;
    return consolidateBookSearchResults(results, libraries);
  }
  const books = findBooks(searchQuery, libraries, formats)
  return books;
}
// Adopted from https://libbysearch.com
// useLibby: true = libby libraries, false = sora libraries
function fetchLibraries(searchTerm = "siege and storm", useLibby = true) {
  var rawFetch = UrlFetchApp.fetch("https://libraryfinder.api.overdrive.com/v2/branches/search", {
    'method': 'post',
    "headers": {
      "content-type": "application/json",
    },
    'payload': JSON.stringify({
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
        "type": (useLibby ? "Public Library" : "School Library")
      },
      "include": [
        "systems"
      ],
      "limit": 30
    })
  });
  var json = JSON.parse(rawFetch.getContentText());
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
        websiteId: branch.systems[0].websiteId
      }
    })
    .filter((value, index, self) => {
      return index === self.findIndex((t) => t.id === value.id)
    }
    );
  return libraries;
}