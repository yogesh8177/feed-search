import * as fs from 'fs';
import { requestHandler, globals, cors } from '../decorators/decorators';
import GlobalOptions from '../models/GlobalOptions';

@globals
export class LiveMatchController {
    constructor(private options?: GlobalOptions) {}

    @cors()
    @requestHandler
    async fetchMatch(req, res) {
        let liveMatch;
        if (['test', 'docker', 'github'].includes(this.options.env)) {
            liveMatch = JSON.parse(fs.readFileSync('./data/live-match.json').toString('utf-8'));
            console.log('fetched live-match via fs');
        }
        else {
            const { s3, S3_BUCKET } = this.options;
            liveMatch = await this.options.fetchFromS3(s3, {Bucket: S3_BUCKET, Key: 'superheroes/feed/live-match.json'});
            console.log('fetched live-match via s3');
        }
        return liveMatch;
    }
}