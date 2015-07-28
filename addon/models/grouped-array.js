import Ember from 'ember';
import TableContent from './table-content';
import Grouping from './grouping';

var GroupedArray = TableContent.extend({

  groupingLevel: 0,

  init: function () {
    this.wrapSubChildren();
  },

  grouping: Ember.computed(function () {
    return Grouping.create({
      groupingMetadata: this.get('content.groupingMetadata'),
      groupingLevel: this.get('groupingLevel')
    });
  }),

  nextLevelGrouping: Ember.computed(function() {
    return this.get('grouping').nextLevel();
  }).property('grouping'),

  wrapSubChildren: function () {
    var self = this;
    var content = this.get('content');
    content.forEach(function (item) {
      var children = Ember.get(item, 'children');
      if (children) {
        Ember.set(item, 'children', GroupedArray.create({
          content: children,
          grouping: self.get('nextLevelGrouping'),
          sortingColumns: self.get('sortingColumns')
        }));
      }
    });
  },

  _content: Ember.computed(function () {
    if (this.get('grouping.isLeafParent')) {
      return this._super();
    }
    return this.get('content');
  }).property('sortingColumns._columns')
});

export default GroupedArray;
