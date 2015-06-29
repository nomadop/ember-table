import Ember from 'ember';

export default Ember.Object.extend({
  defersCount: 0,

  defers: Ember.computed(function () {
    var result = [];
    for (var i = 0; i < this.get('defersCount'); i++) {
      result.push(Ember.RSVP.defer());
    }
    return result;
  }).property('defersCount'),

  promises: Ember.computed(function () {
    return this.get('defers').map(function (defer) {
      return defer.promise;
    });
  }).property('defers'),

  ready: function (callback) {
    Ember.RSVP.all(this.get('promises')).then(function () {
      Ember.run.later(callback);
    });
  }
});
