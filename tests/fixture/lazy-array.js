import Ember from 'ember';
import LazyArray from 'ember-table/models/lazy-array';

export default Ember.Object.extend({
  normalFixture: function () {
    return LazyArray.create({
      totalCount: 200,
      chunkSize: 50,
      callback: function (pageIndex) {
        var self = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
          resolve(self.initChunk());
        });
      },
      initChunk: function () {
        var chunk = [];
        for (var i = 0; i < 50; i++) {
          chunk.push(i);
        }
        return chunk;
      }
    });
  },

  errorFixture: function () {
    return LazyArray.create({
      totalCount: 200,
      chunkSize: 50,
      callback: function (pageIndex) {
        return new Ember.RSVP.Promise(function (resolve, reject) {
          reject('server is down');
        });
      }
    });
  }
});
