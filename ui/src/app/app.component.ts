import { Component, HostListener } from '@angular/core';
import { FeedService } from './feed.service';
import { Feed, FeedResponse } from './models/Feed';
import { TableData } from './models/TableData';
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
  tableHeaders: object[] = [
    {title: 'id', type: TableData.STRING},
    {title: 'image', type: TableData.IMAGE}, 
    {title: 'title', type: TableData.STRING}, 
    {title: 'description', type: TableData.STRING},
    {title: 'dateLastEdited', type: TableData.DATE}
  ];
  totalResults: number;

  @HostListener('window:beforeunload', ['$event'])
  WindowBeforeUnoad($event: any) {
    console.log('saving filters before reload');
    localStorage.setItem('queryParams', JSON.stringify(this.feedQueryParams));
    console.log('state saved');
  }

  constructor(private feedService: FeedService) {
  }
  
  ngOnInit() {
    this.initializeQueryParams();
    this.loadFeed(this.feedQueryParams);
  }
  
  initializeQueryParams() {
    let savedState = JSON.parse(localStorage.getItem('queryParams'));
    if (!savedState) {
      this.feedQueryParams.searchTerm = '';
      this.feedQueryParams.page       = 1;
      this.feedQueryParams.pageSize   = 6;
      this.feedQueryParams.sortField  = 'dateLastEdited';
      this.feedQueryParams.type       = 'Date';
      this.feedQueryParams.order      = 'asc';
    }
    else {
      this.feedQueryParams.searchTerm = savedState.searchTerm || '';
      this.feedQueryParams.page       = parseInt(savedState.page) || 1;
      this.feedQueryParams.pageSize   = parseInt(savedState.pageSize) || 6;
      this.feedQueryParams.sortField  = savedState.sortField || 'dateLastEdited';
      this.feedQueryParams.type       = savedState.type || 'Date';
      this.feedQueryParams.order      = savedState.order || 'asc';
    }
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
