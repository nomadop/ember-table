import Ember from 'ember';

var SubRowArray = Ember.ArrayController.extend({
  init: function() {
    this._super();
    var oldObject = this.get('oldObject');
    if (oldObject) {
      var oldControllers = oldObject.get('_subControllers');
      var isLazyLoadContent = this.get('isLazyLoadContent');
      if (isLazyLoadContent) {
        var oldExpandedControllers = [];
        oldControllers.forEach(function(item) {
        if (item) {
            if (isLazyLoadContent && item.get('isExpanded')) {
              oldExpandedControllers.push(item);
            }
          }
        }.bind(this));
        this.set('oldExpandedControllers', oldExpandedControllers);
      } else {
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
    if (this.get('isLazyLoadContent') && this.isControllerExpandedBefore(controller)) {
      controller.expandChildren();
    }
    this.incrementProperty('definedControllersCount', 1);
  },

  isControllerExpandedBefore: function(controller) {
    var oldExpandedControllers = this.get('oldExpandedControllers');
    if (oldExpandedControllers) {
      return oldExpandedControllers.some(function(item) {
        return item.get('id') === controller.get('id');
      });
    }
    return false;
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
