import Ember from 'ember';
import StyleBindingsMixin from 'ember-table/mixins/style-bindings';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default Ember.View.extend(
StyleBindingsMixin, RegisterTableComponentMixin, {
  classNames: 'ember-table-column-sortable-indicator',
  classNameBindings: ['tableComponent._isShowingSortableIndicator:active', 'tableComponent.reorderIndicatorStyle'],
  styleBindings: ['left', 'height', 'top'],
  left: Ember.computed.alias('tableComponent._sortableIndicatorLeft'),

  height: Ember.computed(function() {
    var isReorderInnerColumns = this.get('tableComponent._isReorderInnerColumns');
    var indicatorHeight = this.get('tableComponent._height');

    // change the indicator height and top
    // so that indicator will not cover group name cell
    if (isReorderInnerColumns) {
      var headerHeight = this.get('tableComponent._headerHeight');
      indicatorHeight = indicatorHeight  - headerHeight;
      this.set('top', headerHeight);
    } else {
      this.set('top', 0);
    }
    return indicatorHeight;
  }).property('tableComponent._isReorderInnerColumns')

});

