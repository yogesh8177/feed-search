import { Trie } from '../trie';
import * as mockData from '../../data/mock_data.json';
import assert from 'assert';

const trieOptions = {
    extraDotNestedFields: 'biography.publisher'
};

describe("Trie tests", () => {
    it("Should instantiate a new trie", done => {
        let trie = new Trie(mockData.documents, trieOptions);
        trie.setFieldToGenerateTrie(['name'])
            .buildTrieForFields();
        done();
    });

    it("Should return expected search results for search term `granny`", done => {
        const searchTerm = 'granny';
        const expectedResults = [
            {
                word: "granny goodness",
                extraFields: "DC Comics",
                hits: 0
            }
        ];

        let trie = new Trie(mockData.documents, trieOptions);
        trie.setFieldToGenerateTrie(['name'])
            .buildTrieForFields();

        let results = trie.suggestWords(searchTerm);
        assert.deepStrictEqual(results, expectedResults);
        done();
    });

    it("should search only by prefix 'gamora' twice, and increment hit to 2", done => {
        const searchTerm = 'gamora';
        const expectedResults = [
            {
                word: "gamora",
                extraFields: "Marvel Comics",
                hits: 2,
            }
        ];

        let trie = new Trie(mockData.documents, trieOptions);
        trie.setFieldToGenerateTrie(['name'])
            .buildTrieForFields();

        trie.suggestWords(searchTerm, true);
        let results = trie.suggestWords(searchTerm, true);
        
        assert.deepStrictEqual(results, expectedResults);
        done();

    })
})