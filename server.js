const http          = require("http");
const dotenv        = require('dotenv').config();
const querystring   = require('querystring');
const SearchEngine  = require('./database/searchEngine');
const mockData      = require('./data/mock_data.json');
const host          = fetchEnvVariable('HOST') || '0.0.0.0';
const port          = fetchEnvVariable('PORT') || 8000;
const AWS           = require('aws-sdk');
const fs            = require('fs');
let s3;
let engine;

const env           = fetchEnvVariable('NODE_ENV');
const fieldIndexes  = fetchEnvVariable('FIELD_INDEXES').split(',');
const invertedIndexes = fetchEnvVariable('INVERTED_INDEXES').split(',');

const buildVersion = fs.readFileSync('./build.txt').toString('utf-8');

let S3_BUCKET;

if (['production', 'staging'].includes(env)) {
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
        if (Array.isArray(dataToLoad))
            engine.loadDataIntoDb(dataToLoad);
        else
            engine.loadDataIntoDb(dataToLoad.documents);
        
        fieldIndexes.forEach(item => {
            let field = item.split(':');
            engine.createFieldIndexOn(field[0], field[1]);
        });
        engine.createInvertedTextIndex(invertedIndexes);
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
        const defaultSortField     = fieldIndexes[0].split(':')[0];
        const defaultSortFieldType = fieldIndexes[0].split(':')[1];
        const defaultSortOrder     = fetchEnvVariable('DEFAULT_SORT_ORDER');

        const queryParams = querystring.parse(req.url.split('?')[1]);
        /**
         * Expected queryParam format
         *  {
                page: 1,
                pageSize: 10,
                sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' }
            };
         */
        let {searchTerm = '', page = 1, pageSize = 10, sortField = defaultSortField, order = defaultSortOrder, type = defaultSortFieldType} = queryParams;
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
            params.nGrams = true;
        }
        console.log({searchTerm, params});
        const result = engine.searchKeywords(searchTerm, params);
        result.buildVersion = buildVersion;
        res.writeHead(200);
        res.end(JSON.stringify(result));
    }
    catch(error) {
        console.error(`Error inside feedController`);
        console.error(error);
        res.writeHead(500);
        res.end(JSON.stringify({error: 'Internal server error', buildVersion}));
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
            benchmark: `Refreshing took ${ (diff[0] * NS_PER_SEC + diff[1])  * MS_PER_NS } milliseconds`,
            buildVersion
        })); 
    }
    catch(error) {
        console.error({
            message: 'Error while refreshing data',
            error
        });
        res.writeHead(200);
        res.end(JSON.stringify({message: 'error while refreshing', error: error.message, buildVersion})); 
    }
}

const autoCompleteController = async (req, res) => {
    try {
        const queryParams = querystring.parse(req.url.split('?')[1]);
        const { autoComplete = '' } = queryParams;
        let results = engine.suggestWords(autoComplete.trim().toLowerCase());
        if (results.length > 10) {
            results = results.splice(0, 10);
        }
        res.writeHead(200);
        res.end(JSON.stringify({data: results, buildVersion}));
    }
    catch(error) {
        console.error({
            message: 'Error in auto-complete',
            error
        });
        res.writeHead(200);
        res.end(JSON.stringify({message: 'error in auto-complete', error: error.message, buildVersion})); 
    }
}

const configController = async (req, res) => {
    try{
        let config;
        if (['test', 'docker', 'github'].includes(env)) {
            config = JSON.parse(fs.readFileSync('./config/ui/config.json'));
            console.log('fetched config via fs');
        }
        else {
            config = await fetchFromS3(s3, {Bucket: S3_BUCKET, Key: fetchEnvVariable('S3_CONFIG_KEY')});
            console.log('fetched config via s3');
        }
        config.buildVersion = buildVersion;
        res.writeHead(200);
        res.end(JSON.stringify(config)); 
    }
    catch(error) {
        console.error({
            message: 'Error while fetching config',
            error
        });
        res.writeHead(500);
        res.end(JSON.stringify({error: 'Internal server error', buildVersion})); 
    }
}

const liveMatchController = async (req, res) => {
    try{
        let liveMatch;
        if (['test', 'docker', 'github'].includes(env)) {
            liveMatch = JSON.parse(fs.readFileSync('./data/live-match.json'));
            console.log('fetched live-match via fs');
        }
        else {
            liveMatch = await fetchFromS3(s3, {Bucket: S3_BUCKET, Key: 'superheroes/feed/live-match.json'});
            console.log('fetched live-match via s3');
        }
        liveMatch.buildVersion = buildVersion;
        res.writeHead(200);
        res.end(JSON.stringify(liveMatch)); 
    }
    catch(error) {
        console.error({
            message: 'Error while fetching live-match',
            error
        });
        res.writeHead(500);
        res.end(JSON.stringify({error: 'Internal server error', buildVersion})); 
    }
}

const requestListener = async (req, res) => {
    const url = req.url.split('?');
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');

    switch(url[0]) {

        case '/':
            res.writeHead(200);
            res.end(JSON.stringify({status: 'live', buildVersion}));
        break;

        case '/feed':
            return feedController(req, res);
        break;

        case '/config':
            return configController(req, res);
        break;

        case '/live-match':
            await liveMatchController(req, res);
        break;

        case '/auto-complete':
            autoCompleteController(req, res);
        break;

        case '/refresh':
            await refreshController(req, res);
        break;

        case '/test':
            res.writeHead(200);
            res.end(JSON.stringify({message: 'healthy', buildVersion})); 
        break;

        case '/loaderio-5a06a5b545ec5f56a42510093c4621e1.txt':
            res.writeHead(200);
            res.end('loaderio-5a06a5b545ec5f56a42510093c4621e1'); 
        break;

        default:
            res.writeHead(404);
            res.end(`{"message": "Requested resource not found", buildVersion: "${buildVersion}}"`);
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
        let s3Data = await fetchFromS3(s3, {Bucket: S3_BUCKET, Key: fetchEnvVariable('S3_DB_SOURCE_KEY')});
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
