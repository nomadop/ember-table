import Ember from 'ember';
import StyleBindingsMixin from 'ember-table/mixins/style-bindings';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';
import SortabelMixin from 'ember-table/mixins/sortable';

export default Ember.CollectionView.extend(
  StyleBindingsMixin, RegisterTableComponentMixin, SortabelMixin, {
    classNames: ['ember-table-table-block', 'ember-table-header-groups-block'],
    styleBindings: ['width'],
    columnGroups: undefined,
    headerHeight: undefined,
    itemViewClass: 'header-group',

    height: Ember.computed(function () {
      return this.get('tableComponent._headerHeight') * 2;
    }).property('tableComponent._headerHeight'),

    //will bind to a property passed in from template, we expect that property reflect scroll position
    scrollLeft: null,

    //use JQuery scrollLeft, which needs inner element has a larger width than outer element,
    //header-groups-block acts as the outer element in scrolling
    onScrollLeftDidChange: Ember.observer(function () {
      return this.$().scrollLeft(this.get('scrollLeft'));
    }, 'scrollLeft'),

    content: Ember.computed(function () {
      var columnGroups = this.get('columnGroups');
      return columnGroups.map(function (columnGroup) {
        if (!!columnGroup.get('innerColumns')) {
          return [[columnGroup], columnGroup.get('columns')];
        } else {
          return [[columnGroup]];
        }
      });
    }).property('columnGroups.@each'),

    createChildView: function (view, attrs) {
      var columnGroups = this.get('tableComponent._columns');
      var childView = view.extend({
        scrollLeft: this.get('scrollLeft'),
        height: this.get('height'),
        group: columnGroups[attrs.contentIndex],
        columnGroup: this.get('columnGroups')[attrs.contentIndex]
      });
      return this._super(childView, attrs);
    },

    // for sortable mixin
    reorderPlaceHolderClass: 'group-column-reorder-indicator',
    sortableItemSelector: '.ember-table-header-block',
    sortableTargetElement: '> .ui-state-highlight.group-column-reorder-indicator',
    sortItemName: 'columnGroup',

    columnSortDidStart: function() {
      this.set('tableComponent._isReorderInnerColumns', false);
    },

    didInsertElement: function () {
      this._super();
      if (this.get('tableComponent.enableColumnReorder')) {
        this.$().sortable(this.get('sortableOption'));
      }
    },

    willDestroyElement: function () {
      if (this.get('tableComponent.enableColumnReorder')) {
        // TODO(azirbel): Get rid of this check, as in onColumnSortDone?
        var $divs = this.$();
        if ($divs) {
          $divs.sortable('destroy');
        }
      }
      this._super();
    }
});
