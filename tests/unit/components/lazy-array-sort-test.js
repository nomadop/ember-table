import {moduleForComponent, test} from 'ember-qunit';

import ColumnDefinition from 'ember-table/models/column-definition';

var columns, firstColumn, secondColumn, thirdColumn, firstGroup;

moduleForComponent('ember-table', 'EmberTableComponent', {

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
    'template:body-table-container',
    'template:footer-table-container',
    'template:header-cell',
    'template:header-row',
    'template:header-table-container',
    'template:scroll-container',
    'template:table-cell',
    'template:table-row'
  ]
});

var setEmberTable = function(obj){
  return obj.subject({
    columns: [firstColumn, secondColumn],
    hasFooter: false,
    enableContentSelection: true
  });
};

// test('it should ')

