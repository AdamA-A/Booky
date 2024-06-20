class Search {
    query;
    queryOptions;
    books;
    constructor(query) {
        this.query = query;
    }
    sendQuery(options = {"EpubPub": true, "Libby": true, "Sora": true}) {
        this.queryOptions = options;
        if (options.Libby) {
            //
        }
        if (options.EpubPub) {
            //
        }
    }
}