# Patrón de Búsqueda con AG Grid QuickFilter

Este documento describe cómo implementar búsqueda en cualquier feature que use AG Grid.

## 📋 Patrón Reutilizable

### 1. En el componente TypeScript (*.page.ts)

```typescript
import { signal } from '@angular/core';

export class YourFeaturePage {
  // Agregar signal para el texto de búsqueda
  quickFilterText = signal<string>('');
  
  // Conectar con el evento del toolbar
  onSearch(searchTerm: string) {
    this.quickFilterText.set(searchTerm);
  }
}
```

### 2. En el template HTML (*.page.html)

```html
<ag-grid-angular
  [rowData]="yourData()"
  [columnDefs]="columnDefs"
  [gridOptions]="gridOptions"
  [quickFilterText]="quickFilterText()">
</ag-grid-angular>
```

## ✅ Características

- **Búsqueda en tiempo real**: Filtra mientras escribes
- **Multi-columna**: Busca en todas las columnas automáticamente
- **Case-insensitive**: No distingue mayúsculas/minúsculas
- **Sin configuración extra**: AG Grid lo maneja nativamente
- **Performance optimizado**: Usa índices internos de AG Grid

## 🎯 Ejemplo Completo (Vehicles Feature)

Ver implementación en:
- `vehicles.page.ts` - Líneas 26, 40-42
- `vehicles.page.html` - Línea 27

## 🔧 Personalización Avanzada (Opcional)

### Excluir columnas de la búsqueda

```typescript
{
  headerName: 'Acciones',
  field: 'actions',
  getQuickFilterText: () => '' // Esta columna no se buscará
}
```

### Personalizar texto de búsqueda por columna

```typescript
{
  headerName: 'Estado',
  field: 'status',
  getQuickFilterText: (params) => {
    // Retornar texto personalizado para búsqueda
    return params.value === 'active' ? 'Activo Disponible' : params.value;
  }
}
```

## 📝 Notas

- No requiere servicio compartido
- No requiere lógica de filtrado manual
- Compatible con todos los features que usen AG Grid
- Funciona con paginación, ordenamiento y otros filtros
