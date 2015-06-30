import Ember from 'ember';

export default Ember.ArrayProxy.extend({
  count: 0,

  content: Ember.computed.alias('defers'),

  defers: Ember.computed(function () {
    var result = [];
    for (var i = 0; i < this.get('count'); i++) {
      result.push(Ember.RSVP.defer());
    }
    return result;
  }).property('count'),

  promises: function (deferIndexes) {
    var defers = this.get('defers');
    if(deferIndexes instanceof Array){
      return deferIndexes.map(function(deferIndex) {
        return defers[deferIndex].promise;
      });
    }
    return defers.map(function(defer) {
      return defer.promise;
    });
  },

  next: function() {
    var defer = this.objectAt(this.get('_index'));
    this.incrementProperty('_index');
    return defer;
  },

  _index: 0,

  ready: function (callback, deferIndexes) {
    var promises = this.promises(deferIndexes);
    return Ember.RSVP.all(promises).then(function () {
      return Ember.run.later(callback);
    });
  }
});
