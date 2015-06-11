import Ember from 'ember';
import ColumnFixture from './columns';

export default Ember.Object.extend({
  table: function (obj) {
    var columnFixture = ColumnFixture.create();
    return obj.subject({
      columns: [
        columnFixture.get('firstColumn'),
        columnFixture.get('secondColumn'),
        columnFixture.get('thirdColumn')
      ],
      hasFooter: false,
      enableContentSelection: true,
      content: []
    });
  },
  groupTable: function (obj) {
    var columnFixture = ColumnFixture.create();
    var result = obj.subject({
      columns: [
        columnFixture.get('firstColumn'),
        columnFixture.get('firstGroup')],
      hasFooter: false,
      enableContentSelection: true,
      content: []
    });
    return result;
  }
});
