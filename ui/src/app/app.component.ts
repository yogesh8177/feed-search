import { Component } from '@angular/core';
import { FeedService } from './feed.service';
import { Feed, FeedResponse } from './models/Feed';
import { FeedQueryParams } from './models/FeedQueryParams';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ui';
  feed: Feed[];
  feedQueryParams: FeedQueryParams = new FeedQueryParams();

  constructor(private feedService: FeedService) {
  }
  
  ngOnInit() {
    this.feedQueryParams.page       = 1;
    this.feedQueryParams.pageSize   = 9;
    this.feedQueryParams.sortField  = 'dateLastEdited';
    this.feedQueryParams.type       = 'Date';
    this.feedQueryParams.order      = 'desc';
    this.feedService.getFeed(this.feedQueryParams).subscribe(
      data => {
        let feedResponse: FeedResponse = data;
        this.feed = feedResponse.documents;
        console.log(`feed loaded`, this.feed);
      },
      error => console.error(error)
    );
  }
}
