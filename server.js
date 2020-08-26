const http          = require("http");
const querystring   = require('querystring');
const SearchEngine  = require('./database/searchEngine');
const mockData      = require('./data/mock_data.json');
const host          = 'localhost';
const port          = 8000;

// Instantiating our in memory database
const engine = new SearchEngine();
engine.loadDataIntoDb(mockData);
engine.createFieldIndexOn('dateLastEdited', 'Date');
engine.createFieldIndexOn('title', 'string');
engine.createInvertedTextIndex();

const engineKeys = Object.keys(engine);
console.log(`Initialized in memory db`, engineKeys);

const feedController = (req, res) => {
    const queryParams = querystring.parse(req.url.split('?')[1]);
    /**
     * Expected queryParam format
     *  {
            page: 1,
            pageSize: 10,
            sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' }
        };
     */
    let {searchTerm = '', page = 1, pageSize = 10, sortField = null, order = null, type = null} = queryParams;
    console.log({page, pageSize, sortField, order, type});
    const params = {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        sort: {
            sortField,
            order,
            type
        }
    };
    if (!searchTerm) {
        searchTerm = [];
    }
    else if (searchTerm.startsWith(`"`) && searchTerm.endsWith(`"`)) {
        searchTerm = [searchTerm.replace(/["]/g, '')];
    }
    else {
        searchTerm = searchTerm.split(' ');
    }
    const payload = {
        searchTerm,
        params
    };
    const result = engine.searchKeywords(searchTerm, params);
    res.writeHead(200);
    res.end(JSON.stringify(result));
}

const requestListener = (req, res) => {
    console.log('request url', req.url);
    const url = req.url.split('?');
    res.setHeader("Content-Type", "application/json");
    switch(url[0]) {
        case '/feed':
            return feedController(req, res);
        break;

        default:
            res.writeHead(404);
            res.end(`{"message": "Requested resource not found"}`);
        break;
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});