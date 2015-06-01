import Ember from 'ember';
import StyleBindingsMixin from 'ember-table/mixins/style-bindings';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default Ember.CollectionView.extend(
  StyleBindingsMixin, RegisterTableComponentMixin, {
    styleBindings: ['width'],
    columnGroups: undefined,
    headerHeight: undefined,
    itemViewClass: 'header-group',

    height: Ember.computed(function () {
      return this.get('tableComponent._headerHeight') * 2;
    }).property('tableComponent._headerHeight'),

    //table row width will change with each column width so we bind with it
    width: Ember.computed.alias('tableComponent._rowWidth'),

    //will bind to a property passed in from template, we expect that property reflect scroll position
    scrollLeft: null,

    //use JQuery scrollLeft, which needs inner element has a larger width than outter element,
    //header-groups-block acts as the inner element in scrolling
    onScrollLeftDidChange: Ember.observer(function () {
      return this.$().parent().scrollLeft(this.get('scrollLeft'));
    }, 'scrollLeft'),

    content: Ember.computed(function () {
      var columnGroups = this.get('columnGroups');
      var self = this;
      return columnGroups.map(function (columnGroup) {
        if (!!columnGroup.get('innerColumns')) {
          return [[columnGroup], columnGroup.get('columns')];
        } else {
          columnGroup.set('headerCellHeight', self.get('height'));
          return [[columnGroup]];
        }
      });
    }).property('columnGroups.@each'),

    createChildView: function (view, attrs) {
      var columnGroups = this.get('tableComponent.columnGroups');
      var childView = view.extend({
        scrollLeft: this.get('scrollLeft'),
        height: this.get('height'),
        group: columnGroups[attrs.contentIndex],
        columnGroup: this.get('columnGroups')[attrs.contentIndex]
      });
      return this._super(childView, attrs);
    },

    // Options for jQuery UI sortable
    sortableOption: Ember.computed(function () {
      return {
        axis: 'x',
        containment: 'parent',
        cursor: 'move',
        helper: 'original',
        items: ".ember-table-header-block.sortable",
        opacity: 0.9,
        placeholder: 'ui-state-highlight',
        scroll: true,
        tolerance: 'intersect',
        update: Ember.$.proxy(this.onColumnSortDone, this),
        stop: Ember.$.proxy(this.onColumnSortStop, this),
        sort: Ember.$.proxy(this.onColumnSortChange, this)
      };
    }),

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
    },

    onColumnSortStop: function () {
      this.set('tableComponent._isShowingSortableIndicator', false);
    },

    onColumnSortChange: function () {
      var left = this.$('.ui-state-highlight').offset().left -
        this.$().closest('.ember-table-tables-container').offset().left;
      this.set('tableComponent._isShowingSortableIndicator', true);
      this.set('tableComponent._sortableIndicatorLeft', left);
    },

    onColumnSortDone: function (event, ui) {
      var newIndex = ui.item.index();
      this.$().sortable('cancel');
      var view = Ember.View.views[ui.item.attr('id')];
      var column = view.get('group');
      this.get('tableComponent').onColumnSort(column, newIndex);
      this.set('tableComponent._isShowingSortableIndicator', false);
    }
  });
