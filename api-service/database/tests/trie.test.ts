import { Trie } from '../trie';
import * as mockData from '../data/mock_data.json';
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
                extraFields: "DC Comics"
            }
        ];

        let trie = new Trie(mockData.documents, trieOptions);
        trie.setFieldToGenerateTrie(['name'])
            .buildTrieForFields();
        done();

        let results = trie.suggestWords(searchTerm);
        assert.strictEqual(results, expectedResults);
        done();
    });
})