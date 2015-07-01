import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';

moduleForEmberTable('grand total', function () {
  return EmberTableFixture.create({
    height: 330,
    width: 700,
    content: Ember.ArrayProxy.create({
      groupingMetadata: [""],
      content: [
        {
          id: 1,
          children: [
            {
              id: 11
            }
          ]
        }
      ],
      grandTotalTitle: "Total"
    })
  });
});

test('render grand total cell', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  assert.equal(helper.fixedBodyCell(0, 0).text().trim(), 'Total');
});

test('render grouping indicator', function (assert) {
  var component = this.subject();
  this.render();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  helper.rowGroupingIndicator(0).click();

  assert.equal(helper.rowGroupingIndicator(1).length, 1, 'second row is expandable');
});
