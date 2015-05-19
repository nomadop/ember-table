import Ember from 'ember';

export default Ember.ArrayProxy.extend({
  //Total count of rows
  totalCount: undefined,

  // Function to get next chunk of rows.
  // The callback should return a promise which will return an array of rows.
  // The callback function should maintain the sequence of chunks,
  // first call to it should return first chunk, next call to it should return next chunk.
  callback: undefined,

  init: function () {
    var lazyContent = [];
    var totalCount = this.get('totalCount');
    for (var i = 0; i < totalCount; i++) {
      lazyContent.push(Ember.ObjectProxy.create({isLoaded: false}));
    }
    this.set('_lazyContent', lazyContent);
    this.set('_loadedCount', 0);
    this.set('_isLoading', false);
    this.set('_maxIndexRequested', 0);
  },

  objectAt: function (index) {
    var lazyContent = this.get('_lazyContent');
    var isLoading = this.get('_isLoading');
    if (isLoading) {
      if (index > this.get('_maxIndexRequested')) {
        this.set('_maxIndexRequested', index);
      }
      return lazyContent[index];
    }
    if (this.shouldLoadMore(index)) {
      this.loadMore(index);
    }
    return lazyContent[index];
  },

  length: Ember.computed.alias('totalCount'),

  loadMore: function (index) {
    var callback = this.get('callback');
    var lazyContent = this.get('_lazyContent');
    var loadedCount = this.get('_loadedCount');
    this.set('_isLoading', true);
    var chunksNeeded = parseInt((index + 11 - loadedCount) / 100) + 1;
    var promises = [];
    for (var i = 0; i < chunksNeeded; i++) {
      promises.push(callback());
    }
    var _this = this;
    Ember.RSVP.all(promises).then(function (chunks) {
      var ret = chunks.reduce(function (result, chunk) {
        return result.concat(chunk);
      }, []);
      for (var x = 0; x < ret.length; x++) {
        var rowProxy = lazyContent[loadedCount + x];
        rowProxy.set('isLoaded', true);
        rowProxy.set('content', ret[x]);
      }
      _this.set('_loadedCount', loadedCount + ret.length);
      _this.set('_isLoading', false);
      var maxIndexRequested = _this.get('_maxIndexRequested');
      if (_this.shouldLoadMore(maxIndexRequested)) {
        _this.loadMore(maxIndexRequested);
      }
    });
  },

  shouldLoadMore: function (index) {
    var loadedCount = this.get('_loadedCount');
    return loadedCount <= index + 11;
  },
  _lazyContent: null,
  _loadedCount: null,
  _isLoading: null

});
