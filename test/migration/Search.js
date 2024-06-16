class Search {
    query;
    queryOptions;
    constructor(query) {
        this.query = query;
    }
    sendQuery(options = {"EpubPub": true, "Libby": true, "Sora": true}) {
        this.queryOptions = options;
        if (options.EpubPub) {
            //
        }
    }
}