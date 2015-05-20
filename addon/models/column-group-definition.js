import Ember from 'ember';
import ColumnDefinition from './column-definition';

export default ColumnDefinition.extend({
  // ---------------------------------------------------------------------------
  // API - Inputs
  // ---------------------------------------------------------------------------

  innerColumns:[],

  savedWidth: Ember.computed(function() {
    return this.get('innerColumns').getEach('savedWidth').reduce(function(res, width) {
      return res + width;
    }, 0);
  }),

  innerColumnStyle: undefined,

  groupStyle: undefined,

  firstColumnClass: undefined,

  lastColumnClass: undefined,

  getCellContent: function() {
    return "";
  },

  columns: Ember.computed(function(){
    var columns = this.get('innerColumns');
    columns.setEach('cellStyle', this.get('innerColumnStyle'));
    return columns;
  }).property('innerColumns.@each', 'innerColumnStyle')

});
