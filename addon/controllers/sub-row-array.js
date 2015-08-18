import Ember from 'ember';

var SubRowArray = Ember.ArrayController.extend({
  init: function() {
    this._super();
    var oldObject = this.get('oldObject');
    if (oldObject) {
      var content = this.get('content');
      var oldControllers = oldObject.get('_subControllers');
      oldControllers.forEach(function(item) {
        if (item) {
          var index = content.indexOf(Ember.get(item, 'content'));
          this.setControllerAt(item, index);
        }
      }.bind(this));
    }
  },

  objectAt: function (idx) {
    return this._subControllers[idx];
  },

  setControllerAt: function (controller, idx) {
    this._subControllers[idx] = controller;
    this.incrementProperty('definedControllersCount', 1);
  },

  objectAtContent: function (idx) {
    var content = this.get('content');
    return content.objectAt(idx);
  },

  definedControllersCount: 0,

  definedControllers: function () {
    return this._subControllers.filter(function (item) {
      return !!item;
    });
  }
});

export default SubRowArray;
