import Ember from 'ember';
import { moduleForComponent} from 'ember-qunit';
import TableFixture from '../fixture/table';


export default function moduleForEmberTable(description, subject) {
  var tableFixture = TableFixture.create();

  moduleForComponent('ember-table', 'EmberTableComponent', {
    needs: [
      'view:body-table-container',
      'view:column-sortable-indicator',
      'view:footer-table-container',
      'view:header-cell',
      'view:header-row',
      'view:header-block',
      'view:header-table-container',
      'view:scroll-container',
      'view:lazy-table-block',
      'view:multi-item-collection',
      'view:scroll-container',
      'view:scroll-panel',
      'view:table-block',
      'view:table-cell',
      'view:table-row',
      'view:header-group',
      'view:header-groups-block',
      'view:grouping-column-cell',
      'template:body-table-container',
      'template:footer-table-container',
      'template:header-cell',
      'template:header-row',
      'template:header-table-container',
      'template:scroll-container',
      'template:table-cell',
      'template:table-row',
      'template:grouping-column-cell'
    ],
    subject: subject
  });

}
