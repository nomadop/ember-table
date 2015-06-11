import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';

import ColumnDefinition from 'ember-table/models/column-definition';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';
import LazyArray from 'ember-table/models/lazy-array';
import TableFixture from '../../fixture/table';

var tableFixture = TableFixture.create();
moduleForEmberTable('EmberTableComponent');

test('should call set sort function with clicked column when sort partial data', function (assert) {
  var component = tableFixture.table(this);
  component.set('setSortConditionBy', 'setSort');
  component.set('targetObject', Ember.Object.create({
    setSort: function (column) {
      assert.equal(column, component.get('columns')[0]);
    }
  }));

  this.$('span:contains(Column1)').click();
});

