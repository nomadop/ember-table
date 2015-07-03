import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import GroupedRowDataProvider from '../../fixture/grouped-row-data-provider';
import DeferPromises from '../../fixture/defer-promises';

moduleForEmberTable("Given a table with chunked completed group row data", function (content) {
  return EmberTableFixture.create({
    height: 800,
    content: content
  });
});

test('sort completed data of grouped row', function (assert) {
  var defers = DeferPromises.create({count: 4});
  var provider = GroupedRowDataProvider.create({defers: defers, groupingMetadata: [{id: 'accountType'}, {id: ''}]});
  var component = this.subject(provider.get('content'));
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0, 1]);

  return defers.ready(function () {
    var secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '102', 'second row id should be equal to 102 before sort');
    helper.getHeaderCell(0).click();
    secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '101', 'second row id should be equal to 101 when sort asc');
    helper.getHeaderCell(0).click();
    secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '110', 'second row id should be equal to 110 when sort desc');
  });
});

moduleForEmberTable("Given a table with chunked partial group row data", function (content) {
  return EmberTableFixture.create({
    height: 120,
    content:content
  });
});

test('sort partial data of grouped row', function (assert) {
  var defers = DeferPromises.create({count: 4});
  var provider = GroupedRowDataProvider.create({defers: defers, groupingMetadata: [{id: 'accountType'}, {id: ''}]});
  var component = this.subject(provider.get('content'));
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    var secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '102', 'second row id should be equal to 102 before sort');
    helper.getHeaderCell(0).click();
  }, [1]);

  defers.ready(function () {
    var secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '101', 'second row id should be equal to 101 when sort asc');
    helper.getHeaderCell(0).click();
  }, [2]);

  return defers.ready(function () {
    var secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '110', 'second row id should be equal to 110 when sort desc');
  });
});

test('expand grouped row with leaf rows when sorted', function(assert){
  var defers = DeferPromises.create({count: 3});
  var provider = GroupedRowDataProvider.create({defers: defers, groupingMetadata: [{id: 'accountType'}, {id: ''}]});
  var component = this.subject(provider.get('content'));
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  defers.ready(function () {
    helper.getHeaderCell(0).click();
    helper.rowGroupingIndicator(0).click();
    var secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '101', 'second row id should be equal to 101 when sort asc');
  }, [0]);

  defers.ready(function () {
    helper.getHeaderCell(0).click();
  }, [1]);

  return defers.ready(function () {
    var secondRowId = helper.bodyCell(1, 0).text().trim();
    assert.equal(secondRowId, '110', 'second row id should be equal to 110 when sort desc');
  });
});

test('expand second level rows twice', function(assert) {
  var defers = DeferPromises.create({count: 2});
  var provider = GroupedRowDataProvider.create({defers: defers, groupingMetadata: [{id: 'accountType'}, {id: ''}]});
  var component = this.subject(provider.get('content'));
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  return defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
    helper.rowGroupingIndicator(0).click();
    assert.equal(provider.get('loadChunkCount'), 2, 'Loaded chunk count should be 2');
  });
});

test('sort leaf column with three levels', function (assert) {
  var defers = DeferPromises.create({count: 5});
  var provider = GroupedRowDataProvider.create({defers: defers, groupingMetadata: [{id: 'accountType'}, {id: 'accountCode'}, {id: ''}]});
  var component = this.subject(provider.get('content'));
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  defers.ready(function () {
    helper.rowGroupingIndicator(0).click();
  }, [0]);

  defers.ready(function () {
    helper.rowGroupingIndicator(1).click();
  }, [1]);

  defers.ready(function () {
    var thirdRowId = helper.bodyCell(2, 0).text().trim();
    assert.equal(thirdRowId, '1003', 'it should render 1003 before sort');
    helper.getHeaderCell(0).click();
  }, [2]);

  defers.ready(function () {
    var thirdRowId = helper.bodyCell(2, 0).text().trim();
    assert.equal(thirdRowId, '1001', 'it should render 1001 before sort');
    helper.getHeaderCell(0).click();
  }, [3]);

  return defers.ready(function () {
    var thirdRowId = helper.bodyCell(2, 0).text().trim();
    assert.equal(thirdRowId, '1010', 'it should render 1010 before sort');
  });
});
