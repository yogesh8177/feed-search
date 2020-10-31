const Trie = require('../trie').Trie;
const mockData      = require('../../data/mock_data.json');
const { strict } = require('assert');
const { assert } = require('console');

const totalMockData = mockData.documents.length;

describe("Trie tests", () => {
    it("Should instantiate a new trie", done => {
        let trie = new Trie(mockData.documents);
        trie.setFieldToGenerateTrie(['name'])
            .buildTrieForFields();
        done();
    });

    it("Should return expected search results for search term `granny`", done => {
        const searchTerm = 'granny';
        const expectedResults = [
            searchTerm,
            'granny goodness'
        ];

        let trie = new Trie(mockData.documents);
        trie.setFieldToGenerateTrie(['name'])
            .buildTrieForFields();
        done();

        let results = trie.suggestWords(searchTerm);
        assert.strictEqual(results, expectedResults);
        done();
    });
})