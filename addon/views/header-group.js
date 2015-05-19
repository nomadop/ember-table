import Ember from 'ember';
import HeaderBlock from '../views/header-block';

export default HeaderBlock.extend({
  width: Ember.computed(function() {
    return this.get('columnGroup').get('savedWidth');
  }),

  headerHeight: Ember.computed.alias('tableComponent._headerHeight'),

  content: Ember.computed(function() {
    var group = this.get('columnGroup');
    if (group.get('innerColumns')) {
      return [[group], group.get('innerColumns')];
    } else {
      group.set('headerCellHeight', this.get('headerHeight') * 2);
      return [[group]];
    }
  }).property('columnGroup'),

  createChildView: function(viewClass, attrs) {
    var vc = viewClass.extend({
      top: attrs.contentIndex * this.get('headerHeight'),
      width: this.get('width'),
      height: this.get('headerHeight') * 2 / this.get('content').length
    });
    return this._super(vc, attrs);
  }
});
