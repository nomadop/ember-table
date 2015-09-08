import Ember from 'ember';

var RowPath = Ember.Object.extend({

  row: null,

  nextLevelKey: Ember.computed.oneWay('row.nextLevelGrouping.key'),

  key: Ember.computed.oneWay('row.grouping.key'),

  nextLevelSortDirection: Ember.computed.oneWay('row.nextLevelGrouping.sortDirection'),

  createChild: function(row) {
    return RowPath.create({
      parent: this,
      row: row
    });
  },

  toQuery: function() {
    return {
      key: this.get('nextLevelKey'),
      upperGroupings: this.get('upperGroupings'),
      sortDirection: this.get('nextLevelSortDirection')
    };
  },

  upperGroupings: Ember.computed(function() {
    var groupings = this.getWithDefault('parent.upperGroupings', []).slice();
    var content = this.get('row.content');
    var key = this.get('key');
    if(key){
      groupings.push([key, content]);
    }
    return groupings;
  }).property('parent.upperGroupings', 'row.content')

});

export default RowPath;
