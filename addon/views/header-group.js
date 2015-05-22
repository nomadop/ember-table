import Ember from 'ember';
import HeaderBlock from '../views/header-block';

export default HeaderBlock.extend({

  classNameBindings: [ 'columnGroup.groupStyle' ],

  width: Ember.computed.alias('columnGroup.savedWidth'),

  headerHeight: Ember.computed.alias('tableComponent._headerHeight'),

  content: Ember.computed(function() {
    var group = this.get('columnGroup');
    if (group.get('innerColumns')) {
      return [[group], group.get('columns')];
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
