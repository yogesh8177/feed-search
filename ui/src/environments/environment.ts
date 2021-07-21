// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  feedApiUrl: 'http://localhost:8000/feed',
  blogApiUrl: 'http://localhost:8000/blog',
  autoCompleteUrl: 'http://localhost:8000/auto-complete',
  feedConfigApiUrl: 'http://localhost:8000/config',
  liveMatchUrl: 'http://localhost:8000/live-match',
  fetchVotesUrl: 'http://localhost:3000/fetch-votes',
  castVoteUrl: 'http://localhost:3000/cast-vote',
  facebookBaseUrl: 'http://localhost:3000/blog',
  production: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
