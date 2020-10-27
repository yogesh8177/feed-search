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
    this.votes = this.liveMatchService.fetchVotes();
  }

  castVote(vote: Vote) {
    this.votes.forEach(v => {
      if (v.voteeId === vote.voteeId) v.count++;
    });
  }

  closeLiveMatch() {
    this.showLiveMatch = false;
  }

  showLiveMatchUI() {
    this.loadLiveMatch();
    this.showLiveMatch = true;
  }
}
