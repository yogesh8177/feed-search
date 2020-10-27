import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LiveMatch } from '../../models/LiveMatch';
import { Vote } from '../../models/Votes';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LiveMatchService {

  constructor(private http: HttpClient) { }

  fetchLiveMatch() {
    return this.http.get<LiveMatch>(environment.liveMatchUrl);
  }

  fetchVotes() {
    let mockVotes: Vote[] = [
      {
        voteeId: "2",
        count: 25,
        playerName: "Abe Sapien"
      },
      {
        voteeId: "4",
        count: 78,
        playerName: "Abomination"
      }
    ];
    return mockVotes;
  }
}
