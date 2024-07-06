class EpubPub {
    // JS-Equivalent of a private constructor
    static #isInternalConstructing = false;
    constructor(epubpubType) {
        if (!EpubPub.#isInternalConstructing) {
            throw new TypeError("EpubPub is not constructable");
        }
        EpubPub.#isInternalConstructing = false;
        // More initialization logic
        if (epubpubType == "libby") {
            this.#useLibby = true;
        } else if (epubpubType == "sora") {
            this.#useLibby = false;
        } else {
            throw new TypeError("epubpubType must equal 'libby' or 'sora'");
        }
    }
    // Instances
    static #libbyInstance;
    static #soraInstance;
    static #createInstance(type) {
        EpubPub.#isInternalConstructing = true;
        return new EpubPub(type);
    }
    static getLibbyInstance() {
        return EpubPub.#libbyInstance ? EpubPub.#libbyInstance : EpubPub.#libbyInstance = EpubPub.#createInstance("libby");
    }

    static getSoraInstance() {
        return EpubPub.#soraInstance ? EpubPub.#soraInstance : EpubPub.#soraInstance = EpubPub.#createInstance("sora");
    }

    #useLibby; // Defined in constructor

    static async epubPub_main(books) {
        //
    }
    static async fetchEpubVersions(books) { // Input in format: [{ title: "Ruin and Rising", author: "Leigh Bardugo" }]
        var toFetchBookUrls = books.map(book => {
            var concatTitleAuthor = (book.title + ' by ' + book.author).replaceAll(' ', '-').toLocaleLowerCase();
            return "https://www.epub.pub/book/" + concatTitleAuthor;
        })

        var bookWebpages = JSON.parse(await GAS.fetchAllWithMutedExceptions(toFetchBookUrls));

        var docParser = new DOMParser(); // For parsing webpages
        var spreadUrls = []; // to be filled with spread URLs to fetch
        var epubVersions = []; // the output of this function
        var spreadUrlMap = {}; // to map spread URLs to their place in epubVersions
        bookWebpages.forEach((webpage, i) => {
            // If webpage is invalid, skip to next one
            if (webpage.code != "200") {
                epubVersions.push({ "exists": false });
                return;
            }

            // Parse the webpage for book's spread url (which means, the url to the read-online swipe version)
            var parsed = docParser.parseFromString(webpage.text, 'text/html');
            var readId = parsed.querySelector(".btn-read[data-domain*=spread]").getAttribute("data-readid");
            var url = "https://spread.epub.pub/epub/" + readId;
            spreadUrls.push(url);

            // Parse the webpage for book's public EPUB file name
            var epubVersion = { "exists": true };
            var strong = parsed.evaluate("//strong[contains(., 'ile') and contains(., 'ame')]", parsed.querySelector("#bookDetails > ul"), null, XPathResult.ANY_TYPE, null).iterateNext();
            var parent = strong.parentNode;
            var publicEpubFileName = parent.textContent.replace(strong.textContent, "");
            epubVersion["publicEpubFileName"] = publicEpubFileName;


            // Make sure to mark this webpage in epubVersions
            var spreadUrlLocation = (epubVersions.push(epubVersion)) - 1;
            spreadUrlMap[spreadUrlLocation] = i.toString();
        })

        var spreadWebpages = JSON.parse(await GAS.fetchAllWithMutedExceptions(spreadUrls));
        spreadWebpages.forEach((webpage, i) => {
            var epubVersionLocation = spreadUrlMap[i.toString()];

            // Get content URL
            var parsed = docParser.parseFromString(webpage.text, 'text/html');
            var contentUrl = parsed.querySelector("#assetUrl").getAttribute("value");
            epubVersions[epubVersionLocation]["contentUrl"] = contentUrl;
        })
        console.log(epubVersions);
        // this.downloadEpub(epubVersions[0].publicEpubFileName, epubVersions[0].contentUrl)
        return epubVersions;
    }
    static async downloadEpub(epubFileName = "ruin-and-rising-by-leigh-bardugo.epub", contentUrl = "https://asset.epub.pub/epub/ruin-and-rising-by-leigh-bardugo-1.epub/content.opf") {

        // EPUB file name when downloaded
        var publicEpubFileName = epubFileName;

        // Build EPUB as ZIP
        var zip = new JSZip();
        zip.file("mimetype", "application/epub+zip");
        zip.file("META-INF/container.xml", "<?xml version=\"1.0\"?>\n<container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">\n   <rootfiles>\n      <rootfile full-path=\"OEBPS/content.opf\" media-type=\"application/oebps-package+xml\"/>\n      \n   </rootfiles>\n</container>\n    ");

        // Get the Content OPF from its ACTUAL url
        var realInfo = contentUrl.substring(contentUrl.indexOf("asset.epub.pub/epub/") + 20); // Contains info from which the next two variables are derived
        epubFileName = realInfo.substring(0, realInfo.indexOf('/')); // EpubPub sometimes alters file names, like appending a "-1" to the end, so this retrieves the actual file name
        var oebpsUrlInsert = realInfo.substring(epubFileName.length + 1, realInfo.indexOf("content.opf")); // EpubPub sometimes renames or foregoes an "OEBPS" folder, so this retrieves the name of the actual folder where OEBPS files are stored
        var fetchContent = await window.fetch(contentUrl);
        var txt = await fetchContent.text();
        zip.file("OEBPS/content.opf", txt);

        // Parse OPF file for other files in EPUB
        var parser = new DOMParser();
        let document = parser.parseFromString(txt, "text/xml");
        let manifest = document.getElementsByTagName("manifest")[0];
        var relativePaths = EpubPub.getHREFs(manifest.childNodes);

        // Get those other files
        var epubAndOebpsUrl = "https://asset.epub.pub/epub/" + epubFileName + "/" + oebpsUrlInsert;
        var fetched = await Fetcher.fetchAll(relativePaths.map((href) => { return epubAndOebpsUrl + href; }), "none");

        // Add those other files to the ZIP
        for (var i = 0; i < fetched.length; i++) {
            console.log(relativePaths[i]);
            let resp = fetched[i];
            let blob = await resp.blob();
            zip.file("OEBPS/" + relativePaths[i], blob);
        }

        // Download ZIP with the file extension EPUB
        zip.generateAsync({ type: "blob" })
            .then(function (content) {
                // see FileSaver.js
                saveAs(content, publicEpubFileName); // Renaming file name from ZIP to EPUB in the process
            });
    }
    static getHREFs(elmnts) {
        var arr = [];

        // For each element that might have an HREF
        elmnts.forEach((elmnt) => {

            // If an HREF value exists, add it
            const href = elmnt?.attributes?.href?.value;
            if (href) {
                arr.push(href);
            }
        })

        // Return the found HREFs
        return arr;
    }
    static async getContentUrl() {
        return "https://asset.epub.pub/epub/ruin-and-rising-by-leigh-bardugo-1.epub/content.opf";
        var contentText = await GAS.fetchWithContentText(spreadUrl);
        return;
    }
}
// EpubPub.epubPub_main();