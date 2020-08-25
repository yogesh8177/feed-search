const assert = require('assert');
const SearchEngine = require('../searchEngine');
const mockData = require('../../data/mock_data.json');

/**
 * 1. Load data into engine
 * 2. Total mock items must match total items pushed into our engine
 * 3. Each item inserted into our engine must have auto incremented id starting from 1
 */

describe('Search Engine basic functionality tests', () => {

    describe('Loading mock data inside engine', () => {
      it('Should load all 100 items present in mock data', () => {
        const engine = new SearchEngine();
        engine.loadDataIntoDb(mockData);
        assert.equal(engine.documents.length, mockData.length);
      });

      it('Documents should have auto incrementing id starting with 1 till total documents length', () => {
        const engine = new SearchEngine();
        engine.loadDataIntoDb(mockData);
        let docId = 1; // initial doc id
        engine.documents.forEach(doc => {
          assert.equal(doc.id, docId);
          docId++; // increment doc id
        });
      });

      it('Auto increment document id inside engine must equal to total document length', () => {
        const engine = new SearchEngine();
        engine.loadDataIntoDb(mockData);
        assert.equal(engine.documents.length, engine.documentId);
      });

    });

  });