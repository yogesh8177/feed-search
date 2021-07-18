import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FeedService } from '../Services/feed.service';
import { ConfigService } from '../Services/config/config.service';
import { Feed, FeedResponse } from '../models/Feed';
import { Config } from '../models/Config';
import { TableData } from '../models/TableData';
import { FeedQueryParams } from '../models/FeedQueryParams';
import { GoogleAnalyticsService } from '../Services/analytics/google-analytics.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['../app.component.scss']
})
export class HomeComponent implements OnInit {
  title = 'Feed';
  buildVersion: string;
  config: Config;
  feed: Feed[] = [];
  selectedFeedCards: Feed[] = [];
  feedQueryParams: FeedQueryParams = new FeedQueryParams();
  isSelectionMode: boolean = false;
  errors: string[] = [];
  @ViewChild('cardSection') cardSection: ElementRef;
  @ViewChild('topSection') topSection: ElementRef;

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
    //console.log('saving filters before reload');
    sessionStorage.setItem('queryParams', JSON.stringify(this.feedQueryParams));
    //console.log('state saved');
  }

  constructor(
    private configService: ConfigService,
    private feedService: FeedService,
    private googleAnalytics: GoogleAnalyticsService
    ) {
  }
  
  ngOnInit() {
    this.initializeQueryParams();
    this.loadConfig();
    this.loadFeed(this.feedQueryParams);
  }

  loadConfig() {
    this.configService.fetchConfig().subscribe(
      data => {
        this.config = data;
        this.title  = this.config.appTitle; 
      },
      error => {
        console.error(error);
        this.errors.push('Error while loading config, please refresh the page to try again');
      }
    );
  }
  
  initializeQueryParams() {
    let savedState = JSON.parse(sessionStorage.getItem('queryParams'));
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

  loadFeed(params: FeedQueryParams) {
    this.feed.length = 0;
    this.errors.length = 0;
    this.feedService.getFeed(params)
    .pipe(
      map<FeedResponse, FeedResponse>(res => this.sanitizeFeedResponse(res))
    )
    .subscribe(
      feedResponse => {
        this.totalResults = feedResponse.total;
        this.feed = feedResponse.documents;
        this.scrollTo(this.topSection);
        //console.log(`feed loaded`, this.feed);
        (this.feed.length === 0 && params.searchTerm) && this.errors.push(`No search results, please use double quotes for exact match. Eg: ["iron man"] instead of [iron man].`);
      },
      error => {
        console.error(error);
        this.errors.push('Error while loading feed, please refresh the page to try again!');
      }
    );
  }

  sanitizeFeedResponse(feedResponse: FeedResponse) {
    let selectedIdsMap = {};
    this.selectedFeedCards.map(c => { 
      selectedIdsMap[c.id] = c.isSelected;
    });

    feedResponse.documents.forEach(item => {
      item.isSelected = selectedIdsMap.hasOwnProperty(item.id) ? selectedIdsMap[item.id] : false;
    });
    return feedResponse;
  }

  toggleShowSelectCards() {
    this.isSelectionMode = !this.isSelectionMode;
    if (!this.isSelectionMode) this.clearSelectedItems();
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
    this.googleAnalytics.emitAnalyticsEvent('sortField', {sortField: event});
  }

  onSearchFieldChange(event: string) {
    console.log('searchTerm', event);
    this.feedQueryParams.searchTerm = event;
    this.feedQueryParams.page       = 1;
    this.loadFeed(this.feedQueryParams);
    this.googleAnalytics.emitAnalyticsEvent('searchTerm', {searchTerm: event});
  }

  onPageUpdate(event: number) {
    //console.log('Page updated', event);
    this.feedQueryParams.page = event;
    this.loadFeed(this.feedQueryParams);
  }

  scrollTo(element: ElementRef) {
    element.nativeElement.scrollIntoView({behavior: "smooth", block: "start", inline: "start"});
  }
}
