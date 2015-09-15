import Ember from 'ember';
import ColumnDefinition from './column-definition';

export default ColumnDefinition.extend({
  // ---------------------------------------------------------------------------
  // API - Inputs
  // ---------------------------------------------------------------------------

  innerColumns: [],

  //minWidth of a column group is used to stop resizing to left,
  //when resizing a column group, the last inner column should reduce its width
  //until reaching its minWidth, and the width of all other inner columns should not change
  minWidth: Ember.computed(function () {
    var innerColumns = this.get('innerColumns');
    var result = 0;
    for (var i = 0; i < innerColumns.length - 1; i++) {
      result += innerColumns[i].get('width');
    }
    result += innerColumns[innerColumns.length - 1].get('minWidth');
    return result;
  }).property('innerColumns.@each.width', 'innerColumns.@each.minWidth'),

  savedWidth: Ember.computed(function () {
    return this.get('innerColumns').getEach('width').reduce(function (res, width) {
      return res + width;
    }, 0);
  }).property('innerColumns.@each.width'),

  innerColumnStyle: '',

  groupStyle: undefined,

  firstColumnStyle: undefined,

  lastColumnStyle: undefined,

  getCellContent: function() {
    return "";
  },

  isGroup: true,

  reorder: function (index, col) {
    if (this.get('innerColumns').indexOf(col) === -1) {
      return;
    }
    this.get('innerColumns').removeObject(col);
    this.get('innerColumns').insertAt(index, col);
  },

  columns: Ember.computed(function () {
    var columns = this.get('innerColumns');
    this._updateInnerColumnStyle(columns);
    return columns;
  }).property('innerColumns.@each'),

  innerColumnStyleDidChange: Ember.observer('innerColumnStyle', 'lastColumnStyle', 'firstColumnStyle', function() {
    var innerColumns = this.get('columns');
    this._updateInnerColumnStyle(innerColumns);
  }),

  _updateInnerColumnStyle: function(innerColumns) {
    var innerColumnStyle = this.get('innerColumnStyle');

    innerColumns.setEach('cellStyle', innerColumnStyle);

    var fistColumn = innerColumns[0];
    fistColumn.set('cellStyle', this._combineSpecificStyle(innerColumnStyle, 'firstColumnStyle'));

    var lastColumn = innerColumns[innerColumns.length - 1];
    lastColumn.set('cellStyle', this._combineSpecificStyle(innerColumnStyle, 'lastColumnStyle'));
  },

  _combineSpecificStyle: function (defaultStyle, specificStyleName) {
    var specificStyle = this.get(specificStyleName);
    if (specificStyle) {
      if (defaultStyle) {
        return specificStyle + " " + defaultStyle;
      } else {
        return specificStyle;
      }
    }
    return defaultStyle;
  },

  lastColumn: Ember.computed(function () {
    var columns = this.get('columns');
    return columns[columns.length - 1];
  }).property('columns'),

  resize: function (groupWidth) {
    var lastColumnWidth = this.get('lastColumn.width');
    this.get('lastColumn').resize(lastColumnWidth + groupWidth - this.get(
      'width'));
  }

});
