class BigBookPreview {
    // Big Book Preview properties (bb stands for Big Book, as shown in the stylesheet)
    static previewContainer = document.getElementById("bigBookContainer");
    static titleElmnt = document.getElementById("bbTitle");
    static authorElmnt = document.getElementById("bbAuthor");
    static coverElmnt = document.getElementById("bbCover");
    static shortDescriptionElmnt = document.getElementById("bbLess");
    static restOfDescriptionElmnt = document.getElementById("bbMore");
    static epubAvailableElmnt = document.getElementById("bbEpubpubAvailable");
    static libbyAvailableElmnt = document.getElementById("bbLibbyAvailable");
    static libbyLibraryListElmnt = document.getElementById("bbLibbyLibraryList");
    static soraAvailableElmnt = document.getElementById("bbSoraAvailable");
    static soraLibraryListElmnt = document.getElementById("bbSoraLibraryList");
    static #descriptionCutoff = 133;
    static #showHideElmnts = {
        "dots": document.getElementById("bbDots"),
        "moreText": document.getElementById("bbMore"),
        "btnText": document.getElementById("bbMoreLess")
    }
    static #epubDownloadInfo = { "available": false, "publicEpubFileName": "", "contentUrl": "" };
    static closeElmnt = document.getElementById("bbClose");

    // Handle title calls
    static get title() {
        return this.titleElmnt.textContent;
    }
    static set title(newTitle) {
        this.titleElmnt.textContent = newTitle;
    }

    // Handle author calls
    static get author() {
        return this.authorElmnt.textContent;
    }
    static set author(newAuthor) {
        this.authorElmnt.textContent = newAuthor;
    }

    // Handle cover image calls
    static get cover() {
        return this.coverElmnt.src;
    }
    static set cover(newCover) {
        this.coverElmnt.src = newCover;
    }

    // Handle description calls
    static get description() {
        let beginning = this.shortDescriptionElmnt.textContent;
        let ending = this.restOfDescriptionElmnt.textContent;
        return beginning + ending;
    }
    static set description(newDescription) {
        let length = newDescription.length;
        if (length > this.#descriptionCutoff) {
            let beginning = newDescription.substring(0, this.#descriptionCutoff);
            let ending = newDescription.substring(this.#descriptionCutoff);
            this.shortDescriptionElmnt.textContent = beginning;
            this.restOfDescriptionElmnt.textContent = ending;
            console.log("elmnts:")
            console.log(this.#showHideElmnts);
            console.log("values:")
            console.log(Object.values(this.#showHideElmnts));
            for (let elmnt of Object.values(this.#showHideElmnts)) {
                elmnt.style.display = "";
            }
        } else {
            this.shortDescriptionElmnt.textContent = newDescription;
            this.restOfDescriptionElmnt.textContent = "";
            for (let elmnt of Object.values(this.#showHideElmnts)) {
                elmnt.style.display = "none";
            }
        }
    }

    // Handle epub availability calls
    static get epubAvailability() {
        return this.epubAvailableElmnt.textContent;
    }
    /* Accepts either:
    {available: false}
    {available: true, publicEpubFileName: "some_name", contentUrl: "some_url"}
    */
    static set epubAvailability(newAvailability) {
        if (!newAvailability.available) {
            this.epubAvailableElmnt.setAttribute("class", "bbUnavailable");
            this.epubAvailableElmnt.textContent = "Download Unavailable.";
        } else {
            this.epubAvailableElmnt.setAttribute("class", "");
            this.epubAvailableElmnt.textContent = "Download Available!";
        }
        this.#epubDownloadInfo = newAvailability;
    }

    // Handle Libby available library list calls
    static get libbyAvailableList() {
        return Array.from(this.libbyLibraryListElmnt.querySelectorAll("a")).map(node => {return {"libraryName": node.textContent, "url": node.href};});
    }
    /* input is in one of the following forms:
    []
    [{"name": "some_name", "url": "some_url"}]
    */
    static set libbyAvailableList(newList) {
        if (newList.length == 0) {
            this.libbyLibraryListElmnt.innerHTML = "";
            this.libbyLibraryListElmnt.setAttribute("class", "bbUnavailable");
            this.libbyLibraryListElmnt.textContent = "No Available Libraries.";
            this.libbyAvailableElmnt.setAttribute("class", "bbUnavailable");
            this.libbyAvailableElmnt.textContent = "No Libraries.";
        } else {
            let anchors = newList.map((library, i) => {return '<a target="_blank" href="' + library.url + '">(' + (i + 1) + ') ' + library.name + '</a>';}).join("<br>");
            this.libbyLibraryListElmnt.innerHTML = anchors;
            this.libbyLibraryListElmnt.setAttribute("class", "");
            this.libbyAvailableElmnt.setAttribute("class", "bbAvailable");
            this.libbyAvailableElmnt.textContent = newList.length + " Available Libraries!";
        }
    }

    // Handle Sora available library list calls
    static get soraAvailableList() {
        return Array.from(this.soraLibraryListElmnt.querySelectorAll("a")).map(node => {return {"libraryName": node.textContent, "url": node.href};});
    }
    /* input is in one of the following forms:
    []
    [{"name": "some_name", "url": "some_url"}]
    */
    static set soraAvailableList(newList) {
        if (newList.length == 0) {
            this.soraLibraryListElmnt.innerHTML = "";
            this.soraLibraryListElmnt.setAttribute("class", "bbUnavailable");
            this.soraLibraryListElmnt.textContent = "No Available Libraries.";
            this.soraAvailableElmnt.setAttribute("class", "bbUnavailable");
            this.soraAvailableElmnt.textContent = "No Libraries.";
        } else {
            let anchors = newList.map(library => {return '<a target="_blank" href="' + library.url + '">' + library.name + '</a>';}).join("<br>");
            this.soraLibraryListElmnt.innerHTML = anchors;
            this.soraLibraryListElmnt.setAttribute("class", "");
            this.soraAvailableElmnt.textContent = newList.length + " Available Libraries!";
            this.soraAvailableElmnt.setAttribute("class", "bbAvailable");
            this.soraAvailableElmnt.textContent = newList.length + " Available Libraries!";
        }
    }

    // Show and Hide Big Book Preview
    static show() {
        bigBookContainer.style.display = "";
        bbClose.style.display = "block";
    }
    static hide() {
        bigBookContainer.style.display = "none";
        bbClose.style.display = "none";
    }

    static downloadEpubIfExists() {
        if (this.#epubDownloadInfo.available) {
            EpubPub.downloadEpub(this.#epubDownloadInfo.publicEpubFileName, this.#epubDownloadInfo.contentUrl);
        }
    }
    static showHideDescription() {
        var dots = this.#showHideElmnts.dots;
        var moreText = this.#showHideElmnts.moreText;
        var btnText = this.#showHideElmnts.btnText;

        if (dots.style.display === "none") {
            dots.style.display = "inline";
            btnText.innerHTML = "Read more";
            moreText.style.display = "none";
        } else {
            dots.style.display = "none";
            btnText.innerHTML = "Read less";
            moreText.style.display = "inline";
        }
    }
}