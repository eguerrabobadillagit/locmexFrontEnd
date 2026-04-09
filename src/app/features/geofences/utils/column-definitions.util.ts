import { ColDef } from 'ag-grid-community';
import { GeofenceResponse } from '../interfaces/geofence-request.interface';

export const geofenceColumnDefs: ColDef<GeofenceResponse>[] = [
  {
    headerName: 'Nombre',
    field: 'name',
    flex: 1,
    minWidth: 200,
    cellRenderer: (params: any) => {
      const geofence = params.data as GeofenceResponse;
      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: ${geofence.color};"></div>
          <span style="font-weight: 500;">${geofence.name}</span>
        </div>
      `;
    }
  },
  {
    headerName: 'Tipo',
    field: 'type',
    width: 120,
    cellRenderer: (params: any) => {
      const type = params.value;
      const typeConfig = {
        circular: { label: 'Circular', color: '#3b82f6', icon: '⭕' },
        polygon: { label: 'Polígono', color: '#8b5cf6', icon: '⬡' }
      };
      const config = typeConfig[type as keyof typeof typeConfig];
      return `
        <span style="
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          background: ${config.color}15;
          color: ${config.color};
          font-size: 12px;
          font-weight: 500;
        ">
          ${config.icon} ${config.label}
        </span>
      `;
    }
  },
  {
    headerName: 'Cliente',
    field: 'clientName',
    flex: 1,
    minWidth: 150
  },
  {
    headerName: 'Descripción',
    field: 'description',
    flex: 1.5,
    minWidth: 200,
    cellRenderer: (params: any) => {
      return params.value || '<span style="color: #9ca3af;">Sin descripción</span>';
    }
  },
  {
    headerName: 'Estado',
    field: 'status',
    width: 120,
    cellRenderer: (params: any) => {
      const status = params.value;
      const statusConfig = {
        active: { label: 'Activo', color: '#10b981' },
        inactive: { label: 'Inactivo', color: '#ef4444' }
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      return `
        <span style="
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          background: ${config.color}15;
          color: ${config.color};
          font-size: 12px;
          font-weight: 500;
        ">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: ${config.color};"></span>
          ${config.label}
        </span>
      `;
    }
  },
  {
    headerName: 'Creado',
    field: 'createdAt',
    width: 150,
    cellRenderer: (params: any) => {
      const date = new Date(params.value);
      return date.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  },
  {
    headerName: 'Acciones',
    field: 'id',
    width: 120,
    cellRenderer: (params: any) => {
      return `
        <div style="display: flex; gap: 8px; align-items: center;">
          <button 
            class="action-btn edit-btn" 
            data-action="edit" 
            data-id="${params.value}"
            style="
              padding: 6px 8px;
              border: none;
              border-radius: 6px;
              background: transparent;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
            <ion-icon name="create-outline" style="font-size: 18px; color: #3b82f6;"></ion-icon>
          </button>
          <button 
            class="action-btn delete-btn" 
            data-action="delete" 
            data-id="${params.value}"
            style="
              padding: 6px 8px;
              border: none;
              border-radius: 6px;
              background: transparent;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
            <ion-icon name="trash-outline" style="font-size: 18px; color: #ef4444;"></ion-icon>
          </button>
        </div>
      `;
    }
  }
];
