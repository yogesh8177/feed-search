const http          = require("http");
const dotenv        = require('dotenv').config();
const querystring   = require('querystring');
const SearchEngine  = require('./database/searchEngine');
const mockData      = require('./data/mock_data.json');
const host          = process.env.HOST || '0.0.0.0';
const port          = process.env.PORT || 8000;
const AWS           = require('aws-sdk');
let s3;
let engine;

const env           = fetchEnvVariable('NODE_ENV');
let S3_BUCKET;

if (env === 'production') {
    S3_BUCKET = fetchEnvVariable('S3_BUCKET');

    AWS.config.update({
        region: 'us-east-1',
        accessKeyId: fetchEnvVariable('IAM_ACCESS_KEY_ID'),
        secretAccessKey: fetchEnvVariable('IAM_SECRET_KEY'),
    });
    
    s3 = new AWS.S3();
}

// Instantiating our in memory database
const initializeSearchEngine = async () => {
    try {
        if (engine && Object.keys(engine).length) {
            Object.keys(engine).forEach(key => {
                delete engine[key];
            });
        }
        engine = null;
        engine = new SearchEngine();
        const dataToLoad = ['test', 'docker', 'github'].includes(env) ? mockData : await fetchDataToLoad(env, s3);
        engine.loadDataIntoDb(dataToLoad);
        engine.createFieldIndexOn('dateLastEdited', 'Date');
        engine.createFieldIndexOn('title', 'string');
        engine.createInvertedTextIndex(['title', 'description']);
    }
    catch(error) {
        console.error(`Error while initializing in memory database`);
        console.error(error);
    }
    
    const engineKeys = Object.keys(engine);
    console.log(`Initialized in memory db`, engineKeys);
}

(async () => {
    try {
        await initializeSearchEngine();
    }
    catch(error) {
        console.error(error);
    }
})();

const feedController = (req, res) => {
    try {
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
        console.log({searchTerm, params});
        const result = engine.searchKeywords(searchTerm, params);
        res.writeHead(200);
        res.end(JSON.stringify(result));
    }
    catch(error) {
        console.error(`Error inside feedController`);
        console.error(error);
        res.writeHead(500);
        res.end(JSON.stringify({error: 'Internal server error'}));
    }
}

const refreshController = async (req, res) => {
    try {
        const NS_PER_SEC = 1e9;
        const MS_PER_NS = 1e-6
        const time = process.hrtime();
        await initializeSearchEngine();
        const diff = process.hrtime(time);
        res.writeHead(200);
        res.end(JSON.stringify({
            message: 'refreshed', 
            benchmark: `Refreshing took ${ (diff[0] * NS_PER_SEC + diff[1])  * MS_PER_NS } milliseconds`
        })); 
    }
    catch(error) {
        console.error({
            message: 'Error while refreshing data',
            error
        });
        res.writeHead(200);
        res.end(JSON.stringify({message: 'error while refreshing', error: error.message})); 
    }
}

const requestListener = async (req, res) => {
    const url = req.url.split('?');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    switch(url[0]) {
        case '/feed':
            return feedController(req, res);
        break;

        case '/refresh':
            await refreshController(req, res);
        break;

        case '/test':
            res.writeHead(200);
            res.end(JSON.stringify({message: 'healthy'})); 
        break;

        case '/loaderio-5a06a5b545ec5f56a42510093c4621e1':
            res.writeHead(200);
            res.end(JSON.stringify({message: 'success'})); 
        break;

        default:
            res.writeHead(404);
            res.end(`{"message": "Requested resource not found"}`);
        break;
    }
};

function fetchEnvVariable(variableName) {
    const env = process.env.NODE_ENV;
    return (env === 'test') ? dotenv.parsed[variableName] : process.env[variableName];
}

async function fetchFromS3(s3, payload) {
    try{
        let response = await s3.getObject({
            Bucket: payload.Bucket,
            Key: payload.Key
        }).promise();
        console.log({
            message: 'data loaded from s3',
            response
        });
        return JSON.parse(response.Body.toString('utf-8'));
    }
    catch(error) {
        console.error({
            message: 'Error while fetching from s3',
            error
        });
        return error;
    }
};

async function fetchDataToLoad(env, s3) {
    try{
        if (env === 'test') return mockData;
        let s3Data = await fetchFromS3(s3, {Bucket: S3_BUCKET, Key: 'news/data.json'});
        return s3Data;
    }
    catch(error) {
        console.error({
            message: 'Error while fetching to load into search engine',
            error
        });
        return error;
    }
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

module.exports = server;
