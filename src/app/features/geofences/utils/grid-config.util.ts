import { GridOptions } from 'ag-grid-community';
import { IFilterOption } from '../../../core/models/filter-option.interface';

export const geofenceGridOptions: GridOptions = {
  domLayout: 'autoHeight',
  pagination: true,
  paginationPageSize: 10,
  paginationPageSizeSelector: [10, 25, 50, 100],
  rowSelection: 'single',
  animateRows: true,
  enableCellTextSelection: true,
  suppressMovableColumns: true,
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100
  }
};

export const geofenceFilterOptions: IFilterOption[] = [
  { label: 'Todos los tipos', value: 'all' },
  { label: 'Circular', value: 'circular' },
  { label: 'Polígono', value: 'polygon' }
];
