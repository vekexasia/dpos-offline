// Karma configuration
// Generated on Sun Jul 30 2017 11:20:45 GMT+0200 (CEST)
var webpackConfig = require('./webpack.config');

module.exports = function(config) {
  let cfg = {
    client: {
      mocha: {
        bail:true
      }
    },
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    mime: {
      'text/x-typescript': ['ts','tsx']
    },

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai', 'sinon'],
    preprocessors: {
      "**/*.ts": ["webpack"], // *.tsx for React Jsx
    },

    // list of files / patterns to load in the browser
    files: [
      'test/**/*spec.ts'
    ],


    // list of files to exclude
    exclude: [
    ],


    webpack: webpackConfig[0],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  };
  console.log(process.env);
  if (process.env.TRAVIS) {
    cfg.browsers = ['Chrome_travis_ci'];
  }
  config.set(cfg)
};
