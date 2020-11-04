import { globalOptions } from '../app';

const globals = <T extends { new (...args: any[]): {} }>(constructor: T) => {
    return class extends constructor {
        options = globalOptions
    }; 
};

export {globals};