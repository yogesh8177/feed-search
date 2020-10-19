export class Feed {
    id: string;
    name: string;
    powerstats: any;
    biography: any;
    appearance: any;
    work: any;
    connections: any;
    image: any;
    totalScore: number;
}

export class FeedResponse {
    total: number;
    documents: Feed [];
}