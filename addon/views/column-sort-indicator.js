import Ember from 'ember';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default Ember.View.extend(RegisterTableComponentMixin,{
  templateName: 'column-sort-indicator',

  classNameBindings: ['columnCellStyle'],

  tagName: 'span',

  column: null,

  sortOrder: Ember.computed(function () {
    var sortingColumns = this.get('tableComponent.sortingColumns');
    if (!sortingColumns || !sortingColumns._columns) {
      return "";
    }
    var index = sortingColumns.findOrder(this.get('column'));
    return index > 0 ? index: "";
  }).property('tableComponent.sortingColumns._columns'),

  columnCellStyle: Ember.computed(function(){
    var columnClasses = [];
    columnClasses = columnClasses.concat(this.get('column.sortIndicatorStyles'));
    return columnClasses.join(' ');
  }).property('column.sortIndicatorStyles')
});
