import Ember from 'ember';

var SubRowArray = Ember.ArrayController.extend({
  init: function() {
    this._super();
    var oldObject = this.get('oldObject');
    if (oldObject) {
      var oldControllers = oldObject.get('_subControllers');
      if (!this.get('isLazyLoadContent')) {
        var content = this.get('content');
        oldControllers.forEach(function(item) {
          if (item) {
            var index = content.indexOf(Ember.get(item, 'content'));
            if (index !== -1) {
              this.setControllerAt(item, index);
            }
          }
        }.bind(this));
      }
    }
  },

  objectAt: function (idx) {
    return this._subControllers[idx];
  },

  setControllerAt: function (controller, idx) {
    this._subControllers[idx] = controller;
    if (this.get('isLazyLoadContent')) {
      var oldExpandedController = this.oldExpandedController(controller);
      if (oldExpandedController) {
        this._subControllers[idx] = oldExpandedController;
        oldExpandedController.oldExpandedChildrenReused();
      }
    }
    this.incrementProperty('definedControllersCount', 1);
  },

  oldExpandedControllers: Ember.computed.filter('oldObject._subControllers', function(controller) {
    return controller && Ember.get(controller, 'isExpanded');
  }),

  oldExpandedController: function(controller) {
    var oldExpandedControllers = this.get('oldExpandedControllers');
    if (oldExpandedControllers) {
      return oldExpandedControllers.find(function(item) {
        return item.get('id') === controller.get('id');
      });
    }
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
