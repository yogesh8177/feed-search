import { requestHandler, globals, cors } from '../decorators/decorators';
import GlobalOptions from '../models/GlobalOptions';

@globals
export class SearchController {

    constructor(private options?: GlobalOptions) {}

    @cors()
    @requestHandler
    autoComplete(req, res) {
        const queryParams = req.queryParams;
        const autoComplete: string = queryParams.autoComplete.toString();
        let results = this.options.engine.suggestWords(autoComplete.trim().toLowerCase());
        if (results.length > 10) {
            results = results.splice(0, 10);
        }
        return {data: results };
    }
}