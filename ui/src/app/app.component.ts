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
  tableHeaders: string[] = ['id', 'image', 'title', 'dateLastEdited'];
  totalResults: number;

  constructor(private feedService: FeedService) {
  }
  
  ngOnInit() {
    this.feedQueryParams.searchTerm = '';
    this.feedQueryParams.page       = 1;
    this.feedQueryParams.pageSize   = 6;
    this.feedQueryParams.sortField  = 'dateLastEdited';
    this.feedQueryParams.type       = 'Date';
    this.feedQueryParams.order      = 'asc';
    this.loadFeed(this.feedQueryParams);
  }
  
  loadFeed(params: FeedQueryParams) {
    this.feed = [];
    this.feedService.getFeed(params).subscribe(
      data => {
        let feedResponse: FeedResponse = data;
        this.totalResults = data.total;
        this.feed = feedResponse.documents;
        console.log(`feed loaded`, this.feed);
      },
      error => console.error(error)
    );
  }

  onSortFieldChange(event: string) {
    let [sortField, type, order]   = event.split(':');
    this.feedQueryParams.sortField = sortField;
    this.feedQueryParams.type      = type;
    this.feedQueryParams.order     = order;
    console.log('sort field changed', this.feedQueryParams);
    this.loadFeed(this.feedQueryParams);
  }

  onSearchFieldChange(event: string) {
    console.log('searchTerm', event);
    this.feedQueryParams.searchTerm = event;
    this.loadFeed(this.feedQueryParams);
  }

  onPageUpdate(event: number) {
    console.log('Page updated', event);
    this.feedQueryParams.page = event;
    this.loadFeed(this.feedQueryParams);
  }
}
