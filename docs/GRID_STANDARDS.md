# Estándares de Grids - AG Grid

Esta guía define los estándares para crear grids consistentes en toda la aplicación.

## 📋 Tabla de Contenidos

1. [Estructura de Archivos](#estructura-de-archivos)
2. [Estilos Estandarizados](#estilos-estandarizados)
3. [Utilidades Compartidas](#utilidades-compartidas)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Checklist de Implementación](#checklist-de-implementación)

---

## Estructura de Archivos

Para cada catálogo/grid, crear los siguientes archivos:

```
features/
  └── [feature-name]/
      ├── [feature-name].page.ts
      ├── [feature-name].page.html
      ├── [feature-name].page.scss
      └── utils/
          ├── column-definitions.util.ts
          └── grid-config.util.ts
```

---

## Estilos Estandarizados

### 1. SCSS de Página

**Copiar este bloque en cada `.page.scss`:**

```scss
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

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .grid-container {
    padding: 16px 20px;
    border-radius: 8px;
  }
}
```

### 2. HTML de Página

```html
<div class="page-container">
  <app-page-header
    title="Título del Catálogo"
    subtitle="Descripción breve"
    actionLabel="Agregar Item"
    actionIcon="add-outline"
    (actionClick)="onAdd()"
  />

  <app-data-toolbar
    searchPlaceholder="Buscar..."
    filterLabel="Todos"
    [filterOptions]="filterOptions"
    [showViewToggle]="true"
    (searchChange)="onSearch($event)"
    (filterChange)="onFilterChange($event)"
    (viewChange)="onViewChange($event)"
  />

  <div class="grid-container">
    <ag-grid-angular
      style="width: 100%; height: 100%;"
      class="ag-theme-quartz"
      [rowData]="filteredData()"
      [columnDefs]="columnDefs"
      [gridOptions]="gridOptions"
      [quickFilterText]="quickFilterText()">
    </ag-grid-angular>
  </div>
</div>
```

---

## Utilidades Compartidas

### Importar Utilidades

```typescript
import {
  renderTextCell,
  renderIconTextCell,
  renderStatusChip,
  renderActionButtons,
  renderDateCell,
  GridColors
} from '../../../core/utils/grid-cell-renderers.util';

import { standardColumnConfig } from '../../../core/utils/grid-styles.config';
```

### Funciones Disponibles

#### 1. `renderTextCell(value, type?)`

Para columnas de texto simple.

```typescript
{
  headerName: 'Nombre',
  field: 'name',
  ...standardColumnConfig.textColumn,
  cellRenderer: (params: any) => {
    if (!params.data) return '';
    return renderTextCell(params.value);
  }
}
```

**Tipos disponibles:**
- `'primary'` - Font-size: 14px, Font-weight: 600
- `'secondary'` - Font-size: 13px, Font-weight: 500 (default)
- `'small'` - Font-size: 11px, Font-weight: 500

#### 2. `renderIconTextCell(value, iconName, iconColor?, bgColor?)`

Para columnas principales (ID, IMEI, Placa).

```typescript
{
  headerName: 'Placa',
  field: 'plate',
  ...standardColumnConfig.primaryColumn,
  cellRenderer: (params: any) => {
    if (!params.data) return '';
    return renderIconTextCell(params.value, 'car-outline');
  }
}
```

#### 3. `renderStatusChip(text, type)`

Para chips de estado con punto de color.

```typescript
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
}
```

**Tipos disponibles:**
- `'success'` - Verde
- `'danger'` - Rojo
- `'warning'` - Naranja
- `'info'` - Azul

#### 4. `renderActionButtons(id, options?)`

Para columna de acciones.

```typescript
{
  headerName: 'Acciones',
  field: 'id',
  ...standardColumnConfig.actionsColumn,
  cellRenderer: (params: any) => {
    if (!params.data) return '';
    return renderActionButtons(params.data.id, {
      editDataAttr: 'data-vehicle-id', // Personalizar atributo
      deleteDataAttr: 'data-vehicle-id'
    });
  }
}
```

#### 5. `renderDateCell(dateString, locale?, options?)`

Para columnas de fecha.

```typescript
{
  headerName: 'Creado',
  field: 'createdAt',
  ...standardColumnConfig.dateColumn,
  cellRenderer: (params: any) => {
    if (!params.data) return '';
    return renderDateCell(params.value);
  }
}
```

---

## Ejemplos de Uso

### Ejemplo Completo: column-definitions.util.ts

```typescript
import { ColDef } from 'ag-grid-community';
import {
  renderTextCell,
  renderIconTextCell,
  renderStatusChip,
  renderActionButtons,
  renderDateCell
} from '../../../core/utils/grid-cell-renderers.util';
import { standardColumnConfig } from '../../../core/utils/grid-styles.config';

export const myColumnDefs: ColDef[] = [
  // Columna principal con icono
  {
    headerName: 'ID',
    field: 'id',
    ...standardColumnConfig.primaryColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderIconTextCell(params.value, 'finger-print');
    }
  },
  
  // Columnas de texto
  {
    headerName: 'Nombre',
    field: 'name',
    ...standardColumnConfig.textColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderTextCell(params.value);
    }
  },
  
  // Columna de estado
  {
    headerName: 'Estado',
    field: 'isActive',
    ...standardColumnConfig.statusColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderStatusChip(
        params.value ? 'Activo' : 'Inactivo',
        params.value ? 'success' : 'danger'
      );
    }
  },
  
  // Columna de fecha
  {
    headerName: 'Creado',
    field: 'createdAt',
    ...standardColumnConfig.dateColumn,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return renderDateCell(params.value);
    }
  },
  
  // Columna de acciones
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
```

---

## Checklist de Implementación

Al crear un nuevo grid, verificar:

### ✅ Estructura
- [ ] Archivos creados en la estructura correcta
- [ ] Imports de utilidades agregados

### ✅ Estilos
- [ ] SCSS de página copiado y aplicado
- [ ] HTML con estructura estándar
- [ ] Clase `ag-theme-quartz` en ag-grid-angular

### ✅ Columnas
- [ ] Todas las columnas usan `cellRenderer` (no `valueFormatter`)
- [ ] Validación `if (!params.data) return ''` en todos los cellRenderers
- [ ] Columnas usan `standardColumnConfig` para flex/minWidth
- [ ] Columna principal usa `renderIconTextCell()`
- [ ] Columnas de texto usan `renderTextCell()`
- [ ] Columna de estado usa `renderStatusChip()`
- [ ] Columna de acciones usa `renderActionButtons()`

### ✅ Tipografía
- [ ] Columna principal: font-size 14px, font-weight 600
- [ ] Columnas normales: font-size 13px, font-weight 500
- [ ] Chips de estado: font-size 11px, font-weight 500

### ✅ Responsive
- [ ] Media queries agregados para mobile
- [ ] Grid funciona correctamente en pantallas pequeñas

---

## Colores Estandarizados

Usar `GridColors` de las utilidades:

```typescript
import { GridColors } from '../../../core/utils/grid-cell-renderers.util';

// Disponibles:
GridColors.primary        // #3b82f6
GridColors.primaryLight   // #dbeafe
GridColors.textDark       // #1f2937
GridColors.textMedium     // #374151
GridColors.success        // #155724
GridColors.successBg      // #d4edda
GridColors.danger         // #721c24
GridColors.dangerBg       // #f8d7da
```

---

## Soporte

Para dudas o mejoras, consultar:
- `src/app/core/utils/grid-cell-renderers.util.ts`
- `src/app/core/utils/grid-styles.config.ts`
- Ejemplos: `features/vehicles/` y `features/devices/`
