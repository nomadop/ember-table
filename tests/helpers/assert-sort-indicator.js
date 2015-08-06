import QUnit from 'qunit';

QUnit.assert.noSortIndicatorOn = function(element, message) {
  var hasUp = element.find('.column-sort-indicator').hasClass('sort-indicator-icon-up');
  var hasDown = element.find('.column-sort-indicator').hasClass('sort-indicator-icon-down');
  var hasIndicator = hasUp || hasDown;
  this.push(!hasIndicator, hasIndicator, false, message);
};

QUnit.assert.ascendingIndicatorOn = function(element, message) {
  var hasUp = element.find('.column-sort-indicator').hasClass('sort-indicator-icon-up');
  this.push(hasUp, hasUp, true, message);
};

QUnit.assert.descendingIndicatorOn = function(element, message) {
  var hasDown = element.find('.column-sort-indicator').hasClass('sort-indicator-icon-down');
  this.push(hasDown, hasDown, true, message);
};
