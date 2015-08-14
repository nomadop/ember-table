import Ember from 'ember';

export default Ember.ArrayProxy.extend({

  // This property contains all sorted columns.
  sortingColumns: null,

  _content: Ember.computed(function () {
    var content = this.get('content');
    if (this.get('sortingColumns.isNotEmpty')) {
      var sortingColumns = this.get('sortingColumns');
      return sortingColumns.sortContent(content);
    }
    return content.slice();
  }).property('sortingColumns._columns'),

  objectAt: function (index) {
    return this.get('_content').objectAt(index);
  }
});
