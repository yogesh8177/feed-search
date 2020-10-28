const dotenv = require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV;

function fetchEnvVariable(variableName) {
    return (NODE_ENV === 'test') ? dotenv.parsed[variableName] : process.env[variableName];
}

const validateRequestMethod = (req, methods) => {
    if (!methods.includes(req.method)) return Promise.reject(new Error(`method: ${req.method} not supported`));
    return Promise.resolve();
};

const successResponse = (res, payload) => {
    const { response, buildVersion } = payload;
    res.writeHead(200);
    res.end(JSON.stringify({data: response, buildVersion}));
}

const errorResponse = (res, errorObject) => {
    const {error, buildVersion} = errorObject;
    res.writeHead(500);
    res.end(JSON.stringify({error: error.message, buildVersion}));
}

const logError = (message, error) => {
    console.error({
        message,
        error
    });
};

const logSuccess = (message, payload) => {
    console.log({
        message,
        payload
    });
}

module.exports = {
    fetchEnvVariable,
    logError,
    logSuccess,
    validateRequestMethod,
    successResponse,
    errorResponse,
    NODE_ENV
};