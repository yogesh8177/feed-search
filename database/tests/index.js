const assert = require('assert');
const SearchEngine = require('../searchEngine');
const mockData = require('../../data/mock_data.json');

/**
 * 1. Load data into engine
 * 2. Should load all 100 items present in mock data
 * 3. Each item inserted into our engine must have auto incremented id starting from 1
 * 4. Every document must have id, title, image, description and dateLastEdited
 * 5. Auto increment document id inside engine must equal to total document length
 * 6. SortedIndex must be sorted in ascending order
 * 7. 'Search should return 2 documents for search term `the lion king` 
 */

describe('Search Engine basic functionality tests', () => {
  const engine = new SearchEngine();
  
  describe('Loading mock data inside engine', () => {

    it('Should load all 100 items present in mock data', () => {
        engine.loadDataIntoDb(mockData);
        assert.equal(engine.documents.length, mockData.length);
      });

      it('Documents should have auto incrementing id starting with 1 till total documents length', () => {
        let documentId = 1; // initial doc id
        engine.documents.forEach(doc => {
          assert.equal(doc.id, documentId);
          documentId++; // increment doc id
        });
      });

      it('Every document must have id, title, image, description and dateLastEdited', () => {
        let documentId = 1; // initial doc id
        engine.documents.forEach(doc => {
          assert.equal(doc.hasOwnProperty('id'), true);
          assert.equal(doc.hasOwnProperty('title'), true);
          assert.equal(doc.hasOwnProperty('image'), true);
          assert.equal(doc.hasOwnProperty('description'), true);
          assert.equal(doc.hasOwnProperty('dateLastEdited'), true);
          documentId++; // increment doc id
        });
      });

      it('Auto increment document id inside engine must equal to total document length', () => {
        assert.equal(engine.documents.length, engine.documentId);
      });

      it('SortedIndex must be sorted in ascending order', () => {
        engine.createFieldIndexOn('title', 'string');
        const isSorted = true;
        const indexLength = engine.sortedIndex.length;
        for (let i = indexLength - 1; i >= 1; i--) {
          if (engine.sortedIndex[i] < engine.sortedIndex[i - 1]) {
            isSorted = false;
            break;
          }
          //console.log(`index[${i}] > index[${i-1}] = ${engine.sortedIndex[i].timeStamp} > ${engine.sortedIndex[i-1].timeStamp}`);
        }
        assert.equal(isSorted, true);
      });

      it('Search should return 2 documents for search term `the lion king` ', () => {
        engine.createInvertedTextIndex();
        let result = engine.searchKeywords(['the lion king']);
        assert.equal(result.hasOwnProperty('total'), true);
        assert.equal(result.hasOwnProperty('documents'), true);
        assert.equal(Array.isArray(result.documents), true);
        assert.equal(result.total, 2);
        //console.log(engine.invertedIndex);
        //console.log({result: JSON.stringify(result)});
      });

    });

  });