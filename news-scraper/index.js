const AWS     = require('aws-sdk');
const util    = require('./util');
const NewsAPI = require('newsapi');

const NEWS_API_KEY      = util.fetchEnvVariable('NEWS_API_KEY');
const IAM_ACCESS_KEY_ID = util.fetchEnvVariable('IAM_ACCESS_KEY_ID');
const IAM_SECRET_KEY    = util.fetchEnvVariable('IAM_SECRET_KEY');
const S3_BUCKET         = util.fetchEnvVariable('S3_BUCKET');

const s3 = new AWS.S3({
    credentials: {
      accessKeyId: IAM_ACCESS_KEY_ID,
      secretAccessKey: IAM_SECRET_KEY,
    }
});

console.log({
    NEWS_API_KEY,
    IAM_SECRET_KEY,
    IAM_ACCESS_KEY_ID
});

const newsapi = new NewsAPI(NEWS_API_KEY);

const response = {
    statusCode: 200,
    body: JSON.stringify('Success'),
};



(async () => {
    let news            = await util.fetchNews(newsapi);
    console.log({news});
    let transformedNews = util.transformNewsFormat(news.articles);
    let s3Response      = await util.uploadToS3(s3, {
        Bucket: S3_BUCKET,
        Key: 'news/data.json',
        Body: JSON.stringify(transformedNews),
        ContentType: "application/json"
    });
    console.log({transformedNews, s3Response});
})();

exports.handler = async (event) => {
    try{
        console.log({event: JSON.stringify(event)});

        let news            = await util.fetchNews(newsapi);
        let transformedNews = util.transformNewsFormat(news.articles);
        let s3Response      = await util.uploadToS3(s3, {
            Bucket: S3_BUCKET,
            Key: 'news/data.json',
            Body: JSON.stringify(transformedNews),
            ContentType: "application/json"
        });
        console.log({s3Response});

        return response;
    }
    catch(error) {
        console.error({
            message: 'Error in news scraper lambda',
            error
        });
        response.statusCode = 500;
        response.body = 'Internal server error';
        return response;
    }
};
