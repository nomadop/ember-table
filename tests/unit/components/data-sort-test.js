import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import Columns from '../../fixture/columns';
import LazyArrayFixture from '../../fixture/lazy-array';
import LazyArray from 'ember-table/models/lazy-array';
import DefersPromise from '../../fixture/defer-promises';

moduleForEmberTable('A normal JavaScript array as ember-table content', function () {
  var content = [{
    id: 2
  }, {
    id: 1
  }, {
    id: 4
  }, {
    id: 3
  }];
  var columns = Columns.create();
  return EmberTableFixture.create({
    content: content,
    columns: [columns.get('noSortFnID')]
  });
});

test('sort by id column', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  helper.getHeaderCellContent(0).click();
  assert.ok(helper.getHeaderCell(0).hasClass('sort-indicator-icon-up'), 'should show ascending indicator');
  helper.assertCellContent(0, 0, '1', 'should sort as ascending');

  helper.getHeaderCellContent(0).click();
  assert.ok(helper.getHeaderCell(0).hasClass('sort-indicator-icon-down'), 'should show descending indicator');
  helper.assertCellContent(0, 0, '4', 'should sort as descending');

  helper.getHeaderCellContent(0).click();
  assert.ok(!helper.getHeaderCell(0).hasClass('sort-indicator-icon-down'), 'should not show descending indicator');
  assert.ok(!helper.getHeaderCell(0).hasClass('sort-indicator-icon-up'), 'should not show ascending indicator');
  helper.assertCellContent(0, 0, '2', 'should display unsort state');
});

moduleForEmberTable('lazy-array as ember-table content', function (options) {
  var toQuery = function(obj) {
    var keys = Object.keys(obj).sort();
    return keys.map(function (key) {
      return key + '=' + obj[key];
    }).join('&');
  };
  var content = LazyArray.create({
    totalCount: 20,
    chunkSize: 5,
    _preloadGate: 1,
    callback: function(pageIndex, query) {
      var defer = options.defers.next();
      defer.resolve(this.initChunk(pageIndex, query));
      return defer.promise;
    },
    initChunk: function (pageIndex, query) {
      var self = this;
      var resultMap = {
        '': function () {
          var index, chunk = [];
          var chunkSize = self.get('chunkSize');
          for (var i = 1; i <= chunkSize; i++) {
            index = (i + 2) % chunkSize + pageIndex * chunkSize;
            chunk.push({id: index});
          }
          return chunk;
        },
        'sortDirect=asc&sortName=ID': function() {
          var index, chunk = [];
          var chunkSize = self.get('chunkSize');
          for (var i = 0; i < chunkSize; i++) {
            index = i + pageIndex * chunkSize;
            chunk.push({id: index});
          }
          return chunk;
        },
        'sortDirect=desc&sortName=ID': function(){
          var index, chunk = [];
          var chunkSize = self.get('chunkSize');
          for (var i = 1; i <= chunkSize; i++) {
            index = self.get('_totalCount') - (i + pageIndex * chunkSize);
            chunk.push({id: index});
          }
          return chunk;
        }
      };
      return resultMap[toQuery(query)]();
    }
  });
  var columns = Columns.create();
  return EmberTableFixture.create({
    height: options.height,
    content: content,
    columns: [columns.get('noSortFnID')]
  });
});

test('sort column of id by completed data', function (assert) {
  var defers = DefersPromise.create({count: 4});
  var component = this.subject({defers:defers, height: 800});
  this.render();

  return defers.ready(function () {
    var helper = EmberTableHelper.create({_assert: assert, _component: component});
    helper.assertCellContent(0, 0, '3', 'should sort as ascending');

    helper.getHeaderCellContent(0).click();
    assert.ok(helper.getHeaderCell(0).hasClass('sort-indicator-icon-up'), 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should sort as ascending');

    helper.getHeaderCellContent(0).click();
    assert.ok(helper.getHeaderCell(0).hasClass('sort-indicator-icon-down'), 'should show descending indicator');
    helper.assertCellContent(0, 0, '19', 'should sort as descending');

    helper.getHeaderCellContent(0).click();
    assert.ok(!helper.getHeaderCell(0).hasClass('sort-indicator-icon-down'), 'should not show descending indicator');
    assert.ok(!helper.getHeaderCell(0).hasClass('sort-indicator-icon-up'), 'should not show ascending indicator');
    helper.assertCellContent(0, 0, '3', 'should display unsort state');
  });
});

test('sort column of id by partial data', function (assert) {
  var defers = DefersPromise.create({count: 8});
  var component = this.subject({defers:defers, height: 200});
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  defers.ready(function () {
    helper.assertCellContent(0, 0, '3', 'should sort as ascending');
    helper.getHeaderCellContent(0).click();
  }, [0, 1]);
  defers.ready(function () {
    assert.ok(helper.getHeaderCell(0).hasClass('sort-indicator-icon-up'), 'should show ascending indicator');
    helper.assertCellContent(0, 0, '0', 'should sort as ascending');

    helper.getHeaderCellContent(0).click();
  }, [2, 3]);

  defers.ready(function () {
    assert.ok(helper.getHeaderCell(0).hasClass('sort-indicator-icon-down'), 'should show descending indicator');
    helper.assertCellContent(0, 0, '19', 'should sort as descending');

    helper.getHeaderCellContent(0).click();
  }, [4, 5]);

  return defers.ready(function(){
    assert.ok(!helper.getHeaderCell(0).hasClass('sort-indicator-icon-down'), 'should not show descending indicator');
    assert.ok(!helper.getHeaderCell(0).hasClass('sort-indicator-icon-up'), 'should not show ascending indicator');
    helper.assertCellContent(0, 0, '3', 'should display unsort state');
  });
});
