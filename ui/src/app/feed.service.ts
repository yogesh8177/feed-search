import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Feed, FeedResponse } from './models/Feed';
import { FeedQueryParams } from './models/FeedQueryParams';

@Injectable({
  providedIn: 'root'
})
export class FeedService {

  feedUrl: string = 'http://web-server:8000/feed';

  constructor(private http: HttpClient) { }

  getFeed(params: FeedQueryParams) {
    let queryParams = new URLSearchParams();

    queryParams.set('page', params.page.toString());
    queryParams.set('pageSize', params.pageSize.toString());
    queryParams.set('sortField', params.sortField);
    queryParams.set('type', params.type);
    queryParams.set('order', params.order);
    queryParams.set('searchTerm', params.searchTerm);

    let feedSearchUrl = `${this.feedUrl}?${queryParams.toString()}`;
    console.log(`Feed search url`, feedSearchUrl);
    return this.http.get<FeedResponse>(feedSearchUrl);
  }
}
