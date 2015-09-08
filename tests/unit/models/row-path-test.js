import RowPath from 'ember-table/models/row-path';
import {
  module, test
}
from 'qunit';

var firstRowPath, secondRowPath;

module('row path test', {
  beforeEach: function() {
    firstRowPath = RowPath.create();
  }
});

test('blank row path', function(assert) {
  assert.deepEqual(firstRowPath.get('upperGroupings'), []);
});

test('children row path', function(assert) {
  var content = {
    grouping: {
      key: 'firstLevelKey'
    },
    content: 'content',
    nextLevelGrouping: {
      key: 'secondLevelKey'
    }
  };
  var secondRowPath = firstRowPath.createChild(content);
  assert.deepEqual(secondRowPath.get('upperGroupings'), [
    ['firstLevelKey', 'content']
  ]);
});
