import Ember from 'ember';
import Row from './row';
import SubRowArray from './sub-row-array';
import LazyGroupRowArray from '../models/lazy-group-row-array';
import RowPath from 'ember-table/models/row-path';

var GroupRow = Row.extend({
    subRowsCount: Ember.computed(function () {
      if (!this.get('isExpanded')) {
        return 0;
      }
      var childrenCount = this.get('_childrenRow.length') || 0;
      var childrenExpandedCount = 0;
      if (this.get('_childrenRow.length') > 0) {
        childrenExpandedCount = this.get('_childrenRow').definedControllers().reduce(function (previousValue, item) {
          if (!item) {
            return previousValue;
          }
          return previousValue + item.get('subRowsCount');
        }, 0);
      }
      return childrenCount + childrenExpandedCount;
    }).property('isExpanded', '_childrenRow.definedControllersCount', '_childrenRow.@each.subRowsCount', '_childrenRow.length'),

    _childrenRow: null,

    expandChildren: function () {
      this.set('isExpanded', true);
      this.createChildrenRow();
      var target = this.get('target');
      if (target) {
        target.notifyPropertyChange('length');
      }
    },

    createChildrenRow: function () {
      if (!this.get('_childrenRow')) {
        this.set('_childrenRow', SubRowArray.create({
          content: this.get('children')
        }));
      }
    },

    collapseChildren: function () {
      this.set('isExpanded', false);
      var target = this.get('target');
      if (target) {
        target.notifyPropertyChange('length');
      }
    },

    subRowsCountDidChange: Ember.observer('subRowsCount', function () {
      var parentRow = this.get('parentRow');
      if (parentRow) {
        parentRow.notifyPropertyChange('subRowsCount');
      }
    }),

    sortingColumnsDidChange: Ember.observer('target.sortingColumns._columns', function() {
      if (this.get('_childrenRow') && !this.get('nextLevelGrouping.sortDirection')) {
        this.sortingConditionsChanged(this.get('target.sortingColumns'), this.get('target.sortingColumns.isNotEmpty'));
      }
    }),

    sortingGroupersDidChange: Ember.observer('nextLevelGrouping.sortDirection', function() {
      if (this.get('_childrenRow')) {
        var previousSortDirection = this.get('_previousGrouperSortDirection');
        var currentSortDirection = this.get('nextLevelGrouping.sortDirection');
        if (previousSortDirection !== currentSortDirection) {
          this.sortingConditionsChanged(this.get('nextLevelGrouping'), this.get('nextLevelGrouping.sortDirection'));
          this.set('_previousGrouperSortDirection', currentSortDirection);
        }
      }
    }),

    sortingConditionsChanged: function(sorter, isSortConditionNotEmpty) {
      if (this.get('children.isNotCompleted')) {
        this.recreateChildrenRow();
        this.notifyLengthChange();
      } else {
        if (isSortConditionNotEmpty) {
          this.recreateSortedChildrenRow(sorter);
          this.notifyLengthChange();
        }
      }
    },

    recreateChildrenRow: function() {
      this.set('children', LazyGroupRowArray.create());
      this.set('_childrenRow', SubRowArray.create({
        content: this.get('children'),
        oldControllersMap: this.get('_childrenRow').getAvailableControllersMap(),
        isContentIncomplete: true
      }));
    },

    recreateSortedChildrenRow: function(sorter) {
      this.set('_childrenRow', SubRowArray.create({
        content: sorter.sortContent(this.get('children')),
        oldControllersMap: this.get('_childrenRow').getAvailableControllersMap()
      }));
    },

    notifyLengthChange: function() {
      if (this.get('target')) {
        this.get('target').notifyPropertyChange('length');
      }
    },

    findRow: function (idx) {
      var subRows = this.get('_childrenRow');
      if (!subRows) {
        return undefined;
      }
      var p = idx;
      for (var i = 0; i < subRows.get('length'); i++) {
        if (p === 0) {
          return subRows.objectAt(i);
        }
        var row = subRows.objectAt(i);
        p--;
        if (row && row.get('isExpanded')) {
          var subRowsCount = row.get('subRowsCount');
          if (p < subRowsCount) {
            return row.findRow(p);
          } else {
            p -= subRowsCount;
          }
        }
      }
      return undefined;
    },

    createRow: function (idx) {
      var subRows = this.get('_childrenRow');
      if (!subRows) {
        return undefined;
      }
      var p = idx;
      for (var i = 0; i < subRows.get('length'); i++) {
        if (p === 0) {
          var content = subRows.objectAtContent(i);
          if (content && Ember.get(content, 'isLoading')) {
            Ember.set(content, 'contentLoadedHandler', Ember.Object.create({
              target: subRows,
              index: i
            }));
            var subRowsContent = this.get('children');
            if (subRowsContent.triggerLoading) {
              var group = Ember.Object.create({
                query: this.get('path').toQuery(),
                key: this.get('nextLevelGrouping.key')
              });
              subRowsContent.triggerLoading(i, this.get('target'), group);
            }
          }
          var newRow = this.get('itemController').create({
            target: this.get('target'),
            parentController: this.get('parentController'),
            content: content,
            expandLevel: this.get('expandLevel') + 1,
            grouping: this.get('nextLevelGrouping'),
            itemController: this.get('itemController'),
            parentRow: this
          });
          subRows.setControllerAt(newRow, i);
          return newRow;
        }
        var row = subRows.objectAt(i);
        p--;
        if (row && row.get('isExpanded')) {
          var subRowsCount = row.get('subRowsCount');
          if (p < subRowsCount) {
            return row.createRow(p);
          } else {
            p -= subRowsCount;
          }
        }
      }
      return undefined;
    },

    children: Ember.computed(function () {
      if (this.get('target.groupMeta.loadChildren') && this.get('grouping.isGroup') && this.get('expandLevel') >= 0) {
        return LazyGroupRowArray.create();
      }
      return this.get('content.children');
    }).property('target.groupMeta.loadChildren', 'grouping.isGroup'),

    hasChildren: Ember.computed.oneWay('grouping.isGroup'),

    isExpanded: false,

    expandLevel: null,
    grandTotalTitle: Ember.computed.oneWay('target.groupMeta.grandTotalTitle'),
    grouping: null,
    groupName: Ember.computed(function () {
      if (this.get('grouping.isGrandTotal')) {
        return this.get('grandTotalTitle');
      }
      return this.get('content.' + this.get('grouping.key'));
    }).property('content', 'content.isLoaded', 'grouping.key'),

    nextLevelGrouping: Ember.computed.alias('grouping.nextLevelGrouping'),

    parentRow: null,

    path: Ember.computed(function() {
      var parentPath = this.get('parentRow.path') || RowPath.create();
      return parentPath.createChild(this);
    }).property('parentRow.path', 'grouping.key', 'content')

  }
);


export default GroupRow;
