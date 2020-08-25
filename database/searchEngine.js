class SearchEngine {
    constructor() {
        this.documentId = 0;
        // raw documents inserted in natural order
        this.documents = [];
        // documents sorted by timeStamp by default
        this.sortedIndex = [];
        // words to document inverted index.
        this.invertedIndex = {};
    }

    /**
     * Load data into our engine
     * @param {mixed} data array or an object to load into our search engine
     */
    loadDataIntoDb(data) {
        if (typeof data !== 'object') {
            return Promise.reject(Error(`Supplied data is not an Array or Object`));
        }
        // Load our data into documents array and assign a unique integer ID.
        if (Array.isArray(data)) {
            data.forEach(item => {
                let doc = Object.assign({}, item);
                doc.id = ++this.documentId;
                this.documents.push(doc);
            });
            return;
        }
        let doc = Object.assign({}, data);
        doc.id = ++this.documentId;
        this.documents.push(doc);
    }

    createDocumentIndexBasedOnTime() {
        this.sortedIndex = this.documents.map(item => {
                return {id: item.id, timeStamp: new Date(item.dateLastEdited).getTime()};
            });
        // sort the documents based on timestamps.
        this.sortedIndex.sort((a, b) => a.timeStamp - b.timeStamp);
        console.log(`sorted document index`, this.sortedIndex);
    }
}

module.exports = SearchEngine;