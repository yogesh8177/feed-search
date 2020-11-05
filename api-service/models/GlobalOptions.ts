import { SearchEngine } from '../database/searchEngine';

export default class GlobalOptions {
    engine: SearchEngine;
    buildVersion: string;
    defaultSortField: string;
    defaultSortFieldType: string;
    defaultSortOrder: string;
    initializeSearchEngine: Function;
    env: string;
    s3: any;
    fetchFromS3: Function;
    S3_DB_SOURCE_KEY: string;
    S3_BUCKET: string;
    S3_CONFIG_KEY: string;
}