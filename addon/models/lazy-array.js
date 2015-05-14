/* jshint loopfunc:true */
import Ember from 'ember';

export default function (totalCount, initSize, getNextChunk) {
  var ret = Ember.A(new Array(totalCount));

  var promise = getNextChunk();
  promise.then(function (data) {
    ret = data;
  });

  var LazyArray = Ember.ArrayProxy.extend({
    objectAt: function (index) {
      var reloadValue = index + 11;
      if (reloadValue >= ret.length) {
        var loop = (reloadValue - ret.length) / 100 + 1;

        while (loop > 0) {
          getNextChunk().then(function (data) {
            ret = ret.concat(data);
          });
          loop--;
        }
      }
      return ret[index];
    },

    length: totalCount
  });

  return LazyArray.create({
    content: Ember.A(new Array(totalCount))
  });
}

