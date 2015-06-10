import Ember from 'ember';
import TableCell from './table-cell';
export default TableCell.extend({
  templateName: 'grouping-column-cell',

  classNames: ['grouping-column-cell'],

  expanded: false,

  indicatorClass: Ember.computed(function() {
    var classNames = ['grouping-column-indicator'];
    if (this.get('expanded')) {
      classNames.push('unfold');
    }
    return classNames.join(' ');
  }).property('expanded'),

  isGroupRow: Ember.computed.oneWay('row.isGroupRow'),

  actions: {
    toggleExpansionState: function() {
      this.toggleProperty('expanded');
    }
  }
});
