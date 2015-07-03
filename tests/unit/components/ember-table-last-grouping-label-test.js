import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table-with-GL-data';
import EmberTableHelper from '../../helpers/ember-table-helper';
import LazyGroupRowArray from 'ember-table/models/lazy-group-row-array';
import DeferPromises from '../../fixture/defer-promises';

moduleForEmberTable('one level grouping',
  function (defers) {
    return EmberTableFixture.create({
      height: 600,
      width: 700,
      defers: defers,
      groupingMetadata: [{id: "accountSection"}, {id: "accountType"}]
    });
  });

test('show last grouping label', function (assert) {
  var defers = DeferPromises.create({count: 2});
  var component = this.subject(defers);
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  this.render();

  defers.ready(function() {
    var firstRowIndicator = helper.rowGroupingIndicator(0);
    assert.equal(firstRowIndicator.length, 1, 'first row should be grouping row');
    firstRowIndicator.click();
  }, [0]);

  return defers.ready(function () {
    assert.equal(helper.fixedBodyCell(1, 0).text().trim(), 'accountType-0', 'last grouping label should be visible');
    assert.equal(helper.rowGroupingIndicator(1).length, 0, 'should have no grouping indicator for last grouping');
  });
});
