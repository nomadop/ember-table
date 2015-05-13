import Ember from 'ember';

export default function (totalCount, initSize, getNextChunk) {
  var ret = Ember.A(new Array(totalCount));

 var promise = getNextChunk();
  promise.then(function(data) {
    ret = data;
  });

  var LazyArray = Ember.ArrayProxy.extend({
    objectAt: function(index) {
      if(index >= 89) {
        getNextChunk().then(function(data) {
          ret = ret.concat(data);
        });
      }
      return ret[index];
    },

    length: totalCount
  });

  return LazyArray.create({
    content: Ember.A(new Array(totalCount))
  });
}

