import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutoCompleteResults } from '../../models/Search';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }

  autoComplete(prefix: string) {
    return this.http.get<AutoCompleteResults>(`${environment.autoCompleteUrl}?autoComplete=${prefix}`);
  }
}
