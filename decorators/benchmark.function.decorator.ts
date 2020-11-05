
const benchmark = (envs?: string[]) => {
    return (
        target: Object,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        let originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            try {
                console.time(`Response time ${propertyKey}`);
                let result = await originalMethod.apply(this, args);
                let memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
                console.timeEnd(`Response time ${propertyKey}`);
                console.log(`Heap used: ${memoryUsage}MB`);
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

export { benchmark };