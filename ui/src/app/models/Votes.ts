export class Vote {
    count: number;
    voteeId: string;
    playerName: string;
}

export class VoteResponse {
    data: Vote[];
    buildVersion: string;
}