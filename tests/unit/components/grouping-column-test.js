import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import LazyArray from 'ember-table/models/lazy-array';
import TableFixture from '../../fixture/table';
import EmberTableHelper from '../../helpers/ember-table-helper';

var tableFixture = TableFixture.create();
var content = [{
  groupName: 'firstRootGroupName',
  isGroupRow: true,
  id: 100,
  state: 'up'
}, {
  groupName: 'secondRootGroupName',
  id: 1000,
  state: 'up'
}, {
  groupName: 'thirdRootGroupName',
  isGroupRow: false,
  id: 10000,
  state: 'down'
}];

moduleForEmberTable('render grouping column',
  function() {
    return EmberTableFixture.create({
      content: content,
      hasGroupingColumn: true,
      height: 300
    });
});

test('it should has a grouping column at most left position', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('hasGroupingColumn', true);
  });

  var fixedColumns = this.$('.ember-table-left-table-block > .ember-table-table-row > .ui-sortable > .ember-table-header-cell');
  assert.equal(fixedColumns.length, 1);
});

test('it should render group name in grouping column', function(assert) {
  var component = this.subject();
  var firstRowGroupColumnName = findCellText(this, 'left', 0, 0);

  assert.equal(firstRowGroupColumnName, 'firstRootGroupName');
});

test('it should not render group indicator in grouping column when the loan is not grouped data', function(assert) {
  var component = this.subject();

  var indicator = this.$('.ember-table-body-container ' +
    '.ember-table-left-table-block ' +
    '.ember-table-table-row:eq(1) ' +
    '.ember-table-cell:eq(0) ' +
    '.grouping-column-indicator');

  assert.equal(indicator.length, 0);
});

test('it should render columns data in columns', function(assert) {
  var component = this.subject();

  var firstRowId = findCellText(this, 'right', 0, 0);
  var firstRowState =findCellText(this, 'right', 0, 2);

  assert.equal(firstRowId, '100');
  assert.equal(firstRowState, 'up');
});

function findCellText(object, blockPosition, rowIndex, cellIndex) {
  return object.$('.ember-table-body-container ' +
    '.ember-table-' + blockPosition + '-table-block ' +
    '.ember-table-table-row:eq(' + rowIndex + ') ' +
    '.ember-table-cell:eq(' + cellIndex + ') ' +
    '.ember-table-content').text().trim();
}

moduleForEmberTable('Given a table with group row data',
  function() {
    return EmberTableFixture.create({
      height: 330,
      width: 600,
      content: content,
      hasGroupingColumn: true,
      numFixedColumns: 0
    });
});

test('lock grouping column', function(assert) {
  var helper = EmberTableHelper.create({_assert: assert, _component: this});
  this.subject();

  var offsetBefore = [helper.nthColumnHeader(1).offset()];
  Ember.run(function() {
    helper.resizeColumn('Column1', 100);
    helper.scrollBodyLeft(10);
  });
  assert.equal(helper.nthColumnHeader(1).find('span').text().trim(), 'GroupingColumn', 'first column should be grouping column');

  var offsetAfter = [helper.nthColumnHeader(1).offset()];
  assert.deepEqual(offsetAfter, offsetBefore, 'grouping column 1 should not be scrolled left');
});

moduleForEmberTable('Given a table with group row data and two fixed columns',
  function() {
    return EmberTableFixture.create({
      height: 330,
      width: 700,
      content: content,
      hasGroupingColumn: true,
      numFixedColumns: 2
    });
});

test('lock grouping column in addition', function(assert) {
  var helper = EmberTableHelper.create({_assert: assert, _component: this});
  this.subject();

  var offsetBefore = [1,2,3].map(function(x){ return helper.nthColumnHeader(x).offset();});
  var nonFixedOffsetBefore = [helper.nthColumnHeader(4).offset()];
  Ember.run(function() {
    helper.resizeColumn('Column2', 200);
    helper.scrollBodyLeft(50);
  });

  var offsetAfter = [1,2,3].map(function(x){ return helper.nthColumnHeader(x).offset();});
  var nonFixedOffsetAfter = [helper.nthColumnHeader(4).offset()];

  assert.deepEqual(helper.nthColumnHeader(1).find('span').text().trim(), 'GroupingColumn', 'first column should be grouping column');
  assert.deepEqual(offsetBefore, offsetAfter, 'grouping column and fixed columns should not be scrolled left');
  assert.notDeepEqual(nonFixedOffsetAfter, nonFixedOffsetBefore, 'non-fixed columns should be scrolled left');
});
