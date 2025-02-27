import Ember from 'ember';
import StyleBindingsMixin from 'ember-table/mixins/style-bindings';
import ResizeHandlerMixin from 'ember-table/mixins/resize-handler';
import RowArrayController from 'ember-table/controllers/row-array';
import GroupedRowArrayController from 'ember-table/controllers/grouped-row-array';
import Row from 'ember-table/controllers/row';
import GroupRow from 'ember-table/controllers/group-row';
import ColumnDefinition from 'ember-table/models/column-definition';
import SortingColumns from 'ember-table/models/sorting-columns';

export default Ember.Component.extend(
StyleBindingsMixin, ResizeHandlerMixin, {
  classNames: ['ember-table-tables-container'],
  classNameBindings: ['enableContentSelection:ember-table-content-selectable'],

  // ---------------------------------------------------------------------------
  // API - Inputs
  // ---------------------------------------------------------------------------

  // Values which are bound to the table's style attr. See
  // `Ember.StyleBindingsMixin` documentation for more details.
  styleBindings: ['height'],

  // An array of row objects. Usually a hash where the keys are column names
  // and the values are the rows's values. However, could be any object, since
  // each column can define a function to return the column value given the row
  // object. See `Ember.Table.ColumnDefinition.getCellContent`.
  content: [],

  // An array of column definitions: see `Ember.Table.ColumnDefinition`. Allows
  // each column to have its own configuration.
  // TODO(new-api): Rename to `data`
  columns: null,

  _columns: Ember.computed(function () {
    var columns = this.get('columns').copy();
    if (this.get('_hasGroupingColumn')) {
      columns.unshiftObject(this.get('_groupingColumn'));
    }
    return columns;
  }).property('_hasGroupingColumn', 'columns'),

  // The number of fixed columns on the left side of the table. Fixed columns
  // are always visible, even when the table is scrolled horizontally.
  numFixedColumns: 0,

  // fixed columns count in real.
  // a grouping column will be added as fixed column if has grouping column
  _numFixedColumns: Ember.computed(function() {
    var numFixedColumns = this.get('numFixedColumns');
    if (this.get('_hasGroupingColumn')) {
      numFixedColumns++;
    }
    return numFixedColumns;
  }).property('numFixedColumns', '_hasGroupingColumn'),

  groupingMetadata: Ember.computed(function() {
    return this.get('groupMeta.groupingMetadata') || [];
  }).property('groupMeta.groupingMetadata'),

  hasGrandTotalRow: Ember.computed(function() {
    return !!this.get('groupMeta.grandTotalTitle');
  }).property('groupMeta.grandTotalTitle'),

  // The number of footer rows in the table. Footer rows appear at the bottom of
  // the table and are always visible.
  // TODO(new-api): Rename to `numFooterRows`
  numFooterRow: 0,

  // The row height in pixels. A consistent row height is necessary to calculate
  // which rows are being shown, to enable lazy rendering.
  // TODO: Currently must be kept in sync with the LESS file.
  rowHeight: 30,

  // The minimum header height in pixels. Headers will grow in height if given
  // more content than they can display.
  // TODO: Currently must be kept in sync with the LESS file.
  minHeaderHeight: 30,

  // The footer height in pixels.
  // TODO: Currently must be kept in sync with the LESS file.
  footerHeight: 30,

  // Enables or disables the header block.
  hasHeader: true,

  // Enables or disables the footer block.
  // TODO(new-api): Control this via `numFooterRows` and remove from API
  hasFooter: true,

  reorderIndicatorStyle: null,

  enableColumnReorder: true,

  // Allow users to select the content of table cells.
  enableContentSelection: false,

  // Sets which column resizing behavior to use. Possible values are
  // <code>'standard'</code> (resizing a column pushes or pulls all other
  // columns) and <code>'fluid'</code> (resizing a column steals width from
  // neighboring columns).
  columnMode: 'standard',

  // Sets which row selection behavior to follow. Possible values are 'none'
  // (clicking on a row does nothing), 'single' (clicking on a row selects it
  // and deselects other rows), and 'multiple' (multiple rows can be selected
  // through ctrl/cmd-click or shift-click).
  selectionMode: 'single',

  sortAction: null,

  sortIndicatorViewName: null,

  groupingColumnWidth: 150,

  // By default the indicator view should be supported by ember-table.
  // if you want to custom grouped row view should set a custom view which inherit
  // from 'grouped-row-indicator'.
  // This view is expected to be positioned as absolute.
  groupedRowIndicatorViewName: null,

  //Width of group indicator and default value is 10 px.
  //If width of custom group row indicator view is not 10 pixel, this property must be set with the real value.
  groupIndicatorWidth: 10,

  // By default the indicator view should be supported by ember-table.
  // You can customize by providing your custom view name.
  // You can reference `ember-table/views/row-loading-indicator` in implementation.
  rowLoadingIndicatorViewName: null,

  // Meta info for group data, including groupingMetadata, grandTotalTitle(optional), loadChildren(optional)
  groupMeta: null,

  // ---------------------------------------------------------------------------
  // API - Outputs
  // ---------------------------------------------------------------------------

  // An array of the rows currently selected. If `selectionMode` is set to
  // 'single', the array will contain either one or zero elements.
  selection: Ember.computed(function(key, val) {
    var selectionMode = this.get('selectionMode');
    if (arguments.length > 1 && val) {
      this.get('persistedSelection').clear();
      this.get('rangeSelection').clear();
      switch (selectionMode) {
        case 'single':
          this.get('persistedSelection').addObject(val);
          break;
        case 'multiple':
          this.get('persistedSelection').addObjects(val);
      }
    }
    var selection = this.get('persistedSelection').copy().addObjects(this.get('rangeSelection'));
    switch (selectionMode) {
      case 'none':
        return null;
      case 'single':
        return selection[0] || null;
      case 'multiple':
        return selection;
    }
  }).property('persistedSelection.[]', 'rangeSelection.[]', 'selectionMode'),

  // Columns involved in sorting, sort direction is property _sortState of each column.
  // Sort order is decided by index of each column, smaller index has higher order.
  sortingColumns: Ember.computed(function() {
    return SortingColumns.create();
  }),

  // ---------------------------------------------------------------------------
  // Internal properties
  // ---------------------------------------------------------------------------

  // Special flag used by child views to look up this component using
  // nearestWithProperty()
  isEmberTable: true,

  // true if is dragging an inner column of group
  // otherwise is false
  // the value is set when reordering starts
  _isReorderInnerColumns: undefined,

  columnsFillTable: true,

  // _resolvedContent is an intermediate property between content and rows
  // This allows content to be a plain array or a promise resolving to an array
  _resolvedContent: function(key, value) {
    if (arguments.length > 1) {
      return value;
    } else {
      var _this = this;
      value = [];

      var content = this.get('content');
      if (content.then)
      {
        // content is a promise
        content.then(function(resolvedContent) {
          // when the promise resolves, set this property so it gets cached
          _this.set('_resolvedContent', resolvedContent);

          // if the promise resolves immediately, set `value` so we return
          // the resolved value and not []
          value = resolvedContent;
        });

        // returns [] if the promise doesn't resolve immediately, or
        // the resolved value if it's ready
        return value;
      }
      else
      {
        // content is not a promise
        return content;
      }
    }
  }.property('content'),

  init: function() {
    this._super();
    if (this.get('hasColumnGroup')) {
      this.set('columnGroups', this.get('_columns'));
    }
    if (!Ember.$.ui) {
      throw 'Missing dependency: jquery-ui';
    }
    if (!Ember.$().mousewheel) {
      throw 'Missing dependency: jquery-mousewheel';
    }
    if (!Ember.$().antiscroll) {
      throw 'Missing dependency: antiscroll.js';
    }
    return this.prepareTableColumns();
  },

  // TODO(azirbel): Document
  actions: {
    addColumn: Ember.K,
    sortByColumn: function(column, event){
      if (this.get('bodyContent.status.loadingCount') || this.get('content.loadingCount') || !column.sortFn){
        return;
      }
      var sortingColumns = this.get('sortingColumns');
      sortingColumns.update(column, event);
      this.sendAction('sortAction', sortingColumns);

      var bodyContent = this.get('bodyContent');
      if (bodyContent.sort) {
        bodyContent.sort(sortingColumns);
      }
      Ember.run.next(this, this.updateLayout);
    }
  },

  height: Ember.computed.alias('_tablesContainerHeight'),

  // TODO(new-api): eliminate view alias
  // specify the view class to use for rendering the table rows
  tableRowView: 'table-row',
  tableRowViewClass: Ember.computed.alias('tableRowView'),

  onColumnSort: function(column, newIndex) {
    // Fixed columns are not affected by column reordering
    var numFixedColumns = this.get('fixedColumns.length');
    var columns = this.get('_columns');
    if (columns.indexOf(column) !== -1) {
      columns.removeObject(column);
      columns.insertAt(numFixedColumns + newIndex, column);
    }
    else {
      Ember.A(columns)
        .filterBy('isGroup', true)
        .invoke('reorder', newIndex, column);
      this.set("_innerColumnReordered", !this.get('_innerColumnReordered'));
    }

    return this.prepareTableColumns();
  },

  //Do not want to create a new groupedRowController, even if its content length did change as more chunks are loaded.
  //If a new groupedRowController is created, the expanding state will be cleared.
  _groupedRowController: Ember.computed(function(){
    var self = this;
    var content = this.get('content');
    return GroupedRowArrayController.create({
      target: this,
      parentController: this,
      container: this.get('container'),
      itemController: GroupRow,
      content: content,
      onLoadError: function(errorMessage, groupingName, chunkIndex) {
        self.sendAction('handleDataLoadingError', errorMessage, groupingName, chunkIndex);
      },
      groupMeta: this.get('groupMeta')
  });
  }).property('content'),

  // An array of Ember.Table.Row computed based on `content`
  bodyContent: Ember.computed(function() {
    if (this.get('_hasGroupingColumn')) {
      return this.get('_groupedRowController');
    }
    return RowArrayController.create({
      target: this,
      parentController: this,
      container: this.get('container'),
      itemController: Row,
      content: this.get('_resolvedContent')
    });
  }).property('_resolvedContent.[]', '_hasGroupingColumn'),

  // An array of Ember.Table.Row
  footerContent: Ember.computed(function(key, value) {
    if (value) {
      return value;
    } else {
      return Ember.A();
    }
  }).property(),

  fixedColumns: Ember.computed(function() {
    var columns = this.get('_columns');
    if (!columns) {
      return Ember.A();
    }
    var numFixedColumns = this.get('_numFixedColumns') || 0;
    return columns.slice(0, numFixedColumns) || [];
  }).property('_columns.[]', '_numFixedColumns'),

  flattenedFixedColumns: Ember.computed(function() {
    return this.flattenColumnOrColumnGroups(this.get('fixedColumnGroups'));
  }).property('fixedColumnGroups'),

  fixedColumnGroups: Ember.computed.alias('fixedColumns'),

  tableColumns: Ember.computed(function() {
    var columns = this.get('_columns');
    if (!columns) {
      return Ember.A();
    }
    var numFixedColumns = this.get('_numFixedColumns') || 0;
    var noneFixedColumns = columns.slice(numFixedColumns, columns.get('length')) || [];
    return this.flattenColumnOrColumnGroups(noneFixedColumns);
  }).property('_columns.@each', '_numFixedColumns', "_innerColumnReordered"),

  tableColumnGroups: Ember.computed(function() {
    var columns = this.get('_columns');
    var numFixedColumns = this.get('_numFixedColumns');
    return columns.slice(numFixedColumns, columns.get('length')) || [];
  }).property('_columns.@each', '_numFixedColumns'),

  prepareTableColumns: function() {
    var _this = this;
    var columns = this.get('_columns') || Ember.A();
    columns.setEach('controller', this);
    columns.forEach(function(col, i) {
      col.set('nextResizableColumn', _this.getNextResizableColumn(columns, i));
      if (col.get('isGroup')) {
        col.get('innerColumns').forEach(function(innerCol) {
          innerCol.set('isInner', true);
        });
      }
    });
  },

  hasColumnGroup: function () {
    return this.get('_columns')
      .getEach('innerColumns')
      .any(function (i) {
        return !!i;
      });
  }.property(),

  _flattenedColumns: function() {
    var columns;
    if (this.get('hasColumnGroup')) {
      columns = this.get('_columns') || Ember.A();
      return this.flattenColumnOrColumnGroups(columns);
    }
  }.property('_columns.@each', '_innerColumnReordered'),

  flattenColumnOrColumnGroups: function(columnOrColumnGroups) {
    return columnOrColumnGroups.reduce(function(result, col) {
      var innerColumns = col.get('innerColumns');
      if (innerColumns) {
        return result.concat(innerColumns);
      } else {
        result.push(col);
        return result;
      }
    }, []);
  },

  getNextResizableColumn: function(columns, index) {
    var column;
    while (index < columns.length) {
      index += 1;
      column = columns.objectAt(index);
      if (column != null && column.get('isResizable')) {
        return column;
      }
    }
    return null;
  },

  //encapsulate input, will be used inside only
  _hasGroupingColumn: Ember.computed(function() {
    return this.get('groupingMetadata.length') > 0;
  }).property('groupingMetadata.@each'),

  _groupingColumn: Ember.computed(function () {
    var groupingColumnWidth = this.get('groupingColumnWidth');
    return ColumnDefinition.create({
      headerCellName: '', //Todo: Fix grouping header name
      textAlign: 'text-align-left',
      isSortable: false,
      sortFn: null,
      minWidth: 40, // Prevent cell content from changing into '...' then into normal string.
      savedWidth: groupingColumnWidth,
      tableCellView: 'grouping-column-cell',
      getCellContent: function (row) {
        return row.get('groupName');
      }
    });
  }),

  // ---------------------------------------------------------------------------
  // View concerns
  // ---------------------------------------------------------------------------

  didInsertElement: function() {
    this._super();
    this.set('_tableScrollTop', 0);
    this.elementSizeDidChange();
    this.doForceFillColumns();
  },

  willDestroyElement: function() {
    var antiscrollElements = this.$('.antiscroll-wrap');
    var antiscroll;
    antiscrollElements.each(function(i, antiscrollElement) {
      antiscroll = Ember.$(antiscrollElement).data('antiscroll');
      if (antiscroll) {
        antiscroll.destroy();
        Ember.$(antiscrollElement).removeData('antiscroll');
      }
    });
    this._super();
  },

  onResizeEnd: function() {
    // We need to put this on the run loop, because resize event came from
    // window. Otherwise, we get this warning when used in tests. You have
    // turned on testing mode, which disabled the run-loop's autorun. You
    // will need to wrap any code with asynchronous side-effects in an
    // Ember.run
    if (this.tableWidthNowTooSmall()) {
      this.set('columnsFillTable', true);
    }
    Ember.run(this, this.elementSizeDidChange);
  },

  elementSizeDidChange: function() {
    if ((this.get('_state') || this.get('state')) !== 'inDOM') {
      return;
    }
    this.set('_width', this.$().parent().width());
    this.set('_height', this.$().parent().height());
    // we need to wait for the table to be fully rendered before antiscroll can
    // be used
    Ember.run.next(this, this.updateLayout);
  },

  tableWidthNowTooSmall: function() {
    if ((this.get('_state') || this.get('state')) !== 'inDOM') {
      return false;
    }
    var oldTableWidth = this.get('_width');
    var newTableWidth = this.$().parent().width();
    // TODO(azirbel): This should be 'columns', I believe. Fix separately.
    var totalColumnWidth = this._getTotalWidth(this.get('tableColumns'));
    return (oldTableWidth > totalColumnWidth) && (newTableWidth < totalColumnWidth);
  },

  updateLayout: function() {
    if ((this.get('_state') || this.get('state')) !== 'inDOM') {
      return;
    }
    // update antiscroll
    this.$('.antiscroll-wrap').antiscroll().data('antiscroll').rebuild();
    if (this.get('columnsFillTable')) {
      return this.doForceFillColumns();
    }
  },

  // Iteratively adjusts column widths to adjust to a changed table width.
  // Attempts to scale columns proportionally. However, if a column hits a min
  // or max width after scaling proportionally, we need to respect that setting.
  // In that case, keep iterating until all column widths are set to the best
  // they can be. Note that this may fail to arrive at the table width if the
  // resizable columns are all restricted by min/max widths.
  doForceFillColumns: function() {
    var allColumns = this.get('_columns');
    var columnsToResize = allColumns.filterProperty('canAutoResize');
    var unresizableColumns = allColumns.filterProperty('canAutoResize', false);
    var availableWidth = this.get('_width') - this._getTotalWidth(unresizableColumns);
    var doNextLoop = true;
    var nextColumnsToResize = [];
    var totalResizableWidth;
    var newWidth;

    while (doNextLoop) {
      doNextLoop = false;
      nextColumnsToResize = [];
      totalResizableWidth = this._getTotalWidth(columnsToResize);
      /*jshint loopfunc:true */
      // TODO(azirbel): Revisit JSHint error above
      columnsToResize.forEach(function(column) {
        newWidth = Math.floor((column.get('width') / totalResizableWidth) * availableWidth);
        if (newWidth < column.get('minWidth')) {
          doNextLoop = true;
          column.set('width', column.get('minWidth'));
          availableWidth -= column.get('width');
        } else if (newWidth > column.get('maxWidth')) {
          doNextLoop = true;
          column.set('width', column.get('maxWidth'));
          availableWidth -= column.get('width');
        } else {
          column.set('width', newWidth);
          nextColumnsToResize.pushObject(column);
        }
      });
    }
  },

  onBodyContentLengthDidChange: Ember.observer(function() {
    Ember.run.next(this, function() {
      Ember.run.once(this, this.updateLayout);
    });
  }, 'bodyContent.length'),

  // ---------------------------------------------------------------------------
  // Private variables
  // ---------------------------------------------------------------------------

  _tableScrollTop: 0,
  _tableScrollLeft: 0,
  _innerColumnReordered: false,

  _width: null,
  _height: null,
  _contentHeaderHeight: null,

  _hasVerticalScrollbar: Ember.computed(function() {
    var height = this.get('_height');
    var contentHeight = this.get('_tableContentHeight') +
        this.get('_headerHeight') + this.get('_footerHeight');
    return height < contentHeight;
  }).property('_height', '_tableContentHeight', '_headerHeight',
      '_footerHeight'),

  _hasHorizontalScrollbar: Ember.computed(function() {
    var contentWidth = this.get('_tableColumnsWidth');
    var tableWidth = this.get('_width') - this.get('_fixedColumnsWidth');
    return contentWidth > tableWidth;
  }).property('_tableColumnsWidth', '_width', '_fixedColumnsWidth'),

  // tables-container height adjusts to the content height
  _tablesContainerHeight: Ember.computed(function() {
    var height = this.get('_height');
    var _headerHeight = this.get('_headerHeight');
    var headerHeight = _headerHeight * (this.get('hasColumnGroup') ? 2 : 1);
    var contentHeight = this.get('_tableContentHeight') + headerHeight + this.get('_footerHeight');
    return Math.min(contentHeight, height);
  }).property('_height', '_tableContentHeight', '_headerHeight',
      '_footerHeight'),

  // Actual width of the fixed columns
  _fixedColumnsWidth: Ember.computed(function() {
    return this._getTotalWidth(this.get('fixedColumns'));
  }).property('fixedColumns.@each.width'),

  // Actual width of the (non-fixed) columns
  _tableColumnsWidth: Ember.computed(function() {
    // Hack: We add 3px padding to the right of the table content so that we can
    // reorder into the last column.
    var contentWidth = this._getTotalWidth(this.get('tableColumns')) + 3;
    var availableWidth = this.get('_width') - this.get('_fixedColumnsWidth');
    return Math.max(contentWidth, availableWidth);
  }).property('tableColumns.@each.width', '_width', '_fixedColumnsWidth'),

  _rowWidth: Ember.computed(function() {
    var columnsWidth = this.get('_tableColumnsWidth');
    var nonFixedTableWidth = this.get('_tableContainerWidth') -
        this.get('_fixedColumnsWidth');
    return Math.max(columnsWidth, nonFixedTableWidth);
  }).property('_fixedColumnsWidth', '_tableColumnsWidth',
      '_tableContainerWidth'),

  // Dynamic header height that adjusts according to the header content height
  _headerHeight: Ember.computed(function() {
    var minHeight = this.get('minHeaderHeight');
    var contentHeaderHeight = this.get('_contentHeaderHeight');
    return Math.max(contentHeaderHeight, minHeight);
  }).property('_contentHeaderHeight', 'minHeaderHeight'),

  // Dynamic footer height that adjusts according to the footer content height
  _footerHeight: Ember.computed(function() {
    return this.get('hasFooter') ? this.get('footerHeight') : 0;
  }).property('footerHeight', 'hasFooter'),

  _bodyHeight: Ember.computed(function() {
    var bodyHeight = this.get('_tablesContainerHeight');
    if (this.get('hasHeader')) {
      bodyHeight -= this.get('_headerContainerHeight');
    }
    if (this.get('hasFooter')) {
      bodyHeight -= this.get('footerHeight');
    }
    return bodyHeight;
  }).property('_tablesContainerHeight', '_hasHorizontalScrollbar',
      '_headerHeight', 'footerHeight', 'hasHeader', 'hasFooter'),

  _headerContainerHeight: Ember.computed(function() {
    return this.get('hasColumnGroup') ? this.get('_headerHeight') * 2 : this.get('_headerHeight');
  }).property('hasColumnGroup','_headerHeight'),

  _tableBlockWidth: Ember.computed(function() {
    return this.get('_width') - this.get('_fixedColumnsWidth');
  }).property('_width', '_fixedColumnsWidth'),

  _fixedBlockWidthBinding: '_fixedColumnsWidth',

  _tableContentHeight: Ember.computed(function() {
    return this.get('rowHeight') * this.get('bodyContent.length');
  }).property('rowHeight', 'bodyContent.length'),

  _tableContainerWidth: Ember.computed(function() {
    return this.get('_width');
  }).property('_width'),

  _scrollContainerWidth: Ember.computed(function() {
    return this.get('_width') - this.get('_fixedColumnsWidth');
  }).property('_width', '_fixedColumnsWidth'),

  _numItemsShowing: Ember.computed(function() {
    return Math.floor(this.get('_bodyHeight') / this.get('rowHeight'));
  }).property('_bodyHeight', 'rowHeight'),

  _startIndex: Ember.computed(function() {
    var numContent = this.get('bodyContent.length');
    var numViews = this.get('_numItemsShowing');
    var rowHeight = this.get('rowHeight');
    var scrollTop = this.get('_tableScrollTop');
    var index = Math.floor(scrollTop / rowHeight);
    // Adjust start index so that end index doesn't exceed content length
    if (index + numViews >= numContent) {
      index = numContent - numViews;
    }
    return Math.max(index, 0);
  }).property('bodyContent.length', '_numItemsShowing', 'rowHeight',
      '_tableScrollTop'),

  _getTotalWidth: function(columns, columnWidthPath) {
    if (columnWidthPath == null) {
      columnWidthPath = 'width';
    }
    if (!columns) {
      return 0;
    }
    var widths = columns.getEach(columnWidthPath) || [];
    return widths.reduce((function(total, w) {
      return total + w;
    }), 0);
  },

  // ---------------------------------------------------------------------------
  // Selection
  // TODO: Make private or reorganize into a new section
  // ---------------------------------------------------------------------------

  lastSelected: null,

  isSelected: function(row) {
    switch (this.get('selectionMode')) {
      case 'none':
        return false;
      case 'single':
        return this.get('selection') === row.get('content');
      case 'multiple':
        return this.get('selection').contains(row.get('content'));
    }
  },

  setSelected: function(row, val) {
    this.persistSelection();
    var item = row.get('content');
    if (val) {
      return this.get('persistedSelection').addObject(item);
    } else {
      return this.get('persistedSelection').removeObject(item);
    }
  },

  // items that were selected directly or as part of a previous
  // range selection (shift-click)
  persistedSelection: Ember.computed(function() {
    return Ember.A();
  }),

  // items that are part of the currently editable range selection
  rangeSelection: Ember.computed(function() {
    return Ember.A();
  }),

  // TODO: Handle click event in the row view
  click: function(event) {
    var row = this.getRowForEvent(event);
    if (!row || !row.get('content')) {
      return;
    }
    var item = row.get('content');
    switch (this.get('selectionMode')) {
      case 'none':
        break;
      case 'single':
        this.get('persistedSelection').clear();
        this.get('persistedSelection').addObject(item);
        break;
      case 'multiple':
        if (event.shiftKey) {
          this.get('rangeSelection').clear();

          var lastIndex = this.rowIndex(this.get('lastSelected'));
          // If the last selected row is no longer in the table, use the
          // first row in the table
          if (lastIndex === -1) {
            lastIndex = 0;
          }

          var curIndex = this.rowIndex(this.getRowForEvent(event));
          var minIndex = Math.min(lastIndex, curIndex);
          var maxIndex = Math.max(lastIndex, curIndex);

          this.get('rangeSelection').addObjects(
            this.get('bodyContent').slice(minIndex, maxIndex + 1)
            .mapBy('content')
          );
        } else {
          if (!event.ctrlKey && !event.metaKey) {
            this.get('persistedSelection').clear();
            this.get('rangeSelection').clear();
          } else {
            this.persistSelection();
          }
          if (this.get('persistedSelection').contains(item)) {
            this.get('persistedSelection').removeObject(item);
          } else {
            this.get('persistedSelection').addObject(item);
          }
          this.set('lastSelected', row);
        }
        break;
    }
  },

  findRow: function(content) {
    // TODO(azirbel): Replace with filter
    this.get('bodyContent').forEach(function(row) {
      if (row.get('content') === content) {
        return row;
      }
    });
    return null;
  },

  rowIndex: function(row) {
    if (!this.get('bodyContent')) {
      return null;
    }
    return this.get('bodyContent').indexOf(row);
  },

  persistSelection: function() {
    this.get('persistedSelection').addObjects(this.get('rangeSelection'));
    this.get('rangeSelection').clear();
  },

  getRowForEvent: function(event) {
    var $rowView = Ember.$(event.target).parents('.ember-table-table-row');
    var view = Ember.View.views[$rowView.attr('id')];
    if (view) {
      return view.get('row');
    }
    return null;
  }
});
