import Ember from 'ember';
import {
  moduleForComponent,
  test
}
from 'ember-qunit';

import ColumnDefinition from 'ember-table/models/column-definition';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';

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

    thirdColumn = ColumnDefinition.create({
      textAlign: 'text-align-left',
      headerCellName: 'Column3',
      getCellContent: function(row) {
        return row.get('c');
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

test('it should has column group', function(assert) {
  var component = setEmberTableWithGroup(this);

  assert.ok(component.get('hasColumnGroup'));
});

test('it should not has column group', function(assert) {
  var component = setEmberTableWithoutGroup(this);

  assert.ok(!component.get('hasColumnGroup'));
});

// test template

var validateColumnNames = function(assert, obj) {
  assert.equal(obj.$('span:contains(Column1)').length, 1);
  assert.equal(obj.$('span:contains(Column2)').length, 1);
  assert.equal(obj.$('span:contains(Column3)').length, 1);
};

test('it should render all columns in two blocks', function(assert) {
  setEmberTableWithGroup(this);

  validateColumnNames(assert, this);
  assert.equal(this.$('.ember-table-header-block').length, 2);
  assert.equal(this.$('span:contains(Group1)').length, 1);
});

test('it should render all columns in one block', function(assert) {
  setEmberTableWithoutGroup(this);

  validateColumnNames(assert, this);
  assert.equal(this.$('.ember-table-header-block').length, 1);
});

test('it should render the group with group class', function(assert) {
  setEmberTableWithGroup(this);

  assert.equal(this.$('.group-1-class').length, 1);
});

test('it should set cell class of group name cell', function(assert) {
  setEmberTableWithGroup(this);

  assert.equal(this.$('.group-1-class .group-1-cell-class').text().trim(), 'Group1');
});

test('it should render grouped columns with class group-1-inner-column', function(assert) {
  setEmberTableWithGroup(this);

  var columnElements = this.$('.group-1-class .group-1-inner-column');
  assert.equal(columnElements.length, 2);
  assert.equal(columnElements.first().text().trim(), 'Column2');
  assert.equal(columnElements.last().text().trim(), 'Column3');
});

test('it shoulld set the first column class in group', function(assert) {
  setEmberTableWithGroup(this);

  assert.equal(this.$('.group-1-first-column').text().trim(), 'Column2');
});

test('it should set the last column class in group', function(assert) {
  setEmberTableWithGroup(this);

  assert.equal(this.$('.group-1-last-column').text().trim(), 'Column3');
});

function getGroupColumnWidth(table) {
  return table.$('.ember-table-header-container ' +
    '.ember-table-header-block:nth-child(2) ' +
    '.ember-table-header-row:nth-child(1)').width();
}

test('Should resize group width when inner column size changed', function(assert) {
  setEmberTableWithGroup(this);
  assert.ok(getGroupColumnWidth(this) === 300, 'Should be width before change');

  Ember.run(function () {
    thirdColumn.set('savedWidth', 500);
  });
  assert.ok(getGroupColumnWidth(this) === 650, 'Should be width after change');
});

