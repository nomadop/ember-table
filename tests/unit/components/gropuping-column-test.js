import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import TableDom from '../../helpers/table-dom';

moduleForEmberTable('Resize grouping column', (groupingColumnResizable) => {
  return EmberTableFixture.create({
    groupMeta: {
      groupingColumnResizable,
      groupingMetadata: [
        {id: 'accountSection'},
        {id: 'accountType'},
      ]
    },
    content: [
      {id: 1, accountSection: 'as-1', children:[
        {id: 11, accountType: 'at-11'}
      ]},
      {id: 2, accountSection: 'as-2'}
    ]
  });
});

test('Can not resize grouping column', function(assert) {
  var component = this.subject();
  this.render();
  var tableDom = TableDom.create({content: component.$()});
  var groupingColumnHeader = tableDom.headerRows(0).cell(0);
  var widthBeforeResize = groupingColumnHeader.width();
  var distanceX = 60;
  Ember.run(() => groupingColumnHeader.resizeX(distanceX));
  var widthAfterResize = groupingColumnHeader.width();
  assert.equal(widthAfterResize, widthBeforeResize);
});


test('resize grouping column', function(assert) {
  var component = this.subject(true);
  this.render();
  var tableDom = TableDom.create({content: component.$()});
  var groupingColumnHeader = tableDom.headerRows(0).cell(0);
  var widthBeforeResize = groupingColumnHeader.width();
  var distanceX = 60;
  Ember.run(() => groupingColumnHeader.resizeX(distanceX));
  var widthAfterResize = groupingColumnHeader.width();
  assert.equal(widthAfterResize, widthBeforeResize + distanceX);
});

test('Resizable grouping column does not auto adjust width', function(assert) {
  var component = this.subject(true);
  this.render();
  var tableDom = TableDom.create({content: component.$()});
  var groupingColumnHeader = tableDom.headerRows(0).cell(0);
  var widthBeforeResize = groupingColumnHeader.width();
  Ember.run(() => tableDom.rows(0).groupIndicator().click());
  var widthAfterResize = groupingColumnHeader.width();
  assert.equal(widthAfterResize, widthBeforeResize);
});
