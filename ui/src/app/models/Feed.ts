export class Feed {
    id: string;
    name: string;
    powerstats: any;
    secondaryStats: any;
    image: any;
    totalScore: number;
    cardLabel: CardLabel;
    isSelected: boolean = false;
}

export class FeedResponse {
    total: number;
    documents: Feed [];
}

export class CardLabel {
    label: string;
    className: string;
    constructor(_label: string, _className: string) {
        this.label = _label;
        this.className = _className;
    }
}