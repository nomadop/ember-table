import Ember from 'ember';
import ColumnDefinition from 'ember-table/models/column-definition';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';

export default Ember.Object.extend({
  firstColumn: Ember.computed(function () {
    return ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column1',
      sortBy: function (prev, next) {
        return prev.get('id') - next.get('id');
      },
      getCellContent: function (row) {
        return row.get('a');
      }
    });
  }),

  secondColumn: Ember.computed(function () {
    return ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column2',
      sortBy: function (prev, next) {
        return prev.get('id') - next.get('id');
      },
      getCellContent: function (row) {
        return row.get('b');
      }
    });
  }),

  thirdColumn: Ember.computed(function () {
    return ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column3',
      getCellContent: function (row) {
        return row.get('c');
      }
    });
  }),

  firstGroup: Ember.computed(function () {
    return ColumnGroupDefinition.create({
      headerCellName: 'Group1',
      cellStyle: 'group-1-cell-class',
      groupStyle: 'group-1-class',
      innerColumnStyle: 'group-1-inner-column',
      firstColumnStyle: 'group-1-first-column',
      lastColumnStyle: 'group-1-last-column',
      innerColumns: [this.get('secondColumn'), this.get('thirdColumn')]
    });
  })
});
