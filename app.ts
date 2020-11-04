import * as http from 'http';
import * as dotEnv  from 'dotenv';
const dotenv = dotEnv.config();
import GlobalOptions from './models/GlobalOptions';

import { SearchEngine, EngineOptions } from '../database/searchEngine';
import * as mockData from '../data/mock_data.json';
import * as AWS  from 'aws-sdk';
import * as fs from 'fs';
import * as Controllers from './controllers/controllers';

const host: string        = fetchEnvVariable('HOST') || '0.0.0.0';
const port: number        = parseInt(fetchEnvVariable('PORT')) || 8000;
let s3;
const globalOptions: GlobalOptions = new GlobalOptions();

let engine: SearchEngine;

const env: string               = fetchEnvVariable('NODE_ENV');
globalOptions.env               = env;

const fieldIndexes: string []   = fetchEnvVariable('FIELD_INDEXES').split(',');
const invertedIndexes: string[] = fetchEnvVariable('INVERTED_INDEXES').split(',');

globalOptions.buildVersion          = fs.readFileSync('./build.txt').toString('utf-8');
globalOptions.defaultSortField      = fieldIndexes[0].split(':')[0];
globalOptions.defaultSortFieldType  = fieldIndexes[0].split(':')[1];
globalOptions.defaultSortOrder      = fetchEnvVariable('DEFAULT_SORT_ORDER');
globalOptions.S3_CONFIG_KEY         = fetchEnvVariable('S3_CONFIG_KEY');
globalOptions.fetchFromS3           = fetchFromS3;
globalOptions.S3_DB_SOURCE_KEY      = fetchEnvVariable('S3_DB_SOURCE_KEY');

let S3_BUCKET;

if (['production', 'staging'].includes(env)) {
    S3_BUCKET = fetchEnvVariable('S3_BUCKET');

    AWS.config.update({
        region: 'us-east-1',
        accessKeyId: fetchEnvVariable('IAM_ACCESS_KEY_ID'),
        secretAccessKey: fetchEnvVariable('IAM_SECRET_KEY'),
    });
    
    s3                      = new AWS.S3();
    globalOptions.s3        = s3;
    globalOptions.S3_BUCKET = S3_BUCKET;
}

// Instantiating our in memory database
const initializeSearchEngine = async () => {
    try {
        if (engine && Object.keys(engine).length) {
            Object.keys(engine).forEach(key => {
                delete engine[key];
            });
        }
        let engineOptions: EngineOptions = {loadTrie: true, extraDotNestedFields: 'biography.publisher'};
        engine = null;
        engine = new SearchEngine();
        const dataToLoad = ['test', 'docker', 'github'].includes(env) ? mockData : await fetchDataToLoad(env, s3);
        if (Array.isArray(dataToLoad))
            engine.loadDataIntoDb(dataToLoad, engineOptions);
        else
            engine.loadDataIntoDb(dataToLoad.documents, engineOptions);
        
        fieldIndexes.forEach(item => {
            let field = item.split(':');
            engine.createFieldIndexOn(field[0], field[1]);
        });
        engine.createInvertedTextIndex(invertedIndexes);
        globalOptions.engine = engine;
    }
    catch(error) {
        console.error(`Error while initializing in memory database`);
        console.error(error);
    }
    
    const engineKeys = Object.keys(engine);
    console.log(`Initialized in memory db`, engineKeys);
}

globalOptions.initializeSearchEngine = initializeSearchEngine;

(async () => {
    try {
        await initializeSearchEngine();
    }
    catch(error) {
        console.error(error);
    }
})();

const requestListener = async (req, res) => {
    const url = req.url.split('?');

    switch(url[0]) {

        case '/':
            let homeController = new Controllers.HomeController();
            homeController.root(req, res);
        break;

        case '/feed':
            let feedController = new Controllers.FeedController();
            feedController.getFeed(req, res);
        break;

        case '/config':
            let configController = new Controllers.ConfigController();
            configController.fetchConfig(req, res);
        break;

        case '/live-match':
            let liveMatchController = new Controllers.LiveMatchController();
            liveMatchController.fetchMatch(req, res);
        break;

        case '/auto-complete':
            let autoCompleteController = new Controllers.SearchController();
            autoCompleteController.autoComplete(req, res);
        break;

        case '/refresh':
            let refreshController = new Controllers.HomeController();
            refreshController.refresh(req, res);
        break;

        case '/test':
            let homeTestController = new Controllers.HomeController();
            homeTestController.test(req, res);
        break;

        case '/loaderio-5a06a5b545ec5f56a42510093c4621e1.txt':
            res.writeHead(200);
            res.end('loaderio-5a06a5b545ec5f56a42510093c4621e1'); 
        break;

        default:
            let defaultController = new Controllers.HomeController();
            defaultController.notFound404(req, res);
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

export {server, globalOptions};
