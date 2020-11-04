import { globalOptions } from '../app';
import * as querystring from 'querystring';

const requestHandler = (
        target: Object,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        let originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            try {

                args[1].setHeader('Content-Type', 'application/json');
                args[1].setHeader('Access-Control-Allow-Origin', '*');
                args[1].setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');

                const queryParams = querystring.parse(args[0].url.split('?')[1]);
                args[0].queryParams = queryParams;

                const result = await originalMethod.apply(this, args);

                result.buildVersion = globalOptions.buildVersion;
                args[1].writeHead(result.statusCode || 200);
                args[1].end(JSON.stringify(result));
                
                return result;
            }
            catch(error) {
                console.error(`Error while executing: ${propertyKey}() for target: ${target}`);
                console.error(error);
                args[1].writeHead(error.statusCode || 500);
                args[1].end(JSON.stringify({error: 'Internal server error', buildVersion: args[2].buildVersion}));
                return error;
            }
        };
        return descriptor;
    }

export { requestHandler };