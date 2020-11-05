import { QueryParams } from '../models/QueryParams';
import { requestHandler, globals, cors } from '../decorators/decorators';
import GlobalOptions from '../models/GlobalOptions';

@globals
export class FeedController {
    constructor (private options?: GlobalOptions) {}

    @cors()
    @requestHandler
    getFeed(req, res) {
        const { defaultSortField, defaultSortFieldType, defaultSortOrder} = this.options;
        const queryStringParams = req.queryParams;
        /**
         * Expected queryParam format
         *  {
                page: 1,
                pageSize: 10,
                sort: { sortField: 'dateLastEdited', order: 'desc', type: 'Date' }
            };
         */
        let queryParams = new QueryParams();
        queryParams.searchTerm = [queryStringParams.searchTerm as string];
        queryParams.page = parseInt(queryStringParams.page as string) || 1;
        queryParams.pageSize = parseInt(queryStringParams.pageSize as string) || 10;
        queryParams.sort.sortField = queryStringParams.sortField as string || defaultSortField;
        queryParams.sort.order = queryStringParams.order as string || defaultSortOrder;
        queryParams.sort.type = queryStringParams.type as string || defaultSortFieldType;
    
        let currentSearchTerm: string = queryStringParams.searchTerm as string || '';

        currentSearchTerm = currentSearchTerm.trim();
        if (!currentSearchTerm) {
            queryParams.searchTerm = [];
        }
        else if (currentSearchTerm.startsWith(`"`) && currentSearchTerm.endsWith(`"`)) {
            queryParams.searchTerm = [currentSearchTerm.replace(/["]/g, '')];
        }
        else {
            queryParams.searchTerm = currentSearchTerm.split(' ');
            queryParams.nGrams = true;
        }
        console.log({ currentSearchTerm, queryParams });
        const result = this.options.engine.searchKeywords(queryParams.searchTerm, queryParams) as any;
        return result;
    }
}