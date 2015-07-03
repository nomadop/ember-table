import Ember from 'ember';
import EmberTable from './ember-table';
import LazyGroupRowArray from 'ember-table/models/lazy-group-row-array';

var EmberTableWithGLData = EmberTable.extend({
    content: Ember.computed(function () {
      var chunkSize = this.get('chunkSize');
      var totalCount = this.get('totalCount');
      var defers = this.get('defers');
      var groupingMetadata = this.get('groupingMetadata');
      return LazyGroupRowArray.create({
        loadChildren: function getChunk(chunkIndex, parentQuery) {
          var defer = defers.next();
          var result = {
            content: [],
            meta: {totalCount: totalCount, chunkSize: chunkSize}
          };
          for (var i = 0; i < chunkSize; i++) {
            result.content.push({id: i, "accountType": 'accountType-' + i});
          }
          defer.resolve(result);
          return defer.promise;
        },
        groupingMetadata: groupingMetadata
      });
    }).property('groupingMetadata', 'chunkSize', 'totalCount', 'defers'),

    groupingMetadata: [],
    chunkSize: 5,
    totalCount: 5,
    defers: null
  })
  ;

export default EmberTableWithGLData;
