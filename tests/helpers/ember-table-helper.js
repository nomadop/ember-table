import Ember from 'ember';

export default Ember.Object.extend({
  _component: null,
  _assert: null,

  getGroupHeaderCell: function getGroupHeaderCell(colIndex) {
    var component = this.get('_component');
    var columnHeader = component.$('.ember-table-right-table-block .ember-table-header-block:nth-child(' + colIndex + ')');
    var groupHeader = columnHeader.find('.ember-table-table-row:nth-child(1) .ember-table-header-cell');
    return groupHeader;
  },

  assertGroupColumnHeader: function assertGroupColumnHeader(colIndex, headerCellName, description) {
    var assert = this.get('_assert');
    var groupHeader = this.getGroupHeaderCell(colIndex);
    assert.ok(groupHeader.find('span').text().trim() === headerCellName, description);
  },

  assertFixedColumnHeader: function assertFixedColumnHeader(headerCellName, description) {
    var assert = this.get('_assert');
    var component = this.get('_component');
    var headerCell = component.$('.ember-table-left-table-block .ember-table-header-cell');
    assert.ok(headerCell.find('span').text().trim() === headerCellName, description);
  },

  dragToRight: function dragToRight(colIndex, offset) {
    var groupHeaderCell = this.getGroupHeaderCell(colIndex);
    groupHeaderCell.simulate('drag', {dx: offset});
  }


});
