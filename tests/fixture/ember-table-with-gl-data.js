import Ember from 'ember';

var EmberTableWithGLData = Ember.Object.extend({
  groupingMetadata: [{id: "accountSection"}, {id: "accountType"}],
  loadChildren: function getChunk() {
    var defer = this.get('defers').next();
    var result = {
      content: [],
      meta: {totalCount: this.totalCount, chunkSize: this.chunkSize}
    };
    for (var i = 0; i < this.chunkSize; i++) {
      result.content.push({id: i, "accountType": 'accountType-' + i});
    }
    defer.resolve(result);
    return defer.promise;
  },
  chunkSize: 5,
  totalCount: 5,
  defers: null
});

export default EmberTableWithGLData;
