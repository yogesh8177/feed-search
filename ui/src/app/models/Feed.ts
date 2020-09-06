export class Feed {
    id: string;
    title: string;
    image: string;
    description: string;
    dateLastEdited: Date;
}

export class FeedResponse {
    total: number;
    documents: Feed [];
}