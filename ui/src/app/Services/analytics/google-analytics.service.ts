import { Injectable } from '@angular/core';
declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {

  constructor() { }

  emitAnalyticsEvent(eventName: string, event: any) {
    gtag('event', eventName, event);
  }
}
