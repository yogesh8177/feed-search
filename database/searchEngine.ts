import { Trie } from './trie';

export class EngineOptions {
    loadTrie: boolean = false;
    extraDotNestedFields: string = '';
}

export class SearchEngine {

    documentId: number;
    documentsMap: object;
    invertedIndex: object;
    nGramsIndex: object;
    maxPageSize: number;
    minNgram: number;
    trie: Trie;

    constructor() {
        // initial documentId value
        this.documentId = 0;
        // raw documents inserted in natural order
        this.documentsMap = {};
        // words to document inverted index.
        this.invertedIndex = {};
        // nGrams inverted index
        this.nGramsIndex = {};
        // max result size
        this.maxPageSize = 10;
        // min nGram size
        this.minNgram = 2;
        // trie
        this.trie = null;
    }

    /**
     * Load data into our engine
     * @param {mixed} data array or an object to load into our search engine
     */
    loadDataIntoDb(data, options: EngineOptions) {
        if (typeof data !== 'object') {
            return Promise.reject(Error(`Supplied data is not an Array or Object`));
        }

        // Load our data into documents array and assign a unique integer ID.
        if (Array.isArray(data)) {
            data.forEach(item => {
                let doc = Object.assign({}, item);
                doc.dateLastEdited = new Date(doc.dateLastEdited);
                this.documentsMap[++this.documentId] = doc;
            });

            if (options.loadTrie) {
                this.trie = new Trie(data, options);
                this.trie.setFieldToGenerateTrie(['name'])
                        .buildTrieForFields();
            }
            return;
        }
        let doc = Object.assign({}, data);
        this.documentsMap[++this.documentId] = doc;
    }

    /**
     * Created a timeStamp based sorted document array
     */
    createFieldIndexOn(indexField, type = 'Date') {
        if (!['Date', 'string', 'number'].includes(type)) return new Error(`Invalid field and type encountered`);

        this[`${indexField}Index`] = Object.keys(this.documentsMap).map(key => {
                const item = this.documentsMap[key];
                item.id = key;
                if (type === 'Date' && !isNaN(Date.parse(item[indexField]))) return {id: item.id, [indexField]: new Date(item[indexField]).getTime()};
                if (type === 'string') return {id: item.id, [indexField]: item[indexField]};
                if (type === 'number') return {id: item.id, [indexField]: parseInt(item[indexField])};
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
    createInvertedTextIndex(fieldsArray) {
        if (!Array.isArray(fieldsArray)) {
            throw new Error(`Please pass array to createInvertedTextIndex function`);
        }
        fieldsArray.forEach(field => {
            Object.keys(this.documentsMap).forEach(key => {
                const document        = this.documentsMap[key];
                document.id           = key;
                let fieldTokens       = document[field].toLowerCase().replace(/[.:!]/g, '').split(' ');
                fieldTokens.forEach(token => {
                    if (this.invertedIndex.hasOwnProperty(token)) {
                        this.invertedIndex[token].add(document.id);
                    }
                    else {
                        this.invertedIndex[token] = new Set([document.id]);
                    }
                });
    
                this.addPhrasesToInvertedIndex(fieldTokens, document.id);
                this.addNgramsToInvertedIndex(fieldTokens, document.id);
            });
        });
    }

    addNgramsToInvertedIndex(fieldTokens, documentId) {
        let currentNgramSize = this.minNgram;
        fieldTokens.forEach(token => {
            const tokenLength = token.length;
            while(currentNgramSize <= token.length) {
                for(let i = 0; i <= (tokenLength - currentNgramSize); i++) {
                    const nGram = token.slice(i, i + currentNgramSize);
                    if (this.nGramsIndex.hasOwnProperty(nGram)) {
                        this.nGramsIndex[nGram].add(documentId);
                    }
                    else {
                        this.nGramsIndex[nGram] = new Set([documentId]);
                    }
                }
                currentNgramSize++;
            }
            currentNgramSize = this.minNgram;
        });
    }

    addPhrasesToInvertedIndex(fieldTokens, documentId) {
        // let us now add phrases to inverted index
        let totalFieldTokens = fieldTokens.length;

        // min length of a phrase is 2
        const minPhraseSize = 2;
        // max supported phrase length is 4
        const maxPhraseSize = 4;

        let currentPhraseSize = maxPhraseSize;
        while(currentPhraseSize >= minPhraseSize) {
            for(let i = 0; i <= (totalFieldTokens - currentPhraseSize); i++) {
                let phrase = fieldTokens.slice(i, i + currentPhraseSize).join(' ');
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
    }

    /**
     * Search for given words and return the matching document(s);
     * @param {array} keyWords 
     */
    searchKeywords(keyWords, params) {
        if (!Array.isArray(keyWords)) {
            return Promise.reject(new Error(`Please supply an array as a parameter`));
        }

        if (keyWords.length === 0) {
            return this.paginateOnIndex(params);
        }
        // We have search terms, thus we need to search for keywords
        let resultIds = new Set();
        let resultSet = {total: 0, documents: []};

        let searchMode = params.nGrams ? 'nGramsIndex' : 'invertedIndex';

        keyWords.forEach(key => {
            let searchTerm = key.toLowerCase();
            if (this[searchMode].hasOwnProperty(searchTerm)) {
                this[searchMode][searchTerm].forEach(item => {
                    resultIds.add(item);
                });
            }
        });

        resultIds.forEach(id => {
            resultSet.documents.push(this.documentsMap[id.toString()]);
        });
        resultSet.total = resultIds.size;
        resultSet.documents = this.paginateSearchResults(resultSet.documents, params);
        
        return resultSet;
    }

    suggestWords(prefix) {
        return this.trie.suggestWords(prefix);
    }

    paginateOnIndex(params) {
        const { page, pageSize, sort } = params;
        const {sortField, order, type} = sort;
        const totalItems = this[`${sortField}Index`].length;

        if (this.hasOwnProperty(`${sortField}Index`)) {
            let start, end = 0;
            let resultIds = [];

            // start from the start of index array
            if (order === 'asc') {
                start = (page - 1) * pageSize;
                end   = start + pageSize;
            }
            // start from end of the index array
            else {
                start = (totalItems - (pageSize * page));
                end   = start + pageSize;
                start = start < 0 ? 0 : start;
                end   = end < start ? 0 : end;
            }
            
            resultIds = this[`${sortField}Index`].slice(start, end).map(item => item.id);
            order !== 'asc' && resultIds.reverse();
            // if order is descending, invert start and end as slice expects smaller start and larger end
            const resultSet = {
                total: this[`${sortField}Index`].length,
                documents: [],
                resultIds,
                start,
                end,
                page
            };

            resultIds.forEach(id => {
                resultSet.documents.push(this.documentsMap[id]);
            });

            return resultSet;
        }
        else {
            throw new Error('Unexpected index field encountered');
        }
    }

    /**
     * Paginate results for a search query
     * @param {array}  searchResults
     * @param {object} params 
     */
    paginateSearchResults(searchResults, params) {
        const { page, pageSize, sort } = params;
        if (isNaN(page) || page <= 0 || isNaN(pageSize) || pageSize <= 0) throw new Error(`Please supply valid params for paginating`);
        const offset = (page - 1) * pageSize;
        const {sortField, order, type} = sort;

        if (type === 'Date' || type === 'number') {
            searchResults.sort((a,b) => (order === 'asc') ? a[sortField] - b[sortField] : b[sortField] - a[sortField]);
        }
        else {
            searchResults.sort((a,b) => {
                if (order === 'asc') {
                    if (a[sortField] < b[sortField]) return -1;
                    if (a[sortField] > b[sortField]) return 1;
                    return 0;
                }
                if (a[sortField] < b[sortField]) return 1;
                if (a[sortField] > b[sortField]) return -1;
                return 0;
            });
        }
        let currenRange = (offset + pageSize);
        if (currenRange >= searchResults.length)
            return searchResults.slice(offset, searchResults.length);
        else
            return searchResults.slice(offset, offset + pageSize);
    }
}

//module.exports = SearchEngine;