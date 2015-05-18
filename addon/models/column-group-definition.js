import Ember from 'ember';
import ColumnDefinition from './column-definition';

export default ColumnDefinition.extend({
  // ---------------------------------------------------------------------------
  // API - Inputs
  // ---------------------------------------------------------------------------

  innerColumns:[],

  savedWidth: Ember.computed(function() {
    return this.get('innerColumns').reduce(function(res, column) {
      return res + column.get('savedWidth');
    }, 0);
  }),

  getCellContent: function() {
    return "";
  }
});
