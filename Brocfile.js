/* global require, module */

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var fs = require('fs');

// Escape HTML using approach in
// http://stackoverflow.com/questions/24816/escaping-html-strings-with-jquery
var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}

var app = new EmberAddon({
  /*
   * Replace patterns. We use this to replace strings such as:
   * @@{controllers/file.js}
   * With the content of those files.
   */
  replace: {
    files: [
      '**/*.js'
    ],
    patterns: [{
      match: /@@{([^}]*)}/g,
      replacement: function(matchedText) {
        filename = matchedText.slice(3, -1);
        fullFilename = './tests/dummy/app/' + filename;
        fileContents = fs.readFileSync(fullFilename, 'utf8');
        return escapeHtml(fileContents).replace(/\n/g, '\\n');
      }
    }]
  },
  /*
   * Disable style of #ember-testing { zoom 50% }
   * If this style is turned on, Chrome will not return correct outerHeight.
   */
  'ember-cli-qunit': {
    disableContainerStyles: true
  }
});

app.import(app.bowerDirectory + '/d3/d3.js');
/*
 * Support test of jquery-ui-sortable
 */
app.import(app.bowerDirectory + '/jquery-simulate/jquery.simulate.js');

module.exports = app.toTree();
