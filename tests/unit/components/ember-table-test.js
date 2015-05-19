import {
  moduleForComponent,
  test
  } from 'ember-qunit';

import ColumnDefinition from 'ember-table/models/column-definition';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';

var columns, firstColumn, secondColumn, thirdColumn, firstGroup;

moduleForComponent('ember-table', 'EmberTableComponent', {

  beforeEach: function () {

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

var setEmberTableWithGroup = function(obj) {
  return obj.subject({
    columns: [firstColumn, firstGroup],
    hasFooter: false,
    enableContentSelection: true
  });
};

var setEmberTableWithoutGroup = function(obj) {
  return obj.subject({
    columns: [firstColumn, secondColumn, thirdColumn],
    hasFooter: false,
    enableContentSelection: true
  });
};

// test hasColumnGroup

test('it should has column group', function (assert) {
  var component = setEmberTableWithGroup(this);

  assert.ok(component.get('hasColumnGroup'));
});

test('it should not has column group', function (assert) {
  var component = setEmberTableWithoutGroup(this);

  assert.ok(!component.get('hasColumnGroup'));
});

// test template

var validateColumnNames = function(assert, obj) {
  assert.equal(obj.$('span:contains(Column1)').length, 1);
  assert.equal(obj.$('span:contains(Column2)').length, 1);
  assert.equal(obj.$('span:contains(Column3)').length, 1);
};

test('it should render all columns in two blocks', function (assert) {
  setEmberTableWithGroup(this);

  validateColumnNames(assert, this);
  assert.equal(this.$('.ember-table-header-block').length, 2);
  assert.equal(this.$('span:contains(Group1)').length, 1);
});

test('it should render all columns in one block', function (assert) {
  setEmberTableWithoutGroup(this);

  validateColumnNames(assert, this);
  assert.equal(this.$('.ember-table-header-block').length, 1);
});
