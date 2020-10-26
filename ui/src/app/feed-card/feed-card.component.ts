import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Feed } from '../models/Feed';
import  { GoogleAnalyticsService } from '../Services/analytics/google-analytics.service';

@Component({
  selector: 'app-feed-card',
  templateUrl: './feed-card.component.html',
  styleUrls: ['./feed-card.component.scss']
})
export class FeedCardComponent implements OnInit {
  @Input() feedCard: Feed;
  @Input() comparisonStat: string = '';
  @Input() showSelectCard: boolean = false;
  @Output() selectedCard = new EventEmitter<Feed>();
  flipCard: boolean = false;
  
  constructor(
    private googleAnalytics: GoogleAnalyticsService
  ) { }
  
  ngOnInit(): void {
  }
  
  setSelectedCard(selectedCard: Feed) {
    selectedCard.isSelected = !selectedCard.isSelected;
    this.selectedCard.emit(selectedCard);
  }

  flipThisCard() {
    this.flipCard = !this.flipCard;
    this.googleAnalytics.emitAnalyticsEvent('card-info', {character: this.feedCard.name});
  }

}
