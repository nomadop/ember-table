import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';
import LazyGroupRowArray from 'ember-table/models/lazy-group-row-array';

var TestENV = {
  defers: [
    Ember.RSVP.defer(),
    Ember.RSVP.defer()
  ],
  promises: function(){
    return this.defers.map(function(defer){
      return defer.promise;
    });
  },
  ready: function(callback){
    Ember.RSVP.all(this.promises()).then(function() {
      Ember.run.later(callback);
    });
  }
};

moduleForEmberTable('Given a table with chunked group row data',
  function () {
    var chunkSize = 5;
    return EmberTableFixture.create({
      height: 500,
      width: 700,
      content: LazyGroupRowArray.create(
        {
          loadChildren: function getChunk(chunkIndex, parentQuery) {
            var defer = TestENV.defers[chunkIndex];
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
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  return TestENV.ready(function(){
    assert.equal(helper.fixedBodyRows().length, 12, 'should render two chunks of rows');
    assert.equal(helper.rowGroupingIndicator(0).length, 1, 'first row is grouping row');    
  });
});

test('expand chunked top level rows', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  return TestENV.ready(function(){
    helper.rowGroupingIndicator(0).click();
    assert.equal(helper.rowGroupingIndicator(0).hasClass("unfold"), true, 'grouping row is expanded');
    assert.equal(helper.fixedBodyRows().length, 14, 'children rows are displayed');
  });
});

test('collapse chunked top level rows', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});
  return TestENV.ready(function(){
      helper.rowGroupingIndicator(0).click();
      helper.rowGroupingIndicator(0).click();

      assert.equal(helper.rowGroupingIndicator(0).hasClass("unfold"), false, 'grouping row is collapsed');
      assert.equal(helper.fixedBodyRows().length, 12, 'children rows are collapsed');  
  });
});
