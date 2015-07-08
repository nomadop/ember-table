import Ember from 'ember';
import StyleBindingsMixin from 'ember-table/mixins/style-bindings';

export default Ember.View.extend(StyleBindingsMixin, {
  templateName: 'grouped-row-indicator',

  classNameBindings: ['indicatorClass'],

  styleBindings: ['left'],

  hasChildren: false,

  isExpanded: false,

  row: Ember.computed.alias('parentView.row'),

  isShown: Ember.computed(function(){
    return this.get('hasChildren') && !this.get('row.isLoading');
  }).property('hasChildren'),

  expandLevel: 0,

  left: Ember.computed(function() {
    return this.get('expandLevel') * 10 + 5;
  }).property('expandLevel'),

  indicatorClass: Ember.computed(function() {
    var classNames = ['grouping-column-indicator'];
    if (this.get('isExpanded')) {
      classNames.push('unfold');
    }
    return classNames.join(' ');
  }).property('isExpanded'),

  click: function() {
    if(this.get('isShown')){
      this.get('parentView').send('toggleExpansionState');
    }
  }
});
