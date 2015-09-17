import Ember from 'ember';
import RowLoadingIndicator from './row-loading-indicator';
import StyleBindingsMixin from 'ember-table/mixins/style-bindings';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default Ember.View.extend(
StyleBindingsMixin, RegisterTableComponentMixin, {
  // ---------------------------------------------------------------------------
  // API - Inputs
  // ---------------------------------------------------------------------------

  // TODO: Doc
  templateName: 'table-cell',
  classNames: ['ember-table-cell'],
  classNameBindings: 'column.textAlign',
  styleBindings: 'width',

  // ---------------------------------------------------------------------------
  // Internal properties
  // ---------------------------------------------------------------------------

  init: function() {
    this._super();
    this.contentPathDidChange();
    this.contentDidChange();
  },

  rowLoadingIndicatorView: Ember.computed(function () {
    var customizeViewName = this.get('tableComponent.rowLoadingIndicatorViewName');
    var viewName = customizeViewName ? customizeViewName : this._defaultRowLoadingIndicatorViewName;
    return this.container.lookupFactory('view:' + viewName);
  }).property('tableComponent.rowLoadingIndicatorViewName'),

  rowLoadingIndicatorViewDidChange: Ember.observer('rowLoadingIndicatorView', function () {
    this.rerender();
  }),

  hasCustomRowLoadingIndicatorView: Ember.computed(function() {
    return this.get('tableComponent.rowLoadingIndicatorViewName') !== this._defaultRowLoadingIndicatorViewName;
  }).property('tableComponent.rowLoadingIndicatorViewName'),

  _defaultRowLoadingIndicatorViewName: 'row-loading-indicator',

  row: Ember.computed.alias('parentView.row'),
  column: Ember.computed.alias('content'),
  width: Ember.computed.alias('column.width'),

  contentDidChange: function() {
    this.notifyPropertyChange('cellContent');
  },

  isLoading: Ember.computed.oneWay('row.isLoading'),

  contentPathWillChange: Ember.beforeObserver(function() {
    var contentPath = this.get('column.contentPath');
    if (contentPath) {
      this.removeObserver("row." + contentPath, this,
          this.contentDidChange);
    }
  }, 'column.contentPath'),

  contentPathDidChange: Ember.beforeObserver(function() {
    var contentPath = this.get('column.contentPath');
    if (contentPath) {
      this.addObserver("row." + contentPath, this,
          this.contentDidChange);
    }
  }, 'column.contentPath'),

  cellContent: Ember.computed(function(key, value) {
    var row = this.get('row');
    var column = this.get('column');
    if (!row || !column) {
      return;
    }
    if (arguments.length === 1) {
      value = column.getCellContent(row);
    } else {
      column.setCellContent(row, value);
    }
    return value;
  }).property('row.isLoaded', 'column')
});
