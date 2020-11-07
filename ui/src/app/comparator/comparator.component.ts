import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange, ViewChild, ElementRef } from '@angular/core';
import { Feed, CardLabel } from '../models/Feed';
import { GoogleAnalyticsService } from '../Services/analytics/google-analytics.service';

@Component({
  selector: 'feed-comparator',
  templateUrl: './comparator.component.html',
  styleUrls: ['./comparator.component.scss', '../app.component.scss']
})
export class ComparatorComponent implements OnInit, OnChanges {

  @Input() feed: Feed[];
  @ViewChild('compareSection') compareSection: ElementRef;
  comparedFeedItems: Feed[] = [];
  winnerFeedItems: Feed[] = [];
  maxCurrentScore: number = 0;
  totalMaxScorers: number = 0;
  individualStatsArray: string[] = [];
  selectedStatToCompare: string = '';
  currentComparisonStat: string = '';

  constructor(
    private googleAnalytics: GoogleAnalyticsService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    Object.keys(changes).forEach(key => {
      if (key === 'feed') {
        this.resetCompareComponent();
      }
    });
  }

  ngOnInit(): void {
  }

  resetCompareComponent() {
    this.comparedFeedItems.length = 0;
    this.winnerFeedItems.length = 0;
    this.maxCurrentScore = 0;
    this.totalMaxScorers = 0;
    this.individualStatsArray.length = 0;
    this.selectedStatToCompare = '';
    this.currentComparisonStat = '';
  }

  /**
   * "powerstats": {
        "intelligence": "88",
        "strength": "28",
        "speed": "35",
        "durability": "65",
        "power": "100",
        "combat": "85"
      }
   */
  triggerCompare() {
    if (!this.feed.length || this.feed.length === 1) {
      alert('Please select atleast 2 card(s) to compare! You may search for other cards while selecion mode is on!');
      return;
    }
    let comparedFeed = this.compareFeedItems(this.feed, this.selectedStatToCompare);
    this.winnerFeedItems = comparedFeed.splice(0, this.totalMaxScorers).map(item => {
      item.cardLabel = new CardLabel('Winner!', 'top-rank');
      return item;
    });
    let rankStartIndex = 2;
    comparedFeed.forEach(item => {
      item.cardLabel = new CardLabel(`${rankStartIndex}`, 'rankings');
      rankStartIndex++;
    });
    this.comparedFeedItems = comparedFeed;
    this.scrollTo(this.compareSection);
    this.googleAnalytics.emitAnalyticsEvent('cards-compare', {compareCardIds: comparedFeed.map(c => c.name).join(','), powerStat: this.selectedStatToCompare});
  }

  setComparisonStat(stat: string) {
    this.selectedStatToCompare = stat;
    this.triggerCompare();
  }

  compareFeedItems(feedItems: Feed[], comparisonStat: string): Feed[] {
    let _comparedFeedItems: Feed[] = [];
    this.maxCurrentScore = 0;
    this.totalMaxScorers = 0;
    this.currentComparisonStat = comparisonStat;

    feedItems.forEach(item => {
      let statToCompare = comparisonStat;
      let totalScore    = 0;
      let calculatedFeed: Feed = Object.assign({}, item);

      if (statToCompare === '' || statToCompare === undefined || statToCompare === null) {
        Object.keys(item.powerstats).forEach(stat => {
          totalScore += parseInt(item.powerstats[stat]) || 0;
        });
        calculatedFeed.totalScore = totalScore;
        _comparedFeedItems.push(calculatedFeed);
        this.maxCurrentScore = this.maxCurrentScore < totalScore ? totalScore : this.maxCurrentScore;
      }
      else if (typeof statToCompare === 'number' || 
      (typeof statToCompare === 'string' && parseInt(item.powerstats[statToCompare]) !== NaN)
      ) {
        //console.log(`comparing stat: ${statToCompare}`, item.powerstats[statToCompare]);
        totalScore += parseInt(item.powerstats[statToCompare]) || 0;
        calculatedFeed.totalScore = totalScore;
        _comparedFeedItems.push(calculatedFeed);
        this.maxCurrentScore = this.maxCurrentScore < totalScore ? totalScore : this.maxCurrentScore;
      }
      else {
        console.error('Unexpected stat type encountered', {comparisonStat, type: typeof statToCompare});
      }
    });

    // Sort the feed items by total score
    _comparedFeedItems.sort((a, b) => b.totalScore - a.totalScore);
    _comparedFeedItems.forEach(item => {
      if (item.totalScore === this.maxCurrentScore)
        this.totalMaxScorers++;
    });
    this.individualStatsArray = Object.keys(_comparedFeedItems[0].powerstats);
    //console.log('comparision result:', {comparisionResult: _comparedFeedItems, totalWinners: this.totalMaxScorers});
    //_comparedFeedItems.forEach(item => console.log(`${comparisonStat || 'all stats'} => ${item.name} - ${item.totalScore}`));
    return _comparedFeedItems;
  }

  scrollTo(element: ElementRef) {
    setTimeout(() => {
      element.nativeElement.scrollIntoView({behavior: "smooth", block: "start", inline: "start"});
    }, 500);
  }

}
