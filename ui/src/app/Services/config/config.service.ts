import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Config } from '../../models/Config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  configUrl: string = environment.feedConfigApiUrl;

  constructor(private http: HttpClient) { }

  fetchConfig() {
    return this.http.get<Config>(this.configUrl);
  }

  fetchBuild() {
    return this.http.get<string>(`assets/build.txt`);
  }
}
