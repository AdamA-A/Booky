EpubPub.epubPub_main();
class Search {
    constructor(query) {
        this.query = query;
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
    /* Change the below for each ebook */
    FOLDER_ID_TO_EXPORT_EPUB_TO = "17B08-41056AiL95yB1Fa_Uk1XaZ8ZHgZ"; // epub file will be put in the folder with the inputted id. Current folder is at: https://drive.google.com/drive/folders/17B08-41056AiL95yB1Fa_Uk1XaZ8ZHgZ?usp=drive_link

    static async zipAndGet(arr, fileName = "test.zip") {
        const blob = await clientZip.downloadZip(arr).blob()
        // make and click a temporary link to download the Blob
        const link = document.createElement("a");
        const href = URL.createObjectURL(blob);
        link.href = href;
        link.download = fileName
        link.click();
        link.remove();
        URL.revokeObjectURL(href);
    }

    static async epubPub_main(epubFileName = "ruin-and-rising-by-leigh-bardugo.epub", spreadUrl = "https://spread.epub.pub/epub/5a51abd37412f4000781b287") {
        var publicEpubFileName = epubFileName;
        var mimetypeBlob = { name: "mimetype", lastModified: new Date(), input: "application/epub+zip" };
        var metaFolderBlob = { name: "META-INF/container.xml", lastModified: new Date(), input: "<?xml version=\"1.0\"?>\n<container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">\n   <rootfiles>\n      <rootfile full-path=\"OEBPS/content.opf\" media-type=\"application/oebps-package+xml\"/>\n      \n   </rootfiles>\n</container>\n    " };
        // Get the file content.opf from its ACTUAL url
        var contentUrl = await GAS.getContentUrl(spreadUrl);
        var realInfo = contentUrl.substring(contentUrl.indexOf("asset.epub.pub/epub/") + 20);
        epubFileName = realInfo.substring(0, realInfo.indexOf('/'));
        var oebpsUrlInsert = realInfo.substring(epubFileName.length + 1, realInfo.indexOf("content.opf"));
        var fetchContent = await fetch(contentUrl);
        return EpubPub.zipAndGet([fetchContent]);
        console.log(fetchContent);
        var txt = await fetchContent.text();
        console.warn(txt);
        var contentBlob = { name: "OEBPS/content.opf", lastModified: new Date(), input: txt };
        // return EpubPub.zipAndGet(toZip);
        var parser = new DOMParser();
        let document = parser.parseFromString(txt, "text/xml");
        let manifest = document.getElementsByTagName("manifest")[0];
        var hrefs = EpubPub.getHREFs(manifest.childNodes);
        var blobs = await EpubPub.getOtherBlobs(hrefs, "https://asset.epub.pub/epub/" + epubFileName + "/" + oebpsUrlInsert);
        blobs.push(mimetypeBlob);
        blobs.push(metaFolderBlob);
        blobs.push(fetchContent);
        // EpubPub.zipAndGet(blobs, publicEpubFileName);
    }
    static getHREFs(elmnts) {
        var arr = [];
        elmnts.forEach( (elmnt) => {
            const href = elmnt?.attributes?.href?.value;
            if (href) {
                arr.push(href);
            }
        })
        return arr;
    }
    static async getOtherBlobs(paths, epubAndOebpsUrl) {
        var now = new Date();
        var blobs = (await Fetcher.fetchAll(paths.map((path) => { return epubAndOebpsUrl + path; }), "none")).map((fetch, i) => { return { name: ("OEBPS/" + paths[i]), lastModified: now, input: fetch }; });
        return blobs;
    }
    static getFetch(url) {
        return fetch(url);
    }
    static getContentUrl(spreadUrl) {
        var $ = Cheerio.load(getFetch(spreadUrl).getContentText());
        return $("#assetUrl").attr("value");
    }
}