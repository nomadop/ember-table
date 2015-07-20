import Ember from 'ember';
import TableContent from './table-content';

var GroupedArray = TableContent.extend({

  groupingLevel: 0,

  init: function () {
    this.wrapSubChildren();
  },

  groupingMetadata: Ember.computed(function (key, value) {
    return value || this.get('content.groupingMetadata') || this.get('parent.groupingMetadata');
  }).property('parent.groupingMetadata'),

  _sortConditions: Ember.computed(function (key, value) {
    return value || this.get('parent._sortConditions');
  }).property('parent._sortConditions'),

  wrapSubChildren: function () {
    var self = this;
    var content = this.get('content');
    content.forEach(function (item) {
      var children = Ember.get(item, 'children');
      if (children) {
        Ember.set(item, 'children', GroupedArray.create({
          content: children,
          groupingLevel: self.groupingLevel + 1,
          parent: self,
        }));
      }
    });
  },

  isLeafCollection: Ember.computed(function () {
    return this.get('groupingLevel') === this.get('groupingMetadata.length') - 1;
  }).property('groupingLevel', 'groupingMetadata.[]'),

  _content: Ember.computed(function () {
    var content = this.get('content');
    if (!this.get('isLeafCollection')) {
      return content;
    }
    return this._super();
  }).property('_sortConditions'),

  objectAt: function (index) {
    return this.get('_content').objectAt(index);
  }
});

export default GroupedArray;
