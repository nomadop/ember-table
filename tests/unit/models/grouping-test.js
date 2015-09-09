import Ember from "ember";
import { module, test } from 'qunit';
import Grouping from 'ember-table/models/grouping';

var grouping;

module('Grouping is grand total row', {
  beforeEach: function() {
    grouping = Grouping.create({
      groupingMetadata: [{id: 'section'}, {id: 'type'}],
      groupingLevel: -1
    });
  },
  afterEach: function () {
    grouping = null;
  }
});

test('nextLevel', function(assert) {
  var nextLevelGrouping = grouping.get('nextLevelGrouping');
  assert.equal(nextLevelGrouping.get('key'), 'section', 'key is "section"');
});

module('Custom grouping sort function', {
  beforeEach: function () {
    grouping = Grouping.create({
      groupingMetadata: [{
        id: 'section',
        sortFn: function (prev, next) {
          return Ember.get(prev, 'id') - Ember.get(next, 'id');
        }
      }, {
        id: 'type'
      }],
      groupingLevel: 0
    });
  },
  afterEach: function () {
    grouping = null;
  }
});

test('sort by custom sort function', function (assert) {
  var arr = [
    {id: 2},
    {id: 4},
    {id: 1},
    {id: 3}
  ];
  grouping.set('sortDirection', 'asc');

  var result = grouping.sortContent(arr);
  assert.deepEqual(result, [{
    id: 1
  }, {
    id: 2
  }, {
    id: 3
  }, {
    id: 4
  }], "should sort by id");
});
