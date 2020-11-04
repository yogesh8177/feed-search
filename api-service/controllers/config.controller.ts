import * as fs from 'fs';
import { requestHandler, globals } from '../decorators/decorators';
import GlobalOptions from '../models/GlobalOptions';

@globals
export class ConfigController {
    constructor(private options?: GlobalOptions) {}

    @requestHandler
    async fetchConfig(req, res) {
        let config;
        if (['test', 'docker', 'github'].includes(this.options.env)) {
            config = JSON.parse(fs.readFileSync('../config/ui/config.json').toString('utf-8'));
            console.log('fetched config via fs');
        }
        else {
            const { s3, S3_BUCKET, S3_CONFIG_KEY } = this.options;
            config = await this.options.fetchFromS3(s3, {Bucket: S3_BUCKET, Key: S3_CONFIG_KEY});
            console.log('fetched config via s3');
        }
        return config;
    }
}