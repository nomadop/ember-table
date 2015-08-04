import QUnit from 'qunit';

QUnit.assert.noSortIndicator = function(element, message) {
  var hasUp = element.find('.column-sort-indicator').hasClass('sort-indicator-icon-up');
  var hasDown = element.find('.column-sort-indicator').hasClass('sort-indicator-icon-down');
  var hasIndicator = hasUp || hasDown;
  this.push(!hasIndicator, !hasIndicator, true, message);
};

QUnit.assert.eleText = function(element, expected, message) {
  var text = element.text().trim();
  this.push(text === expected, text, expected, message);
};
