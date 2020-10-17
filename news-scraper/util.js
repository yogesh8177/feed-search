const https = require('follow-redirects').https;
const fs = require('fs');

const env = process.env.NODE_ENV;

const deleteOldRunLogs = () => {
    if (fs.existsSync('./errorLogs.json'))
        fs.unlinkSync('./errorLogs.json');
    if (fs.existsSync('./successLogs.json'))
        fs.unlinkSync('./successLogs.json');
}
const logError = (message, error) => {
    console.error({
        message,
        error
    });
    if (env === 'test'){
        fs.appendFileSync('./errorLogs.json', JSON.stringify({message, error}, null, 2));
        fs.appendFileSync('./errorLogs.json', '\n');
    }
}

const logSuccess = (message, payload) => {
    console.log({
        message,
        successObject: payload
    });
    if (env === 'test') {
        fs.appendFileSync('./successLogs.json', JSON.stringify({message, payload}, null, 2));
        fs.appendFileSync('./successLogs.json', '\n');
    }
}

const request = (options) => {
    return new Promise((resolve, reject) => {
        let response = '';
        const req = https.request(options, res => {
            console.log(`${options.hostname}${options.path} => statusCode: ${res.statusCode}`);

            res.on('data', chunk => {
                response += chunk;
            });

            res.on('end', () => resolve(JSON.parse(response)));
        });

        req.on('error', error => {
            logError(`Error while performing request`, error);
            return reject(error);
        });
        req.end();
    });
}

const fetchEnvVariable = (variableName) => {
    if (env.startsWith('lambda')) return process.env[variableName];
    
    const dotenv  = require('dotenv').config();
    return (env === 'test') ? dotenv.parsed[variableName] : process.env[variableName];
}


const fetchNews = async (newsapi) => {
    try {
        let response = await newsapi.v2.topHeadlines({
            // sources: 'bbc-news,the-verge',
            // q: 'bitcoin',
            // category: 'business',
            language: 'en',
            country: 'in'
        });
        return response;
    }
    catch(error) {
        console.error({
            message: 'Error while fetching news',
            error
        });
        return null;
    }
};

const transformNewsFormat = (articles) => {
    let transformedArticles = articles.map(article => {
        return {
            image: article.urlToImage,
            title: article.title,
            description: article.description,
            url: article.url,
            dateLastEdited: article.publishedAt
        };   
    });
    return transformedArticles;
};

const uploadToS3 = async (s3, payload) => {
    try{
        if (env === 'test') {
            let fileName = payload.Key.split('/').join('_');
            fs.writeFileSync(`${fileName}`, JSON.stringify(payload.Body));
            return {message: 'written to local file system', Key: payload.Key};
        }
        let response = await s3.putObject({
            Bucket: payload.Bucket,
            Key: payload.Key,
            Body: payload.Body,
        }).promise();
        return response;
    }
    catch(error) {
        console.error({
            message: 'Error while uploading to s3',
            error
        });
        return error;
    }
};

module.exports = {
    fetchNews,
    transformNewsFormat,
    fetchEnvVariable,
    uploadToS3,
    request,
    logError,
    logSuccess,
    deleteOldRunLogs,
    MAX_RETY_COUNT
};