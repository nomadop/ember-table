import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';

import ColumnDefinition from 'ember-table/models/column-definition';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';
import LazyArray from 'ember-table/models/lazy-array';
import TableFixture from '../../fixture/table';

var tableFixture = TableFixture.create();
moduleForEmberTable('sortIndicator');

test('should show indicator when sort by column', function (assert) {
  tableFixture.table(this);

  this.$('.ember-table-content-container:contains(Column1)').click();

  assert.ok(this.$('.sort-indicator-icon:contains(Column1)').hasClass('sort-indicator-icon-up'));
});

test('should toggle indicator when click column twice', function (assert) {
  tableFixture.table(this);

  var columnCellContainer = this.$('.ember-table-content-container:contains(Column2)');
  var columnCell = this.$('.ember-table-header-cell:contains(Column2)');

  columnCellContainer.click();

  assert.ok(columnCell.hasClass('sort-indicator-icon-up'));

  columnCellContainer.click();

  assert.ok(columnCell.hasClass('sort-indicator-icon-down'));
});

test('should only one indicator show at the same time', function(assert) {
  tableFixture.table(this);

  var firstColumnCellContainer = this.$('.ember-table-content-container:contains(Column1)');
  var secondColumnCellContainer = this.$('.ember-table-content-container:contains(Column2)');
  var firstColumnCell = this.$('.ember-table-header-cell:contains(Column1)');
  var secondColumnCell = this.$('.ember-table-header-cell:contains(Column2)');

  firstColumnCellContainer.click();
  secondColumnCellContainer.click();

  assert.ok(!firstColumnCell.hasClass('sort-indicator-icon-up'));
  assert.ok(secondColumnCell.hasClass('sort-indicator-icon-up'));
});


