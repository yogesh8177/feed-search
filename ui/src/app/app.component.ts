import { Component, HostListener } from '@angular/core';
import { FeedService } from './Services/feed.service';
import { ConfigService } from './Services/config/config.service';
import { Feed, FeedResponse } from './models/Feed';
import { Config } from './models/Config';
import { TableData } from './models/TableData';
import { FeedQueryParams } from './models/FeedQueryParams';

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
  selectedFeedCards: Feed[] = [];
  feedQueryParams: FeedQueryParams = new FeedQueryParams();
  showSelectCard: boolean = false;

  tableHeaders: object[] = [
    {title: 'id', type: TableData.STRING},
    {title: 'image', type: TableData.IMAGE}, 
    {title: 'name', type: TableData.STRING}, 
    {title: 'powerstats', type: TableData.STRING},
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
    let savedState = JSON.parse(localStorage.getItem('queryParams'));
    if (!savedState) {
      this.feedQueryParams.searchTerm = '';
      this.feedQueryParams.page       = 1;
      this.feedQueryParams.pageSize   = 10;
      this.feedQueryParams.sortField  = 'id';
      this.feedQueryParams.type       = 'number';
      this.feedQueryParams.order      = 'asc';
    }
    else {
      console.log('loaded from localstorage', savedState);
      this.feedQueryParams.searchTerm = savedState.searchTerm || '';
      this.feedQueryParams.page       = parseInt(savedState.page) || 1;
      this.feedQueryParams.pageSize   = parseInt(savedState.pageSize) || 10;
      this.feedQueryParams.sortField  = savedState.sortField || 'id';
      this.feedQueryParams.type       = savedState.type || 'number';
      this.feedQueryParams.order      = savedState.order || 'asc';
    }
  }

  loadConfig() {
    this.configService.fetchConfig().subscribe(
      data => {
        this.config = data;
        this.title  = this.config.appTitle; 
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
    let selectedIdsMap = {};
    this.selectedFeedCards.map(c => { 
      selectedIdsMap[c.id] = c.isSelected;
    });

    console.log({selectedIdsMap});
    this.feed.forEach(item => {
      Object.keys(item).forEach(key => {
        if (item[key] === null || item[key] === undefined) {
          item[key] = 'No content';
        }
      });
      if (selectedIdsMap.hasOwnProperty(item.id)) {
        item.isSelected = selectedIdsMap[item.id];
      }
      else {
        item.isSelected = false;
        console.log(`no history`)
      }
    });
  }

  toggleShowSelectCards() {
    this.showSelectCard = !this.showSelectCard;
    if (!this.showSelectCard) this.clearSelectedItems();
  }

  clearSelectedItems() {
    this.selectedFeedCards.forEach(item => item.isSelected = false);
    this.selectedFeedCards.length = 0;
  }

  onCardSelect(card: Feed) {
    //console.log('selected card', {id: card.id, name: card.name, isSelected: card.isSelected});
    let currentCardExists = this.selectedFeedCards.filter(c => c.id === card.id);
    // if card already exists and we want to add it to selected list, we do nothing
    if (currentCardExists.length && card.isSelected) return;

    // if card already exists and we want to remove it, lets remove it!
    if (currentCardExists.length && !card.isSelected) {
      console.log(`deleting card as de-selected`);
      let deleteIndex = null;
      this.selectedFeedCards.map((c, index) => {
        if (c.id === card.id) deleteIndex = index;
      });

      if (deleteIndex >= 0) this.selectedFeedCards.splice(deleteIndex, 1);
    }

    // if selected card does not exist in selected list, let us add it
    if (!currentCardExists.length && card.isSelected) this.selectedFeedCards.push(card);
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
}
