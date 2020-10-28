const http          = require("http");
const querystring   = require('querystring');
const redis         = require('redis');
const util          = require('./util');
const { promisify } = require("util");
const fs            = require('fs');

const REDIS_HOST  = util.fetchEnvVariable('REDIS_HOST');
const REDIS_PORT  = util.fetchEnvVariable('REDIS_PORT');
const HOST        = util.fetchEnvVariable('HOST');
const PORT        = util.fetchEnvVariable('PORT');
const redisPrefix = util.NODE_ENV;

const buildVersion = fs.readFileSync('./build.txt').toString('utf-8');

let redisOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
};
if (util.NODE_ENV === 'staging') {
    redisOptions.password = util.fetchEnvVariable('REDIS_PASSWORD');
}
const client = redis.createClient(options);

const incrByAsync = promisify(client.incrby).bind(client);

const fetchVotesController = async (req, res) => {
    try {
        await util.validateRequestMethod(req, ['GET']);

        const queryParams = querystring.parse(req.url.split('?')[1]);
        const { voteeIds = '' } = queryParams;
        let playerIds = voteeIds.split(',');

        const multi = client.multi();

        playerIds.forEach(id => {
            multi.get(`${redisPrefix}:vote:${id}`);
        })

        let redisResponse = await new Promise((res, rej) => {
            multi.exec((error, data) => {
                if (error) return rej(error);
                return res(data);
            });
        });

        let votesResponse = playerIds.map((id, index) => {
            return {
                voteeId: id,
                count: redisResponse[index]
            };
        });
        
        util.successResponse(res, {response: votesResponse, buildVersion});
    }
    catch(error) {
        util.logError('Error while fetching votes', { error, buildVersion });
        util.errorResponse(res, {error, buildVersion});
    }
};

const castVoteController = async (req, res) => {
    try {
        let response = {};
        await util.validateRequestMethod(req, ['POST', 'OPTIONS']);
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', async () => {
            if (body) {
                let jsonBody = JSON.parse(body);
                await incrByAsync(`${redisPrefix}:vote:${jsonBody.voteeId}`, 1);
                response = jsonBody;
                response.message = 'vote casted';
                util.successResponse(res, {response, buildVersion});
            }
            else {
                // Serving options request
                res.writeHead(200);
                res.end('ok');
            }
        });
    }
    catch(error) {
        util.logError('Error while casting vote', { error, buildVersion });
        util.errorResponse(res, {error, buildVersion});
    }
};

const requestListener = async (req, res) => {
    const url = req.url.split('?');
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');

    switch(url[0]) {

        case '/':
            res.writeHead(200);
            res.end(JSON.stringify({service: 'voting-service', status: 'live', buildVersion}));
        break;

        case '/fetch-votes':
            return fetchVotesController(req, res);
        break;

        case '/cast-vote':
            return castVoteController(req, res);
        break;

        case '/test':
            res.writeHead(200);
            res.end(JSON.stringify({message: 'healthy', buildVersion})); 
        break;

        default:
            res.writeHead(404);
            res.end(`{"message": "Requested resource not found", buildVersion: "${buildVersion}}"`);
        break;
    }
};

const server = http.createServer(requestListener);
server.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

function shutDown () {
    process.exit(0);
}

module.exports = { 
    server,
    shutDown
};