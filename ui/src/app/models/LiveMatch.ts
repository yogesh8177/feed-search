import { Feed } from './Feed';

export class LiveMatch {
    title: string;
    status: string;
    players: Feed[];
    expires: string;
    startedOn: string;
    winnerId: string;
}