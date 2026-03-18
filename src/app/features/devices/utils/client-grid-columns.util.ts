import { ColDef } from 'ag-grid-community';
import { Client } from '../interfaces/client.interface';

/**
 * Genera las definiciones de columnas para la grilla de clientes
 * @param selectedClientId ID del cliente actualmente seleccionado (opcional)
 * @returns Array de definiciones de columnas para AG Grid
 */
export function getClientColumnDefs(selectedClientId?: string | null): ColDef[] {
  return [
    {
      headerName: '',
      field: 'selected',
      width: 60,
      cellRenderer: (params: any) => {
        const isSelected = selectedClientId === params.data.id;
        return isSelected ? '<ion-icon name="checkmark-circle-outline" style="color: #3b82f6; font-size: 24px;"></ion-icon>' : '';
      }
    },
    {
      headerName: 'Cliente',
      field: 'name',
      flex: 2,
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        const iconName = 'business-outline';
        const iconColor = '#3b82f6';
        const bgColor = '#dbeafe';
        return `
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 6px; background: ${bgColor}; flex-shrink: 0;">
              <ion-icon name="${iconName}" style="font-size: 16px; color: ${iconColor};"></ion-icon>
            </div>
            <span style="font-weight: 500; font-size: 14px; color: #1f2937;">${params.data.name}</span>
          </div>
        `;
      }
    },
    {
      headerName: 'Contacto',
      field: 'contactName',
      flex: 1,
      cellRenderer: (params: any) => {
        return `<span style="color: #6b7280;">${params.data.contactName || '-'}</span>`;
      }
    },
    {
      headerName: 'Correo',
      field: 'contactEmail',
      flex: 1.5,
      cellRenderer: (params: any) => {
        return `<span style="color: #6b7280;">${params.data.contactEmail || '-'}</span>`;
      }
    },
    {
      headerName: 'Código',
      field: 'externalCode',
      width: 100,
      cellRenderer: (params: any) => {
        return `<span style="color: #6b7280; font-family: monospace;">${params.data.externalCode || '-'}</span>`;
      }
    }
  ];
}
