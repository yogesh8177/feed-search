const assert        = require('assert');
const SearchEngine  = require('../searchEngine');
const mockData      = require('../../data/mock_data.json');
const { strict } = require('assert');

const totalMockData = mockData.documents.length;

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
      engine.loadDataIntoDb(mockData.documents);
      let documentMapKeyLength = Object.keys(engine.documentsMap).length;
      assert.strictEqual(documentMapKeyLength, mockData.documents.length);
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

    it('Every document must have id, name, powerstats, connections etc.. properties', () => {
      let documentId = 1; // initial doc id
      Object.keys(engine.documentsMap).forEach(key => {
        const doc = engine.documentsMap[key];
        assert.strictEqual(doc.hasOwnProperty('id'), true);
        assert.strictEqual(doc.hasOwnProperty('name'), true);
        assert.strictEqual(doc.hasOwnProperty('powerstats'), true);
        assert.strictEqual(doc.hasOwnProperty('connections'), true);
        documentId++; // increment doc id
      });
    });

    it('Auto increment document id inside engine must equal to total document length', () => {
      let documentMapKeyLength = Object.keys(engine.documentsMap).length;
      assert.strictEqual(documentMapKeyLength, engine.documentId);
    });

  });

  describe('Creating index in our engine', () => {
    it('idIndex must have id and id properties', () => {
      const indexField = `id`;
      engine.createFieldIndexOn(indexField, 'number');
      checkArrayProperty(engine[`${indexField}Index`], ['id', indexField]);
    });

    it('nameIndex must have id and name properties', () => {
      const indexField = `name`;
      engine.createFieldIndexOn('name', 'string');
      checkArrayProperty(engine[`${indexField}Index`], ['id', indexField]);
    });

    xit('id index must be sorted in ascending order', () => {
      engine.createFieldIndexOn('id', 'number');
      let isSorted = true;
      // Note, index name will be indexFieldIndex => nameIndex in this case.
      const indexLength = engine.nameIndex.length;
      for (let i = indexLength - 1; i >= 1; i--) {
        if (engine.nameIndex[i].id < engine.nameIndex[i - 1].name) {
          isSorted = false;
          break;
        }
        //console.log(`index[${i}] > index[${i-1}] = ${engine.nameIndex[i].name} > ${engine.nameIndex[i-1].name}`);
      }
      assert.strictEqual(isSorted, true);
    });

    it('nameIndex must be sorted in ascending order', () => {
      engine.createFieldIndexOn('name', 'string');
      let isSorted = true;
      // Note, index name will be indexFieldIndex => nameIndex in this case.
      const indexLength = engine.nameIndex.length;
      for (let i = indexLength - 1; i >= 1; i--) {
        if (engine.nameIndex[i].name < engine.nameIndex[i - 1].name) {
          isSorted = false;
          break;
        }
        //console.log(`index[${i}] > index[${i-1}] = ${engine.nameIndex[i].name} > ${engine.nameIndex[i-1].name}`);
      }
      checkArrayProperty(engine.nameIndex, ['id', 'name']);
      assert.strictEqual(isSorted, true);
    });
  });

  describe('Searching in our db', () => {
    it('Search should return 2 documents for search term `batman` ', () => {
      engine.createInvertedTextIndex(['name']);
      const params = {
        page: 1,
        pageSize: 10,
        sort: { sortField: 'id', order: 'asc', type: 'number' }
      };
      let result = engine.searchKeywords(['batman'], params);
      assert.strictEqual(result.hasOwnProperty('total'), true);
      assert.strictEqual(result.hasOwnProperty('documents'), true);
      assert.strictEqual(Array.isArray(result.documents), true);
      assert.strictEqual(result.total, 3);
    });

    it('Search should return 5 documents for search term `super` ', () => {
      engine.createInvertedTextIndex(['name']);
      const params = {
        page: 1,
        pageSize: 10,
        sort: { sortField: 'id', order: 'asc', type: 'number' },
        nGrams: true
      };
      let result = engine.searchKeywords(['super'], params);
      assert.strictEqual(result.hasOwnProperty('total'), true);
      assert.strictEqual(result.hasOwnProperty('documents'), true);
      assert.strictEqual(Array.isArray(result.documents), true);
      assert.strictEqual(result.total, 5);
    });

    it('Search should match 1 document for search term `Abe Sapien` ', () => {
      engine.createInvertedTextIndex(['name']);
      const params = {
        page: 1,
        pageSize: 10,
        sort: { sortField: 'id', order: 'asc', type: 'number' }
      };
      const expectedNames = [
        'Abe Sapien'
      ];
      let result = engine.searchKeywords(['Abe','Sapien'], params);
      let titlesFound = 0;
      result.documents.forEach(doc => {
        if (expectedNames.includes(doc.name)) titlesFound++;
      });

      assert.strictEqual(result.hasOwnProperty('total'), true);
      assert.strictEqual(result.hasOwnProperty('documents'), true);
      assert.strictEqual(Array.isArray(result.documents), true);
      assert.strictEqual(result.total, 1);
      assert.strictEqual(titlesFound, expectedNames.length);
    });

    it('Search should match 3 documents for search term `Agent 13` ', () => {
      engine.createInvertedTextIndex(['name']);
      const params = {
        page: 1,
        pageSize: 10,
        sort: { sortField: 'id', order: 'asc', type: 'number' }
      };
      const expectedNames = [
        'Agent 13',
        'Agent Bob',
        'Agent Zero'
      ];

      let result = engine.searchKeywords(['Agent', '13'], params);
      let titlesFound = 0;
      result.documents.forEach(doc => {
        if (expectedNames.includes(doc.name)) titlesFound++;
      });

      assert.strictEqual(result.hasOwnProperty('total'), true);
      assert.strictEqual(result.hasOwnProperty('documents'), true);
      assert.strictEqual(Array.isArray(result.documents), true);
      assert.strictEqual(titlesFound, expectedNames.length);
    });

    it('Search should return items having `Abomination` in their name for search term `abomina`', () => {
      engine.createInvertedTextIndex(['name']);
      const params = {
        page: 1,
        pageSize: 100,
        sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' },
        nGrams: true // must pass this to support nGrams search
      };

      let result = engine.searchKeywords(['abomina'], params);
      assert.strictEqual(result.total, 1);
      result.documents.forEach(doc => {
        assert.strictEqual(doc.name, 'Abomination');
      });
    });
  });
  
  describe('Sorting in our db', () => {
    xit('Should return results without search keys and sort by id asc', () => {
      const params = {
        page: 1,
        pageSize: 8,
        sort: { sortField: 'id', order: 'asc', type: 'number' }
      };
      let result   = engine.searchKeywords([], params);
      let isSorted = true;

      for (let i = params.pageSize - 1; i >= 1; i--) {
        //console.log(`${result.documents[i][params.sort.sortField]} < ${result.documents[i - 1][params.sort.sortField]}`)
        if (result.documents[i][params.sort.sortField] < result.documents[i - i][params.sort.sortField]) {
          isSorted = false;
          break;
        }
      }
      assert.strictEqual(result.total, totalMockData);
      assert.strictEqual(result.documents.length, params.pageSize);
      assert.strictEqual(isSorted, true);
    });
  
    it('Should return results without search keys and sort by name asc', () => {
      const params = {
        page: 1,
        pageSize: 10,
        sort: { sortField: 'name', order: 'asc', type: 'string' }
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

    it('Should return results without search keys and sort by id desc', () => {
      const params = {
        page: 1,
        pageSize: 8,
        sort: { sortField: 'id', order: 'desc', type: 'number' }
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
  
    it('Should return results without search keys and sort by name desc', () => {
      const params = {
        page: 1,
        pageSize: 8,
        sort: { sortField: 'name', order: 'desc', type: 'string' }
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
    it(`Should match given names on page 2 where we sort by name in desc order`, () => {
      const expectedNames = [
        'Wondra',
        'Wonder Woman'
      ];
      let matchedNames = 0;
      const params = {
        page: 2,
        pageSize: 10,
        sort: { sortField: 'name', order: 'desc', type: 'string' }
      };
      let result   = engine.searchKeywords([], params);
      assert.strictEqual(result.documents.length, params.pageSize);
      result.documents.forEach(doc => {
        if (expectedNames.includes(doc.name))
          matchedNames++;
      });
      assert.strictEqual(matchedNames, expectedNames.length);
    });

    it('Should match given names on page 2 where we sort by name in asc order', () => {
      const expectedNames = ['Air-Walker', 'Agent Zero'];

      const params = {
        page: 2,
        pageSize: 10,
        sort: { sortField: 'name', order: 'asc', type: 'string' }
      };
      let matchedNames = 0;
      let result        = engine.searchKeywords([], params);
      assert.strictEqual(result.documents.length, params.pageSize);
      result.documents.forEach(doc => {
        if (expectedNames.includes(doc.name))
          matchedNames++;
      });
      assert.strictEqual(matchedNames, expectedNames.length);
    })

    it(`Should match given names on page 2 where we sort by id in desc order`, () => {
      const expectedNames = [
        'X-23',
        'Wiz Kid'
      ];
      let matchedNames = 0;
      const params = {
        page: 2,
        pageSize: 10,
        sort: { sortField: 'id', order: 'desc', type: 'number' }
      };
      let result   = engine.searchKeywords([], params);
      assert.strictEqual(result.documents.length, params.pageSize);
      result.documents.forEach(doc => {
        if (expectedNames.includes(doc.name))
          matchedNames++;
      });
      assert.strictEqual(matchedNames, expectedNames.length);
    });

    it('Should match given names on page 2 where we sort by id in asc order', () => {
      const expectedNames = ['Air-Walker', 'Agent Zero'];

      const params = {
        page: 2,
        pageSize: 10,
        sort: { sortField: 'id', order: 'asc', type: 'number' }
      };
      let matchedNames = 0;
      let result        = engine.searchKeywords([], params);
      assert.strictEqual(result.documents.length, params.pageSize);
      result.documents.forEach(doc => {
        if (expectedNames.includes(doc.name))
          matchedNames++;
      });
      assert.strictEqual(matchedNames, expectedNames.length);
    })

    it('should return 1 documents on 74th page with pageSize 10', () => {
      const params = {
        page: 74,
        pageSize: 10,
        sort: { sortField: 'id', order: 'desc', type: 'number' }
      };
      let result        = engine.searchKeywords([], params);
      assert.strictEqual(result.documents.length, 1);
    });
  });

});