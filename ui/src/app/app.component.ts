import { Component, HostListener } from '@angular/core';
import { FeedService } from './Services/feed.service';
import { ConfigService } from './Services/config/config.service';
import { Feed, FeedResponse } from './models/Feed';
import { Config } from './models/Config';
import { TableData } from './models/TableData';
import { FeedQueryParams } from './models/FeedQueryParams';
import { SocialMedia } from './models/SocialMedia';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Feed';
  buildVersion: string;
  config: Config;
  feed: Feed[] = [];
  feedQueryParams: FeedQueryParams = new FeedQueryParams();
  socialMedia: SocialMedia;

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
    sessionStorage.setItem('queryParams', JSON.stringify(this.feedQueryParams));
    console.log('state saved');
  }

  constructor(
    private feedService: FeedService,
    private configService: ConfigService
    ) {
  }
  
  ngOnInit() {
    this.loadBuildNumber();
    this.initializeQueryParams();
    this.loadConfig();
    this.loadFeed(this.feedQueryParams);
  }
  
  initializeQueryParams() {
    let savedState = JSON.parse(sessionStorage.getItem('queryParams'));
    if (!savedState) {
      this.feedQueryParams.searchTerm = '';
      this.feedQueryParams.page       = 1;
      this.feedQueryParams.pageSize   = 6;
      this.feedQueryParams.sortField  = 'dateLastEdited';
      this.feedQueryParams.type       = 'Date';
      this.feedQueryParams.order      = 'desc';
    }
    else {
      this.feedQueryParams.searchTerm = savedState.searchTerm || '';
      this.feedQueryParams.page       = parseInt(savedState.page) || 1;
      this.feedQueryParams.pageSize   = parseInt(savedState.pageSize) || 6;
      this.feedQueryParams.sortField  = savedState.sortField || 'dateLastEdited';
      this.feedQueryParams.type       = savedState.type || 'Date';
      this.feedQueryParams.order      = savedState.order || 'desc';
    }
  }

  loadConfig() {
    this.configService.fetchConfig().subscribe(
      data => {
        this.config = data;
        this.title  = this.config.appTitle; 
        this.socialMedia = this.config.socialMedia;
      },
      error => console.error(error)
    );
  }
  
  loadFeed(params: FeedQueryParams) {
    this.feed.length = 0;
    this.feedService.getFeed(params).subscribe(
      data => {
        let feedResponse: FeedResponse = data;
        this.totalResults = data.total;
        this.feed = feedResponse.documents;
        this.sanitizeFeedResponse();
        console.log(`feed loaded`, this.feed);
      },
      error => console.error(error)
    );
  }

  sanitizeFeedResponse() {
    this.feed.forEach(item => {
      Object.keys(item).forEach(key => {
        if (item[key] === null || item[key] === undefined) {
          item[key] = 'No content';
        }
      });
    });
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
    this.feedQueryParams.page       = 1;
    this.loadFeed(this.feedQueryParams);
  }

  onPageUpdate(event: number) {
    console.log('Page updated', event);
    this.feedQueryParams.page = event;
    this.loadFeed(this.feedQueryParams);
  }

  loadBuildNumber() {
    this.configService.fetchBuild().subscribe(
      data => {
        this.buildVersion = data;
        console.log(`build number loaded: ${data}`);
      },
      error => console.error(error)
    );
  }

  visitSocialMedia(socialMedia: string) {
    window.open(this.socialMedia[socialMedia].link);
  }
}
