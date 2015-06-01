import Ember from 'ember';
import HeaderBlock from '../views/header-block';

export default HeaderBlock.extend({
  classNames: ['ember-table-right-table-block', 'sortable'],
  classNameBindings: [ 'columnGroup.groupStyle', 'hasMultiInnerColumns:ember-table-multi-inner-block' ],

  width: Ember.computed.alias('columnGroup.savedWidth'),

  headerHeight: Ember.computed.alias('tableComponent._headerHeight'),

  hasMultiInnerColumns: Ember.computed(function() {
    var innerColumns = this.get('columnGroup.innerColumns');
    return innerColumns && innerColumns.length > 1;
  }).property("columnGroup.innerColumns.[]"),

  createChildView: function(viewClass, attrs) {
    var vc = viewClass.extend({
      top: attrs.contentIndex * this.get('headerHeight'),
      width: this.get('width'),
      height: this.get('headerHeight') * 2 / this.get('content').length,

      //whether this row is top one of a column group header
      // If the group header has only one row, it is top row
      // If the group header has two rows, the first row is top row.
      isTopRow: attrs.contentIndex === 0
    });
    return this._super(vc, attrs);
  }
});
