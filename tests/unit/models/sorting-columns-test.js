import Ember from "ember";
import { module, test } from 'qunit';
import Qunit from 'qunit';
import SortingColumns from 'ember-table/models/sorting-columns';
import Column from 'ember-table/models/column-definition';

Qunit.assert.sortingStateEqual = function(needle, sortingColumns, message) {
  var actual = sortingColumns.map(function(c) {
    return c.get('contentPath') + ":" + c.get('sortDirect');
  });
  this.deepEqual(actual, needle, message);
};

var sortingColumns, idColumn, nameColumn, ageColumn;

module('SortingColumns contains no column', {
  beforeEach: function() {
    sortingColumns = SortingColumns.create();
    idColumn = Column.create({contentPath: "id"});
  },
  afterEach: function() {
    sortingColumns = null;
    idColumn = null;
  }
});

test('click to add it', function(assert) {
  sortingColumns.update(idColumn, {metaKey: false});

  assert.sortingStateEqual(['id:asc'], sortingColumns);
});

test('command click to add column', function (assert) {
  sortingColumns.update(idColumn, {metaKey: true});

  assert.sortingStateEqual(['id:asc'], sortingColumns);
});


module('SortingColumns contains "id" column', {
  beforeEach: function() {
    sortingColumns = SortingColumns.create();
    idColumn = Column.create({contentPath: "id"});
    nameColumn = Column.create({contentPath: "name"});
    sortingColumns.update(idColumn, {metaKey: false});
  },
  afterEach: function() {
    sortingColumns = null;
    idColumn = null;
    nameColumn = null;
  }
});

test('click "id" column to change sort direction to desc', function(assert) {
  sortingColumns.update(idColumn, {metaKey: false});

  assert.sortingStateEqual(['id:desc'], sortingColumns);
});

test('click "id" column two times to change sort direction to asc again', function(assert) {
  sortingColumns.update(idColumn, {metaKey: false});
  sortingColumns.update(idColumn, {metaKey: false});

  assert.sortingStateEqual(['id:asc'], sortingColumns);
});

test('command click "id" column to remove it', function(assert) {
  sortingColumns.update(idColumn, {metaKey: true});

  assert.sortingStateEqual([], sortingColumns, 'sorting columns is updated');
  assert.equal(idColumn.get('_sortState'), 0, 'id column is in unsorted state');
});

test('click "name" column to replace "id" column', function(assert) {
  sortingColumns.update(nameColumn, {metaKey: false});

  assert.sortingStateEqual(['name:asc'], sortingColumns, 'sorting columns is updated');
  assert.equal(idColumn.get('_sortState'), 0, 'id column is in unsorted state');
});

test('command click "name" column to add it', function(assert) {
  sortingColumns.update(nameColumn, {metaKey: true});

  assert.sortingStateEqual(['id:asc', 'name:asc'], sortingColumns);
});

module('SortingColumns contains "id", "name" columns', {
  beforeEach: function() {
    sortingColumns = SortingColumns.create();
    idColumn = Column.create({contentPath: "id"});
    nameColumn = Column.create({contentPath: "name"});
    ageColumn = Column.create({contentPath: "age"});
    sortingColumns.update(idColumn, {metaKey: false});
    sortingColumns.update(nameColumn, {metaKey: true});
  },
  afterEach: function() {
    sortingColumns = null;
    idColumn = null;
    nameColumn = null;
    ageColumn = null;
  }
});

test('click "id" column to change sort direction of "id" to desc', function(assert) {
  sortingColumns.update(idColumn, {metaKey: false});

  assert.sortingStateEqual(['id:desc', 'name:asc'], sortingColumns);
});

test('click "id" column twice to change sort direction of "id" to asc again', function(assert){
  sortingColumns.update(idColumn, {metaKey: false});
  sortingColumns.update(idColumn, {metaKey: false});

  assert.sortingStateEqual(['id:asc', 'name:asc'], sortingColumns);
});

test('command click "id" column to remove it', function(assert) {
  sortingColumns.update(idColumn, {metaKey: true});

  assert.sortingStateEqual(['name:asc'], sortingColumns, 'sorting columns is changed');
  assert.equal(idColumn.get('_sortState'), 0);
});

test('command click "age" column to add it', function(assert) {
  sortingColumns.update(ageColumn, {metaKey: true});

  assert.sortingStateEqual(['id:asc', 'name:asc', 'age:asc'], sortingColumns);
});

test('click "age" column to replace all columns with "age" columns', function(assert) {
  sortingColumns.update(ageColumn, {metaKey: false});

  assert.sortingStateEqual(['age:asc'], sortingColumns, 'sorting columns is changed');
  assert.equal(idColumn.get('_sortState'), 0, 'id column is changed to unsorted');
  assert.equal(nameColumn.get('_sortState'), 0, 'name column is changed to unsorted');
});
