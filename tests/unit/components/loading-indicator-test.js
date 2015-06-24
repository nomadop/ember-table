import Ember from 'ember';
import {
  test
}
from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import EmberTableHelper from '../../helpers/ember-table-helper';

var firstRowObjectChildren = [{
  id: 11,
  isLoading: true
}];

var firstRowObject = {
  groupName: 'Group 1',
  id: 1,
  children: firstRowObjectChildren
};

moduleForEmberTable('loading indicator', function(content) {
  return EmberTableFixture.create({
    content: content,
    groupingMetadata: ["", ""],
    height: 157
  });
});

test('render loading indicator', function(assert) {
  var component = this.subject([{id: 1, isLoading: true}]);
  this.render();
  var helper = EmberTableHelper.create({ _assert: assert, _component: component});

  var loadingRow = helper.bodyRows().eq(0);
  assert.equal(loadingRow.find('.loading-indicator').length, 3, 'should render loading indicator');
});


test('expand grouped rows', function(assert) {
  var component = this.subject([firstRowObject]);
  this.render();
  var helper = EmberTableHelper.create({ _assert: assert, _component: component});

  helper.rowGroupingIndicator(0).click();

  var secondRow = helper.bodyRows().eq(1);
  assert.equal(secondRow.find('.loading-indicator').length, 3, 'second row should show 3 loading indicators in normal columns');

  var secondFixedRow = helper.fixedBodyRows().eq(1);
  assert.equal(secondFixedRow.find('.loading-indicator').length, 1, 'second row should show 1 loading indicator in grouping column');

  Ember.run(function(){
	  Ember.set(firstRowObjectChildren[0], 'isLoading', false);
  });

	secondRow = helper.bodyRows().eq(1);
	var firstChildrenId = secondRow.find('.ember-table-content:eq(0)').text().trim();
	assert.equal(firstChildrenId, '11', 'it should render chidlren');
});
