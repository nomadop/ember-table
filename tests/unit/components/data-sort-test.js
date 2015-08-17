import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import Columns from '../../fixture/columns';
import LazyArray from 'ember-table/models/lazy-array';
import DefersPromise from '../../fixture/defer-promises';
import GroupedRowDataProvider from '../../fixture/grouped-row-data-provider';
import { defaultFixture } from '../../fixture/lazy-array-factory';

import _loadSortIndicatorAssertions from '../../helpers/assert-sort-indicator';
import _loadTextAssertions from '../../helpers/assert-text';
import TableDom from '../../helpers/table-dom';


var normalArray = [{ id: 2}, { id: 1}, { id: 4}, { id: 3}];

moduleForEmberTable('A normal JavaScript array as ember-table content', function (options) {
  return EmberTableFixture.create({
    content: options.content,
    groupMeta: options.groupMeta
  });
});

test('regular click to sort by id column', function (assert) {
  var component = this.subject({content:normalArray});
  this.render();
  var table = TableDom.create({content: component.$()});

  var idHeaderCell = table.headerRow(0).cell(0);
  var firstIdCell = table.cell(0, 0);

  idHeaderCell.click();
  assert.ascendingIndicatorOn(idHeaderCell, 'should show ascending indicator');
  assert.textOn(firstIdCell, '1', 'should sort as ascending');

  idHeaderCell.click();
  assert.descendingIndicatorOn(idHeaderCell, 'should show descending indicator');
  assert.textOn(firstIdCell, '4', 'should sort as descending');

  idHeaderCell.click();
  assert.ascendingIndicatorOn(idHeaderCell, 'should show ascending indicator');
  assert.textOn(firstIdCell, '1', 'should sort as ascending');
});

test('click with command key to sort by id column', function (assert) {
  var component = this.subject({content:normalArray});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  helper.clickHeaderCellWithCommand(0);
  helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
  helper.assertCellContent(0, 0, '1', 'should sort as ascending');

  helper.clickHeaderCellWithCommand(0);
  helper.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
  helper.assertCellContent(0, 0, '1', ' should keep as ascending after unsort');

  helper.getHeaderCell(0).click();
  helper.getHeaderCell(0).click();
  helper.assertCellContent(0, 0, '4', 'should sort as descending');
  helper.clickHeaderCellWithCommand(0);
  helper.assertCellContent(0, 0, '4', 'should keep as descending after unsort');
});

test('sort with grouped row array', function(assert) {
  var content = [{
      id: 1,
      accountSection: 'f-1',
      children: [{
        id: 12,
        children: [{
          id: 122
        }, {
          id: 121
        }, {
          id: 123
        }]
      }, {
        id: 13
      }, {
        id: 11
      }]
    }, {
      id: 2,
      accountSection: 'f-2'
    }];
  var groupMeta = {
    groupingMetadata: [{id: 'accountSection'}, {id: 'accountType'}, {id: 'accountCode'}]
  };
  var component = this.subject({content: content, groupMeta: groupMeta});
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  this.render();

  helper.rowGroupingIndicator(0).click();
  helper.assertCellContent(1, 0, '12', 'should show unsorted');
  helper.rowGroupingIndicator(1).click();
  helper.assertCellContent(2, 0, '122', 'should show unsorted');

  helper.getHeaderCell(0).click();

  helper.assertCellContent(2, 0, '121', 'should show ascending');
  helper.getHeaderCell(0).click();
  helper.assertCellContent(2, 0, '123', 'should show descending');
});

test('sort by id:asc, activity:desc', function(assert) {
  var content = [
    {id: "id-a", activity: "activity-b"},
    {id: "id-a", activity: "activity-a"},
    {id: "id-c", activity: "activity-a"},
    {id: "id-b", activity: "activity-a"}
  ];
  var sortedContent = [
    ["id-a","activity-a"],
    ["id-a", "activity-b"],
    ["id-b", "activity-a"],
    ["id-c", "activity-a"]
  ];
  var component = this.subject({content: content});
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  this.render();
  helper.getHeaderCell(0).click();
  helper.clickHeaderCellWithCommand(1);

  var bodyCellsContent = helper.bodyCellsContent([0, 1, 2, 3], [0, 1]);

  assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
});

moduleForEmberTable('Sort a normal JavaScript array by groupers', function () {
  var content = [
    {id: 1, accountSection: 'as-2', children: [
      {id: 11, accountSection: 'as-2', accountType: 'at-3'},
      {id: 12, accountSection: 'as-2', accountType: 'at-1'},
      {id: 13, accountSection: 'as-2', accountType: 'at-2'}
    ]},
    {id: 2, accountSection: 'as-1'},
    {id: 3, accountSection: 'as-3'}
  ];
  var groupMeta = {
    groupingMetadata: [{id: 'accountSection'}, {id: 'accountType'}, {id: 'accountCode'}]
  };

  return EmberTableFixture.create({
    content: content,
    groupMeta: groupMeta
  });
});

test('sort grouper accountSection asc', function(assert) {
  var component = this.subject();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  this.render();

  Ember.run(component, 'setGrouperSortDirection', 0, 'asc');

  assert.equal(helper.fixedBodyCell(0, 0).text().trim(), "as-1");
});

test('sort grouper accountSection desc', function(assert) {
  var component = this.subject();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  this.render();

  Ember.run(component, 'setGrouperSortDirection', 0, 'desc');

  assert.equal(helper.fixedBodyCell(0, 0).text().trim(), "as-3");
});

test('change sort grouper accountSection from asc to unsorted', function(assert) {
  var component = this.subject();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  this.render();

  Ember.run(function() {
    component.setGrouperSortDirection(0, 'asc');
    component.setGrouperSortDirection(0, null);
  });

  assert.equal(helper.fixedBodyCell(0, 0).text().trim(), "as-2");
});

test('change sort grouper accountSection to asc with expand state', function (assert) {
  var component = this.subject();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  this.render();

  helper.rowGroupingIndicator(0).click();
  Ember.run(component, 'setGrouperSortDirection', 0, 'asc');

  assert.equal(helper.fixedBodyCell(2, 0).text().trim(), "at-3");
});

test('change sort grouper accountSection and accountType to asc with expand state', function (assert) {
  var component = this.subject();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  this.render();

  helper.rowGroupingIndicator(0).click();
  Ember.run(function() {
    component.setGrouperSortDirection(1, 'asc');
    component.setGrouperSortDirection(0, 'asc');
  });
  assert.equal(helper.fixedBodyCell(2, 0).text().trim(), "at-1");
});

moduleForEmberTable('lazy-array as ember-table content', function (options) {
  return EmberTableFixture.create({
    height: options.height,
    content: defaultFixture(options)
  });
});

test('regular click to sort column of id by completed data', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers:defers, height: 800});
  this.render();

  return defers.ready(function () {
    var helper = EmberTableHelper.create({_assert: assert, _component: component});
    helper.assertCellContent(0, 0, '3', 'should sort as unsorted');

    helper.getHeaderCell(0).click();
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should sort as ascending');

    helper.getHeaderCell(0).click();
    helper.assertDescendingIndicatorInHeaderCell(0, 'should show descending indicator');
    helper.assertCellContent(0, 0, '19', 'should sort as descending');

    helper.getHeaderCell(0).click();
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should sort as ascending');
  });
});

test('click with command key to sort column of id by completed data', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers:defers, height: 800});
  this.render();

  return defers.ready(function () {
    var helper = EmberTableHelper.create({_assert: assert, _component: component});
    helper.assertCellContent(0, 0, '3', 'should sort as unsorted');

    helper.clickHeaderCellWithCommand(0);
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should sort as ascending');

    helper.clickHeaderCellWithCommand(0);
    helper.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
    helper.assertCellContent(0, 0, '0', 'should keep ascending after unsort');

    helper.getHeaderCell(0).click();
    helper.getHeaderCell(0).click();

    helper.clickHeaderCellWithCommand(0);
    helper.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
    helper.assertCellContent(0, 0, '19', 'should keep descending after unsort');
  });
});

test('regular click to sort column of id by partial data', function (assert) {
  var defers = DefersPromise.create({count: 8});
  var component = this.subject({defers:defers, height: 200});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.assertCellContent(0, 0, '3', 'should sort as unsorted');
    helper.getHeaderCell(0).click();
  }, [0, 1]);
  defers.ready(function () {
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should sort as ascending');
    helper.getHeaderCell(0).click();
  }, [2, 3]);

  defers.ready(function () {
    helper.assertDescendingIndicatorInHeaderCell(0, 'should show descending indicator');
    helper.assertCellContent(0, 0, '19', 'should sort as descending');
    helper.getHeaderCell(0).click();
  }, [4, 5]);

  return defers.ready(function(){
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should sort as ascending');
  });
});

test('multiple columns sort by partial data', function (assert) {
  var defers = DefersPromise.create({count: 6});
  var component = this.subject({defers:defers, height: 200});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.getHeaderCell(1).click();
  }, [0, 1]);
  defers.ready(function () {
    helper.clickHeaderCellWithCommand(2);
  }, [2, 3]);

  return defers.ready(function () {
    var sortedContent = [
      ["activity-0", "state-1"],
      ["activity-0", "state-3"],
      ["activity-0", "state-5"]
    ];
    var bodyCellsContent = helper.bodyCellsContent([0, 1, 2], [1, 2]);
    assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
  });
});

test('sort quickly twice', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers:defers, height: 200, delayTime: 500});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.assertCellContent(0, 0, '3', 'should sort as unsorted');
    var idHeaderCell = helper.getHeaderCell(0);
    idHeaderCell.click();
    idHeaderCell.click();
  }, [0, 1]);

  return defers.ready(function(){
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should ascending');
  });
});

test('click with command key to sort column of id by partial data', function (assert) {
  var defers = DefersPromise.create({count: 12});
  var component = this.subject({defers:defers, height: 200});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.assertCellContent(0, 0, '3', 'should sort as unsorted');
    helper.clickHeaderCellWithCommand(0);
  }, [0, 1]);
  defers.ready(function () {
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should sort as ascending');
    helper.clickHeaderCellWithCommand(0);
  }, [2, 3]);
  defers.ready(function () {
    helper.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
    helper.assertCellContent(0, 0, '3', 'should display unsorted state');
    helper.getHeaderCell(0).click();
  }, [4, 5]);

  defers.ready(function(){
    helper.getHeaderCell(0).click();
  }, [6, 7]);

  defers.ready(function(){
    helper.clickHeaderCellWithCommand(0);
  }, [8, 9]);

  return defers.ready(function(){
    helper.assertNonSortIndicatorInHeaderCell(0, 'should not show loading indicator');
    helper.assertCellContent(0, 0, '3', 'should display unsorted state');
  }, [10, 11]);
});

test('multiple columns sort with complete data', function(assert) {
  var defers = DefersPromise.create({count: 1});
  var options = {defers: defers, height: 800, totalCount: 3, chunkSize: 3, multipleColumns: true};
  var component = this.subject(options);
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  options.chunks = [
    [
      {id: 2, activity: "a"},
      {id: 1, activity: "b"},
      {id: 1, activity: "a"}
    ]
  ];
  this.render();

  return defers.ready(function() {
    helper.getHeaderCell(0).click();
    helper.clickHeaderCellWithCommand(1);

    var sortedContent = [
      ["1", "a"],
      ["1", "b"],
      ["2", "a"]
    ];
    var bodyCellsContent = helper.bodyCellsContent([0, 1, 2], [0, 1]);
    assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
  });

});

moduleForEmberTable('lazy-grouped-row-array as ember-table content', function (options) {
  return EmberTableFixture.create({
    height: options.height,
    groupMeta: GroupedRowDataProvider.create({
      defers: options.defers,
      delayTime: options.delayTime || 0,
      groupingMetadata: [{id: 'accountSection'}, {id: 'accountType'}]
    })
  });
});

test('click grouping-column header cell', function(assert) {
  var defers = DefersPromise.create({count: 2});
  var component = this.subject({defers: defers, height: 1000});
  this.render();
  var tableDom = TableDom.create({content: component.$()});
  defers.ready(function () {
    var groupingColumnHeader = tableDom.headerRow(0).cell(0);
    groupingColumnHeader.click();
    assert.noSortIndicatorOn(groupingColumnHeader, 'it should not appear ascending indicator');
  }, [0, 1]);
});

test('multiple columns sort completed data for lazy group row array', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers: defers, height: 1000});
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  this.render();
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0, 1]);

  return defers.ready(function () {
    helper.getHeaderCell(1).click();
    helper.clickHeaderCellWithCommand(2);

    var sortedContent = [
      ["activity-0", "state-1"],
      ["activity-0", "state-3"],
      ["activity-0", "state-5"]
    ];
    var bodyCellsContent = helper.bodyCellsContent([1, 2, 3], [1, 2]);
    assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
  });
});

test('click with command key to sort completed data for lazy group row array', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers: defers, height: 1000});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0, 1]);

  return defers.ready(function () {
    helper.assertCellContent(1, 0, '102', 'should unsorted before click header cell');
    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(1, 0, '101', 'should sort ascending');

    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(1, 0, '102', 'should unsorted');

    helper.getHeaderCell(0).click();
    helper.getHeaderCell(0).click();
    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(1, 0, '102', 'should unsorted');
  });
});

test('regular click to sort partial data for lazy group row array', function (assert) {
  var defers = DefersPromise.create({count: 5});
  var options = {defers: defers, height: 120};
  var component = this.subject(options);
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '102', 'should unsorted before click header cell');
    helper.getHeaderCell(0).click();
  }, [1]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '101', 'should sort ascending');
    helper.getHeaderCell(0).click();
  }, [2]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '110', 'should sort descending');
    helper.getHeaderCell(0).click();
  }, [3]);

  return defers.ready(function () {
    helper.assertCellContent(1, 0, '101', 'should sort ascending');
  });
});

test('click with command key to sort partial data for lazy group row array', function (assert) {
  var defers = DefersPromise.create({count: 7});
  var component = this.subject({defers: defers, height: 120});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '102', 'should unsorted before click header cell');
    helper.clickHeaderCellWithCommand(0);
  }, [1]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '101', 'should sort ascending');
    helper.clickHeaderCellWithCommand(0);
  }, [2]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '102', 'should unsorted');
    helper.getHeaderCell(0).click(); //make it sort ascending again
  }, [3]);

  defers.ready(function () {
    helper.getHeaderCell(0).click(); //make it descending again
  }, [4]);

  defers.ready(function () {
    helper.clickHeaderCellWithCommand(0); //cancel sort
  }, [5]);

  return defers.ready(function () {
    helper.assertCellContent(1, 0, '102', 'should unsorted');
  }, [6]);
});

test('sort completed descending data to unsorted state with command key', function (assert) {
  var defers = DefersPromise.create({count: 3});
  var component = this.subject({defers: defers, height: 120});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.getHeaderCell(0).click();
    helper.getHeaderCell(0).click();
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.assertCellContent(1, 0, '110', 'should sort descending when click header cell');
    helper.scrollTop(150);
  }, [1]);

  return defers.ready(function () {
    helper.clickHeaderCellWithCommand(0); //will not retrieve unsorted data
    helper.scrollTop(-150);
    Ember.run.later(function () {
      helper.assertCellContent(1, 0, '110', 'should leave data as descending');
    });
  }, [2]);
});

test('sort quickly twice', function (assert) {
  var defers = DefersPromise.create({count: 3});
  var component = this.subject({defers:defers, height: 120, delayTime: 500});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function(){
    helper.rowGroupingIndicator(0).click();
  }, [0]);
  defers.ready(function () {
    helper.assertCellContent(1, 0, '102', 'should sort as unsorted');
    var idHeaderCell = helper.getHeaderCell(0);
    idHeaderCell.click();
    idHeaderCell.click();
  }, [1]);

  return defers.ready(function(){
    helper.assertAscendingIndicatorInHeaderCell(0, 'should show ascending indicator');
    helper.assertCellContent(1, 0, '101', 'should ascending');
  });
});

test('multiple column sort partial data for lazy group row array', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers: defers, height: 120});
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  this.render();
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.getHeaderCell(1).click();
  }, [1]);

  defers.ready(function () {
    helper.clickHeaderCellWithCommand(2);
  }, [2]);

  return defers.ready(function () {
    var sortedContent = [
      ["activity-0", "state-1"],
      ["activity-0", "state-3"],
      ["activity-0", "state-5"]
    ];
    var bodyCellsContent = helper.bodyCellsContent([1, 2, 3], [1, 2]);
    assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
  });
});

moduleForEmberTable('Grand total row as ember-table content', function (options) {
  return EmberTableFixture.create({
    height: options.height,
    groupMeta: GroupedRowDataProvider.create({
      defers: options.defers,
      delayTime: options.delayTime || 0,
      groupingMetadata: [{id: 'accountSection'}, {id: "accountType"}],
      grandTotalTitle: 'Total'
    })
  });
});

test('regular click to sort completed data', function (assert) {
  var defers = DefersPromise.create({count: 5});
  var component = this.subject({defers: defers, height: 1000});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);
  defers.ready(function () {
    helper.rowGroupingIndicator(3).click();
  }, [1, 2]);
  return defers.ready(function () {
    helper.assertCellContent(4, 0, '303', 'should unsorted before click header cell');
    helper.getHeaderCell(0).click();
    helper.assertCellContent(4, 0, '301', 'should sort ascending');
    helper.getHeaderCell(0).click();
    helper.assertCellContent(4, 0, '310', 'should sort descending');
    helper.getHeaderCell(0).click();
    helper.assertCellContent(4, 0, '301', 'should sort ascending');
  });
});

test('click with command key to sort completed data', function (assert) {
  var defers = DefersPromise.create({count: 5});
  var component = this.subject({defers: defers, height: 1000});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);
  defers.ready(function () {
    helper.rowGroupingIndicator(3).click();
  }, [1, 2]);
  return defers.ready(function () {
    helper.assertCellContent(4, 0, '303', 'should unsorted before click header cell');
    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(4, 0, '301', 'should sort ascending');
    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(4, 0, '303', 'should unsorted');
    helper.getHeaderCell(0).click();
    helper.getHeaderCell(0).click();
    helper.clickHeaderCellWithCommand(0);
    helper.assertCellContent(4, 0, '303', 'should unsorted');
  });
});

test('regular click to sort partial data', function (assert) {
  var defers = DefersPromise.create({count: 7});
  var component = this.subject({defers: defers, height: 180});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.rowGroupingIndicator(3).click();
  }, [1, 2]);

  defers.ready(function () {
    helper.assertCellContent(4, 0, '303', 'should unsorted before click header cell');
    helper.getHeaderCell(0).click();
  }, [3]);

  defers.ready(function () {
    helper.assertCellContent(4, 0, '301', 'should sort ascending');
    helper.getHeaderCell(0).click();
  }, [4]);

  defers.ready(function () {
    helper.assertCellContent(4, 0, '310', 'should sort descending');
    helper.getHeaderCell(0).click();
  }, [5]);

  return defers.ready(function () {
    helper.assertCellContent(4, 0, '301', 'should sort ascending');
  });
});

test('click with command key to sort partial data', function (assert) {
  var defers = DefersPromise.create({count: 9});
  var component = this.subject({defers: defers, height: 180});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.rowGroupingIndicator(3).click();
  }, [1, 2]);

  defers.ready(function () {
    helper.assertCellContent(4, 0, '303', 'should unsorted before click header cell');
    helper.clickHeaderCellWithCommand(0);
  }, [3]);

  defers.ready(function () {
    helper.assertCellContent(4, 0, '301', 'should ascending');
    helper.clickHeaderCellWithCommand(0);
  }, [4]);

  defers.ready(function () {
    helper.assertCellContent(4, 0, '303', 'should unsorted');
    helper.getHeaderCell(0).click();
  }, [5]);

  defers.ready(function () {
    helper.getHeaderCell(0).click();
  }, [6]);

  defers.ready(function () {
    helper.clickHeaderCellWithCommand(0);
  }, [7]);

  return defers.ready(function () {
    helper.assertCellContent(4, 0, '303', 'should unsorted');
  });
});

test('sort completed descending data to unsorted state with command key', function (assert) {
  var defers = DefersPromise.create({count: 5});
  var options = {defers: defers, height: 180};
    var component = this.subject(options);
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.getHeaderCell(0).click();
    helper.getHeaderCell(0).click();
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.rowGroupingIndicator(3).click();
  }, [1, 2]);

  defers.ready(function () {
    helper.assertCellContent(4, 0, '310', 'should sort descending when click header cell');
    helper.scrollTop(150);
  }, [3]);

  return defers.ready(function () {
    helper.clickHeaderCellWithCommand(0);
    helper.scrollTop(-150);
    Ember.run.later(function() {
      helper.assertCellContent(4, 0, '310', 'should leave as descending');
    });
  });
});

test('multiple columns sort completed data', function (assert) {
  var defers = DefersPromise.create({count: 5});
  var component = this.subject({defers: defers, height: 1000});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);
  defers.ready(function () {
    helper.rowGroupingIndicator(1).click();
  }, [1, 2]);
  return defers.ready(function () {
    helper.getHeaderCell(1).click();
    helper.clickHeaderCellWithCommand(2);
    var sortedContent = [
      ["activity-0", "state-1"],
      ["activity-0", "state-3"],
      ["activity-0", "state-5"]
    ];
    var bodyCellsContent = helper.bodyCellsContent([2, 3, 4], [1, 2]);
    assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
  });
});

test('multiple columns sort partial data', function (assert) {
  var defers = DefersPromise.create({count: 5});
  var component = this.subject({defers: defers, height: 120});
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  this.render();
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.rowGroupingIndicator(1).click();
  }, [1]);

  defers.ready(function () {
    helper.getHeaderCell(1).click();
  }, [2]);

  defers.ready(function () {
    helper.clickHeaderCellWithCommand(2);
  }, [3]);

  return defers.ready(function () {
    var sortedContent = [
      ["activity-0", "state-1"],
      ["activity-0", "state-3"],
      ["activity-0", "state-5"]
    ];
    var bodyCellsContent = helper.bodyCellsContent([2, 3, 4], [1, 2]);
    assert.deepEqual(bodyCellsContent, sortedContent, "content should be sorted by multiple columns");
  });
});
