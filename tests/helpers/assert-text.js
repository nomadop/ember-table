import QUnit from 'qunit';

QUnit.assert.textOn = function(element, expected, message) {
  var text = element.text().trim();
  this.push(text === expected, text, expected, message);
};


