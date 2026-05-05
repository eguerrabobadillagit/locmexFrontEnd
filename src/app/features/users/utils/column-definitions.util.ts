import { ColDef } from 'ag-grid-community';
import { renderActionButtons } from '../../../core/utils/grid-cell-renderers.util';

export const userColumnDefs: ColDef[] = [
  {
    headerName: 'Usuario',
    field: 'email',
    flex: 1.5,
    minWidth: 200,
    cellRenderer: (params: any) => {
      if (!params.data || !params.value) return '';
      
      return `
        <div style="display: flex; align-items: center; gap: 8px; height: 100%;">
          <ion-icon name="mail-outline" style="font-size: 16px; color: #6b7280;"></ion-icon>
          <span style="color: #374151; font-weight: 500;">${params.value}</span>
        </div>
      `;
    },
    sortable: true,
    filter: 'agTextColumnFilter'
  },
  {
    headerName: 'Nombre',
    field: 'fullName',
    flex: 1.5,
    minWidth: 200,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      
      const initial = params.data.fullName.charAt(0).toUpperCase();
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      const colorIndex = params.data.fullName.charCodeAt(0) % colors.length;
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
            ${params.data.fullName}
          </span>
        </div>
      `;
    },
    sortable: true,
    filter: 'agTextColumnFilter'
  },
  {
    headerName: 'Rol',
    field: 'roleCode',
    flex: 1,
    minWidth: 150,
    cellStyle: { display: 'flex', alignItems: 'center' },
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      
      const roleConfig: Record<string, { label: string; color: string; bgColor: string }> = {
        platform_admin: { label: 'Dueño', color: '#7c3aed', bgColor: '#f3e8ff' },
        partner_admin: { label: 'Distribuidor', color: '#2563eb', bgColor: '#dbeafe' },
        customer_admin: { label: 'Cliente', color: '#059669', bgColor: '#d1fae5' },
        operator: { label: 'Operador', color: '#ea580c', bgColor: '#fed7aa' }
      };
      
      const config = roleConfig[params.value] || { label: params.value, color: '#6b7280', bgColor: '#f3f4f6' };
      
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
      values: ['platform_admin', 'partner_admin', 'customer_admin', 'operator'],
      valueFormatter: (params: any) => {
        const labels: Record<string, string> = {
          platform_admin: 'Dueño',
          partner_admin: 'Distribuidor',
          customer_admin: 'Cliente',
          operator: 'Operador'
        };
        return labels[params.value] || params.value;
      }
    }
  },
  {
    headerName: 'Cliente',
    field: 'clientName',
    flex: 1.5,
    minWidth: 200,
    sortable: true,
    filter: 'agTextColumnFilter'
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
