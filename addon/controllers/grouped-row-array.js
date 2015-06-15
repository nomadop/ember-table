import Ember from 'ember';
import RowArrayController from 'ember-table/controllers/row-array';

export default RowArrayController.extend({

  init: function() {
    this._super();
    this.set('_childrenRows', Ember.Map.create());
    this.set('_controllersMap', Ember.Map.create());
  },

  objectAtContent: function(idx) {
    var object = this._findObject(idx);
    var controllersMap = this.get('_controllersMap');
    var controller = controllersMap.get(object);
    if (!controller) {
      controller = this.get('itemController').create({
        target: this,
        parentController: this.get('parentController') || this,
        content: object
      });
      controllersMap.set(object, controller);
    }
    return controller;
  },

  expandChildren: function(row) {
    row.set('isExpanded', true);
    var childrenRow = row.get('children') || [];
    var childrenRows = this.get('_childrenRows');
    childrenRows.set(row.get('content'), childrenRow);
    this.toggleProperty('_resetLength');
  },

  collapseChildren: function(row) {
    row.set('isExpanded', false);
    var childrenRows = this.get('_childrenRows');
    childrenRows.delete(row.get('content'));
    this.toggleProperty('_resetLength');
  },

  length: Ember.computed(function() {
    var content = this.get('content');
    return this.lengthOf(content);
  }).property('content.[]', '_resetLength'),

  lengthOf: function(objects) {
    var self = this;
    var childrenRows = this.get('_childrenRows');
    return objects.reduce(function (res, object) {
      var length = 1;
      var children = childrenRows.get(object);
      if(!!children){
        length += self.lengthOf(children);
      }
      return length + res;
    }, 0);
  },

  _findObject: function(idx) {
    var content = this.get('content');
    var childrenRows = this.get('_childrenRows');
    return this._lookUpObject(content, childrenRows, idx);
  },

  _lookUpObject: function(content, childrenRows, idx){
    var childrenCount = 0;
    for(var i=0; i<content.get('length'); i++) {
      var ithObject = content.objectAt(i);
      if (idx === i + childrenCount) {
        return ithObject;
      }
      if (childrenRows.has(ithObject)) {
        var theChildren = childrenRows.get(ithObject);
        var object = this._lookUpObject(theChildren, childrenRows, idx-childrenCount-i-1);
        if(!!object){
          return object;
        }
        childrenCount += this.lengthOf(theChildren);
      }
    }
    return null;
  },

  _resetLength: false,

  _childrenRows: null,

  _controllersMap: null

});
