import { GridOptions } from 'ag-grid-community';
import { baseGridOptions } from '../../../core/utils/grid-styles.config';

export const userGridOptions: GridOptions = {
  ...baseGridOptions,
  pagination: true,
  paginationPageSize: 20,
  paginationPageSizeSelector: [10, 20, 50, 100],
  rowHeight: 48,
  headerHeight: 48,
  suppressCellFocus: true,
  enableCellTextSelection: true,
  ensureDomOrder: true,
  animateRows: true,
  rowSelection: 'single',
  suppressRowClickSelection: true,
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    suppressMovable: true
  }
};

export const userFilterOptions = [
  {
    label: 'Todos',
    value: 'all',
    count: 0
  },
  {
    label: 'Activos',
    value: 'active',
    count: 0
  },
  {
    label: 'Inactivos',
    value: 'inactive',
    count: 0
  }
];
