import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import ColumnFixture from '../../fixture/columns';
import EmberTableFixture from '../../fixture/ember-table';

moduleForEmberTable("Grouped rows work with column groups", function() {
  var column = ColumnFixture.create();
  return EmberTableFixture.create({
    content: [{}, {}],
    groupMeta: {
      groupingMetadata: [{id: 'fl'}, {id: 'sl'}]
    },
    columns: [column.get('firstColumn'), column.get('firstGroup')],
    height: 1000
  });
});

test('table header', function(assert) {
  var component = this.subject();
  this.render();
  var header = component.$('.ember-table-header-container');
  var names = header.find('.ember-table-cell').toArray().map(function(cell) {
    return $(cell).text().trim();
  });
  assert.deepEqual(names, [
    '', //groupName
    'Column1', // firstColumn
    'Group1', // firstGroup
    'Column2', // first inner column in first Group
    'Column3' // last inner column in first Group
  ]);
});
