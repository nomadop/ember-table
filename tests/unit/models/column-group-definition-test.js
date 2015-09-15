import Ember from "ember";
import { module, test} from 'qunit';
import QUnit from 'qunit';
import ColumnGroupDefinition from 'ember-table/models/column-group-definition';
import ColumnDefinition from 'ember-table/models/column-definition';

var group, firstColumn, secondColumn, thirdColumn;

module('column group definition', {
  beforeEach: function () {
    firstColumn = ColumnDefinition.create({
      headerCellName: 'Column1',
      getCellContent: function (row) {
        return row.get('c');
      }
    });
    secondColumn = ColumnDefinition.create({
      headerCellName: 'Column2',
      getCellContent: function (row) {
        return row.get('b');
      }
    });
    group = ColumnGroupDefinition.create({
      headerCellName: 'Group1',
      innerColumns: [firstColumn, secondColumn]
    });
  }
});

test('should resize last inner column', function (assert) {
  var widthBefore = secondColumn.get('savedWidth');
  var widthAdd = 100;

  group.resize(group.get('savedWidth') + widthAdd);

  assert.ok(secondColumn.get('savedWidth') === widthBefore + widthAdd);
});


module('column group definition 3 columns', {
  beforeEach: function () {
    firstColumn = ColumnDefinition.create({
      headerCellName: 'Column1',
      getCellContent: function (row) {
        return row.get('c');
      }
    });
    secondColumn = ColumnDefinition.create({
      headerCellName: 'Column2',
      getCellContent: function (row) {
        return row.get('b');
      }
    });
    thirdColumn = ColumnDefinition.create({
      headerCellName: 'Column3',
      getCellContent: function (row) {
        return row.get('c');
      }
    });
    group = ColumnGroupDefinition.create({
      headerCellName: 'Group1',
      innerColumns: [firstColumn, secondColumn, thirdColumn]
    });
  }
});

test('should resize last inner column when group size become larger', function (assert) {
  var widthBefore = thirdColumn.get('savedWidth');
  var widthAdd = 100;

  group.resize(group.get('savedWidth') + widthAdd);

  assert.ok(thirdColumn.get('savedWidth') === widthBefore + widthAdd);
});

test('should resize last inner column when group size become smaller', function (assert) {
  var widthBefore = thirdColumn.get('savedWidth');
  var widthAdd = -100;

  group.resize(group.get('savedWidth') + widthAdd);

  assert.ok(thirdColumn.get('savedWidth') === widthBefore + widthAdd);
});

test('Should change inner columns when reorder inner column', function (assert) {
  let firstCol = group.innerColumns[0];
  let secondCol = group.innerColumns[1];

  Ember.run(function () {
    group.reorder(1, firstCol);
  });

  assert.equal(group.innerColumns[0], secondCol);
  assert.equal(group.innerColumns[1], firstCol);
});

module('column group definition min width', {
  beforeEach: function () {
    firstColumn = ColumnDefinition.create({
      headerCellName: 'Column1',
      minWidth: 25,
      getCellContent: function (row) {
        return row.get('c');
      }
    });
    secondColumn = ColumnDefinition.create({
      headerCellName: 'Column2',
      minWidth: 25,
      getCellContent: function (row) {
        return row.get('b');
      }
    });
    group = ColumnGroupDefinition.create({
      headerCellName: 'Group1',
      innerColumns: [firstColumn, secondColumn]
    });
  }
});

test('min width', function (assert) {
  assert.ok(group.get('minWidth') === 175,
    'should be sum of width of first column and min width of last column ');
});

test('depends on innerColumns.@each.width', function (assert) {
  group.get('minWidth');

  firstColumn.resize(100);

  assert.ok(group.get('minWidth') === 125, 'should recompute when inner column changes width');
});


test('depends on innerColumns.lastObject.minWidth', function (assert) {
  group.get('minWidth');

  secondColumn.set('minWidth', 50);

  assert.ok(group.get('minWidth') === 200, 'should recompute when last inner column changes min width');
});

module('column group definition inner-column style', {
  beforeEach: function () {
    firstColumn = ColumnDefinition.create({
      headerCellName: 'Column1'
    });
    secondColumn = ColumnDefinition.create({
      headerCellName: 'Column2'
    });
    thirdColumn = ColumnDefinition.create({
      headerCellName: 'Column3'
    });
    group = ColumnGroupDefinition.create({
      headerCellName: 'Group1',
      innerColumns: [firstColumn, secondColumn, thirdColumn]
    });
    QUnit.assert.cellStylesEqual = function(expected, message) {
      var actual = [firstColumn.get('cellStyle'), secondColumn.get('cellStyle'), thirdColumn.get('cellStyle')];
      this.deepEqual(actual, expected, message);
    };
  },
  afterEach: function () {
    firstColumn = undefined;
    secondColumn = undefined;
    thirdColumn = undefined;
    QUnit.assert.cellStylesEqual = undefined;
  }
});

test('apply innerColumnStyle', function(assert) {
  Ember.run(function() {
    group.set('innerColumnStyle', 'text-red');
  });

  assert.cellStylesEqual(['text-red', 'text-red', 'text-red']);
});

test('apply firstColumnStyle', function(assert) {
  Ember.run(function() {
    group.set('firstColumnStyle', 'text-red');
  });

  assert.cellStylesEqual(['text-red', '', '']);
});

test('apply lastColumnStyle', function(assert) {
  Ember.run(function() {
    group.set('lastColumnStyle', 'text-red');
  });

  assert.cellStylesEqual(['', '', 'text-red']);
});

test('apply all styles', function(assert) {
  Ember.run(function() {
    group.set('firstColumnStyle', 'text-gray');
    group.set('innerColumnStyle', 'text-red');
    group.set('lastColumnStyle', 'text-blue');
  });

  assert.cellStylesEqual(['text-gray text-red', 'text-red', 'text-blue text-red']);
});
