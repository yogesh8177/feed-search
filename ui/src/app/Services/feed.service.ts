import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Feed, FeedResponse } from '../models/Feed';
import { FeedQueryParams } from '../models/FeedQueryParams';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeedService {

  feedUrl: string = environment.feedApiUrl;

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
    //console.log(`Feed search url`, feedSearchUrl);
    return this.http.get<FeedResponse>(feedSearchUrl)
            .pipe(
              map<FeedResponse, FeedResponse>(res => {
                // sanitize response and propogate results further...
                res.documents.forEach(item => {
                  Object.keys(item).forEach(key => {
                    if (item[key] === null || item[key] === undefined) {
                      item[key] = 'No content';
                    }
                  });
                });
                return res;
              })
            );
  }
}
