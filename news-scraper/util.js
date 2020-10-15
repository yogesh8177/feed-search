
const fetchEnvVariable = (variableName) => {
    const env = process.env.NODE_ENV;
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
    uploadToS3
};