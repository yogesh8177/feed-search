import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ConfigService } from './Services/config/config.service';
import { Config } from './models/Config';
import { GoogleAnalyticsService } from './Services/analytics/google-analytics.service';
import { FeedQueryParams } from './models/FeedQueryParams';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Feed';
  buildVersion: string;
  config: Config;
  errors: string[] = [];

  constructor(
    private configService: ConfigService,
    private googleAnalytics: GoogleAnalyticsService
    ) {
  }

  ngOnInit() {
    this.loadBuildNumber();
    this.loadConfig();
  }

  loadConfig() {
    this.configService.fetchConfig().subscribe(
      data => {
        this.config = data;
        this.title  = this.config.appTitle; 
      },
      error => {
        console.error(error);
        this.errors.push('Error while loading config, please refresh the page to try again');
      }
    );
  }

  visitSocialMedia(socialMedia: string) {
    window.open(this.config.socialMedia[socialMedia].link);
    this.googleAnalytics.emitAnalyticsEvent('social-icons-click', {socialMedia});
  }

  loadBuildNumber() {
    this.configService.fetchBuild().subscribe(
      data => {
        this.buildVersion = data;
      },
      error => console.error(error)
    );
  }
}
