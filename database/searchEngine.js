class SearchEngine {
    constructor() {
        this.documentId = 0;
        // raw documents inserted in natural order
        this.documentsMap = {};
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
                delete doc['name'];
                doc.title = item.name;
                this.documentsMap[++this.documentId] = doc;
            });
            return;
        }
        let doc = Object.assign({}, data);
        this.documentsMap[++this.documentId] = doc;
    }

    /**
     * Created a timeStamp based sorted document array
     */
    createFieldIndexOn(indexField, type = 'Date') {
        if (!['Date', 'string'].includes(type)) return new Error(`Invalid field and type encountered`);

        this[`${indexField}Index`] = Object.keys(this.documentsMap).map(key => {
                const item = this.documentsMap[key];
                item.id = key;
                if (type === 'Date' && !isNaN(Date.parse(item[indexField]))) return {id: item.id, [indexField]: new Date(item[indexField]).getTime()};
                if (type === 'string') return {id: item.id, [indexField]: item[indexField]};
            });
        // sort the documents based on indexField.
        if (type === 'string') {
            this[`${indexField}Index`].sort((a, b) => {
                if (a[indexField] < b[indexField]) return -1;
                if (a[indexField] > b[indexField]) return 1;
                return 0;
            });
        }
        else {
            this[`${indexField}Index`].sort((a, b) => a[indexField] - b[indexField]);
        }
    }

    /**
     * Create inverted index for words and phrases to their respective documents.
     */
    createInvertedTextIndex() {
        Object.keys(this.documentsMap).forEach(key => {
            const document        = this.documentsMap[key];
            document.id           = key;
            let titleTokens       = document.title.toLowerCase().replace(/[.:!]/g, '').split(' ');
            let descriptionTokens = document.description.toLowerCase().replace(/[.:!]/g, '').split(' ');
            titleTokens.forEach(token => {
                if (this.invertedIndex.hasOwnProperty(token)) {
                    this.invertedIndex[token].add(document.id);
                }
                else {
                    this.invertedIndex[token] = new Set([document.id]);
                }
            });

            descriptionTokens.forEach(token => {
                if (this.invertedIndex.hasOwnProperty(token)) {
                    this.invertedIndex[token].add(document.id);
                }
                else {
                    this.invertedIndex[token] = new Set([document.id]);
                }
            });
            this.addPhrasesToInvertedIndex(titleTokens, descriptionTokens, document.id);
        });
    }

    addPhrasesToInvertedIndex(titleTokens, descriptionTokens, documentId) {
        // let us now add phrases to inverted index
        let totalTitleTokens        = titleTokens.length;
        let totalDescriptionTokens  = descriptionTokens.length;

        // min length of a phrase is 2
        const minPhraseSize = 2;
        // max supported phrase length is 4
        const maxPhraseSize = 4;

        let currentPhraseSize = maxPhraseSize;
        while(currentPhraseSize >= minPhraseSize) {
            for(let i = 0; i <= (totalTitleTokens - currentPhraseSize); i++) {
                let phrase = titleTokens.slice(i, i + currentPhraseSize).join(' ');
                if (this.invertedIndex.hasOwnProperty(phrase)) {
                    this.invertedIndex[phrase].add(documentId);
                }
                else {
                    this.invertedIndex[phrase] = new Set([documentId]);
                }
            }
            currentPhraseSize--;
        }
        currentPhraseSize = maxPhraseSize;
        while(currentPhraseSize >= minPhraseSize) {
            for(let i = 0; i <= (totalDescriptionTokens - currentPhraseSize); i++) {
                let phrase = descriptionTokens.slice(i, i + currentPhraseSize).join(' ');
                if (this.invertedIndex.hasOwnProperty(phrase)) {
                    this.invertedIndex[phrase].add(documentId);
                }
                else {
                    this.invertedIndex[phrase] = new Set([documentId]);
                }
            }
            currentPhraseSize--;
        }
    }

    /**
     * Search for given words and return the matching document(s);
     * @param {array} keyWords 
     */
    searchKeywords(keyWords) {
        if (!Array.isArray(keyWords)) {
            return Promise.reject(new Error(`Please supply an array as a parameter`));
        }
        let resultIds = new Set();
        let resultSet = {total: 0, documents: []};
        keyWords.forEach(key => {
            let searchTerm = key.toLowerCase();
            if (this.invertedIndex.hasOwnProperty(searchTerm)) {
                this.invertedIndex[searchTerm].forEach(item => {
                    resultIds.add(item);
                });
            }
        });

        resultIds.forEach(id => {
            resultSet.documents.push(this.documentsMap[id]);
        });
        resultSet.total = resultIds.size;

        return resultSet;
    }
}

module.exports = SearchEngine;