class Book {
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

        let text = `<div class="bookContainer" data-book-instance-id="${this.#instanceId}">
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
    static clearBookInstances() {
        this.#instances = [];
        this.#nextInstanceId = 0;
    }
}