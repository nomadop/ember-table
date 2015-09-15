import Ember from 'ember';

let TableDom = Ember.ObjectProxy.extend({

  parent: null,

  aliasMethods: ['find', 'eq', 'click', 'text', 'has', 'hasClass', 'trigger'],

  length: Ember.computed.oneWay('content.length'),

  init() {
    this.aliasMethods.forEach((methodName) => {
      this.defineMethod(methodName);
    });
    this._super();
  },

  defineMethod(name) {
    this.set(name, (...args) => {
      let content = this.get('content');
      return content[name](...args);
    });
  },

  headerRows(idx) {
    let selector = idx === undefined ? '' : `:eq(${idx})`;
    let dom = this.find('.ember-table-header-block').find(`.ember-table-table-row${selector}`);
    return this.createChildDom(dom);
  },

  headerRow(idx) {
    let dom = this.headerRows().eq(idx);
    return this.createChildDom(dom);
  },

  rows(idx) {
    let selector = idx === undefined ? '' : `:eq(${idx})`;
    let dom = this.find('.ember-table-table-block.lazy-list-container').find(`.ember-table-table-row${selector}`);
    return this.createChildDom(dom);
  },

  row(idx) {
    let dom = this.rows().eq(idx);
    return this.createChildDom(dom);
  },

  cellsContent(rows, cols) {
    if (typeof(rows) === 'number') {
      let rowIdxs = [];
      for (let i = 0; i < rows; i++) {
        rowIdxs.push(i);
      }
      rows = rowIdxs;
    }
    return rows.map((rIdx) => {
      return cols.map((cIdx) => {
        return this.cell(rIdx, cIdx).text().trim();
      });
    });
  },

  groupIndicator() {
    let dom = this.find('.grouping-column-indicator:has(div)');
    return this.createChildDom(dom);
  },

  cells(){
    let dom = this.find('.ember-table-cell');
    return this.createChildDom(dom);
  },

  cell(...args) {
    let parent = args.length === 1 ? this : this.rows(args[0]);
    let dom = parent.cells().eq(args[args.length - 1]);
    return this.createChildDom(dom);
  },

  createChildDom(dom) {
    return TableDom.create({
      content: dom,
      parent: this
    });
  },

  cellWithContent(text) {
    let dom = this.find('.ember-table-cell:contains(' + text + ')');
    return this.createChildDom(dom);
  },

  // actions

  clickWithCommand() {
    this.trigger({type: 'click', metaKey: true});
  },

  resizeX(dx) {
    let dom = this.find(".ui-resizable-e");
    // simulate drag will miss 1px;
    dom.simulate('mouseover').simulate('drag', {dx: dx + 1});
  },

  scrollTop(defer, rowCount) {
    let delta = 30;
    if (rowCount < 0) {
      rowCount = -rowCount;
      delta = -30;
    }
    let px = 0;
    let scrollBar = this.find('.antiscroll-box .antiscroll-inner');
    let scroll = () => {
      px += delta;
      scrollBar.scrollTop(px);
      rowCount--;
      if (rowCount > 0) {
        setTimeout(scroll, 100);
      } else {
        defer.resolve();
      }
    };
    setTimeout(scroll, 0);
  },

  // attributes

  width() {
    return parseInt(this.content.css('width'));
  }
});

export default TableDom;
