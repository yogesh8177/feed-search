const http          = require("http");
const querystring   = require('querystring');
const SearchEngine  = require('./database/searchEngine');
const mockData      = require('./data/mock_data.json');
const host          = process.env.HOST || '0.0.0.0';
const port          = process.env.PORT || 8000;

// Instantiating our in memory database
const engine = new SearchEngine();
engine.loadDataIntoDb(mockData);
engine.createFieldIndexOn('dateLastEdited', 'Date');
engine.createFieldIndexOn('title', 'string');
engine.createInvertedTextIndex(['title', 'description']);

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
    let {searchTerm = '', page = 1, pageSize = 10, sortField = 'dateLastEdited', order = 'desc', type = 'Date'} = queryParams;
    //console.log({page, pageSize, sortField, order, type});
    const params = {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        sort: {
            sortField,
            order,
            type
        }
    };
    searchTerm = searchTerm.trim();
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
    console.log({searchTerm, params});
    const result = engine.searchKeywords(searchTerm, params);
    res.writeHead(200);
    res.end(JSON.stringify(result));
}

const requestListener = (req, res) => {
    const url = req.url.split('?');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    switch(url[0]) {
        case '/feed':
            return feedController(req, res);
        break;

        case '/test':
            res.writeHead(200);
            res.end(JSON.stringify({message: 'healthy'})); 
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

module.exports = server;
