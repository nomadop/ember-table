import Ember from 'ember';
import GroupingRowProxy from './grouping-row-proxy';

var LoadingPlaceHolder = Ember.ObjectProxy.extend({
  isLoading: true,
  isLoaded: false,
  isError:false,
  contentLoaded: Ember.observer('content', function() {
    this.set('isLoaded', true);
    this.set('isLoading', false);
  })
});

var LazyGroupRowArray = Ember.ArrayProxy.extend({
  status: null,
  loadChildren: Ember.K,
  onLoadError: Ember.K,
  groupingLevel: 0,
  groupingMetadata: null,
  parentQuery: {},
  sortFn: Ember.K,
  isEmberTableContent: true,

  init: function () {
    this.set('content', Ember.A());
    if(!this.get('status')){
      this.set('status', Ember.Object.create({
        loadingCount: 0
      }));
    }
    this._super();
    this.addLoadingPlaceHolder();
  },

  loadOneChunk: function(chunkIndex) {
    var parentQueryCopy = {};
    Ember.setProperties(parentQueryCopy, this.get('parentQuery'));
    return this.loadChildren(chunkIndex, parentQueryCopy, this.get('sortingColumns'));
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
        parentQuery: this.get('parentQuery'),
        status: this.get('status'),
        root: this.get('root') || this
      });
    } else {
      return row;
    }
  },

  isLeafParent: Ember.computed(function(){
    return this.get('groupingLevel') === this.get('groupingMetadata.length') - 1;
  }).property('groupLevel', 'groupingMetadata.[]'),

  _content: Ember.computed(function() {
    if (!this.get('needSort')) {
      return this.get('content');
    }
    if (this.get('isCompleted')) {
      return this.get('sortedContent');
    }
    return Ember.A([LoadingPlaceHolder.create()]);
  }).property('sortedContent', 'isCompleted', 'needSort'),

  sortingColumns: Ember.computed.oneWay('root.sortingColumns'),

  needSort: Ember.computed.and('sortingColumns.isNotEmpty', 'isLeafParent'),

  sortedContent: Ember.computed(function() {
    var content = this.get('content');
    var sortingColumns = this.get('sortingColumns');
    return sortingColumns.sortContent(content);
  }).property('sortingColumns._columns', 'content'),

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
    this.incrementProperty('status.loadingCount');
    this.loadOneChunk(chunkIndex).then(function (result) {
      self.onOneChunkLoaded(result);
      self.set('_hasInProgressLoading', false);
      self.notifyPropertyChange('length');
      self.decrementProperty('status.loadingCount');
    }).catch(function() {
      self.set('_hasInProgressLoading', false);
      self.onLoadError("Failed to load data.", group, chunkIndex);
      self.decrementProperty('status.loadingCount');
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
    content.pushObject(LoadingPlaceHolder.create());
  },

  updatePlaceHolderWithContent: function (content) {
    var _content = this.get('_content');
    var lastObject = _content.get('lastObject');
    lastObject.set('content', content);
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

  _hasInProgressLoading: false,

  loadingCount: Ember.computed.oneWay('status.loadingCount')
});

export default LazyGroupRowArray;
