/**
 * Configuración estandarizada de estilos para AG Grid
 * Usar esta configuración en todos los grids de la aplicación
 */

import { GridOptions } from 'ag-grid-community';

/**
 * Opciones base de AG Grid estandarizadas
 * Usar como base para todos los grids
 */
export const baseGridOptions: GridOptions = {
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

/**
 * Variables CSS estandarizadas para AG Grid
 * Aplicar estas variables en el SCSS de cada página
 */
export const gridCssVariables = {
  '--ag-header-height': '48px',
  '--ag-row-height': '60px',
  '--ag-header-background-color': '#f9fafb',
  '--ag-header-foreground-color': '#374151',
  '--ag-border-color': '#e5e7eb',
  '--ag-row-hover-color': '#f9fafb'
} as const;

/**
 * Estilos SCSS estandarizados para AG Grid
 * Copiar este bloque en el SCSS de cada página que use AG Grid
 */
export const standardGridScss = `
// AG Grid custom styles
::ng-deep {
  .ag-theme-quartz {
    --ag-header-height: 48px;
    --ag-row-height: 60px;
    --ag-header-background-color: #f9fafb;
    --ag-header-foreground-color: #374151;
    --ag-border-color: #e5e7eb;
    --ag-row-hover-color: #f9fafb;

    .ag-header-cell-label {
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ag-row {
      border-bottom: 1px solid #f3f4f6;

      &:hover {
        background-color: #f9fafb;
      }
    }

    .ag-cell {
      display: flex;
      align-items: center;
      line-height: 1.5;
    }

    // Action buttons hover effects
    .action-btn {
      &:hover {
        background: #f3f4f6 !important;
      }

      &.edit-btn:hover {
        background: #dbeafe !important;
      }

      &.delete-btn:hover {
        background: #fee2e2 !important;
      }
    }
  }
}
`;

/**
 * Estilos de página estandarizados
 * Copiar este bloque en el SCSS de cada página de catálogo
 */
export const standardPageScss = `
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  background: #f5f5f5;
  min-height: 100vh;
}

.grid-container {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  ag-grid-angular {
    width: 100%;
    height: 100%;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .grid-container {
    padding: 16px 20px;
    border-radius: 8px;
  }
}
`;

/**
 * Configuración de columnas comunes
 * Usar estos valores para mantener consistencia
 */
export const standardColumnConfig = {
  // Columna principal (ID, IMEI, Placa, etc.)
  primaryColumn: {
    flex: 1.2,
    minWidth: 150
  },
  // Columnas de texto normales
  textColumn: {
    flex: 1,
    minWidth: 120
  },
  // Columnas de texto cortas (Año, Código, etc.)
  shortTextColumn: {
    flex: 0.8,
    minWidth: 100
  },
  // Columna de estado
  statusColumn: {
    width: 120
  },
  // Columna de fecha
  dateColumn: {
    flex: 1.2,
    minWidth: 180
  },
  // Columna de acciones
  actionsColumn: {
    flex: 0.8,
    minWidth: 100,
    pinned: 'right' as const
  }
} as const;
