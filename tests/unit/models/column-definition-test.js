import Ember from "ember";
import { module, test } from 'qunit';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';
import ColumnDefinition from 'ember-table/models/column-definition';

var column;

module('column definition with sortBy', {
  beforeEach: function () {
    column = ColumnDefinition.create({
      headerCellName: 'Column1',
      contentPath: "id"
    });
  },

  afterEach: function () {
    column = null;
  }
});

test('sortFn should reverse sort order on second time ', function (assert) {
  column.toggleSortState();
  assert.equal(column.sortFn({id: 2}, {id: 3}), -1);

  column.toggleSortState();
  assert.equal(column.sortFn({id: 2}, {id: 3}), 1);
});

module('sort without data type', {
  beforeEach: function () {
    column = ColumnDefinition.create({
      headerCellName: 'Column1',
      dataType: null,
      contentPath: "col"
    });
    column.toggleSortState();
  },

  afterEach: function () {
    column = null;
  }
});

test('sort column when content value type is integer', function (assert) {
  assert.equal(column.sortFn({col: 2}, {col: 3}), -1, "2 should be smaller than 3");
});

test('sort column when content value type is integer', function (assert) {
  assert.equal(column.sortFn({col: 3}, {col: 2}), 1, "3 should be larger than 2");
});

test('sort column when content value type is integer', function (assert) {
  assert.equal(column.sortFn({col: 2}, {col: 2}), 0, "2 should be equal to 2");
});

test('sort column when content value type is string', function (assert) {
  assert.equal(column.sortFn({col: "ember"}, {col: "table"}), -1, "ember should be smaller than table on string order");
});

test('sort column when content value type is datetime', function (assert) {
  assert.equal(column.sortFn({col: new Date(2015, 7, 27)}, {col: new Date(2015, 7, 28)}), -1, "yesterday should be smaller than today");
});

test('sort column when content value type is decimal', function (assert) {
  assert.equal(column.sortFn({col: 15.27}, {col: 15.28}), -1, "15.27 should be smaller than 15.28");
});

test('sort column when content value type is decimal', function (assert) {
  assert.equal(column.sortFn({col: "20.99%"}, {col: "30.22%"}), -1, "20.99% should be smaller than 30.22%");
});

module('sort with data type', {
  beforeEach: function () {
    column = ColumnDefinition.create({
      headerCellName: 'Column1',
      dataType: null,
      contentPath: "col"
    });
    column.toggleSortState();
  },

  afterEach: function () {
    column = null;
  }
});

test('sort column when content value type is decimal', function (assert) {
  column.dataType = "decimal";
  assert.equal(column.sortFn({col: "15.27"}, {col: "15.28"}), -1, "15.27 should be smaller than 15.28");
});

test('sort column when content value type is decimal', function (assert) {
  column.dataType = "decimal";
  assert.equal(column.sortFn({col: "3"}, {col: "12.1"}), -1, "3 should be smaller than 12.1");
});

test('sort column when content value type is string', function (assert) {
  column.dataType = "string";
  assert.equal(column.sortFn({col: "ember"}, {col: "table"}), -1, "string of ember should be smaller than string of table");
});

test('sort column when content value type is datetime', function (assert) {
  column.dataType = "datetime";
  assert.equal(column.sortFn({col: "20150727 12:00"}, {col: "20150728 9:00"}), -1, "datetime of 20150727 12:00 is smaller than datetime of 20150728 9:00");
});

test('sort column when content value type is percentage', function (assert) {
  column.dataType = "percentage";
  assert.equal(column.sortFn({col: "2%"}, {col: "3%"}), -1, "2% should be smaller than 3%");
});

test('sort column when content value type is percentage', function (assert) {
  column.dataType = "percentage";
  assert.equal(column.sortFn({col: "3.1%"}, {col: "21.4%"}), -1, "3.1% should be smaller than 21.4%");
});
