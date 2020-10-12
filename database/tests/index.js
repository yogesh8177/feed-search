const assert        = require('assert');
const SearchEngine  = require('../searchEngine');
const mockData      = require('../../data/mock_data.json');
const { strict } = require('assert');

const totalMockData = mockData.length;

// utility methods
function checkArrayProperty(arrayObjects, propertiesToCheck) {
  arrayObjects.forEach(object => {
    propertiesToCheck.forEach(key => {
      assert.strictEqual(object.hasOwnProperty(key), true);
    });
  })
}

describe('Search Engine basic functionality tests', () => {
  const engine = new SearchEngine();

  describe('Loading mock data inside engine', () => {

    it('Should fail if we do not pass any data', async () => {
      try {
        await engine.loadDataIntoDb();
        return Promise.reject(`Should have failed as we didn't pass payload`);
      }
      catch (e) {
        assert.strictEqual(e.message, 'Supplied data is not an Array or Object');
      }
    });

    it('Should load all totalMockData items present in mock data', () => {
      engine.loadDataIntoDb(mockData);
      let documentMapKeyLength = Object.keys(engine.documentsMap).length;
      assert.strictEqual(documentMapKeyLength, mockData.length);
    });

    it('Documents should have auto incrementing id starting with 1 till total documents length', () => {
      let documentId = 1; // initial doc id
      Object.keys(engine.documentsMap).forEach(key => {
        const doc = engine.documentsMap[key];
        doc.id    = key;
        assert.strictEqual(parseInt(doc.id), documentId);
        documentId++; // increment doc id
      });
    });

    it('Every document must have id, title, image, description and dateLastEdited', () => {
      let documentId = 1; // initial doc id
      Object.keys(engine.documentsMap).forEach(key => {
        const doc = engine.documentsMap[key];
        assert.strictEqual(doc.hasOwnProperty('title'), true);
        assert.strictEqual(doc.hasOwnProperty('image'), true);
        assert.strictEqual(doc.hasOwnProperty('description'), true);
        assert.strictEqual(doc.hasOwnProperty('dateLastEdited'), true);
        documentId++; // increment doc id
      });
    });

    it('Auto increment document id inside engine must equal to total document length', () => {
      let documentMapKeyLength = Object.keys(engine.documentsMap).length;
      assert.strictEqual(documentMapKeyLength, engine.documentId);
    });

  });

  describe('Creating index in our engine', () => {
    it('dateLastEditedIndex must have id and dateLastEdited properties', () => {
      const indexField = `dateLastEdited`;
      engine.createFieldIndexOn(indexField, 'Date');
      checkArrayProperty(engine[`${indexField}Index`], ['id', indexField]);
    });

    it('titleIndex must have id and title properties', () => {
      const indexField = `title`;
      engine.createFieldIndexOn('title', 'string');
      checkArrayProperty(engine[`${indexField}Index`], ['id', indexField]);
    });

    it('dateLastEdited must be sorted in ascending order', () => {
      engine.createFieldIndexOn('dateLastEdited', 'Date');
      let isSorted = true;
      // Note, index name will be indexFieldIndex => dateLastEditedIndex in this case.
      const indexLength = engine.dateLastEditedIndex.length;
      for (let i = indexLength - 1; i >= 1; i--) {
        if (engine.dateLastEditedIndex[i].dateLastEdited < engine.dateLastEditedIndex[i - 1].dateLastEdited) {
          isSorted = false;
          break;
        }
        //console.log(`index[${i}] > index[${i-1}] = ${engine.dateLastEditedIndex[i].dateLastEdited} > ${engine.dateLastEditedIndex[i-1].dateLastEdited}`);
      }
      assert.strictEqual(isSorted, true);
    });

    it('titleIndex must be sorted in ascending order', () => {
      engine.createFieldIndexOn('title', 'string');
      let isSorted = true;
      // Note, index name will be indexFieldIndex => titleIndex in this case.
      const indexLength = engine.titleIndex.length;
      for (let i = indexLength - 1; i >= 1; i--) {
        if (engine.titleIndex[i].title < engine.titleIndex[i - 1].title) {
          isSorted = false;
          break;
        }
        //console.log(`index[${i}] > index[${i-1}] = ${engine.titleIndex[i].title} > ${engine.titleIndex[i-1].title}`);
      }
      checkArrayProperty(engine.titleIndex, ['id', 'title']);
      assert.strictEqual(isSorted, true);
    });
  });

  describe('Searching in our db', () => {
    it('Search should return 2 documents for search term `"the lion king"` ', () => {
      engine.createInvertedTextIndex(['title', 'description']);
      const params = {
        page: 1,
        pageSize: 10,
        sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' }
      };
      let result = engine.searchKeywords(['the lion king'], params);
      assert.strictEqual(result.hasOwnProperty('total'), true);
      assert.strictEqual(result.hasOwnProperty('documents'), true);
      assert.strictEqual(Array.isArray(result.documents), true);
      assert.strictEqual(result.total, 2);
    });

    it('Search should return 4 documents for search term `king` ', () => {
      engine.createInvertedTextIndex(['title', 'description']);
      const params = {
        page: 1,
        pageSize: 10,
        sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' }
      };
      let result = engine.searchKeywords(['king'], params);
      assert.strictEqual(result.hasOwnProperty('total'), true);
      assert.strictEqual(result.hasOwnProperty('documents'), true);
      assert.strictEqual(Array.isArray(result.documents), true);
      assert.strictEqual(result.total, 4);
    });

    it('Search should match 2 documents titles for search term `the king` ', () => {
      engine.createInvertedTextIndex(['title', 'description']);
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

      assert.strictEqual(result.hasOwnProperty('total'), true);
      assert.strictEqual(result.hasOwnProperty('documents'), true);
      assert.strictEqual(Array.isArray(result.documents), true);
      assert.strictEqual(result.total, 4);
      assert.strictEqual(titlesFound, expectedTitles.length);
    });

    it('Search should match 1 documents titles for search term `"the king"` ', () => {
      engine.createInvertedTextIndex(['title', 'description']);
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

      assert.strictEqual(result.hasOwnProperty('total'), true);
      assert.strictEqual(result.hasOwnProperty('documents'), true);
      assert.strictEqual(Array.isArray(result.documents), true);
      assert.strictEqual(titlesFound, expectedTitles.length);
    });

    it('Search should return items having `Regional` in their title for search term `region`', () => {
      engine.createInvertedTextIndex(['title', 'description']);
      const params = {
        page: 1,
        pageSize: 100,
        sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' }
      };

      let result = engine.searchKeywords(['region'], params);
      assert.strictEqual(result.total, 8);
      result.documents.forEach(doc => {
        assert.strictEqual(doc.title.match(/Regional/g)[0], 'Regional');
      });
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
        if (result.documents[i][params.sort.sortField] < result.documents[i - i][params.sort.sortField]) {
          isSorted = false;
          //console.log(`${result.documents[i][params.sort.sortField]} < ${result.documents[i - 1][params.sort.sortField]}`)
          break;
        }
      }
      assert.strictEqual(result.total, totalMockData);
      assert.strictEqual(result.documents.length, params.pageSize);
      assert.strictEqual(isSorted, true);
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
        if (result.documents[i][params.sort.sortField] < result.documents[i - i][params.sort.sortField]) {
          isSorted = false;
          //console.log(`${result.documents[i][params.sort.sortField]} < ${result.documents[i - 1][params.sort.sortField]}`)
          break;
        }
      }
  
      assert.strictEqual(result.total, totalMockData);
      assert.strictEqual(result.documents.length, params.pageSize);
      assert.strictEqual(isSorted, true);
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
        //console.log(`${result.documents[i][params.sort.sortField]} < ${result.documents[i - 1][params.sort.sortField]}`)
        if (result.documents[i][params.sort.sortField] > result.documents[i - i][params.sort.sortField]) {
          isSorted = false;
          break;
        }
      }
      assert.strictEqual(result.total, totalMockData);
      assert.strictEqual(result.documents.length, params.pageSize);
      assert.strictEqual(isSorted, true);
  
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
  
      assert.strictEqual(result.total, totalMockData);
      assert.strictEqual(result.documents.length, params.pageSize);
      assert.strictEqual(isSorted, true);
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
      assert.strictEqual(result.documents.length, params.pageSize);
      result.documents.forEach(doc => {
        if (expectedTitles.includes(doc.title))
          matchedTitles++;
      });
      assert.strictEqual(matchedTitles, expectedTitles.length);
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
      assert.strictEqual(result.documents.length, params.pageSize);
      result.documents.forEach(doc => {
        if (expectedTitles.includes(doc.title))
          matchedTitles++;
      });
      assert.strictEqual(matchedTitles, expectedTitles.length);
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
      assert.strictEqual(result.documents.length, params.pageSize);
      result.documents.forEach(doc => {
        if (expectedTitles.includes(doc.title))
          matchedTitles++;
      });
      assert.strictEqual(matchedTitles, expectedTitles.length);
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
      assert.strictEqual(result.documents.length, params.pageSize);
      result.documents.forEach(doc => {
        if (expectedTitles.includes(doc.title))
          matchedTitles++;
      });
      assert.strictEqual(matchedTitles, expectedTitles.length);
    })

    it('should return 4 documents on 17th page with pageSize 6', () => {
      const params = {
        page: 17,
        pageSize: 6,
        sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' }
      };
      let result        = engine.searchKeywords([], params);
      assert.strictEqual(result.documents.length, 4);
    });
  });

});