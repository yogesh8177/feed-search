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
    this.feedQueryParams.searchTerm = '';
    this.feedQueryParams.page       = 1;
    this.feedQueryParams.pageSize   = 6;
    this.feedQueryParams.sortField  = 'dateLastEdited';
    this.feedQueryParams.type       = 'Date';
    this.feedQueryParams.order      = 'desc';
    this.loadFeed(this.feedQueryParams);
  }
  
  loadFeed(params: FeedQueryParams) {
    this.feed = [];
    this.feedService.getFeed(params).subscribe(
      data => {
        let feedResponse: FeedResponse = data;
        this.feed = feedResponse.documents;
        console.log(`feed loaded`, this.feed);
      },
      error => console.error(error)
    );
  }

  onSortFieldChange(event: string) {
    let [sortField, type]          = event.split(':');
    this.feedQueryParams.sortField = sortField;
    this.feedQueryParams.type      = type;
    console.log('sort field changed', this.feedQueryParams);
    this.loadFeed(this.feedQueryParams);
  }

  onSearchFieldChange(event: string) {
    console.log('searchTerm', event);
  }
}
