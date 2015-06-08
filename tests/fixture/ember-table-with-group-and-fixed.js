import Ember from 'ember';
import ColumnFixture from './columns';
import EmberTableFixture from './ember-table';

export default EmberTableFixture.extend({
  columns: Ember.computed(function () {
    var columnFixture = ColumnFixture.create();
    var columnGroups = this.get('groupNames').map(function (c) {
      return columnFixture.get(c);
    });
    return [columnFixture.get('firstColumn')].concat(columnGroups);
  }).property('groupNames'),

  numFixedColumns: 1,

  groupNames: ['firstGroup']
});
