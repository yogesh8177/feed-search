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
        let documentMapKeyLength = Object.keys(engine.documentsMap).length;
        assert.equal(documentMapKeyLength, mockData.length);
      });

      it('Documents should have auto incrementing id starting with 1 till total documents length', () => {
        let documentId = 1; // initial doc id
        Object.keys(engine.documentsMap).forEach(key => {
          const doc = engine.documentsMap[key];
          doc.id = key;
          assert.equal(doc.id, documentId);
          documentId++; // increment doc id
        });
      });

      it('Every document must have id, title, image, description and dateLastEdited', () => {
        let documentId = 1; // initial doc id
        Object.keys(engine.documentsMap).forEach(key => {
          const doc = engine.documentsMap[key];
          assert.equal(doc.hasOwnProperty('title'), true);
          assert.equal(doc.hasOwnProperty('image'), true);
          assert.equal(doc.hasOwnProperty('description'), true);
          assert.equal(doc.hasOwnProperty('dateLastEdited'), true);
          documentId++; // increment doc id
        });
      });

      it('Auto increment document id inside engine must equal to total document length', () => {
        let documentMapKeyLength = Object.keys(engine.documentsMap).length;
        assert.equal(documentMapKeyLength, engine.documentId);
      });

      it('dateLastEdited must be sorted in ascending order', () => {
        engine.createFieldIndexOn('dateLastEdited', 'Date');
        const isSorted = true;
        // Note, index name will be indexFieldIndex => dateLastEditedIndex in this case.
        const indexLength = engine.dateLastEditedIndex.length;
        for (let i = indexLength - 1; i >= 1; i--) {
          if (engine.dateLastEditedIndex[i] < engine.dateLastEditedIndex[i - 1]) {
            isSorted = false;
            break;
          }
          //console.log(`index[${i}] > index[${i-1}] = ${engine.dateLastEditedIndex[i].dateLastEdited} > ${engine.dateLastEditedIndex[i-1].dateLastEdited}`);
        }
        assert.equal(isSorted, true);
       // console.log(engine.dateLastEdited);
      });

      it('titleIndex must be sorted in ascending order', () => {
        engine.createFieldIndexOn('title', 'string');
        const isSorted = true;
        // Note, index name will be indexFieldIndex => titleIndex in this case.
        const indexLength = engine.titleIndex.length;
        for (let i = indexLength - 1; i >= 1; i--) {
          if (engine.titleIndex[i] < engine.titleIndex[i - 1]) {
            isSorted = false;
            break;
          }
          //console.log(`index[${i}] > index[${i-1}] = ${engine.titleIndex[i].title} > ${engine.titleIndex[i-1].title}`);
        }
        assert.equal(isSorted, true);
       // console.log(engine.titleIndex);
      });

      it('Search should return 2 documents for search term `the lion king` ', () => {
        engine.createInvertedTextIndex();
        const params =  {
          page: 1, 
          pageSize: 10, 
          sort: {sortField: 'dateLastEdited', order: 'asc', type: 'string'}
        };
        let result = engine.searchKeywords(['the lion king'], params);
        assert.equal(result.hasOwnProperty('total'), true);
        assert.equal(result.hasOwnProperty('documents'), true);
        assert.equal(Array.isArray(result.documents), true);
        assert.equal(result.total, 2);
        console.log(result);
        //console.log(engine.invertedIndex);
        //console.log({result: JSON.stringify(result)});
      });

    });

  });