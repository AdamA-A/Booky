class Book {
    // Searching and indexing properties
    static #instances = [];
    static #nextInstanceId = 0;
    #instanceId;
    // Book properties
    author = "";
    detailedSeries = { "series": "", "seriesPosition": NaN };
    epubVersion = { "exists": false };
    id = "";
    image = "";
    items = [];
    sample = "";
    sortOrder = NaN;
    title = "";
    type = "";
    constructor(bookProperties = {}) {
        for (let property of Object.keys(bookProperties)) {
            this[property] = bookProperties[property];
        }
        this.#instanceId = Book.#nextInstanceId++;
        Book.#instances.push(this);
    }
    static withId(id) {
        return this.#instances[id];
    }
    static blank() {
        return new Book();
    }
    get libbyItems() {
        return this.items.filter(item => item.usingLibby);
    }
    get soraItems() {
        return this.items.filter(item => !(item.usingLibby))
    }
    sumOfCopies(specificItems) {
        return specificItems.map(item => item.ownedCopies).reduce((partialSum, a) => partialSum + a, 0)
    }
    sumOfAvailableCopies(specificItems) {
        return specificItems.map(item => item.availableCopies).reduce((partialSum, a) => partialSum + a, 0);
    }
    get rendered() {
        let libbyItems = this.libbyItems;
        let soraItems = this.soraItems;

        let libbySumOfCopies = this.sumOfCopies(libbyItems);
        let libbySumOfAvailableCopies = this.sumOfAvailableCopies(libbyItems);

        let soraSumOfCopies = this.sumOfCopies(soraItems);
        let soraSumOfAvailableCopies = this.sumOfAvailableCopies(soraItems);

        let text = `<div class="bookContainer" data-book-instance-id="${this.#instanceId}" onclick="Book.openBigBookPreview(this);">
        <div class="book">
          <h2 class="title">${this.title}</h2>
          <p class="author">${this.author}</p>
          <img class="cover"
            src="${this.image}">
        </div>
        <div class="icons">
          <span><img class="epubIcon check" src="https://www.epub.pub/images/apple-touch-icon.png?20191128">
            <span>${this.epubVersion.exists ? '&#10003;' : 'X'}</span></span>
          <br>
          <span><img class="libbyIcon" src="libbyIcon.png">
            <span>${libbySumOfAvailableCopies}/${libbySumOfCopies}</span></span>
          <br>
          <span><img class="soraIcon"
              src="https://soraapp.com/assets/wishbone/11.6.1/assets/images/turbo-ios-icon-180.png">
            <span>${soraSumOfAvailableCopies}/${soraSumOfCopies}</span></span>
        </div>
      </div>`;
        return text;
    }
    static openBigBookPreview(bookContainerElmnt) {
        // Retrieve instance of book based on the clicked-on element
        let instanceId = Number(bookContainerElmnt.getAttribute("data-book-instance-id"));
        let book = Book.withId(instanceId);
        
        // Fill in values within Big Book Preview
        BigBookPreview.show();
        BigBookPreview.title = book.title;
        BigBookPreview.author = book.author;
        BigBookPreview.cover = book.image;
        BigBookPreview.description = "";
        BigBookPreview.epubAvailability = {"available": book.epubVersion.exists, "publicEpubFileName": book.epubVersion.publicEpubFileName, "contentUrl": book.epubVersion.contentUrl};
        let availableLibbyItems = [];
        if (book.sumOfAvailableCopies(book.libbyItems) > 0) {
            availableLibbyItems = book.libbyItems.filter((item) => item.availableCopies > 0);
        }
        BigBookPreview.libbyAvailableList = availableLibbyItems;
        let availableSoraItems = [];
        if (book.sumOfAvailableCopies(book.soraItems) > 0) {
            availableSoraItems = book.soraItems.filter((item) => item.availableCopies > 0);
        }
        BigBookPreview.soraAvailableList = availableSoraItems;
    }
    static clearBookInstances() {
        this.#instances = [];
        this.#nextInstanceId = 0;
    }
}