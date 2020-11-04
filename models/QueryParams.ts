export class QueryParams {
    searchTerm: string[];
    sort: Sort = new Sort();
    page: number;
    pageSize: number;
    nGrams: boolean;
}

class Sort {
    sortField: string;
    order: string;
    type: string;
}