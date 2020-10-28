import { Component, OnInit } from '@angular/core';
import { Feed } from '../models/Feed';
import { Vote } from '../models/Votes';
import { GoogleAnalyticsService } from '../Services/analytics/google-analytics.service';
import { LiveMatchService } from '../Services/live-match/live-match.service';

@Component({
  selector: 'app-live-match',
  templateUrl: './live-match.component.html',
  styleUrls: ['./live-match.component.scss']
})
export class LiveMatchComponent implements OnInit {

  title: string;
  players: Feed[] = [];
  votes: Vote[] = [];
  showLiveMatch: boolean = false;
  disableRefresh: boolean = false;
  disableVote: boolean = false;

  constructor(
    private googleAnalytics: GoogleAnalyticsService,
    private liveMatchService: LiveMatchService
    ) { }

  ngOnInit(): void {
  }

  loadLiveMatch() {
    this.players.length = 0;
    this.liveMatchService.fetchLiveMatch().subscribe(
      response => {
        this.players = response.players;
        this.title = response.title;
        this.initializePlayerVotes(this.players);
      },
      error => console.error(error)
    );
  }

  initializePlayerVotes(players: Feed[]) {
    players.forEach(player => {
      let vote: Vote = new Vote();
      vote.count = 0;
      vote.voteeId = player.id;
      vote.playerName = player.name;
      this.votes.push(vote);
    });
    console.log({votes: this.votes});
    this.fetchVotes(this.votes);
  }

  fetchVotes(votes: Vote[]) {
    if (this.disableRefresh) return;
    this.votes = this.liveMatchService.fetchVotes(votes);
    this.disableComponent('disableRefresh');
    this.googleAnalytics.emitAnalyticsEvent('fetch-votes', {players: this.votes.map(v => v.playerName)});
  }

  castVote(vote: Vote) {
    if (this.disableVote) return;
    this.votes.forEach(v => {
      if (v.voteeId === vote.voteeId) {
        v.count++;
        this.disableComponent('disableVote');
        this.liveMatchService.castVote(v);
        this.googleAnalytics.emitAnalyticsEvent('cast-vote', {id: vote.voteeId, player: vote.playerName});
      }
    });
  }

  disableComponent (component: string) {
    let self = this;
    self[component] = true;
    console.log(`disabled: ${component}`, self[component]);
    setTimeout(() => {
      self[component] = false;
      console.log(`enabling: ${component}`);
    }, 15000);
  }

  closeLiveMatch() {
    this.showLiveMatch = false;
  }

  showLiveMatchUI() {
    this.loadLiveMatch();
    this.showLiveMatch = true;
  }
}
