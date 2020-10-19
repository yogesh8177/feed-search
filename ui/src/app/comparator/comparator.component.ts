import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { Feed } from '../models/Feed';

@Component({
  selector: 'feed-comparator',
  templateUrl: './comparator.component.html',
  styleUrls: ['./comparator.component.scss', '../app.component.scss']
})
export class ComparatorComponent implements OnInit, OnChanges {

  @Input() feed: Feed[];
  sortedFeedItems: Feed[] = [];
  maxCurrentScore: number = 0;
  totalMaxScorers: number = 0;
  individualStatsArray: string[] = [];
  selectedStatToCompare: string = '';
  currentComparisionStat: string = '';

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(`items changed`, Object.keys(changes));
    Object.keys(changes).forEach(key => {
      if (key === 'feed') {
        this.resetCompareComponent();
      }
    });
  }

  ngOnInit(): void {
  }

  resetCompareComponent() {
    this.sortedFeedItems.length = 0;
    this.maxCurrentScore = 0;
    this.totalMaxScorers = 0;
    this.individualStatsArray.length = 0;
    this.selectedStatToCompare = '';
    this.currentComparisionStat = '';
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
    this.sortedFeedItems = this.compareFeedItems(this.feed, this.selectedStatToCompare);
  }

  setComparisionStat(stat: string) {
    this.selectedStatToCompare = stat;
    this.triggerCompare();
  }

  compareFeedItems(feedItems: Feed[], comparisionStat: string): Feed[] {
    let _sortedFeedItems: Feed[] = [];
    this.maxCurrentScore = 0;
    this.totalMaxScorers = 0;
    this.currentComparisionStat = comparisionStat;

    feedItems.forEach(item => {
      let statToCompare = comparisionStat;
      let totalScore    = 0;
      let calculatedFeed: Feed = Object.assign({}, item);

      if (statToCompare === '' || statToCompare === undefined || statToCompare === null) {
        Object.keys(item.powerstats).forEach(stat => {
          totalScore += parseInt(item.powerstats[stat]) || 0;
        });
        calculatedFeed.totalScore = totalScore;
        _sortedFeedItems.push(calculatedFeed);
        this.maxCurrentScore = this.maxCurrentScore < totalScore ? totalScore : this.maxCurrentScore;
      }
      else if (typeof statToCompare === 'number' || 
      (typeof statToCompare === 'string' && parseInt(item.powerstats[statToCompare]) !== NaN)
      ) {
        //console.log(`comparing stat: ${statToCompare}`, item.powerstats[statToCompare]);
        totalScore += parseInt(item.powerstats[statToCompare]) || 0;
        calculatedFeed.totalScore = totalScore;
        _sortedFeedItems.push(calculatedFeed);
        this.maxCurrentScore = this.maxCurrentScore < totalScore ? totalScore : this.maxCurrentScore;
      }
      else {
        console.error('Unexpected stat type encountered', {comparisionStat, type: typeof statToCompare});
      }
    });

    // Sort the feed items by total score
    _sortedFeedItems.sort((a, b) => b.totalScore - a.totalScore);
    _sortedFeedItems.forEach(item => {
      if (item.totalScore === this.maxCurrentScore)
        this.totalMaxScorers++;
    });
    this.individualStatsArray = Object.keys(_sortedFeedItems[0].powerstats);
    console.log('comparision result:', {comparisionResult: _sortedFeedItems, totalWinners: this.totalMaxScorers});
    _sortedFeedItems.forEach(item => console.log(`${comparisionStat || 'all stats'} => ${item.name} - ${item.totalScore}`));
    return _sortedFeedItems;
  }

}
