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

moduleForComponent('ember-table', 'EmberTableComponent', {

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
    'view:header-groups-block',
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

test('should call set sort function with clicked column when sort partial data', function (assert) {
  assert.expect(1);
  var done = assert.async();
  var component = this.subject({
    columns: [firstColumn, secondColumn],
    hasFooter: false,
    enableContentSelection: true,
    content: []
  });
  this.$();
  component.set('setSortConditionBy', 'setSort');
  component.set('targetObject', Ember.Object.create({
    setSort: function (column) {
      assert.equal(column, firstColumn);
      done();
    }
  }));

  this.$('span:contains(Column1)').click();
});

