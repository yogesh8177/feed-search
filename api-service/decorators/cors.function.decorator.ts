import CorsOptions from '../models/CorsOptions';

const cors = (options?: CorsOptions) => {
    return (
        target: Object,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        let originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            try {
                args[1].setHeader('Access-Control-Allow-Origin', options && options.allowedOrigins ? options.allowedOrigins.join(',') : '*');
                args[1].setHeader('Access-Control-Allow-Methods', options && options.allowedMethods ? options.allowedMethods.join(',') : 'OPTIONS, POST, GET');
                let result = await originalMethod.apply(this, args);
                return result;
            }
            catch(error) {
                console.error(`Error while executing: ${propertyKey}() for target: ${target}`);
                console.error(error);
                return error;
            }
        };
        return descriptor;
    }
} 

export { cors };