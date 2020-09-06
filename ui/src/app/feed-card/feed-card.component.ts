import { Component, OnInit, Input } from '@angular/core';
import { Feed } from '../models/Feed';

@Component({
  selector: 'app-feed-card',
  templateUrl: './feed-card.component.html',
  styleUrls: ['./feed-card.component.scss']
})
export class FeedCardComponent implements OnInit {
  @Input() feedCard: Feed;
  
  constructor() { }

  ngOnInit(): void {
  }

}
