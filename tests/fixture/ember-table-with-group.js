import Ember from 'ember';
import ColumnFixture from './columns';
import EmberTableFixture from './ember-table';

export default EmberTableFixture.extend({
  columns: Ember.computed(function() {
    var columnFixture = ColumnFixture.create();
    return [
      columnFixture.get('firstColumn'),
      columnFixture.get('firstGroup')
    ];
  })
});
