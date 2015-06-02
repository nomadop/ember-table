import Ember from 'ember';
import {
  moduleForComponent,
  test
  }
  from 'ember-qunit';

import simulateDrag from '../../helpers/simulate-drag';

import ColumnDefinition from 'ember-table/models/column-definition';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';

var columns, firstColumn, secondColumn, thirdColumn, fourthColumn, fifthColumn, firstGroup, secondGroup;

moduleForComponent('ember-table', 'reorder indicator', {

  beforeEach: function() {

    firstColumn = ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column1',
      getCellContent: function(row) {
        return row.get('a');
      }
    });

    secondColumn = ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column2',
      getCellContent: function(row) {
        return row.get('b');
      }
    });

    thirdColumn = ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column3',
      getCellContent: function(row) {
        return row.get('c');
      }
    });

    fourthColumn = ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column4',
      getCellContent: function(row) {
        return row.get('d');
      }
    });

    fifthColumn = ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column4',
      getCellContent: function(row) {
        return row.get('d');
      }
    });


    firstGroup = ColumnGroupDefinition.create({
      headerCellName: 'Group1',
      cellStyle: 'group-1-cell-class',
      groupStyle: 'group-1-class',
      innerColumnStyle: 'group-1-inner-column',
      firstColumnStyle: 'group-1-first-column',
      lastColumnStyle: 'group-1-last-column',
      innerColumns: [secondColumn, thirdColumn]
    });

    secondGroup = ColumnGroupDefinition.create({
      headerCellName: 'Group2',
      cellStyle: 'group-2-cell-class',
      groupStyle: 'group-2-class',
      innerColumnStyle: 'group-2-inner-column',
      firstColumnStyle: 'group-2-first-column',
      lastColumnStyle: 'group-2-last-column',
      innerColumns: [fourthColumn, fifthColumn]
    });
  },

  needs: [
    'view:body-table-container',
    'view:column-sortable-indicator',
    'view:footer-table-container',
    'view:header-cell',
    'view:header-row',
    'view:header-block',
    'view:header-table-container',
    'view:scroll-container',
    'view:lazy-table-block',
    'view:multi-item-collection',
    'view:scroll-container',
    'view:scroll-panel',
    'view:table-block',
    'view:table-cell',
    'view:table-row',
    'view:header-group',
    'view:header-groups-block',
    'template:body-table-container',
    'template:footer-table-container',
    'template:header-cell',
    'template:header-row',
    'template:header-table-container',
    'template:scroll-container',
    'template:table-cell',
    'template:table-row',
    'template:header-groups-block'
  ]
});

test('should render show reorder indicator when dragging header', function (assert) {

  this.subject({
    columns: [firstColumn, firstGroup, secondGroup],
    hasFooter: false,
    enableContentSelection: true,
    reorderIndicatorStyle: 'bg-red'
  });

  var draggedElement = this.$('span:contains(Id)');

  simulateDrag(draggedElement, {clientX: 200});

  assert.ok(this.$('.ember-table-column-sortable-indicator').hasClass('bg-red'));

});

