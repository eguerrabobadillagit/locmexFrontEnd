import { ColDef } from 'ag-grid-community';
import {
  renderTextCell,
  renderIconTextCell,
  renderStatusChip,
  renderActionButtons,
  renderBadge,
  GridColors
} from '../../../core/utils/grid-cell-renderers.util';
import { standardColumnConfig } from '../../../core/utils/grid-styles.config';

export const deviceColumnDefs: ColDef<any>[] = [
  {
    headerName: 'IMEI',
    field: 'imei',
    ...standardColumnConfig.primaryColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderIconTextCell(params.data.imei, 'hardware-chip');
    }
  },
  {
    headerName: 'Alias',
    field: 'alias',
    ...standardColumnConfig.primaryColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderTextCell(params.data.alias);
    }
  },
  {
    headerName: 'Modelo',
    field: 'modelName',
    ...standardColumnConfig.textColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderTextCell(params.data.modelName);
    }
  },
  {
    headerName: 'Protocolo',
    field: 'protocol',
    ...standardColumnConfig.textColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderBadge(params.data.protocol, GridColors.neutral, GridColors.textDark);
    }
  },
  {
    headerName: 'Estado',
    field: 'isActive',
    ...standardColumnConfig.statusColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      const isActive = params.data.isActive;
      return renderStatusChip(
        isActive ? 'Activo' : 'Inactivo',
        isActive ? 'success' : 'danger'
      );
    }
  },
  {
    headerName: 'Acciones',
    field: 'id',
    ...standardColumnConfig.actionsColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderActionButtons(params.data.id);
    }
  }
];
