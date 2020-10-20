import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Feed } from '../models/Feed';

@Component({
  selector: 'app-feed-card',
  templateUrl: './feed-card.component.html',
  styleUrls: ['./feed-card.component.scss']
})
export class FeedCardComponent implements OnInit {
  @Input() feedCard: Feed;
  @Input() comparisionStat: string = '';
  @Input() showSelectCard: boolean = false;
  @Output() selectedCard = new EventEmitter<Feed>();
  
  constructor() { }
  
  ngOnInit(): void {
  }
  
  setSelectedCard(selectedCard: Feed) {
    selectedCard.isSelected = !selectedCard.isSelected;
    this.selectedCard.emit(selectedCard);
  }

}
