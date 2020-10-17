const AWS = require('aws-sdk');
const util = require('./util');
const NewsAPI = require('newsapi');

const envVariablesToFetch = [
    'NODE_ENV',
    'NEWS_API_KEY',
    'SUPER_HERO_API_KEY',
    'MAX_RETY_COUNT',
    'TOTAL_SUPER_HEROES',
    'IAM_ACCESS_KEY_ID',
    'IAM_SECRET_KEY',
    'S3_BUCKET'
];
const ENVs = {};

envVariablesToFetch.forEach(variable => {
    ENVs[variable] = util.fetchEnvVariable(variable);
});

Object.keys(ENVs).forEach(variable => {
    console.log(`${variable} => ${ENVs[variable]}`);
});

AWS.config.update({
    region: 'us-east-1',
    accessKeyId: ENVs['IAM_ACCESS_KEY_ID'],
    secretAccessKey: ENVs['IAM_SECRET_KEY'],
});

const s3 = new AWS.S3();


const newsapi = new NewsAPI(ENVs['NEWS_API_KEY']);

const response = {
    statusCode: 200,
    body: JSON.stringify('Success'),
};

let heroesResponse = {
    total: 0,
    documents: []
};

const fetchSuperHeroData = async (errors, retryCount) => {
    try {
        if (retryCount && parseInt(retryCount) > ENVs['MAX_RETY_COUNT']) {
            util.logError(`Max retry reached`, { failedIds: errors });
            return Promise.resolve();
        }
        const options = {
            hostname: `superheroapi.com`,
            port: 443,
            method: 'GET'
        };

        let currentErrorIds = [];
        let iterableArray = [];
        if (Array.isArray(errors) && errors.length) {
            util.logError(`fetching for failed ids`, { retryCount, errors });
            iterableArray = errors;
        }
        else {
            for (let i = 1; i <= ENVs['TOTAL_SUPER_HEROES']; i++) {
                iterableArray.push(i);
            }
        }

        let heroes = await Promise.all(
            iterableArray.map(async i => {
                try {
                    options.path = `/api/${ENVs['SUPER_HERO_API_KEY']}/${i}`;
                    let hero = await util.request(options);
                    heroesResponse.documents.push(hero);
                    util.logSuccess(`hero fetched for id: ${i}`, hero);
                    return Promise.resolve(hero);
                }
                catch (error) {
                    util.logError(`Error fetching hero with id: ${i}`, error);
                    // let us not stop if one request fails
                    currentErrorIds.push(i);
                    return Promise.resolve();
                }
            })
        );

        util.logSuccess(`fetched heroes`, heroes);

        if (currentErrorIds.length) {
            util.logSuccess(`retrying for failed ids, attempt: ${retryCount || 1}`, currentErrorIds);
            await fetchSuperHeroData(currentErrorIds, retryCount ? ++retryCount : 1);
            util.logSuccess(`retrying complete for ids on attempt: ${retryCount}`, currentErrorIds);
        }
        util.logSuccess('exiting', { totalHeroesFetched: heroesResponse.documents.length });
        heroesResponse.total = heroesResponse.documents.length;

        return heroesResponse;
    }
    catch (error) {
        util.logError('Error while fetching superhero data', error);
        return error;
    }
}

let executeLogic = async () => {
    try {
        let news = await util.fetchNews(newsapi);
        let transformedNews = util.transformNewsFormat(news.articles);
        let s3Response = await util.uploadToS3(s3, {
            Bucket: ENVs['S3_BUCKET'],
            Key: 'news/feed/data.json',
            Body: JSON.stringify(transformedNews),
            ContentType: "application/json"
        });
        util.logSuccess('written to s3', { s3Response });
    
        let heroesData = await fetchSuperHeroData();
    
        let herosS3Response = await util.uploadToS3(s3, {
            Bucket: ENVs['S3_BUCKET'],
            Key: 'superheroes/feed/data.json',
            Body: JSON.stringify(heroesData),
            ContentType: "application/json"
        });
    
        util.logSuccess('written to s3', { herosS3Response });
    }
    catch(error) {
        util.logError(`Error while executing lambda`, error);
        return Promise.reject(error);
    }
}

if (ENVs['NODE_ENV'] === 'test') {
    util.deleteOldRunLogs();
    (async () => {
        await executeLogic();
    })();
}

exports.handler = async (event) => {
    try {
        console.log({ event: JSON.stringify(event) });
        await executeLogic();
        return response;
    }
    catch (error) {
        console.error({
            message: 'Error in news scraper lambda',
            error
        });
        response.statusCode = 500;
        response.body = 'Internal server error';
        return response;
    }
};
