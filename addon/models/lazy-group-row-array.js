import Ember from 'ember';
import GroupingRowProxy from './grouping-row-proxy';

export default Ember.ArrayProxy.extend({
  loadChildren: Ember.K,
  onLoadError: Ember.K,
  groupingLevel: 0,
  groupingMetadata: null,
  parentQuery: {},
  parent: null,
  sortFn: Ember.K,
  isEmberTableContent: true,

  init: function () {
    this.set('content', Ember.A());
    this._super();
    this.addLoadingPlaceHolder();
  },

  loadOneChunk: function(chunkIndex) {
    var query = {};
    Ember.setProperties(query, this.get('parentQuery'));
    if(this.get('isLeafParent') && this.get('_sortConditions.sortDirect')){
      Ember.setProperties(query, Ember.getProperties(this.get('_sortConditions'), 'sortName', 'sortDirect'));
    }
    return this.loadChildren(chunkIndex, query);
  },

  wrapLoadedContent: function (row) {
    if (this.get('isGroupingRow')) {
      var groupingMetadata = this.get('groupingMetadata');
      return GroupingRowProxy.create({
        groupingMetadata: groupingMetadata,
        groupingLevel: this.get('groupingLevel'),
        content: row,
        loadChildren: this.loadChildren,
        onLoadError: this.onLoadError,
        parent: this,
        parentQuery: this.get('parentQuery')
      });
    } else {
      return row;
    }
  },

  isLeafParent: Ember.computed(function(){
    return this.get('groupingLevel') === this.get('groupingMetadata.length') - 1;
  }).property('groupLevel', 'groupingMetadata.[]'),

  _content: Ember.computed(function() {
    var content = this.get('content');
    if(!this.get('isLeafParent')){
      return content;
    }
    var sortDirect = this.get('_sortConditions.sortDirect');
    var sortFn = this.get('_sortConditions.sortFn');
    if(this.get('isCompleted') && sortDirect){
      return content.slice().sort(sortFn);
    } else if(sortDirect){
      return Ember.A([
        Ember.ObjectProxy.create({"isLoading": true, "isLoaded": false, "isError":false})
      ]);
    }
    return content;
  }).property('_sortConditions'),

  sort: Ember.K,

  //sort: function (callback){
  //  var isLeafParent = this.get('isLeafParent');
  //  var isCompleted = this.get('isCompleted');
  //  if (isLeafParent) {
  //    console.log('isCompleted', isCompleted);
  //    if(!isCompleted) {
  //      console.log('content length', this.get('content').length);
  //      this.get('content').clear();
  //      this.addLoadingPlaceHolder('content');
  //      console.log('content length', this.get('content').length);
  //    }
  //    this.set('sortFn', callback);
  //    this.notifyPropertyChange('_content');
  //  } else {
  //    var loadedLength = this.get('length');
  //    if(!isCompleted){
  //      loadedLength--;
  //    }
  //    for(var i=0; i < loadedLength; i++){
  //      var item = this.objectAt(i);
  //      var itemContent = item.get('content');
  //      if (itemContent && itemContent.cacheFor('children')) {
  //        item.get('children').sort(callback);
  //      }
  //    }
  //  }
  //},

  // As a root data provider, `_sortConditions` should be set when sort.
  _sortConditions: Ember.computed.oneWay('parent._sortConditions'),

  /*---------------Override ArrayProxy -----------------------*/
  objectAtContent: function (index) {
    var object = this.get('_content').objectAt(index);
    if (object && object.get('isLoading') && !this.get('_hasInProgressLoading')) {
      this.triggerLoading(index);
    }
    return object;
  },

  /*---------------Private methods -----------------------*/
  isGroupingRow: Ember.computed(function() {
    return this.get('groupingLevel') < this.get('groupingMetadata.length');
  }).property('groupingMetadata.[]', 'groupingLevel'),

  _group: Ember.computed(function() {
    if (this.get('isGroupingRow')) {
      var groupingMetadata = this.get('groupingMetadata');
      var groupingLevel = this.get('groupingLevel');
      return groupingMetadata[groupingLevel];
    }
    return null;
  }).property('groupingMetadata.[]', 'groupingLevel'),

  triggerLoading: function (index) {
    this.set('_hasInProgressLoading', true);
    var chunkIndex = this.chunkIndex(index);
    var group = this.get('_group');
    var self = this;
    this.loadOneChunk(chunkIndex).then(function (result) {
      self.onOneChunkLoaded(result);
      self.set('_hasInProgressLoading', false);
      self.notifyPropertyChange('length');
    }).catch(function() {
      self.set('_hasInProgressLoading', false);
      self.onLoadError("Failed to load data.", group, chunkIndex);
    });
  },

  chunkIndex: function (index) {
    var chunkSize = this.get('chunkSize');
    if (!chunkSize) {
      return 0;
    }
    return Math.floor(index / chunkSize);
  },

  onOneChunkLoaded: function (result) {
    var _content = this.get('_content');
    this.setProperties(result.meta);
    var chunk = result.content;
    if (chunk.get('length') > 0) {
      this.updatePlaceHolderWithContent(this.wrapLoadedContent(chunk.get('firstObject')));
      var self = this;
      var chunkObjects = chunk.slice(1).map(function (x) {
        return Ember.ObjectProxy.create({"isLoaded": true, "isError": false, "content": self.wrapLoadedContent(x)});
      });
      _content.pushObjects(chunkObjects);
      if (this.get('length') < this.get('totalCount')) {
        this.addLoadingPlaceHolder('_content');
      }
    } else {
      _content.removeObject(this.get('lastObject'));
    }
  },

  addLoadingPlaceHolder: function (propertyName) {
    var content = this.get(propertyName || 'content');
    content.pushObject(Ember.ObjectProxy.create({"isLoading": true, "isLoaded": false, "isError":false}));
  },

  updatePlaceHolderWithContent: function (content) {
    var _content = this.get('_content');
    var lastObject = _content.get('lastObject');
    lastObject.setProperties({
      'content': content,
      'isLoading': false,
      'isLoaded': true
    });
  },

  updatePlaceHolderWithError: function () {
    var _content = this.get('_content');
    var lastObject = _content.get('lastObject');
    if (lastObject.get('isLoading')) {
      lastObject.set('isError', true);
    }
  },

  length: Ember.computed.oneWay('_content.length'),

  isCompleted: Ember.computed(function(){
    var content = this.get('content');
    return !content.some(function(item){
      return item.get('isLoading');
    });
  }).property('content.@each.isLoading'),

  totalCount: null,

  chunkSize: null,

  _hasInProgressLoading: false
});
