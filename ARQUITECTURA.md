# Arquitectura de Gestión de Vehículos

## Estructura del Proyecto

### Componentes Reutilizables (`core/components/`)

#### 1. **PageHeaderComponent**
Componente reutilizable para encabezados de páginas CRUD.

**Ubicación:** `src/app/core/components/page-header/`

**Inputs:**
- `title` (required): Título principal de la página
- `subtitle` (optional): Subtítulo descriptivo
- `actionLabel` (optional): Texto del botón de acción
- `actionIcon` (optional): Icono del botón (default: 'add-outline')
- `showAction` (optional): Mostrar/ocultar botón de acción (default: true)

**Outputs:**
- `actionClick`: Evento emitido al hacer clic en el botón de acción

**Ejemplo de uso:**
```html
<app-page-header
  title="Gestión de Vehículos"
  subtitle="Control y monitoreo de flota"
  actionLabel="Agregar Vehículo"
  actionIcon="add-outline"
  (actionClick)="onAddVehicle()"
/>
```

---

#### 2. **DataToolbarComponent**
Barra de herramientas con búsqueda, filtros y toggle de vista.

**Ubicación:** `src/app/core/components/data-toolbar/`

**Inputs:**
- `searchPlaceholder` (optional): Placeholder del buscador
- `filterLabel` (optional): Label del selector de filtros
- `filterOptions` (optional): Array de opciones de filtro (IFilterOption[])
- `showViewToggle` (optional): Mostrar/ocultar toggle de vista (default: true)

**Outputs:**
- `searchChange`: Emite el término de búsqueda
- `filterChange`: Emite el valor del filtro seleccionado
- `viewChange`: Emite el modo de vista ('list' | 'grid')

**Ejemplo de uso:**
```html
<app-data-toolbar
  searchPlaceholder="Buscar por placa, conductor o modelo..."
  filterLabel="Todos los estados"
  [filterOptions]="filterOptions"
  [showViewToggle]="true"
  (searchChange)="onSearch($event)"
  (filterChange)="onFilterChange($event)"
  (viewChange)="onViewChange($event)"
/>
```

---

### Modelos e Interfaces (`core/models/`)

#### **IFilterOption**
```typescript
export interface IFilterOption {
  label: string;
  value: string | number;
}
```

#### **IViewMode**
```typescript
export interface IViewMode {
  mode: 'list' | 'grid';
}
```

---

## Feature: Vehicles

### Estructura de Archivos
```
features/vehicles/
├── models/
│   └── vehicle.model.ts          # Interfaces del dominio
├── vehicles.page.ts               # Componente principal
├── vehicles.page.html             # Template
└── vehicles.page.scss             # Estilos
```

### Modelo de Datos

```typescript
export interface Vehicle {
  id: string;
  unit: string;                    // Placa
  model: string;                   // Modelo del vehículo
  driver: string;                  // Nombre del conductor
  driverRole: string;              // Rol del conductor
  status: VehicleStatus;           // Estado del vehículo
  gpsSignal: GPSSignal;            // Información de señal GPS
  speed: number;                   // Velocidad en km/h
  fuel: number;                    // Porcentaje de combustible
  motor: MotorStatus;              // Estado del motor
  lastUpdate: Date;                // Última actualización
}

export type VehicleStatus = 'active' | 'in-route' | 'inactive';
export type MotorStatus = 'on' | 'off';

export interface GPSSignal {
  status: 'strong' | 'weak' | 'none';
  lastConnection: string;
}
```

---

## AG Grid Enterprise

### Configuración

La aplicación utiliza **AG Grid Enterprise** para las tablas de datos.

**Instalación:**
```bash
npm install ag-grid-angular ag-grid-enterprise
```

**Estilos globales** (`src/global.scss`):
```scss
@import "ag-grid-community/styles/ag-grid.css";
@import "ag-grid-community/styles/ag-theme-alpine.css";
```

### Columnas Configuradas

1. **Unidad**: Muestra placa y modelo con icono
2. **Conductor**: Nombre y rol
3. **Estado**: Badge con colores según estado
4. **Conexión GPS**: Icono y tiempo de última conexión
5. **Velocidad**: Velocidad actual en km/h
6. **Combustible**: Barra de progreso con porcentaje
7. **Motor**: Estado ON/OFF
8. **Última Actualización**: Fecha y hora formateada
9. **Acciones**: Botones de editar y eliminar

### Cell Renderers Personalizados

Los cell renderers están implementados inline en el componente. Para futuros CRUDs, se pueden extraer a componentes separados si se requiere mayor complejidad.

---

## Rutas

```typescript
{
  path: 'vehicles',
  loadComponent: () => import('./features/vehicles/vehicles.page').then((m) => m.VehiclesPage),
  canActivate: [AuthGuard]
}
```

---

## Próximos Pasos

### Para Nuevos CRUDs:

1. **Reutilizar componentes core:**
   - `PageHeaderComponent` para encabezados
   - `DataToolbarComponent` para búsqueda y filtros

2. **Seguir la estructura de vehicles:**
   ```
   features/[nombre]/
   ├── models/
   ├── [nombre].page.ts/html/scss
   └── components/ (si se requieren componentes específicos)
   ```

3. **Configurar AG Grid:**
   - Definir `columnDefs` según las necesidades
   - Personalizar cell renderers
   - Configurar `gridOptions`

4. **Agregar ruta en `app.routes.ts`**

---

## Consideraciones de Diseño

- **Standalone Components**: Todos los componentes usan la API standalone de Angular
- **Signals**: Se utiliza la API de signals para reactividad
- **Ionic Components**: Se usan componentes de Ionic para mantener consistencia
- **Responsive**: Los componentes están diseñados para adaptarse a diferentes tamaños de pantalla
- **Tipado fuerte**: Todas las interfaces están tipadas para mejor DX

---

## Estilos y Temas

### Variables CSS de Ionic
Los componentes utilizan variables CSS de Ionic para mantener consistencia:
- `--ion-background-color`
- `--ion-color-light`
- `--ion-color-dark`
- `--ion-color-medium`
- `--ion-text-color`

### Breakpoints Responsive
```scss
@media (max-width: 768px) {
  // Estilos móvil
}
```
