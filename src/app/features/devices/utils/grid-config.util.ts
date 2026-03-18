import { GridOptions } from 'ag-grid-community';
import { IFilterOption } from '../../../core/models/filter-option.interface';

export const deviceFilterOptions: IFilterOption[] = [
  { label: 'Todos los protocolos', value: 'all' },
  { label: 'TCP', value: 'TCP' },
  { label: 'UDP', value: 'UDP' },
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' }
];

export const deviceGridOptions: GridOptions = {
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    enableRowGroup: true
  },
  animateRows: true,
  pagination: false,
  suppressCellFocus: true,
  rowSelection: 'multiple',
  domLayout: 'autoHeight',
  rowGroupPanelShow: 'always',
  groupDisplayType: 'groupRows'
};
