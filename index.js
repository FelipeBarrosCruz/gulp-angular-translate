var concat = require('gulp-concat');
var es = require('event-stream');
var gutil = require('gulp-util');
var path = require('path');

function cacheTranslations(options) {
  return es.map(function(file, callback) {
    file.contents = new Buffer(gutil.template('$translateProvider.translations("<%= language %>", <%= contents %>);\n', {
      contents: file.contents,
      file: file,
      language: options.language || file.path.split(path.sep).pop().match(/^(?:[\w]{3,}-)?([a-z]{2}[_|-]?(?:[A-Z]{2})?)\.json$/i).pop()
    }));
    callback(null, file);
  });
}

function wrapTranslations(options) {
  const TPL = `(function construct() {
    "use strict";
    angular.module("<%= module %>"<%= standalone %>).config(Configuration);

    /** @ngInject */
    function Configuration($translateProvider) {
      <%= contents %>
    }
  })()`;
  return es.map(function(file, callback) {
    file.contents = new Buffer(gutil.template(TPL, {
      contents: file.contents,
      file: file,
      module: options.module || 'translations',
      standalone: options.standalone === false ? '' : ', []'
    }));
    callback(null, file);
  });
}

function gulpAngularTranslate(filename, options) {
  if (typeof filename === 'string') {
    options = options || {};
  } else {
    options = filename || {};
    filename = options.filename || 'translations.js';
  }
  return es.pipeline(
    cacheTranslations(options),
    concat(filename),
    wrapTranslations(options)
  );
};

module.exports = gulpAngularTranslate;
