import Ember from 'ember';
import {
  moduleForComponent,
  test
}
from 'ember-qunit';
import EmberTableFixture from '../../fixture/ember-table';
import LazyArray from 'ember-table/models/lazy-array';
import TableFixture from '../../fixture/table';

var tableFixture = TableFixture.create();
var content = [{
  groupName: 'firstRootGroupName',
  isGroupRow: true,
  id: 100,
  state: 'up'
}, {
  groupName: 'secondRootGroupName',
  id: 1000,
  state: 'up'
}, {
  groupName: 'thirdRootGroupName',
  isGroupRow: false,
  id: 10000,
  state: 'down'
}];

moduleForComponent('ember-table', 'render grouping column', {
  needs: tableFixture.get('needs'),
  subject: function() {
    return EmberTableFixture.create({
      content: content,
      hasGroupingColumn: true,
      height: 300
    });
  }
});


test('it should has a grouping column at most left position', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('hasGroupingColumn', true);
  });

  var fixedColumns = this.$('.ember-table-left-table-block > .ember-table-table-row > .ui-sortable > .ember-table-header-cell');
  assert.equal(fixedColumns.length, 1);
});

test('it should render group name in grouping column', function(assert) {
  var component = this.subject();
  var firstRowGroupColumnName = findCellText(this, 'left', 0, 0);

  assert.equal(firstRowGroupColumnName, 'firstRootGroupName');
});

test('it should not render group indicator in grouping column when the loan is not grouped data', function(assert) {
  var component = this.subject();

  var indicator = this.$('.ember-table-body-container ' +
    '.ember-table-left-table-block ' +
    '.ember-table-table-row:eq(1) ' +
    '.ember-table-cell:eq(0) ' +
    '.grouping-column-indicator');

  assert.equal(indicator.length, 0);
});

test('it should render columns data in columns', function(assert) {
  var component = this.subject();

  var firstRowId = findCellText(this, 'right', 0, 0);
  var firstRowState =findCellText(this, 'right', 0, 2);

  assert.equal(firstRowId, '100');
  assert.equal(firstRowState, 'up');
});

function findCellText(object, blockPosition, rowIndex, cellIndex) {
  return object.$('.ember-table-body-container ' +
    '.ember-table-' + blockPosition + '-table-block ' +
    '.ember-table-table-row:eq(' + rowIndex + ') ' +
    '.ember-table-cell:eq(' + cellIndex + ') ' +
    '.ember-table-content').text().trim();
}
