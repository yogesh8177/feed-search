import { globalOptions } from '../app';
import { requestHandler, globals, cors } from '../decorators/decorators';
import GlobalOptions from '../models/GlobalOptions';

@globals
export class HomeController {

    constructor(private options?: GlobalOptions) {}

    @cors()
    @requestHandler
    root(req, res) {
        return {status: 'live'};
    }

    @cors()
    @requestHandler
    test(req, res) {
        let memoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
        return {message: 'healthy', memoryUsage};
    }

    @cors()
    @requestHandler
    async refresh(req, res) {
        const NS_PER_SEC = 1e9;
        const MS_PER_NS = 1e-6
        const time = process.hrtime();
        await this.options.initializeSearchEngine();
        const diff = process.hrtime(time);
        
        return {
            message: 'refreshed', 
            benchmark: `Refreshing took ${ ((diff[0] * NS_PER_SEC + diff[1])  * MS_PER_NS).toFixed(2) } milliseconds`,
            buildVersion: globalOptions.buildVersion
        };
    }

    @requestHandler
    notFound404(req, res) {
        return { message: 'Requested resource not found', statusCode: 404 };
    }

}