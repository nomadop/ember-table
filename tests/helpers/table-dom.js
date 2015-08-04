import Ember from 'ember';

var TableDom = Ember.ObjectProxy.extend({

  parent: null,

  aliasMethods: ['find', 'eq', 'click', 'text', 'has'],

  init: function() {
    var self = this;
    self.aliasMethods.forEach(function (methodName) {
      self.defineMethod(methodName);
    });
    this._super();
  },

  defineMethod: function(name) {
    this.set(name, function () {
      var content = this.get('content');
      return content[name].apply(content, arguments);
    });
  },

  headerRows: function() {
    var dom = this.find('.ember-table-header-block').find('.ember-table-table-row');
    return this.createChildDom(dom);
  },

  headerRow: function(idx) {
    var dom = this.headerRows().eq(idx);
    return this.createChildDom(dom);
  },

  rows: function() {
    var dom = this.find('.ember-table-table-block.lazy-list-container').find('.ember-table-table-row');
    return this.createChildDom(dom);
  },

  row: function(idx) {
    var dom = this.rows().eq(idx);
    return this.createChildDom(dom);
  },

  cells: function(){
    var dom = this.find('.ember-table-cell');
    return this.createChildDom(dom);
  },

  cell: function(idx) {
    var dom = this.cells().eq(idx);
    return this.createChildDom(dom);
  },

  createChildDom: function(dom) {
    return TableDom.create({
      content: dom,
      parent: this
    });
  }
});

export default TableDom;

