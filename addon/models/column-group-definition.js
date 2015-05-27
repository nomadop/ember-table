import Ember from 'ember';
import ColumnDefinition from './column-definition';

export default ColumnDefinition.extend({
  // ---------------------------------------------------------------------------
  // API - Inputs
  // ---------------------------------------------------------------------------

  innerColumns:[],

  //minWidth of a column group is used to stop resizing to left,
  //when resizing a column group, the last inner column should reduce its width
  //until reaching its minWidth, and the width of all other inner columns should not change
  minWidth: Ember.computed(function() {
    var innerColumns = this.get('innerColumns');
    var result = 0;
    for (var i=0; i<innerColumns.length -1 ; i++) {
      result += innerColumns[i].get('width');
    }
    result += innerColumns[innerColumns.length - 1].get('minWidth');
    return result;
  }).property('innerColumns.@each.width', 'innerColumns.@each.minWidth'),

  savedWidth: Ember.computed(function() {
    return this.get('innerColumns').getEach('savedWidth').reduce(function (res, width) {
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

  isGroup: true,

  reorder: function(index, col) {
    if (this.get('innerColumns').indexOf(col) === -1) { return; }
    this.get('innerColumns').removeObject(col);
    this.get('innerColumns').insertAt(index, col);
  },

  columns: Ember.computed(function () {
    var columns = this.get('innerColumns');
    var innerColumnStyle = this.get('innerColumnStyle');

    columns.setEach('cellStyle', innerColumnStyle);

    columns[0].set('cellStyle', this.get('firstColumnStyle') + ' ' + innerColumnStyle);
    columns[columns.length - 1].set('cellStyle', this.get('lastColumnStyle') + ' ' + innerColumnStyle);

    return columns;
  }).property('innerColumns.@each', 'innerColumnStyle', 'lastColumnStyle', 'firstColumnStyle'),

  lastColumn: Ember.computed(function() {
    var columns = this.get('columns');
    return columns[columns.length - 1];
  }).property('columns'),

  resize: function(groupWidth) {
    var lastColumnWidth = this.get('lastColumn.savedWidth');
    this.get('lastColumn').resize(lastColumnWidth + groupWidth - this.get('savedWidth'));
  }

});
