const assert        = require('assert');
const SearchEngine  = require('../searchEngine');
const mockData      = require('../../data/mock_data.json');
const { expect } = require('chai');
const totalMockData = mockData.length;

/**
 * 1. Load data into engine
 * 2. Should load all totalMockData items present in mock data
 * 3. Each item inserted into our engine must have auto incremented id starting from 1
 * 4. Every document must have id, title, image, description and dateLastEdited
 * 5. Auto increment document id inside engine must equal to total document length
 * 6. SortedIndex must be sorted in ascending order
 * 7. 'Search should return 2 documents for search term `the lion king` 
 */

describe('Search Engine basic functionality tests', () => {
  const engine = new SearchEngine();

  describe('Loading mock data inside engine', () => {

    it('Should fail if we do not pass any data', async () => {
      try {
        await engine.loadDataIntoDb();
        return Promise.reject(`Should have failed as we didn't pass payload`);
      }
      catch (e) {
        assert.equal(e.message, 'Supplied data is not an Array or Object');
      }
    });

    it('Should load all totalMockData items present in mock data', () => {
      engine.loadDataIntoDb(mockData);
      let documentMapKeyLength = Object.keys(engine.documentsMap).length;
      assert.equal(documentMapKeyLength, mockData.length);
    });

    it('Documents should have auto incrementing id starting with 1 till total documents length', () => {
      let documentId = 1; // initial doc id
      Object.keys(engine.documentsMap).forEach(key => {
        const doc = engine.documentsMap[key];
        doc.id    = key;
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

  });

  describe('Creating index in our engine', () => {
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
  });

  describe('Searching in our db', () => {
    it('Search should return 2 documents for search term `"the lion king"` ', () => {
      engine.createInvertedTextIndex();
      const params = {
        page: 1,
        pageSize: 10,
        sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' }
      };
      let result = engine.searchKeywords(['the lion king'], params);
      assert.equal(result.hasOwnProperty('total'), true);
      assert.equal(result.hasOwnProperty('documents'), true);
      assert.equal(Array.isArray(result.documents), true);
      assert.equal(result.total, 2);
      //console.log(result);
      //console.log(engine.invertedIndex);
      //console.log({result: JSON.stringify(result)});
    });

    it('Search should return 4 documents for search term `king` ', () => {
      engine.createInvertedTextIndex();
      const params = {
        page: 1,
        pageSize: 10,
        sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' }
      };
      let result = engine.searchKeywords(['king'], params);
      assert.equal(result.hasOwnProperty('total'), true);
      assert.equal(result.hasOwnProperty('documents'), true);
      assert.equal(Array.isArray(result.documents), true);
      assert.equal(result.total, 4);
      //console.log(result);
      //console.log(engine.invertedIndex);
      //console.log({result: JSON.stringify(result)});
    });

    it('Search should match 2 documents titles for search term `the king` ', () => {
      engine.createInvertedTextIndex();
      const params = {
        page: 1,
        pageSize: 10,
        sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' }
      };
      const expectedTitles = [
        'The Lord of the Rings: The Return of the King',
        'The Lion King'
      ];
      let result = engine.searchKeywords(['the','king'], params);
      let titlesFound = 0;
      result.documents.forEach(doc => {
        if (expectedTitles.includes(doc.title)) titlesFound++;
      });

      assert.equal(result.hasOwnProperty('total'), true);
      assert.equal(result.hasOwnProperty('documents'), true);
      assert.equal(Array.isArray(result.documents), true);
      assert.equal(result.total, 4);
      assert.equal(titlesFound, expectedTitles.length);
      //console.log(result);
      //console.log(engine.invertedIndex);
      //console.log({result: JSON.stringify(result)});
    });

    it('Search should match 1 documents titles for search term `"the king"` ', () => {
      engine.createInvertedTextIndex();
      const params = {
        page: 1,
        pageSize: 10,
        sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' }
      };
      const expectedTitles = [
        'The Lord of the Rings: The Return of the King',
        'Human Web Agent'
      ];
      const unexpectedTitles = ['The Lion King'];

      let result = engine.searchKeywords(['the king'], params);
      let titlesFound = 0;
      result.documents.forEach(doc => {
        if (expectedTitles.includes(doc.title)) titlesFound++;
        if (unexpectedTitles.includes(doc.title)) titlesFound++;
      });

      assert.equal(result.hasOwnProperty('total'), true);
      assert.equal(result.hasOwnProperty('documents'), true);
      assert.equal(Array.isArray(result.documents), true);
      assert.equal(titlesFound, expectedTitles.length);
      //console.log(result);
      //console.log(engine.invertedIndex);
      //console.log({result: JSON.stringify(result)});
    });

  });
  
  describe('Sorting in our db', () => {
    it('Should return results without search keys and sort by dateLastEdited asc', () => {
      const params = {
        page: 1,
        pageSize: 8,
        sort: { sortField: 'dateLastEdited', order: 'asc', type: 'Date' }
      };
      let result   = engine.searchKeywords([], params);
      let isSorted = true;
  
      for (let i = params.pageSize - 1; i >= 1; i--) {
        //console.log(`ran`,i, isSorted, result.documents[i][params.sort.sortField]);
        if (result.documents[i][params.sort.sortField] < result.documents[i - i][params.sort.sortField]) {
          isSorted = false;
          //console.log(`${result.documents[i][params.sort.sortField]} < ${result.documents[i - 1][params.sort.sortField]}`)
          break;
        }
      }
      assert.equal(result.total, totalMockData);
      assert.equal(result.documents.length, params.pageSize);
      assert.equal(isSorted, true);
  
      //console.log(engine.dateLastEditedIndex);
      //console.log(result);
    });
  
    it('Should return results without search keys and sort by title asc', () => {
      const params = {
        page: 1,
        pageSize: 8,
        sort: { sortField: 'title', order: 'asc', type: 'string' }
      };
      let result   = engine.searchKeywords([], params);
      let isSorted = true;
  
      for (let i = params.pageSize - 1; i >= 1; i--) {
        //console.log(`ran`,i, isSorted, result.documents[i][params.sort.sortField]);
        if (result.documents[i][params.sort.sortField] < result.documents[i - i][params.sort.sortField]) {
          isSorted = false;
          //console.log(`${result.documents[i][params.sort.sortField]} < ${result.documents[i - 1][params.sort.sortField]}`)
          break;
        }
      }
  
      assert.equal(result.total, totalMockData);
      assert.equal(result.documents.length, params.pageSize);
      assert.equal(isSorted, true);
      //console.log(engine.dateLastEditedIndex);
      //console.log(result);
    });

    it('Should return results without search keys and sort by dateLastEdited desc', () => {
      const params = {
        page: 1,
        pageSize: 8,
        sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' }
      };
      let result   = engine.searchKeywords([], params);
      let isSorted = true;
  
      for (let i = params.pageSize - 1; i >= 1; i--) {
        //console.log(`ran`,i, isSorted, result.documents[i][params.sort.sortField]);
        //console.log(`${result.documents[i][params.sort.sortField]} < ${result.documents[i - 1][params.sort.sortField]}`)
        if (result.documents[i][params.sort.sortField] > result.documents[i - i][params.sort.sortField]) {
          isSorted = false;
          break;
        }
      }
      //console.log(engine.dateLastEditedIndex);
      //console.log(result);
      assert.equal(result.total, totalMockData);
      assert.equal(result.documents.length, params.pageSize);
      assert.equal(isSorted, true);
  
    });
  
    it('Should return results without search keys and sort by title desc', () => {
      const params = {
        page: 1,
        pageSize: 8,
        sort: { sortField: 'title', order: 'desc', type: 'string' }
      };
      let result   = engine.searchKeywords([], params);
      let isSorted = true;
  
      for (let i = params.pageSize - 1; i >= 1; i--) {
        //console.log(`ran`,i, isSorted, result.documents[i][params.sort.sortField]);
        if (result.documents[i][params.sort.sortField] > result.documents[i - i][params.sort.sortField]) {
          isSorted = false;
          //console.log(`${result.documents[i][params.sort.sortField]} < ${result.documents[i - 1][params.sort.sortField]}`)
          break;
        }
      }
  
      //console.log(engine.dateLastEditedIndex);
      //console.log(result);
      assert.equal(result.total, totalMockData);
      assert.equal(result.documents.length, params.pageSize);
      assert.equal(isSorted, true);
    });
  });

  describe('Pagination tests', () => {
    it(`Should match given titles on page 2 where we sort by title in desc order`, () => {
      const expectedTitles = [
        'Regional Program Facilitator'
      ];
      let matchedTitles = 0;
      const params = {
        page: 2,
        pageSize: 6,
        sort: { sortField: 'title', order: 'desc', type: 'string' }
      };
      let result   = engine.searchKeywords([], params);
      assert.equal(result.documents.length, params.pageSize);
      result.documents.forEach(doc => {
        if (expectedTitles.includes(doc.title))
          matchedTitles++;
      });
      assert.equal(matchedTitles, expectedTitles.length);
    });

    it('Should match given titles on page 2 where we sort by title in asc order', () => {
      const expectedTitles = ['Chief Operations Specialist'];

      const params = {
        page: 2,
        pageSize: 6,
        sort: { sortField: 'title', order: 'asc', type: 'string' }
      };
      let matchedTitles = 0;
      let result        = engine.searchKeywords([], params);
      assert.equal(result.documents.length, params.pageSize);
      result.documents.forEach(doc => {
        if (expectedTitles.includes(doc.title))
          matchedTitles++;
      });
      assert.equal(matchedTitles, expectedTitles.length);
    })

    it(`Should match given titles on page 2 where we sort by dateLastEdited in desc order`, () => {
      const expectedTitles = [
        'Senior Quality Consultant'
      ];
      let matchedTitles = 0;
      const params = {
        page: 2,
        pageSize: 6,
        sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' }
      };
      let result   = engine.searchKeywords([], params);
      assert.equal(result.documents.length, params.pageSize);
      result.documents.forEach(doc => {
        if (expectedTitles.includes(doc.title))
          matchedTitles++;
      });
      assert.equal(matchedTitles, expectedTitles.length);
    });

    it('Should match given titles on page 2 where we sort by dateLastEdited in asc order', () => {
      const expectedTitles = ['Customer Web Specialist'];

      const params = {
        page: 2,
        pageSize: 6,
        sort: { sortField: 'dateLastEdited', order: 'asc', type: 'Date' }
      };
      let matchedTitles = 0;
      let result        = engine.searchKeywords([], params);
      assert.equal(result.documents.length, params.pageSize);
      result.documents.forEach(doc => {
        if (expectedTitles.includes(doc.title))
          matchedTitles++;
      });
      assert.equal(matchedTitles, expectedTitles.length);
    })

    it('should return 4 documents on 17th page with pageSize 6', () => {
      const params = {
        page: 17,
        pageSize: 6,
        sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' }
      };
      let result        = engine.searchKeywords([], params);
      assert.equal(result.documents.length, 4);
    });
  });

});