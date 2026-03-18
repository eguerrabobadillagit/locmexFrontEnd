import { ColDef } from 'ag-grid-community';
import {
  renderTextCell,
  renderIconTextCell,
  renderIconSvgTextCell,
  renderActionButtons,
  renderDateCell,
  renderStatusChip
} from '../../../core/utils/grid-cell-renderers.util';
import { standardColumnConfig } from '../../../core/utils/grid-styles.config';

export const vehicleColumnDefs: ColDef[] = [
  {
    headerName: 'Placa',
    field: 'plate',
    ...standardColumnConfig.primaryColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderIconTextCell(params.value, 'car-outline');
    }
  },
  {
    headerName: 'Marca',
    field: 'brandName',
    ...standardColumnConfig.textColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderTextCell(params.value);
    }
  },
  {
    headerName: 'Modelo',
    field: 'model',
    ...standardColumnConfig.textColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderTextCell(params.value);
    }
  },
  {
    headerName: 'Año',
    field: 'vehicleYear',
    ...standardColumnConfig.shortTextColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderTextCell(params.value);
    }
  },
  {
    headerName: 'Tipo',
    field: 'vehicleTypeName',
    ...standardColumnConfig.textColumn,
    enableRowGroup: true,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderTextCell(params.value);
    }
  },
  {
    headerName: 'Estado',
    field: 'statusCode',
    ...standardColumnConfig.statusColumn,
    enableRowGroup: true,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      const statusMap: any = {
        'active': { text: 'Activo', type: 'success' },
        'in-route': { text: 'En Ruta', type: 'info' },
        'inactive': { text: 'Inactivo', type: 'danger' }
      };
      const status = statusMap[params.value] || statusMap['inactive'];
      return renderStatusChip(status.text, status.type);
    }
  },
  {
    headerName: 'Dispositivo GPS',
    field: 'deviceId',
    ...standardColumnConfig.textColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      const hasDevice = params.value !== null;
      const activitySvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234caf50' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2'%3E%3C/path%3E%3C/svg%3E`;
      const wifiOffSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23f44336' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 20h.01'%3E%3C/path%3E%3Cpath d='M8.5 16.429a5 5 0 0 1 7 0'%3E%3C/path%3E%3Cpath d='M5 12.859a10 10 0 0 1 5.17-2.69'%3E%3C/path%3E%3Cpath d='M19 12.859a10 10 0 0 0-2.007-1.523'%3E%3C/path%3E%3Cpath d='M2 8.82a15 15 0 0 1 4.177-2.643'%3E%3C/path%3E%3Cpath d='M22 8.82a15 15 0 0 0-11.288-3.764'%3E%3C/path%3E%3Cpath d='m2 2 20 20'%3E%3C/path%3E%3C/svg%3E`;
      
      const icon = hasDevice ? activitySvg : wifiOffSvg;
      const text = hasDevice ? 'Asignado' : 'Sin asignar';
      return renderIconSvgTextCell(text, icon);
    }
  },
  {
    headerName: 'Etiqueta',
    field: 'label',
    ...standardColumnConfig.textColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderTextCell(params.value);
    }
  },
  {
    headerName: 'Creado',
    field: 'createdAtUtc',
    ...standardColumnConfig.dateColumn,
    cellRenderer: (params: any) => {
      if (!params.data || !params.value) return '';
      return renderDateCell(params.value);
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
        editDataAttr: 'data-vehicle-id',
        deleteDataAttr: 'data-vehicle-id',
        linkDataAttr: 'data-vehicle-id'
      });
    }
  }
];
