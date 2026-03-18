# Configuración de Routing - Home con Rutas Hijas

## Estructura Implementada

### 1. Rutas Configuradas (`app.routes.ts`)

```
/auth                    → AuthPage (con NoAuthGuard)
/home                    → HomePage (con AuthGuard)
  ├── /home/dashboard    → DashboardPage (ruta por defecto)
  ├── /home/vehiculos    → VehiclesPage
  └── /home/[otros]      → (preparado para más páginas)
```

### 2. Flujo de Navegación

1. **Usuario hace login** → Redirige a `/home`
2. **Home carga** → Automáticamente redirige a `/home/dashboard`
3. **Usuario hace clic en navbar** → Navega a `/home/[menu-id]`
4. **Contenido se renderiza** → Dentro del `<router-outlet>` del home

### 3. Componentes Modificados

#### **HomePage** (`features/home/home.page.ts`)
- ✅ Importa `Router` y `RouterOutlet`
- ✅ Método `selectMenu(id)` navega usando `router.navigate(['/home', id])`
- ✅ Removido lógica de `showMapView` (ahora se maneja por rutas)

#### **HomePage Template** (`features/home/home.page.html`)
- ✅ Reemplazado contenido estático con `<router-outlet>`
- ✅ El layout del home (header, navbar, split-pane) permanece fijo
- ✅ Solo el contenido del `<router-outlet>` cambia

#### **NavbarComponent** (`features/home/components/navbar/`)
- ✅ Removido input `showMapView`
- ✅ Removido `FleetTrackingViewComponent` de imports
- ✅ Método `onMenuSelect(id)` emite el ID al padre (HomePage)

#### **VehiclesPage** (`features/vehicles/vehicles.page.*`)
- ✅ Removido `<ion-content>` (ya existe en HomePage)
- ✅ Removido import de `IonContent`
- ✅ Ajustado estilos para funcionar sin ion-content wrapper

### 4. IDs del Navbar y Rutas

Los IDs del navbar coinciden con las rutas:

| Navbar ID    | Ruta              | Componente        | Estado    |
|--------------|-------------------|-------------------|-----------|
| dashboard    | /home/dashboard   | DashboardPage     | ✅ Creado |
| vehiculos    | /home/vehiculos   | VehiclesPage      | ✅ Creado |
| map-view     | /home/map-view    | (pendiente)       | ⏳ TODO   |
| telemetria   | /home/telemetria  | (pendiente)       | ⏳ TODO   |
| geocercas    | /home/geocercas   | (pendiente)       | ⏳ TODO   |
| despacho     | /home/despacho    | (pendiente)       | ⏳ TODO   |
| rutas        | /home/rutas       | (pendiente)       | ⏳ TODO   |
| conductor    | /home/conductor   | (pendiente)       | ⏳ TODO   |
| almacen      | /home/almacen     | (pendiente)       | ⏳ TODO   |
| productos    | /home/productos   | (pendiente)       | ⏳ TODO   |
| puntos       | /home/puntos      | (pendiente)       | ⏳ TODO   |
| servicios    | /home/servicios   | (pendiente)       | ⏳ TODO   |
| dispositivos | /home/dispositivos| (pendiente)       | ⏳ TODO   |
| portal       | /home/portal      | (pendiente)       | ⏳ TODO   |
| usuarios     | /home/usuarios    | (pendiente)       | ⏳ TODO   |

### 5. Cómo Agregar Nuevas Páginas

Para agregar una nueva página (ejemplo: Conductores):

1. **Crear el componente:**
```bash
# Crear la estructura
features/conductores/
├── conductores.page.ts
├── conductores.page.html
└── conductores.page.scss
```

2. **Agregar la ruta en `app.routes.ts`:**
```typescript
{
  path: 'conductor',
  loadComponent: () => import('./features/conductores/conductores.page')
    .then((m) => m.ConductoresPage)
}
```

3. **El navbar ya tiene el ID configurado** → Al hacer clic navegará automáticamente

4. **Reutilizar componentes core:**
```html
<div class="page-container">
  <app-page-header
    title="Gestión de Conductores"
    subtitle="Control de conductores"
    actionLabel="Agregar Conductor"
    (actionClick)="onAdd()"
  />
  
  <app-data-toolbar
    searchPlaceholder="Buscar conductor..."
    [filterOptions]="filters"
    (searchChange)="onSearch($event)"
  />
  
  <!-- Contenido específico aquí -->
</div>
```

### 6. Notas Importantes

- ⚠️ **No usar `<ion-content>`** en las páginas hijas (dashboard, vehicles, etc.)
- ✅ El `<ion-content>` principal está en `home.page.html`
- ✅ Todas las páginas hijas se renderizan dentro del mismo `<ion-content>`
- ✅ El header y navbar del home permanecen fijos
- ✅ La navegación es instantánea (lazy loading de componentes)

### 7. Beneficios de esta Arquitectura

1. **Layout consistente**: Header y navbar siempre visibles
2. **Navegación fluida**: Sin recargar el layout completo
3. **Lazy loading**: Cada página se carga solo cuando se necesita
4. **Código reutilizable**: Componentes core compartidos
5. **Escalable**: Fácil agregar nuevas páginas
