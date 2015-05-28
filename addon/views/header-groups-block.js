import Ember from 'ember';
import StyleBindingsMixin from 'ember-table/mixins/style-bindings';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default Ember.View.extend(
StyleBindingsMixin, RegisterTableComponentMixin, {
    templateName: 'header-groups-block',
    styleBindings: ['width'],
    columnGroups: undefined,
    headerHeight: undefined,

    //table row width will change with each column width so we bind with it
    width: Ember.computed.alias('tableComponent._rowWidth'),

    //will bind to a property passed in from template, we expect that property reflect scroll position
    scrollLeft: null,
    
    //use JQuery scrollLeft, which needs inner element has a larger width than outter element,
    //header-groups-block acts as the inner element in scrolling
    onScrollLeftDidChange: Ember.observer(function() {
      return this.$().parent().scrollLeft(this.get('scrollLeft'));
    }, 'scrollLeft')

  });
