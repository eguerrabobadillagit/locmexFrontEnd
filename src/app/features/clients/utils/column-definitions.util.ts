import { ColDef } from 'ag-grid-community';
import { renderActionButtons } from '../../../core/utils/grid-cell-renderers.util';

export const clientColumnDefs: ColDef[] = [
  {
    headerName: 'Nombre',
    field: 'name',
    flex: 1.5,
    minWidth: 200,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      
      const initial = params.data.name.charAt(0).toUpperCase();
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      const colorIndex = params.data.name.charCodeAt(0) % colors.length;
      const bgColor = colors[colorIndex];
      
      return `
        <div style="display: flex; align-items: center; gap: 12px; height: 100%;">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${bgColor};
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            flex-shrink: 0;
          ">
            ${initial}
          </div>
          <span style="font-weight: 500; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${params.data.name}
          </span>
        </div>
      `;
    },
    sortable: true,
    filter: 'agTextColumnFilter'
  },
  {
    headerName: 'Contacto',
    field: 'contactName',
    flex: 1.5,
    minWidth: 200,
    cellRenderer: (params: any) => {
      if (!params.data || !params.value) return '';
      
      return `
        <div style="display: flex; align-items: center; gap: 8px; height: 100%;">
          <ion-icon name="person-outline" style="font-size: 16px; color: #6b7280;"></ion-icon>
          <span style="color: #374151;">${params.value}</span>
        </div>
      `;
    },
    sortable: true,
    filter: 'agTextColumnFilter'
  },
  {
    headerName: 'Email',
    field: 'contactEmail',
    flex: 1.5,
    minWidth: 200,
    cellRenderer: (params: any) => {
      if (!params.data || !params.value) return '<span style="color: #9ca3af;">-</span>';
      
      return `
        <div style="display: flex; align-items: center; gap: 8px; height: 100%;">
          <ion-icon name="mail-outline" style="font-size: 16px; color: #6b7280;"></ion-icon>
          <span style="color: #374151;">${params.value}</span>
        </div>
      `;
    },
    sortable: true,
    filter: 'agTextColumnFilter'
  },
  {
    headerName: 'Teléfono',
    field: 'contactPhone',
    flex: 1,
    minWidth: 150,
    cellRenderer: (params: any) => {
      if (!params.data || !params.value) return '<span style="color: #9ca3af;">-</span>';
      
      return `
        <div style="display: flex; align-items: center; gap: 8px; height: 100%;">
          <ion-icon name="call-outline" style="font-size: 16px; color: #6b7280;"></ion-icon>
          <span style="color: #374151;">${params.value}</span>
        </div>
      `;
    },
    sortable: true,
    filter: 'agTextColumnFilter'
  },
  {
    headerName: 'Tipo',
    field: 'clientType',
    flex: 1,
    minWidth: 120,
    cellStyle: { display: 'flex', alignItems: 'center' },
    cellRenderer: (params: any) => {
      if (!params.data || !params.value) return '';
      
      const typeConfig: Record<string, { label: string; color: string; bgColor: string }> = {
        cliente: { label: 'Cliente', color: '#059669', bgColor: '#d1fae5' },
        distribuidor: { label: 'Distribuidor', color: '#2563eb', bgColor: '#dbeafe' },
        socio: { label: 'Socio', color: '#7c3aed', bgColor: '#f3e8ff' }
      };
      
      const config = typeConfig[params.value] || { label: params.value, color: '#6b7280', bgColor: '#f3f4f6' };
      
      return `
        <div style="display: flex; align-items: center; height: 100%;">
          <span style="
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            background: ${config.bgColor};
            color: ${config.color};
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            line-height: 1;
            white-space: nowrap;
          ">
            ${config.label}
          </span>
        </div>
      `;
    },
    sortable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: ['cliente', 'distribuidor', 'socio'],
      valueFormatter: (params: any) => {
        const labels: Record<string, string> = {
          cliente: 'Cliente',
          distribuidor: 'Distribuidor',
          socio: 'Socio'
        };
        return labels[params.value] || params.value;
      }
    }
  },
  {
    headerName: 'Estado',
    field: 'isActive',
    flex: 1,
    minWidth: 120,
    cellStyle: { display: 'flex', alignItems: 'center' },
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      
      const isActive = params.value === true;
      const bgColor = isActive ? '#d4edda' : '#f8d7da';
      const textColor = isActive ? '#155724' : '#721c24';
      const dotColor = isActive ? '#155724' : '#721c24';
      
      return `
        <div style="display: flex; align-items: center; height: 100%;">
          <span style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            background: ${bgColor};
            color: ${textColor};
            border-radius: 11px;
            font-size: 11px;
            font-weight: 500;
            line-height: 1.3;
            white-space: nowrap;
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${dotColor};"></span>
            ${isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      `;
    },
    sortable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: [true, false],
      valueFormatter: (params: any) => {
        return params.value === true ? 'Activo' : 'Inactivo';
      }
    }
  },
  {
    headerName: 'Acciones',
    field: 'actions',
    flex: 0.8,
    minWidth: 100,
    cellRenderer: (params: any) => {
      return renderActionButtons(params.data.id, {
        showEdit: true,
        showDelete: true
      });
    },
    sortable: false,
    filter: false,
    pinned: 'right'
  }
];
