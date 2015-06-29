import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import LazyGroupRowArray from 'ember-table/models/lazy-group-row-array';
import DeferedPromises from '../../fixture/defered-promises';


moduleForEmberTable('Given a table with chunked group row data',
  function (testEnv) {
    var chunkSize = 5;
    return EmberTableFixture.create({
      height: 500,
      width: 700,
      content: LazyGroupRowArray.create(
        {
          loadChildren: function getChunk(chunkIndex, parentQuery) {
            var defer = testEnv.get('defers')[chunkIndex];
            var result = {
              content: [],
              meta: {totalCount: 10, chunkSize: chunkSize}
            };
            for (var i = 0; i < chunkSize; i++) {
              var childrenStart = 10 * (chunkIndex + 1);
              result.content.push({
                id: i, name: 'name-' + i,
                children: [
                  {id: childrenStart + 1, name: 'child-name-' + childrenStart + 1},
                  {id: childrenStart + 2, name: 'child-name-' + childrenStart + 2}
                ]
              });
            }
            defer.resolve(result);
            return defer.promise;
          }
        }),
      groupingMetadata: ["", ""]
    });
  });

test('top level grouping rows are in chunk', function (assert) {
  var testEnv = DeferedPromises.create({defersCount: 2});
  var component = this.subject(testEnv);
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  return testEnv.ready(function(){
    assert.equal(helper.fixedBodyRows().length, 12, 'should render two chunks of rows');
    assert.equal(helper.rowGroupingIndicator(0).length, 1, 'first row is grouping row');
  });
});

test('expand chunked top level rows', function (assert) {
  var testEnv = DeferedPromises.create({defersCount: 2});
  var component = this.subject(testEnv);
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  return testEnv.ready(function(){
    helper.rowGroupingIndicator(0).click();
    assert.equal(helper.rowGroupingIndicator(0).hasClass("unfold"), true, 'grouping row is expanded');
    assert.equal(helper.fixedBodyRows().length, 14, 'children rows are displayed');
  });
});

test('collapse chunked top level rows', function (assert) {
  var testEnv = DeferedPromises.create({defersCount: 2});
  var component = this.subject(testEnv);
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  return testEnv.ready(function(){
      helper.rowGroupingIndicator(0).click();
      helper.rowGroupingIndicator(0).click();

      assert.equal(helper.rowGroupingIndicator(0).hasClass("unfold"), false, 'grouping row is collapsed');
      assert.equal(helper.fixedBodyRows().length, 12, 'children rows are collapsed');
  });
});

moduleForEmberTable('Given a table with 3 chunked group row data',  function subject(content) {
    return EmberTableFixture.create({
      height: 90,
      width: 700,
      content: content,
      groupingMetadata: ["", ""]
    });
});

test('load top level chunk data in need', function(assert) {
  var testEnv = DeferedPromises.create({defersCount: 1});
  var chunkSize = 5;
  var loadedChunkCount = 0;
  var component = this.subject(LazyGroupRowArray.create(
    {
      loadChildren: function getChunk(pageIndex, parentQuery) {
        var defer = testEnv.get('defers')[pageIndex];
        loadedChunkCount++;
        var result = [];
        for (var i = 0; i < chunkSize; i++) {
          var childrenStart = 10 * (pageIndex + 1);
          result.push({
            id: i, name: 'name-' + i,
            children: [
              {id: childrenStart + 1, name: 'child-name-' + childrenStart + 1},
              {id: childrenStart + 2, name: 'child-name-' + childrenStart + 2}
            ]
          });
        }
        defer.resolve({content: result, meta: {totalCount: 15, chunkSize: 5}});
        return defer.promise;
      },

      groupingMetadata: [{id: ''}, {id: ''}]
    }));

  this.render();

  return testEnv.ready(function () {
    assert.equal(loadedChunkCount, 1, 'should only load first chunk');
  });
 });
