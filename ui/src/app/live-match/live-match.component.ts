import { Component, OnInit } from '@angular/core';
import { Feed } from '../models/Feed';
import { Vote, VoteResponse } from '../models/Votes';
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
    this.votes.length = 0;
    players.forEach(player => {
      let vote: Vote = new Vote();
      vote.count = 0;
      vote.voteeId = player.id;
      vote.playerName = player.name;
      this.votes.push(vote);
    });
    this.fetchVotes(this.votes);
  }

  fetchVotes(votes: Vote[]) {
    if (this.disableRefresh) return;
    this.liveMatchService.fetchVotes(votes).subscribe(
      response => {
        let voteCounts = response.data;
        // sequence of results are maintained!
        voteCounts.forEach((vote, index) => {
          this.votes[index].count = vote.count;
        });
        
        this.disableComponent('disableRefresh');
        this.googleAnalytics.emitAnalyticsEvent('fetch-votes', {players: this.votes.map(v => v.playerName)});
      },
      error => console.error(error)
    );
  }

  castVote(vote: Vote) {
    if (this.disableVote) return;
    let voteToCast = this.votes.filter(v => v.voteeId === vote.voteeId);
    if (!voteToCast.length) {
      console.error(`invalid vote, could not find voteeId`);
    }
    else {
      this.disableComponent('disableVote');
      this.liveMatchService.castVote(voteToCast[0]).subscribe(
        response => {
          this.fetchVotes(this.votes);
          this.googleAnalytics.emitAnalyticsEvent('cast-vote', { id: vote.voteeId, player: vote.playerName });
        },
        error => console.error(error)
      );
    }
  }

  disableComponent (component: string) {
    let self = this;
    self[component] = true;
    setTimeout(() => {
      self[component] = false;
    }, 5000);
  }

  closeLiveMatch() {
    this.showLiveMatch = false;
  }

  showLiveMatchUI() {
    this.loadLiveMatch();
    this.showLiveMatch = true;
  }
}
