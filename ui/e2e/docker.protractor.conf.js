// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter, StacktraceOption } = require('jasmine-spec-reporter');

/**
 * @type { import("protractor").Config }
 */
exports.config = {
  allScriptsTimeout: 30000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  capabilities: {
    seleniumAddress: 'http://selenium-chrome-standalone:4444/wd/hub',
    browserName: 'chrome',
    chromeOptions: {
      args: [ 
        "--headless", 
        "--disable-gpu", 
        //"--remote-debugging-port=9222",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--allow-insecure-localhost"
      ]
    }
  },
  directConnect: false,
  baseUrl: 'http://ui:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: StacktraceOption.PRETTY
      }
    }));
  }
};