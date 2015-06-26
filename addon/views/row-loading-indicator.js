import Ember from 'ember';

export default Ember.View.extend({
  templateName: 'row-loading-indicator',

  classNameBindings: ['indicatorClass'],

  isLoading: false,

  // the property of isVisible should not be undefined for Ember.View's binding
  isVisible: Ember.computed(function(){
    return !!this.get('isLoading');
  }).property('isLoading'),

  indicatorClass: Ember.computed(function() {
    var classNames = ['row-loading-indicator'];
    if (this.get('isLoading')) {
      classNames.push('loading');
    }
    return classNames.join(' ');
  }).property('isLoading')
});
