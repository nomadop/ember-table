import {
  moduleForComponent,
  test
  } from 'ember-qunit';

import ColumnDefinition from 'ember-table/models/column-definition';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';

var columns, table;

moduleForComponent('ember-table', 'EmberTableComponent', {

  beforeEach: function () {

    var firstColumn, secondColumn, thirdColumn, firstGroup;

    firstColumn = ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column1',
      getCellContent: function (row) {
        return row.get('a');
      }
    });

    secondColumn = ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column2',
      getCellContent: function (row) {
        return row.get('b');
      }
    });

    thirdColumn = ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column3',
      getCellContent: function (row) {
        return row.get('c');
      }
    });

    firstGroup = ColumnGroupDefinition.create({
      headerCellName: 'Group1',
      innerColumns: [secondColumn, thirdColumn]
    });

    columns = [firstColumn, firstGroup];

  },

  needs: [
    'view:body-table-container',
    'view:column-sortable-indicator',
    'view:footer-table-container',
    'view:header-cell',
    'view:header-row',
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

test('it renders', function (assert) {

  this.subject({
    columns: columns,
    hasFooter: false,
    enableContentSelection: true,
    hasColumnGroup: true
  });

  assert.equal(this.$('.ember-table-header-block').length, 2);

  assert.equal(this.$('span:contains(Column1)').length, 1);
  assert.equal(this.$('span:contains(Column2)').length, 1);
  assert.equal(this.$('span:contains(Column3)').length, 1);
  assert.equal(this.$('span:contains(Group1)').length, 1);

});
