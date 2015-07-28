import Ember from 'ember';

var LoadingPlaceHolder = Ember.ObjectProxy.extend({
  isLoading: true,
  isLoaded: false,
  isError:false,
  contentLoaded: Ember.observer('content', function() {
    this.set('isLoaded', true);
    this.set('isLoading', false);
  })
});

export default LoadingPlaceHolder;
