import Ember from 'ember';
import ColumnFixture from './columns';
import EmberTableFixture from './ember-table';

export default EmberTableFixture.extend({
  columns: Ember.computed(function () {
    var columnFixture = ColumnFixture.create();
    return this.get('columnNames').map(function (c) {
      return columnFixture.get(c);
    });
  }).property('columnNames'),

  numFixedColumns: 1,

  columnsNames: []
});
