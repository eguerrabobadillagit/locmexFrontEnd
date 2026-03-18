import { GridOptions } from 'ag-grid-community';
import { IFilterOption } from '../../../core/models/filter-option.interface';

export const vehicleFilterOptions: IFilterOption[] = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'Activo', value: 'active' },
  { label: 'En Ruta', value: 'in-route' },
  { label: 'Inactivo', value: 'inactive' }
];

export const vehicleGridOptions: GridOptions = {
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    enableRowGroup: true
  },
  animateRows: true,
  // rowHeight: 70,
  pagination: false,
  suppressCellFocus: true,
  rowSelection: 'multiple',
  domLayout: 'autoHeight',
  rowGroupPanelShow: 'always',
  groupDisplayType: 'groupRows'
};
