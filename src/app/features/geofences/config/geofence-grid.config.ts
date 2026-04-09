import { ColDef, GridOptions } from 'ag-grid-community';
import { IFilterOption } from '../../../core/models/filter-option.interface';
import {
  renderTextCell,
  renderIconTextCell,
  renderActionButtons,
  renderStatusChip
} from '../../../core/utils/grid-cell-renderers.util';
import { standardColumnConfig } from '../../../core/utils/grid-styles.config';

export const geofenceFilterOptions: IFilterOption[] = [
  { label: 'Todos los estados', value: 'all' },
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' }
];

export const geofenceColumnDefs: ColDef[] = [
  {
    headerName: 'Geocerca',
    field: 'name',
    ...standardColumnConfig.primaryColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      const icon = params.data.type === 'circular' ? 'radio-button-on-outline' : 'shapes-outline';
      return renderIconTextCell(params.value, icon);
    }
  },
  {
    headerName: 'Tipo',
    field: 'geometryType',
    ...standardColumnConfig.textColumn,
    enableRowGroup: true,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      const typeMap: any = {
        'circle': '⭕ Circular',
        'polygon': '⬡ Polígono',
        'rectangle': '▭ Rectángulo'
      };
      return renderTextCell(typeMap[params.value] || '-');
    }
  },
  {
    headerName: 'Dimensión',
    field: 'geoJson',
    ...standardColumnConfig.textColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      try {
        const geoJson = JSON.parse(params.value);
        if (geoJson.type === 'MultiPolygon' || geoJson.type === 'Polygon') {
          const coords = geoJson.coordinates[0];
          const pointCount = Array.isArray(coords[0]) ? coords[0].length : coords.length;
          return renderTextCell(`${pointCount} puntos`);
        }
      } catch (e) {
        return renderTextCell('-');
      }
      return renderTextCell('-');
    }
  },
  {
    headerName: 'Estado',
    field: 'isActive',
    ...standardColumnConfig.statusColumn,
    enableRowGroup: true,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      const status = params.value ? 
        { text: 'Activo', type: 'success' as const } : 
        { text: 'Inactivo', type: 'danger' as const };
      return renderStatusChip(status.text, status.type);
    }
  },
  {
    headerName: 'Alertas',
    field: 'alertOnEnter',
    ...standardColumnConfig.textColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      const alerts = [];
      if (params.data.alertOnEnter) alerts.push('Entrada');
      if (params.data.alertOnExit) alerts.push('Salida');
      const text = alerts.length > 0 ? alerts.join(', ') : 'Sin alertas';
      return renderTextCell(text);
    }
  },
  {
    headerName: 'Cliente',
    field: 'clientName',
    ...standardColumnConfig.textColumn,
    enableRowGroup: true,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderTextCell(params.value || '-');
    }
  },
  {
    headerName: 'Descripción',
    field: 'description',
    ...standardColumnConfig.textColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderTextCell(params.value || '-');
    }
  },
  {
    headerName: 'Acciones',
    field: 'id',
    ...standardColumnConfig.actionsColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderActionButtons(params.data.id, {
        showLink: true,
        editDataAttr: 'data-geofence-id',
        deleteDataAttr: 'data-geofence-id',
        linkDataAttr: 'data-geofence-id'
      });
    }
  }
];

export const geofenceGridOptions: GridOptions = {
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
