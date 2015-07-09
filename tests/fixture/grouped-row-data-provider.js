import Ember from 'ember';
import LazyGroupRowArray from 'ember-table/models/lazy-group-row-array';

var DataProvider = function() {
  var toQuery = function(obj) {
    var keys = Object.keys(obj).sort();
    return keys.map(function (key) {
      return key + '=' + obj[key];
    }).join('&');
  };

  var makeJsonArray = function(arr, baseNum) {
    baseNum = baseNum || 0;
    return arr.map(function (i) {
      return {
        id: i + baseNum,
        name: 'name-' + i,
        accountType: i + baseNum,
        accountCode: i + baseNum
      };
    });
  };

  var sortDataMap = {
    'chunkIndex=0': function () {
      return makeJsonArray([1, 2, 3, 4, 5]);
    },
    'chunkIndex=1': function () {
      return makeJsonArray([6, 7, 8, 9, 10]);
    },
    'accountSection=1&chunkIndex=0': function () {
      return makeJsonArray([2, 1, 5, 4, 3], 100);
    },
    'accountSection=1&chunkIndex=0&sortDirect=asc&sortName=Column1': function () {
      return makeJsonArray([1, 2, 3, 4, 5], 100);
    },
    'accountSection=1&chunkIndex=0&sortDirect=desc&sortName=Column1': function () {
      return makeJsonArray([10, 9, 8, 7, 6], 100);
    },
    'accountSection=1&accountType=102&chunkIndex=0': function () {
      return makeJsonArray([3, 5, 1, 2, 4], 1000);
    },
    'accountSection=1&accountType=102&chunkIndex=1': function () {
      return makeJsonArray([7, 9, 10, 6, 8], 1000);
    },
    'accountSection=1&accountType=102&chunkIndex=0&sortDirect=asc&sortName=Column1': function () {
      return makeJsonArray([1, 2, 3, 4, 5], 1000);
    },
    'accountSection=1&accountType=102&chunkIndex=0&sortDirect=desc&sortName=Column1': function () {
      return makeJsonArray([10, 9, 8, 7, 6], 1000);
    },
    'accountSection=1&chunkIndex=1': function () {
      return makeJsonArray([8, 7, 9, 10, 6], 100);
    }
  };

  return {
    sortData: function (chunkIndex, query) {
      var queryObj = {};
      Ember.setProperties(queryObj, query);
      Ember.setProperties(queryObj, {chunkIndex: chunkIndex});
      return sortDataMap[toQuery(queryObj)]();
    }
  };
}();

export default Ember.Object.extend({
  loadChunkCount: 0,
  groupingMetadata: null,
  defers: null,
  content: Ember.computed(function () {
    var self = this;
    return LazyGroupRowArray.create({
      loadChildren: function (chunkIndex, parentQuery) {
        var defer = self.get('defers').next();
        var result = {
          content: DataProvider.sortData(chunkIndex, parentQuery),
          meta: {totalCount: 10, chunkSize: 5}
        };
        setTimeout(function () {
          defer.resolve(result);
        }, 138);

        self.incrementProperty('loadChunkCount');
        return defer.promise;
      },
      groupingMetadata: this.get('groupingMetadata')
    });
  })
});
