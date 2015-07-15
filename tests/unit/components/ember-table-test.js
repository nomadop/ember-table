import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';

import ColumnDefinition from 'ember-table/models/column-definition';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';
import TableFixture from '../../fixture/table';
import LazyArrayFactory from '../../fixture/lazy-array-factory';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableGroupFixture from '../../fixture/ember-table-with-group';
import EmberTableGroupAndFixedFixture from '../../fixture/ember-table-with-group-and-fixed';
import EmberTableHelper from '../../helpers/ember-table-helper';

var tableFixture = TableFixture.create();

var validateColumnNames = function (assert, obj) {
  assert.equal(obj.$('span:contains(Column1)').length, 1);
  assert.equal(obj.$('span:contains(Column2)').length, 1);
  assert.equal(obj.$('span:contains(Column3)').length, 1);
};

function getGroupColumnWidth(table) {
  return table.$('.ember-table-header-container .ember-table-header-groups-block ' +
    '.ember-table-header-block:nth-child(2) ' +
    '.ember-table-header-row:nth-child(1)').width();
}

function getInnerColumn(table, columnIndex) {
  return table.$('.ember-table-header-container ' +
    '.ember-table-header-block:nth-child(2) ' +
    '.ember-table-header-row:nth-child(2) ' +
    '.ember-table-header-cell:nth-child(' + (1 + columnIndex) + ') ' +
    '.ember-table-content');
}

moduleForEmberTable('EmberTableComponent');

test('it should not has column group', function (assert) {
  var component = tableFixture.table(this);

  assert.ok(!component.get('hasColumnGroup'));
});

test('it should render all columns in one block', function (assert) {
  tableFixture.table(this);

  validateColumnNames(assert, this);
  assert.equal(this.$('.ember-table-header-block').length, 1);
});

moduleForEmberTable('column group');
test('it should has column group', function (assert) {
  var component = tableFixture.groupTable(this);

  assert.ok(component.get('hasColumnGroup'));
});

test('it should render all columns in two blocks', function (assert) {
  tableFixture.groupTable(this);

  validateColumnNames(assert, this);
  assert.equal(this.$('.ember-table-header-block').length, 2);
  assert.equal(this.$('span:contains(Group1)').length, 1);
});

test('it should render the group with group class', function (assert) {
  tableFixture.groupTable(this);

  assert.equal(this.$('.group-1-class').length, 1);
});

test('it should set cell class of group name cell', function (assert) {
  tableFixture.groupTable(this);

  assert.equal(this.$('.group-1-class .group-1-cell-class').text().trim(), 'Group1');
});

test('it should render grouped columns with class group-1-inner-column', function (assert) {
  tableFixture.groupTable(this);

  var columnElements = this.$('.group-1-class .group-1-inner-column');
  assert.equal(columnElements.length, 2);
  assert.equal(columnElements.first().text().trim(), 'Column2');
  assert.equal(columnElements.last().text().trim(), 'Column3');
});

test('it should set the first column class in group', function (assert) {
  tableFixture.groupTable(this);

  assert.equal(this.$('.group-1-first-column').text().trim(), 'Column2');
});

test('it should set the last column class in group', function (assert) {
  tableFixture.groupTable(this);

  assert.equal(this.$('.group-1-last-column').text().trim(), 'Column3');
});

test('Should resize group width when inner column size changed', function (assert) {
  var component = tableFixture.groupTable(this);
  assert.ok(getGroupColumnWidth(this) === 300, 'Should be width before change');

  Ember.run(function () {
    var thirdColumn = component.get('_columns')[1].innerColumns[1];
    thirdColumn.resize(500);
  });
  assert.ok(getGroupColumnWidth(this) === 650, 'Should be width after change');
});

test('Should reorder inner columns when dragging the inner column', function (assert) {
  var component = tableFixture.groupTable(this);
  var firstCol = component.get('_columns')[1].innerColumns[0];

  Ember.run(function () {
    component.onColumnSort(firstCol, 1);
  });

  var col = getInnerColumn(this, 1);
  assert.ok(col.text().trim() === firstCol.headerCellName, "Should be header cell name of first column");
});

moduleForEmberTable('Given a group table And the height is 150 And the table row height is 30',
  function() {
    return EmberTableGroupFixture.create({
      content: LazyArrayFactory.normalFixture(),
      height: 157 //seems in Chrome row height is 32px
    });
});

test('Should show 3 rows in table body ', function(assert) {
  this.subject();
  assert.ok(this.$('.ember-table-body-container .ember-table-table-row').length === 5, 'should render 3 body row and 2 hidden row');
});

moduleForEmberTable('Given a table And the height is 330 And the table row height is 30 And callback return normalFixture data',
  function() {
    return EmberTableFixture.create({
      content: LazyArrayFactory.normalFixture(),
      height: 330});
});

test('lazy array has no errorFixture handling', function(assert) {
  this.subject();
  var firstRow = this.$('.ember-table-body-container .ember-table-table-row').first();
  assert.ok(firstRow.hasClass('ember-table-load-error') === false, 'all row should not has class ember-table-load-error');
});

moduleForEmberTable('Given a table And the height is 330 And the table row height is 30 And callback return error',
  function() {
    return EmberTableFixture.create({
      content: LazyArrayFactory.errorFixture(),
      height: 330});
});

test('lazy array error handling', function(assert) {
  this.subject();
  var firstRow = this.$('.ember-table-body-container .ember-table-table-row').first();
  assert.ok(firstRow.hasClass('ember-table-load-error'), 'first row should has class ember-table-load-error');
});


moduleForEmberTable('Given a table And has 1 fixed column And has 1 group column',
  function() {
    return EmberTableGroupAndFixedFixture.create({
      content: LazyArrayFactory.normalFixture(),
      height: 330,
      columnNames: ['firstColumn', 'firstGroup']});
});

test('render group and fixed columns together', function(assert) {
  this.subject();

  var firstColumnHeader = this.$('.ember-table-left-table-block .ember-table-header-cell');
  assert.ok(firstColumnHeader, 'should have fixed column');
  assert.ok(firstColumnHeader.find('span').text().trim() === 'Column1', 'Column1 should be fixed');
  assert.ok(firstColumnHeader.height() === 60, 'Height of header should be 2 rows');

  var secondColumn = this.$('.ember-table-right-table-block .ember-table-header-block:nth-child(1)');
  assert.ok(secondColumn, 'should have second column');
  assert.ok(secondColumn.find('.ember-table-table-row').length === 2,
    'Second column should be group col' +
    'umn with two header rows');

  var groupHeader = secondColumn.find('.ember-table-table-row:nth-child(1) .ember-table-header-cell');
  assert.ok(groupHeader.length ===1, 'First header row should have only one cell');
  assert.ok(groupHeader.find('span').text().trim() === 'Group1', 'Header name should be Group1');
});

moduleForEmberTable('Given a table with 1 fixed column and 2 column groups',
  function() {
    return EmberTableGroupAndFixedFixture.create({
      content: LazyArrayFactory.normalFixture(),
      height: 330,
      columnNames: ['firstColumn', 'firstGroup', 'secondGroup']
    });
});

test('render fix column with two column groups', function (assert) {
  var helper = EmberTableHelper.create({_assert: assert, _component: this});
  this.subject();

  helper.assertGroupColumnHeader(2, 'Group2', 'Header name should be Group2');
});

test('reorder two column groups', function (assert) {
  var helper = EmberTableHelper.create({_assert: assert, _component: this});
  this.subject();

  helper.assertGroupColumnHeader(1, 'Group1', 'Header name should be Group1');

  Ember.run(function () {
    helper.reorderColumn(1, 300);
  });

  helper.assertFixedColumnHeader('Column1', 'Column1 should be fixed');
  helper.assertGroupColumnHeader(1, 'Group2', 'Header name should be Group2');
  helper.assertGroupColumnHeader(2, 'Group1', 'Header name should be Group1');
});

moduleForEmberTable('Given a table with 1 fixed column group and 1 column',
  function() {
    return EmberTableGroupAndFixedFixture.create({
      content: LazyArrayFactory.normalFixture(),
      height: 330,
      columnNames: ['firstGroup', 'firstColumn']
    });
});

test('render fixed group column', function(assert) {
  var helper = EmberTableHelper.create({_assert: assert, _component: this});
  this.subject();

  helper.assertFixedColumnGroupHeader('Group1', 'Group1 should be fixed');
  helper.assertBodyContentCellCountInRow(1, 'Non-fixed cell count should be 1 for first row');
});
