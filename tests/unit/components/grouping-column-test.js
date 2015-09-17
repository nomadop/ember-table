import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import GroupedRowIndicator from 'ember-table/views/grouped-row-indicator';
import TableDom from '../../helpers/table-dom';

var content = [
    {
      firstLevel: 'firstRootGroupName',
      id: 100,
      state: 'up'
    },
    {
      firstLevel: 'secondRootGroupName',
      id: 1000,
      state: 'up'
    },
    {
      firstLevel: 'thirdRootGroupName',
      id: 10000,
      state: 'down',
      children: [
        {
          secondLevel: 'secondRootGroupName',
          id: 10007,
          state: 'up'
        },
        {
          secondLevel: 'secondRootGroupName',
          id: 10002,
          state: 'down'
        }]
    }];

var groupMeta = {
  groupingMetadata: [{id: "firstLevel"}, {id: "secondLevel"}]
};

moduleForEmberTable('render grouping column',
  function() {
    return EmberTableFixture.create({
      content: content,
      height: 300,
      groupMeta: groupMeta
    });
});

test('it should has a grouping column at most left position', function(assert) {
  var component = this.subject();

  this.render();

  var fixedBodyCell = component.fixedBodyCell(0, 0);
  assert.equal(fixedBodyCell.length, 1);
});

test('it should render group name in grouping column', function(assert) {
  var component = this.subject();
  this.render();

  var firstRowGroupColumnName = component.fixedBodyCell(0, 0).text().trim();

  assert.equal(firstRowGroupColumnName, 'firstRootGroupName');
});

test('it should render group indicator in grouping column when the loan is grouping row', function(assert) {
  var component = this.subject();
  this.render();

  var indicator = component.rowGroupingIndicator(2);

  assert.equal(indicator.length, 1);
});

test('it should render group indicator in grouping column even a grouping row has no children', function(assert) {
  var component = this.subject();
  this.render();

  var indicator = component.rowGroupingIndicator(1);

  assert.equal(indicator.length, 1, "it should render grouped row indicator");
});

test('it should render columns data in columns', function(assert) {
  var component = this.subject();
  this.render();

  var firstRowId = component.bodyCell(0, 0).text().trim();
  var firstRowState = component.bodyCell(0, 2).text().trim();

  assert.equal(firstRowId, '100');
  assert.equal(firstRowState, 'up');
});

moduleForEmberTable('Given a table with group row data',
  function() {
    return EmberTableFixture.create({
      height: 330,
      width: 600,
      content: content,
      numFixedColumns: 0,
      groupMeta: groupMeta
    });
});

test('lock grouping column', function(assert) {
  var component = this.subject();
  this.render();

  var offsetBefore = [component.nthColumnHeader(1).offset()];
  Ember.run(function() {
    component.resizeColumn('Column1', 100);
    component.scrollBodyLeft(10);
  });
  assert.equal(component.nthColumnHeader(1).find('span').text().trim(), '', "first column header should be blank");

  var offsetAfter = [component.nthColumnHeader(1).offset()];
  assert.deepEqual(offsetAfter, offsetBefore, 'grouping column 1 should not be scrolled left');
});

moduleForEmberTable('Given a table with group row data and two fixed columns', function () {
  return EmberTableFixture.create({
    height: 330,
    width: 700,
    content: content,
    numFixedColumns: 2,
    groupMeta: groupMeta
  });
});

test('lock grouping column in addition', function(assert) {
  var component = this.subject();
  this.render();
  var offsetBefore = [1, 2, 3].map(function (x) {
    return component.nthColumnHeader(x).offset();
  });
  var nonFixedOffsetBefore = [component.nthColumnHeader(4).offset()];
  Ember.run(function () {
    component.resizeColumn('Column2', 200);
    component.scrollBodyLeft(50);
  });

  var offsetAfter = [1, 2, 3].map(function (x) {
    return component.nthColumnHeader(x).offset();
  });
  var nonFixedOffsetAfter = [component.nthColumnHeader(4).offset()];

  assert.deepEqual(component.nthColumnHeader(1).find('span').text().trim(), '', "first column header should be blank");
  assert.deepEqual(offsetBefore, offsetAfter, 'grouping column and fixed columns should not be scrolled left');
  assert.notDeepEqual(nonFixedOffsetAfter, nonFixedOffsetBefore, 'non-fixed columns should be scrolled left');

});

test('it should display group row children when group row has children ', function(assert) {
  var component = this.subject();
  this.render();

  var indicator = component.rowGroupingIndicator(2);

  indicator.click();

  assert.ok(indicator.hasClass('unfold'), 'should show collapse icon');
  var firstChildId = component.fixedBodyCell(3, 1).text().trim();

  assert.equal(firstChildId, '10007', 'children row should be displayed');
});

test('collapse children ', function(assert) {
  var component = this.subject();
  this.render();

  var indicator = component.rowGroupingIndicator(2);

  indicator.click();
  indicator.click();

  assert.ok(!indicator.hasClass('unfold'), 'should show expand icon');
  var firstChildId = component.fixedBodyCell(2, 1).text().trim();

  assert.equal(firstChildId, '10000', 'group row should be displayed');
});


moduleForEmberTable('table with two group rows',
  function() {
    return EmberTableFixture.create({
      height: 330,
      width: 700,
      content: [{
          firstLevel: 'firstRootGroupName',
          id: 100,
          state: 'up'
        }, {
          firstLevel: 'secondRootGroupName',
          id: 10000,
          state: 'down',
          children: [{
            id: 10007,
            state: 'up'
          }, {
            id: 10002,
            state: 'down'
          }]
        }, {
          firstLevel: 'thirdRootGroupName',
          id: 20000,
          state: 'down',
          children: [{
            id: 20007,
            state: 'up'
          }, {
            id: 20002,
            state: 'down'
          }]
        }],
      numFixedColumns: 2,
      groupMeta: {
        groupingMetadata: [{id: "firstLevel"}, {id: "secondLevel"}]
      }
    });
});

test('toggle expand indicator', function(assert) {
  var component = this.subject();
  this.render();

  var indicator = component.rowGroupingIndicator(1);

  indicator.click();

  assert.ok(indicator.hasClass('unfold'), 'should show collapse icon');
  var secondGroupingIndicator = component.rowGroupingIndicator(4);
  assert.ok(!!!secondGroupingIndicator.hasClass('unfold'), 'second grouping row indicator should not be changed');
});

test('expand grouping column width', function(assert) {
  var component = this.subject();
  this.render();

  var indicator = component.rowGroupingIndicator(1);
  var columnWidthBefore = component.nthColumnHeader(1).width();

  indicator.click();

  var columnWidthAfter = component.nthColumnHeader(1).width();
  assert.equal(columnWidthAfter, columnWidthBefore + 10, 'should expand width 10px when expanded one level');
});

test('keep grouping column width on expanding', function(assert) {
  var component = this.subject();
  this.render();

  component.rowGroupingIndicator(1).click();

  var columnWidthBefore = component.nthColumnHeader(1).width();

  component.rowGroupingIndicator(4).click();

  var columnWidthAfter = component.nthColumnHeader(1).width();
  assert.equal(columnWidthAfter, columnWidthBefore, 'should not increase width when expanding does not increase total depth');
});

test('decrease grouping column width', function(assert) {
  var component = this.subject();
  this.render();

  var indicator = component.rowGroupingIndicator(1);
  var columnWidthBefore = component.nthColumnHeader(1).width();

  indicator.click();
  indicator.click();

  var columnWidthAfter = component.nthColumnHeader(1).width();
  assert.equal(columnWidthAfter, columnWidthBefore, 'should decrease width expanded row is collapsed');
});

test('keep grouping column width on collapse', function(assert) {
  var component = this.subject();
  this.render();
  component.rowGroupingIndicator(1).click();
  component.rowGroupingIndicator(4).click();

  var columnWidthBefore = component.nthColumnHeader(1).width();

  component.rowGroupingIndicator(4).click();

  var columnWidthAfter = component.nthColumnHeader(1).width();
  assert.equal(columnWidthAfter, columnWidthBefore, 'should not decrease width when collapse does not decrease total depth');
});

moduleForEmberTable('table with two level of grouped rows',
  function() {
    return EmberTableFixture.create({
      height: 330,
      width: 700,
      content: [{
          firstLevel: 'first-level',
          id: 100,
          state: 'up',
          children: [{
            secondLevel: 'second-level-row1',
            id: 1001,
            state: 'up'
          }, {
            secondLevel: 'second-level-row2',
            id: 1002,
            state: 'down',
            children: [{ id: 10021, state: 'up'}, { id: 10022, state: 'down'}]
          }]
        }],
      groupMeta: {
        groupingMetadata: [{id: "firstLevel"}, {id: "secondLevel"}, {id: "thirdLevel"}]
      }
    });
  }
);

test('expand first level row', function (assert) {
  var component = this.subject();
  this.render();
  var firstLevelRowIndicator = component.rowGroupingIndicator(0);

  firstLevelRowIndicator.click();

  var secondLevelRow1 = component.rowGroupingIndicator(1);
  assert.equal(secondLevelRow1.length, 1, "second-level-row1 should render indicator");

  var secondLevelRow2Indicator = component.rowGroupingIndicator(2);
  assert.equal(secondLevelRow2Indicator.length, 1, "second-level-row2 should show indicator");
  assert.ok(!secondLevelRow2Indicator.hasClass('unfold'), "second-level-row2 should have expand indicator");
});

test('expand second level row', function (assert) {
  var component = this.subject();
  this.render();
  var firstLevelRowIndicator = component.rowGroupingIndicator(0);
  firstLevelRowIndicator.click();
  var secondLevelRowIndicator = component.rowGroupingIndicator(2);

  secondLevelRowIndicator.click();

  assert.ok(secondLevelRowIndicator.hasClass('unfold'), 'second level row should have collapse indicator');
  var secondLevelRowChildId = component.bodyCell(3, 0).text().trim();
  assert.equal(secondLevelRowChildId, 10021, "the id of second level row child should equal to 10021");
});

test('collapse second level row', function (assert) {
  var component = this.subject();
  this.render();
  var firstLevelRowIndicator = component.rowGroupingIndicator(0);
  firstLevelRowIndicator.click();
  var secondLevelRowIndicator = component.rowGroupingIndicator(2);
  secondLevelRowIndicator.click();

  secondLevelRowIndicator.click();

  assert.ok(!secondLevelRowIndicator.hasClass('unfold'), "second-level-row2 should show expanded indicator");
  var secondLevelRowChildId = component.bodyCell(3, 0).text().trim();
  assert.ok(!secondLevelRowChildId, "should hide second level children row");
});

test('collapse first level row', function (assert) {
  var component = this.subject();
  this.render();
  var firstLevelRowIndicator = component.rowGroupingIndicator(0);
  firstLevelRowIndicator.click();
  var secondLevelRowIndicator = component.rowGroupingIndicator(2);
  secondLevelRowIndicator.click();

  firstLevelRowIndicator.click();

  assert.ok(!firstLevelRowIndicator.hasClass('unfold'), "first-level-row should show expanded indicator");
  var rowCount = component.fixedBodyRows().length - 2; // there are two hidden rows in ember table.
  assert.equal(rowCount, 1, "ember table should show one row");
});

test('Indent inner grouped row content', function(assert){
  var component = this.subject();
  this.render();
  var firstLevelRowIndicator = component.rowGroupingIndicator(0);
  var firstLevelCellPaddingLeft = component.fixedBodyCell(0, 0).css('padding-left');
  assert.equal(firstLevelCellPaddingLeft, '15px', "first level indicator should be default padding-left");

  firstLevelRowIndicator.click();

  var secondLevelBodyCell = component.fixedBodyCell(1, 0);
  var secondLevelRowCellPaddingLeft = secondLevelBodyCell.css('padding-left');
  assert.equal(secondLevelRowCellPaddingLeft, '25px', "second level Padding-left should be equal to 15px");

  var secondLevelRowIndicator = component.rowGroupingIndicator(2);
  secondLevelRowIndicator.click();

  var thirdLevelBodyCell = component.fixedBodyCell(3,0);
  var thirdLevelRowCellPaddingLeft = thirdLevelBodyCell.css("padding-left");
  assert.equal(thirdLevelRowCellPaddingLeft, '35px',"third level Padding-left should be equal to 25px");
});

moduleForEmberTable('table with five level of grouped rows',
  function() {
    return EmberTableFixture.create({
      height: 330,
      width: 700,
      content: [{
          firstLevel: 'first-level',
          id: 100,
          state: 'up',
          children: [{
            secondLevel: 'second-level',
            id: 200,
            state: 'down',
            children: [{
              thirdLevel: 'third-level',
              id: 300,
              state: 'down',
              children: [{
                fourthLevel: 'fourth-level',
                id: 400,
                state: 'down',
                children: [{
                  id: 4001,
                  state: 'up'
                }, {
                  id: 4002,
                  state: 'down'
                }]
              }]
            }]
          }]
        }],
      groupMeta: {
        groupingMetadata: [{id: "firstLevel"}, {id: "secondLevel"}, {id: "thirdLevel"}, {id: "fourthLevel"}, {id: "fifthLevel"}]
      }
    });
  }
);

test('expand unlimited grouped data', function(assert){
  var component = this.subject();
  this.render();

  var groupedRows = [0, 1, 2, 3];
  groupedRows.forEach(function(groupRow) {
    var indicator = component.rowGroupingIndicator(groupRow);
    indicator.click();
    assert.ok(indicator.hasClass('unfold'), "level" + (groupRow + 1) + " should show collapse indicator");
  });
  var fourthLevelRowChildId = component.bodyCell(4, 0).text().trim();
  assert.equal(fourthLevelRowChildId, 4001, "the fourth level children row should be displayed");
});

test('collapse unlimited grouped data', function(assert){
  var component = this.subject();
  this.render();
  component.expandGroupingRows([0,1,2,3]);

  [3, 2, 1, 0].forEach(function(index) {
    var indicator = component.rowGroupingIndicator(index);
    indicator.click();
    assert.ok(!indicator.hasClass('unfold'), (index + 1) + "th-level-row should show expand indicator");
  });
});

test('collapse unlimited grouped data', function(assert) {
  var component = this.subject();
  this.render();
  component.expandGroupingRows([0,1,2,3]);

  var firstLevelRowIndicator = component.rowGroupingIndicator(0);
  firstLevelRowIndicator.click();

  var rowCount = component.fixedBodyRows().length - 2; // there are two hidden rows in ember table.
  assert.equal(rowCount, 1, "body should show first level row and hidden others");
  var firstLevelRowId = component.bodyCell(0, 0).text().trim();
  assert.equal(firstLevelRowId, 100, "first level row id should be equal to 100");
  assert.equal(component.nthColumnHeader(0).outerWidth(), 150, "should collapse all children rows");
});


test('re-expand unlimited grouped data', function(assert) {
  var component = this.subject();
  this.render();
  component.expandGroupingRows([0,1,2,3]);

  var firstLevelRowIndicator = component.rowGroupingIndicator(0);
  firstLevelRowIndicator.click();
  firstLevelRowIndicator.click();

  assert.equal(component.nthColumnHeader(0).outerWidth(), 190, "should re-expand all children rows");
});


moduleForEmberTable('table with two levels of grouped rows', function () {
    return EmberTableFixture.create({
      height: 330,
      width: 700,
      content: [
          {
            firstLevel: 'first level row 1',
            id: 1
          },
          {
            firstLevel: 'first level row 2',
            id: 2,
            children: [
              {id: 21}
            ]
          }
        ],
      groupMeta: {
        groupingMetadata: [{id: "firstLevel"}, {id: "secondLevel"}]
      }
    });
  }
);

test('grouped row indicator style', function(assert){
  var component = this.subject();
  this.render();
  var noChildrenRowIndicator = component.rowGroupingIndicator(0);
  assert.equal(noChildrenRowIndicator.length, 1, "grouping row should render indicator even if it has no children");
  var hasChildrenRowIndicator = component.rowGroupingIndicator(1);
  hasChildrenRowIndicator.click();
  var secondLevelRowId = component.bodyCell(2, 0).text().trim();
  assert.equal(secondLevelRowId, '21', 'it should show second level rows');
});

moduleForEmberTable('Customize grouped row indicator view', function (CustomIndicatorView) {
    this.container.register('view:custom-grouped-row-indicator', CustomIndicatorView);
    return EmberTableFixture.create({
      height: 330,
      width: 700,
      groupedRowIndicatorViewName: 'custom-grouped-row-indicator',
      content:[
          {
            firstLevel: 'first level row 1',
            id: 1
          },
          {
            firstLevel: 'first level row 2',
            id: 2,
            children: [
              {id: 21}
            ]
          }
        ],
      groupMeta: {
        groupingMetadata: [{id: "firstLevel"}, {id: "secondLevel"}]
      }
    });
  }
);

test('add customized css class', function (assert) {
  var CustomIndicatorView = GroupedRowIndicator.extend({
    classNames: ['custom-grouped-row-indicator']
  });
  var component = this.subject(CustomIndicatorView);
  this.render();

  var indicator = component.fixedBodyCell(1, 0);
  assert.equal(indicator.find('.custom-grouped-row-indicator').length, 1, "should show bind customized css class");
});

test('use customized template and display expand state, expand level', function (assert) {
  var CustomIndicatorView = GroupedRowIndicator.extend({
    template: Ember.Handlebars.compile(`
      {{view.displayText}}
    `),
    displayText: Ember.computed(function () {
      return this.get('isExpanded') + '-' + this.get('expandLevel');
    }).property('isExpanded', 'expandLevel')

  });
  var component = this.subject(CustomIndicatorView);
  this.render();

  var indicator = component.fixedBodyCell(1, 0).find('.grouping-column-indicator');
  assert.equal(indicator.text().trim(), 'false-0', "should show expand state and level");
});

moduleForEmberTable('table with two grouping rows which has three levels', function () {
    return EmberTableFixture.create({
      height: 330,
      width: 700,
      content: [
          {
            groupName: 'root',
            id: 0,
            children: [
              {
                groupName: 'first level row 1',
                id: 1,
                children: [
                  {
                    groupName: 'second level row 1',
                    id: 10,
                    children: [
                      {groupName: 'third level row 1', id: 100},
                      {groupName: 'third level row 2', id: 101}
                    ]
                  }
                ]
              },
              {
                groupName: 'first level row 2',
                id: 2,
                children: [
                  {
                    groupName: 'second level row 1',
                    id: 20,
                    children: [
                      {groupName: 'third level row 1', id: 200},
                      {groupName: 'third level row 2', id: 201}
                    ]
                  }
                ]
              }
            ]
          }
        ],
      groupMeta: {
        groupingMetadata: [{id: "accountSection"}, {id: "accountType"}, {"id": "accountCode"}],
      }
    });
  }
);

test('auto expanding grouping column width', function(assert) {
  var component = this.subject();
  this.render();

  component.expandGroupingRows([0, 1, 3, 4]);
  component.rowGroupingIndicator(3).click();
  component.rowGroupingIndicator(1).click();

  assert.equal(component.nthColumnHeader(0).outerWidth(), 160, 'grouping column should be width of expand depth 1');
});

moduleForEmberTable('table with three levels rows1', function() {
    return EmberTableFixture.create({
      height: 330,
      width: 700,
      content:[
          {
            groupName: 'Row 1',
            id: 1
          },
          {
            groupName: 'Row 2',
            id: 2,
            children: [
              {
                groupName: 'Row 2-1',
                id: 21,
                children: [
                  {
                    groupName: 'Row 2-1-1',
                    id: 211
                  }
                ]
              }
            ]
          },
          {
            groupName: 'first level row 3',
            id: 3
          },
          {
            groupName: 'Row 4',
            id: 4,
            children: [
              {
                groupName: 'Row 4-1',
                id: 41,
                children: undefined
              }
            ]
          },
          {
            groupName: 'Row 5',
            id: 5
          }
        ],
      groupMeta: {
        groupingMetadata: [{id: "accountSection"}, {id: "accountType"}, {"id": "accountCode"}, {"id": ""}],
      }
    });
  }
);

test('expand and collapse grouped rows when row.children is null or undefined', function(assert){
  var component = this.subject();
  this.render();

  component.rowGroupingIndicator(3).click();
  component.rowGroupingIndicator(4).click();
  component.rowGroupingIndicator(3).click();
  component.rowGroupingIndicator(3).click();

  var bodyRows = component.bodyRows();
  assert.ok(bodyRows.length - 2 > 5, "body rows should be larger than 5");
});


moduleForEmberTable('Resize grouping column', function (groupingColumnResizable) {
  return EmberTableFixture.create({
    groupMeta: {
      groupingColumnResizable: groupingColumnResizable,
      groupingMetadata: [
        {id: 'accountSection'},
        {id: 'accountType'}
      ]
    },
    content: [
      {
        id: 1, accountSection: 'as-1',
        children: [
          {id: 11, accountType: 'at-11'}
        ]
      },
      {id: 2, accountSection: 'as-2'}
    ]
  });
});

test('Can not resize grouping column by default', function (assert) {
  var component = this.subject();
  this.render();
  var tableDom = TableDom.create({content: component.$()});
  var groupingColumnHeader = tableDom.headerRows(0).cell(0);
  var widthBefore = groupingColumnHeader.width();

  Ember.run(function () {
    groupingColumnHeader.resizeX(60);
  });

  var widthAfter = groupingColumnHeader.width();
  assert.equal(widthAfter, widthBefore);
});

test('Can resize grouping column', function (assert) {
  var component = this.subject(true);
  this.render();
  var tableDom = TableDom.create({content: component.$()});
  var groupingColumnHeader = tableDom.headerRows(0).cell(0);
  var widthBefore = groupingColumnHeader.width();

  var distanceX = 60;
  Ember.run(function () {
    groupingColumnHeader.resizeX(distanceX);
  });

  var widthAfter = groupingColumnHeader.width();
  assert.equal(widthAfter, widthBefore + distanceX);
});

test('Disable auto adjusting for resizable grouping column', function (assert) {
  var component = this.subject(true);
  this.render();
  var tableDom = TableDom.create({content: component.$()});
  var groupingColumnHeader = tableDom.headerRows(0).cell(0);
  var widthBefore = groupingColumnHeader.width();

  Ember.run(function () {
    tableDom.rows(0).groupIndicator().click();
  });

  var widthAfter = groupingColumnHeader.width();
  assert.equal(widthAfter, widthBefore);
});
