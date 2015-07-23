import Ember from 'ember';


export default Ember.Object.extend({

  init:  function() {
    this.set('_columns', Ember.A());
  },

  _columns: null,

  update: function (column, event) {
    this.propertyWillChange('_columns');
    var columns = this.get('_columns');
    if (columns.indexOf(column) !== -1) {
      columns.removeObject(column);
    }
    columns.pushObject(column);
    columns.forEach(function(item) {
      if (item === column) {
        item.toggleSortState(event.ctrlKey || event.metaKey);
      } else {
        if (!(event.ctrlKey || event.metaKey)) {
          item.changeToUnsortedState();
        }
      }
    });
    this.set('_columns', columns.filterBy('isSorted', true));
    this.propertyDidChange('_columns');
  },

  isNotEmpty: Ember.computed(function () {
    return this.get('_columns').length > 0;
  }).property('_columns.@each'),

  sortBy: function (prev, next) {
    var columns = this.get('_columns');
    for (var i = 0; i < columns.length; i++) {
      var sortingColumn = columns[i];
      var singleColumnCompareResult = sortingColumn.sortFn(prev, next);
      if (singleColumnCompareResult !== 0) {
        return singleColumnCompareResult;
      }
    }
    return 0;
  },

  map: function (fn) {
    var columns = this.get('_columns');
    return columns.map(fn);
  },

  // 0-based index of columns
  findOrder: function(column) {
    var columns = this.get('_columns');
    if(!columns || !column) {
      return 0;
    }
    return columns.indexOf(column) + 1;
  }
});
