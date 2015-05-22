import Ember from "ember";
import { module, test } from 'qunit';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';
import ColumnDefinition from 'ember-table/models/column-definition';

var group, firstColumn, secondColumn, thirdColumn;

module('column group definition', {
  beforeEach: function() {
    firstColumn = ColumnDefinition.create({
      headerCellName: 'Column1',
      getCellContent: function(row) {
        return row.get('c');
      }
    });
    secondColumn = ColumnDefinition.create({
      headerCellName: 'Column2',
      getCellContent: function(row) {
        return row.get('b');
      }
    });
    group = ColumnGroupDefinition.create({
      headerCellName: 'Group1',
      innerColumns: [firstColumn, secondColumn]
    });
  }
});

test('should resize last inner column', function(assert) {
  var widthBefore = secondColumn.get('savedWidth');
  var widthAdd = 100;

  group.resize(group.get('savedWidth') + widthAdd);

  assert.ok(secondColumn.get('savedWidth') === widthBefore + widthAdd);
});


module('column group definition 3 columns', {
  beforeEach: function() {
    firstColumn = ColumnDefinition.create({
      headerCellName: 'Column1',
      getCellContent: function(row) {
        return row.get('c');
      }
    });
    secondColumn = ColumnDefinition.create({
      headerCellName: 'Column2',
      getCellContent: function(row) {
        return row.get('b');
      }
    });
    thirdColumn = ColumnDefinition.create({
      headerCellName: 'Column3',
      getCellContent: function(row) {
        return row.get('c');
      }
    });
    group = ColumnGroupDefinition.create({
      headerCellName: 'Group1',
      innerColumns: [firstColumn, secondColumn, thirdColumn ]
    });
  }
});

test('should resize last inner column when group size become larger', function(assert) {
  var widthBefore = thirdColumn.get('savedWidth');
  var widthAdd = 100;

  group.resize(group.get('savedWidth') + widthAdd);

  assert.ok(thirdColumn.get('savedWidth') === widthBefore + widthAdd);
});

test('should resize last inner column when group size become smaller', function(assert) {
  var widthBefore = thirdColumn.get('savedWidth');
  var widthAdd = -100;

  group.resize(group.get('savedWidth') + widthAdd);

  assert.ok(thirdColumn.get('savedWidth') === widthBefore + widthAdd);
});
