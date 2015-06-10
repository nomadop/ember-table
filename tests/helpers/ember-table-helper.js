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

  assertGroupColumnHeader: function assertGroupColumnHeader(colIndex, headerCellName, message) {
    var assert = this.get('_assert');
    var groupHeader = this.getGroupHeaderCell(colIndex);
    assert.ok(groupHeader.find('span').text().trim() === headerCellName, message);
  },

  assertFixedColumnHeader: function assertFixedColumnHeader(headerCellName, message) {
    var assert = this.get('_assert');
    var component = this.get('_component');
    var headerCell = component.$('.ember-table-left-table-block .ember-table-header-cell');
    assert.ok(headerCell.find('span').text().trim() === headerCellName, message);
  },

  assertFixedColumnGroupHeader: function assertFixedColumnGroupHeader(headerCellName, message) {
    var assert = this.get('_assert');
    var component = this.get('_component');
    var columnHeader = component.$('.ember-table-left-table-block .ember-table-header-block:nth-child(1)');
    var groupHeader = columnHeader.find('.ember-table-table-row:nth-child(1) .ember-table-header-cell');
    assert.equal(groupHeader.find('span').text().trim(), headerCellName, message);
  },

  assertBodyContentCellCountInRow: function assertBodyContentCellCountInRow(cellCount, message) {
    var assert = this.get('_assert');
    var component = this.get('_component');
    var row = component.$('.ember-table-body-container .ember-table-right-table-block .ember-table-table-row:nth-child(1)');
    assert.equal(row.find('.ember-table-cell').length, cellCount, message);
  },

  dragToRight: function dragToRight(colIndex, offset) {
    var groupHeaderCell = this.getGroupHeaderCell(colIndex);
    groupHeaderCell.simulate('drag', {dx: offset});
  }


});
