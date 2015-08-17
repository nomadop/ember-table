import Ember from 'ember';

var Grouping = Ember.Object.extend({
  groupingMetadata: null,
  groupingLevel: null,
  contents: [],
  isLeafParent: Ember.computed(function () {
    return this.get('groupingLevel') === this.get('groupingMetadata.length') - 2;
  }).property('groupingLevel', 'groupingMetadata.[]'),

  isGroup: Ember.computed(function () {
    return this.get('groupingLevel') < this.get('groupingMetadata.length') - 1;
  }).property('groupingMetadata.[]', 'groupingLevel'),

  key: Ember.computed.oneWay('grouper.id'),

  sortDirection: Ember.computed.oneWay('grouper.sortDirection'),

  grouper: Ember.computed(function() {
    return this.getGrouper(this.get('groupingLevel'));
  }).property('groupingLevel', 'groupingMetadata.[]'),

  getGrouper: function(groupingLevel) {
    return groupingLevel >= 0 ? this.get('groupingMetadata').objectAt(groupingLevel) : null;
  },

  isGrandTotal: Ember.computed.equal('groupingLevel', -1),

  nextLevel: function (content) {
    var contents = this.get('contents').slice();
    if (this.get('groupingLevel') >= 0) {
      contents = contents.concat([content]);
    }
    return Grouping.create({
      groupingMetadata: this.get('groupingMetadata'),
      groupingLevel: this.get('groupingLevel') + 1,
      contents: contents
    });
  },

  query: Ember.computed(function () {
    return {
      key: this.get('key'),
      upperGroupings: this.get('upperGroupings')
    };
  }).property('contents.[]', 'key'),

  upperGroupings: Ember.computed(function () {
    var self = this;
    var contents = this.get('contents');
    return contents.map(function (x, i) {
      return [Ember.get(self.getGrouper(i), 'id'), x];
    });
  }),

  sortContent: function(arrayContent) {
    var key = this.get('key');
    var sortDirection = this.get('sortDirection');
    if (!sortDirection) {
      return arrayContent;
    }
    return arrayContent.slice().sort(function (prev, next) {
      return Ember.compare(prev[key], next[key]) * (sortDirection === 'asc' ? 1 : -1);
    });
  }

});

export default Grouping;
