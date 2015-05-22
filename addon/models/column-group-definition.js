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
  }).property('innerColumns.@each.savedWidth'),

  innerColumnStyle: undefined,

  groupStyle: undefined,

  firstColumnStyle: undefined,

  lastColumnStyle: undefined,

  getCellContent: function() {
    return "";
  },

  columns: Ember.computed(function(){
    var columns = this.get('innerColumns');
    var innerColumnStyle = this.get('innerColumnStyle');

    columns.setEach('cellStyle', innerColumnStyle);
    
    columns[0].set('cellStyle', this.get('firstColumnStyle') + ' ' + innerColumnStyle);
    columns[columns.length - 1].set('cellStyle', this.get('lastColumnStyle') + ' ' + innerColumnStyle);

    return columns;
  }).property('innerColumns.@each', 'innerColumnStyle', 'lastColumnStyle', 'firstColumnStyle')

});
