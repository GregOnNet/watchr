var reporters = function () {
  var reporters = ['progress', 'coverage', 'karma-typescript'];

  if (process.env.TEAMCITY_PROJECT_NAME !== undefined) {
    reporters.push('teamcity');
  }

  return reporters;
};

module.exports = function (config) {
  config.set({
    client: {
      jasmine: {
        // Spec directory path relative to the current working dir when jasmine
        // is executed.
        spec_dir: 'spec',

        // Array of filepaths (and globs) relative to spec_dir to include.
        spec_files: ['**/*.spec.ts'],

        // Array of filepaths (and globs) relative to spec_dir to include before
        // jasmine specs.
        helpers: ['helpers/**/*.ts'],
        random: true,
        stopOnFailure: true,
      },
    },

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'karma-typescript'],

    // list of files / patterns to load in the browser
    files: [
      // Libraries normally loaded from CDN.
      'node_modules/jquery/dist/jquery.js',
      'node_modules/signalr/jquery.signalR.js',

      // Generated SignalR proxy (available after build).
      'build/bin/Web/bin/Scripts/lib/server.js',

      // Jasmine support library.
      'node_modules/jasmine-jquery/lib/jasmine-jquery.js',

      { pattern: 'source/**/*.ts' },
      { pattern: 'spec/**/*.spec.ts' },
    ],

    // list of files / patterns to exclude
    exclude: ['source/**/index.ts'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'source/**/*.ts': ['karma-typescript', 'coverage'],
      'spec/**/*.spec.ts': ['karma-typescript'],
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: reporters(),

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  });
};
