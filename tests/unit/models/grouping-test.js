import Ember from "ember";
import { module, test } from 'qunit';
import Qunit from 'qunit';
import Grouping from 'ember-table/models/grouping';

var grouping;

module('Grouping has no upper groupings', {
  beforeEach: function () {
    grouping = Grouping.create({
      groupingMetadata: [{id: 'section'}, {id: 'type'}],
      groupingLevel: 0
    });
  },

  afterEach: function () {
    grouping = null;
  }
});

test('query', function (assert) {
  assert.deepEqual(grouping.get('query'), {key: 'section', upperGroupings: []});
});

test('nextLevel', function (assert) {
  var nextLevelGrouping = grouping.nextLevel({id: 22, section: 'Income'});

  assert.equal(nextLevelGrouping.get('key'), 'type', 'next level key should be "type"');
  assert.deepEqual(nextLevelGrouping.get('query'),
    {key: 'type', upperGroupings: [['section', {id: 22, section: 'Income'}]]}, 'next level query');
  assert.deepEqual(grouping.get('query'), {key: 'section', upperGroupings: []}, 'grouping is not affected by nextLevel');
});


module('Grouping has one upper groupings', {
  beforeEach: function () {
    grouping = Grouping.create({
      groupingMetadata: [{id: 'section'}, {id: 'type'}],
      groupingLevel: 1,
      contents: [{section: 'Income', id: 22}]
    });
  },
  afterEach: function () {
    grouping = null;
  }
});

test('query', function (assert) {
  assert.deepEqual(grouping.get('query'), {key: 'type', upperGroupings: [['section', {section: 'Income', id: 22}]]});
});

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

test('query', function(assert) {
  assert.deepEqual(grouping.get('query'), {key: null, upperGroupings: []});
});

test('nextLevel', function(assert) {
  var nextLevelGrouping = grouping.nextLevel({id: 1, title: 'grand total'});

  assert.equal(nextLevelGrouping.get('key'), 'section', 'key is "section"');
  assert.deepEqual(nextLevelGrouping.get('query'), {key: 'section', upperGroupings: []});
});
