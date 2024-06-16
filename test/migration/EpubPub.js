class Search {
    constructor(query) {
        this.query = query;
        alert("test");
    }
    async getAll() {
        this.libby();
    }

}
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

    static async epubPub_main(title = "Ruin and Rising", author = "Leigh Bardugo") {
        var concatTitleAuthor = (title + ' by ' + author).replaceAll(' ', '-').toLocaleLowerCase();
        var url = "https://www.epub.pub/book/" + concatTitleAuthor;
        alert(url);
    }
    static async downloadEpub(epubFileName = "ruin-and-rising-by-leigh-bardugo.epub", spreadUrl = "https://spread.epub.pub/epub/5a51abd37412f4000781b287") {
        
        // EPUB file name when downloaded
        var publicEpubFileName = epubFileName;

        // Build EPUB as ZIP
        var zip = new JSZip();
        zip.file("mimetype", "application/epub+zip");
        zip.file("META-INF/container.xml", "<?xml version=\"1.0\"?>\n<container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">\n   <rootfiles>\n      <rootfile full-path=\"OEBPS/content.opf\" media-type=\"application/oebps-package+xml\"/>\n      \n   </rootfiles>\n</container>\n    ");

        // Get the Content OPF from its ACTUAL url
        var contentUrl = await GAS.getContentUrl(spreadUrl);
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
}
EpubPub.epubPub_main();