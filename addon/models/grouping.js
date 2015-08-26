import Ember from 'ember';

var Grouping = Ember.Object.extend({
  groupingMetadata: null,
  groupingLevel: null,
  contents: [],
  isGroup: Ember.computed(function () {
    return this.get('groupingLevel') < this.get('groupingMetadata.length') - 1;
  }).property('groupingMetadata.[]', 'groupingLevel'),

  key: Ember.computed.oneWay('grouper.id'),

  sortDirection: Ember.computed.oneWay('grouper.sortDirection'),

  grouper: Ember.computed(function() {
    return this.getGrouper(this.get('groupingLevel'));
  }).property('groupingLevel', 'groupingMetadata.[]'),

  getGrouper: function(groupingLevel) {
    return groupingLevel >= 0 ? this.get('groupingMetadata').objectAt(groupingLevel) : undefined;
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
      upperGroupings: this.get('upperGroupings'),
      sortDirection: this.get('sortDirection')
    };
  }).property('contents.[]', 'key', 'sortDirection'),

  upperGroupings: Ember.computed(function () {
    var self = this;
    var contents = this.get('contents');
    return contents.map(function (x, i) {
      var grouper = self.getGrouper(i);
      return [Ember.get(grouper, 'id'), x, Ember.get(grouper, 'sortDirection')];
    });
  }),

  sortContent: function(arrayContent) {
    var sortFactor = this.get('sortFactor');
    if (!sortFactor) {
      return arrayContent;
    }
    var sortFn = this.get('grouper.sortFn') || this.get('defaultSortFn');
    return arrayContent.slice().sort(function (prev, next) {
      return sortFn(prev, next) * sortFactor;
    });
  },

  sortFactor: Ember.computed(function() {
    var sortDirection = this.get('sortDirection');
    if(sortDirection){
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  }).property('sortDirection'),

  defaultSortFn: Ember.computed(function() {
    var key = this.get('key');
    return function (prev, next) {
      return Ember.compare(Ember.get(prev, key), Ember.get(next, key));
    };
  }).property('key')

});

export default Grouping;
