import Ember from 'ember';

export default Ember.ArrayProxy.extend({
  groupingMetadata: Ember.computed.alias('content.groupingMetadata'),

  grandTotalTitle: Ember.computed.alias('content.grandTotalTitle'),

  _sortConditions: null,

  loadGrandTotal: Ember.computed.alias('content.loadGrandTotal'),

  _content: Ember.computed(function() {
    var sortDirect = this.get('_sortConditions.sortDirect');
    var sortFn = this.get('sortFn');
    var content = this.get('content');
    if(sortDirect){
      return content.slice().sort(sortFn);
    }
    return content.slice();
  }).property('_sortConditions', 'sortFn'),

  objectAt: function(index){
    return this.get('_content').objectAt(index);
  },

  sort: function(callBack) {
    this.set('sortFn', callBack);
  },

  sortFn: Ember.K
});
