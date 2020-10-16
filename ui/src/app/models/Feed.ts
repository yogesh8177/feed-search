export class Feed {
    id: string;
    title: string;
    image: string;
    description: string;
    url: string;
    dateLastEdited: Date;
}

export class FeedResponse {
    total: number;
    documents: Feed [];
}