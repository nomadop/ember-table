import Ember from 'ember';
import {
  moduleForComponent,
  test
  }
  from 'ember-qunit';

import ColumnDefinition from 'ember-table/models/column-definition';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';
import LazyArray from 'ember-table/models/lazy-array';

var columns, firstColumn, secondColumn, sortCondition;

moduleForComponent('ember-table', 'sortIndicator', {

  beforeEach: function () {

    firstColumn = ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column1',
      sortBy: function (prev, next) {
        return prev.get('id') - next.get('id');
      },
      getCellContent: function (row) {
        return row.get('a');
      }
    });

    secondColumn = ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column2',
      sortBy: function (prev, next) {
        return prev.get('id') - next.get('id');
      },
      getCellContent: function (row) {
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

test('should show indicator when sort by column', function (assert) {
  this.subject({
    columns: [firstColumn, secondColumn],
    hasFooter: false,
    content: []
  });

  this.$('.ember-table-content-container:contains(Column1)').click();

  assert.ok(this.$('.sort-indicator-icon:contains(Column1)').hasClass('sort-indicator-icon-up'));
});

test('should toggle indicator when click column twice', function (assert) {
  this.subject({
    columns: [firstColumn, secondColumn],
    hasFooter: false,
    content: []
  });
  var columnCellContainer = this.$('.ember-table-content-container:contains(Column2)');
  var columnCell = this.$('.ember-table-header-cell:contains(Column2)');

  columnCellContainer.click();

  assert.ok(columnCell.hasClass('sort-indicator-icon-up'));

  columnCellContainer.click();

  assert.ok(columnCell.hasClass('sort-indicator-icon-down'));
});

test('should only one indicator show at the same time', function(assert) {
  this.subject({
    columns: [firstColumn, secondColumn],
    hasFooter: false,
    content: []
  });
  var firstColumnCellContainer = this.$('.ember-table-content-container:contains(Column1)');
  var secondColumnCellContainer = this.$('.ember-table-content-container:contains(Column2)');
  var firstColumnCell = this.$('.ember-table-header-cell:contains(Column1)');
  var secondColumnCell = this.$('.ember-table-header-cell:contains(Column2)');

  firstColumnCellContainer.click();
  secondColumnCellContainer.click();

  assert.ok(!firstColumnCell.hasClass('sort-indicator-icon-up'));
  assert.ok(secondColumnCell.hasClass('sort-indicator-icon-up'));
});


