import Ember from 'ember';

export default function (totalCount, initSize, getNextChunk) {
  var ret = Ember.A(new Array(0));

  var LazyArray = Ember.ArrayProxy.extend({
    objectAt: function (index) {
      var loadCount = index + 11;
      if (loadCount >= ret.length) {
        var chunksNeeded = parseInt((loadCount - ret.length) / 100) + 1;
        var promises = [];
        for(var i=0; i<chunksNeeded; i++) {
          promises.push(getNextChunk());
        }
        Ember.RSVP.all(promises).then(function (chunks) {
          ret = chunks.reduce(function(result, chunk) {
            return result.concat(chunk);
          }, []);
        });
      }
      return ret[index];
    },

    length: totalCount
  });

  return LazyArray.create({
    content: Ember.A(new Array(0))
  });
}
