import Ember from 'ember';

export default Ember.ArrayProxy.extend({
  //Total count of rows
  totalCount: undefined,

  loadingCount: 0,

  sortingColumns: null,

  // Function to get next chunk of rows.
  // The callback should return a promise which will return an array of rows.
  // The callback function should maintain the sequence of chunks,
  // first call to it should return first chunk, next call to it should return next chunk.
  callback: undefined,

  chunkSize: undefined,

  // This is a content or _lazyContent cache for sortable order
  _contentCache: Ember.computed(function() {
    var content = this.get('content');
    if (this.get('needSort')) {
      if(this.get('isCompleted')){
        var sortingColumns = this.get('sortingColumns');
        return sortingColumns.sortContent(content);
      } else{
        return Ember.A();
      }
    }
    return content;
  }).property('sortingColumns._columns'),

  needSort: Ember.computed.oneWay('sortingColumns.isNotEmpty'),

  isEmberTableContent: true,

  init: function () {
    var totalCount = this.get('_totalCount');
    var lazyContent = new Array(totalCount);
    this.set('content', lazyContent);
  },

  objectAt: function (index) {
    var cacheContent = this.get('_contentCache');
    var chunkSize = this.get('chunkSize');
    if (!cacheContent[index] || cacheContent[index].get('isError')) {
      this.loadOneChunk(Math.floor(index / chunkSize));
    }
    this.tryPreload(index, chunkSize);
    return cacheContent[index];
  },

  length: Ember.computed.alias('_totalCount'),

  loadOneChunk: function (chunkIndex) {
    var lazyContent = this.get('_contentCache');
    var chunkSize = this.get('chunkSize');
    var chunkStart = chunkIndex * chunkSize;
    var totalCount = this.get('_totalCount');
    var self = this;
    for (var x = 0; x < chunkSize && chunkStart + x < totalCount; x++) {
      if (!lazyContent[chunkStart + x]) {
        lazyContent.replace(chunkStart + x, 1, Ember.ObjectProxy.create({"isLoaded": false, "isError": false}));
      } else {
        lazyContent[chunkStart + x].setProperties({"isLoaded": false, "isError": false});
      }
    }
    this.incrementProperty('loadingCount');
    this.callback(chunkIndex, this.get('sortingColumns')).then(function (chunk) {
      lazyContent.slice(chunkStart, chunkStart + chunkSize)
        .forEach(function (row, x) {
          row.set('isLoaded', true);
          row.set('content', chunk[x]);
        });
      self.decrementProperty('loadingCount');
    }, function () {
      lazyContent.slice(chunkStart, chunkStart + chunkSize)
        .forEach(function (row) {
          row.set('isError', true);
        });
      self.decrementProperty('loadingCount');
    });
  },

  tryPreload: function (index, chunkSize) {
    var chunkEndIndex = Math.floor(index / chunkSize + 1) * chunkSize - 1;
    var lastRowIndex = this.get('_totalCount') - 1;
    if (chunkEndIndex >= lastRowIndex) { return; }

    if (chunkEndIndex - index <= this.get('_preloadGate')) {
      this.objectAt(chunkEndIndex + 1);
    }
  },

  _totalCount: Ember.computed(function() {
    return parseInt(this.get('totalCount'));
  }).property('totalCount'),

  isCompleted: Ember.computed(function(){
    var content = this.get('content');
    var hasUnloaded = content.getEach('isLoaded').any(function(isLoaded){ return !isLoaded; });
    return  !hasUnloaded && content.length === this.get('totalCount');
  }).property('content.@each.isLoaded', 'totalCount'),

  // TODO:(Stephen): This property indicate the value of preload count, and it will be override by user if need.
  // Should change to percentage of 'Chunksize' ?
  _preloadGate: 10
});
