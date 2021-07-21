import { Component, OnInit } from '@angular/core';
import { Feed, CardLabel } from '../models/Feed';
import { Vote, VoteResponse } from '../models/Votes';
import { GoogleAnalyticsService } from '../Services/analytics/google-analytics.service';
import { LiveMatchService } from '../Services/live-match/live-match.service';
import {Router, ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-live-match',
  templateUrl: './live-match.component.html',
  styleUrls: ['./live-match.component.scss']
})
export class LiveMatchComponent implements OnInit {

  title: string;
  status: string;
  players: Feed[] = [];
  votes: Vote[] = [];
  showLiveMatch: boolean = false;
  disableRefresh: boolean = false;
  disableVote: boolean = false;
  hideVotingSection: boolean = false;

  private serviceUnavailable: string = 'Service is unavailable at this time, please try again after some time!';

  constructor(
    private googleAnalytics: GoogleAnalyticsService,
    private liveMatchService: LiveMatchService,
    private activatedRoute: ActivatedRoute
    ) { 
      this.activatedRoute.queryParams.subscribe(params => {
        const openMatchWindow = params['openMatchWindow'];
        if (openMatchWindow) {
          this.showLiveMatchUI();
        }
      });
     }

  ngOnInit(): void {
  }

  loadLiveMatch() {
    this.players.length = 0;
    this.liveMatchService.fetchLiveMatch().subscribe(
      response => {
        this.players = response.players;
        this.title = response.title;
        this.status = response.status;
        this.hideVotingSection = response.winnerId ? true : false;
        this.players.forEach(player => {
          if (player.id === response.winnerId) player.cardLabel = new CardLabel('Winner!', 'top-rank');
        });
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
      error => this.errorHandler(error)
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
        error => this.errorHandler(error)
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

  errorHandler(error) {
    console.error(error);
    alert(this.serviceUnavailable); 
    this.closeLiveMatch();
  }
}
