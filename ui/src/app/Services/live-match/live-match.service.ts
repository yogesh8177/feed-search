import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LiveMatch } from '../../models/LiveMatch';
import { Vote, VoteResponse } from '../../models/Votes';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LiveMatchService {

  constructor(private http: HttpClient) { }

  fetchLiveMatch() {
    return this.http.get<LiveMatch>(environment.liveMatchUrl);
  }

  fetchVotes(votes: Vote[]) {
    let playerIds = votes.map(v => v.voteeId);
    return this.http.get<VoteResponse>(`${environment.fetchVotesUrl}?voteeIds=${playerIds.join(',')}`);
    // console.log(`fetching votes`);
    // let mockVotes: Vote[] = [
    //   {
    //     voteeId: "2",
    //     count: 25,
    //     playerName: "Abe Sapien"
    //   },
    //   {
    //     voteeId: "4",
    //     count: 78,
    //     playerName: "Abomination"
    //   }
    // ];
    // return mockVotes;
  }

  castVote(vote: Vote) {
    console.log(`casting vote`);
    return this.http.post<Vote>(environment.castVoteUrl, vote);
  }
}
