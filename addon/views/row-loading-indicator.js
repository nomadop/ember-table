import Ember from 'ember';

export default Ember.View.extend({
  templateName: 'row-loading-indicator',

  classNameBindings: ['indicatorClass'],

  isLoading: false,

  indicatorClass: Ember.computed(function() {
    var classNames = ['row-loading-indicator'];
    if (this.get('isLoading')) {
      classNames.push('loading');
    }
    return classNames.join(' ');
  }).property('isLoading')
});
