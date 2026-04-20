# Instrucciones para Desarrollo - LocMex FrontEnd

## 📋 Resumen del Proyecto

**Nombre:** gpsFront (LocMex FrontEnd)  
**Tecnologías:** Angular 20 + Ionic 8 + Capacitor 8  
**Tipo:** Aplicación móvil/web de gestión de flota vehicular  
**Backend API:** https://staging.americas-iot.com/api  

## 🏗️ Arquitectura y Tecnologías

### Stack Principal
- **Angular 20**: Framework principal con componentes standalone
- **Ionic 8**: UI framework para componentes móviles
- **Capacitor 8**: Bridge para funcionalidades nativas
- **TypeScript 5.9**: Lenguaje de desarrollo
- **SCSS**: Preprocesador de estilos

### Librerías Clave
- **@angular/google-maps**: Integración con Google Maps
- **ag-grid-enterprise**: Grids de datos avanzados
- **@microsoft/signalr**: Comunicación en tiempo real
- **terra-draw**: Dibujo sobre mapas
- **ng-angular-popup**: Notificaciones y popups

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Componentes y utilidades reutilizables
│   │   ├── components/          # Componentes genéricos
│   │   ├── guards/              # Guards de rutas
│   │   ├── interceptors/        # HTTP interceptors
│   │   ├── interfaces/          # Interfaces globales
│   │   ├── models/              # Modelos de datos
│   │   └── utils/               # Utilidades
│   ├── features/                # Módulos de negocio
│   │   ├── auth/               # Autenticación
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── devices/            # Gestión de dispositivos
│   │   ├── home/               # Página principal
│   │   └── vehicles/           # Gestión de vehículos
│   ├── app.component.ts        # Componente raíz
│   └── app.routes.ts           # Configuración de rutas
├── assets/                     # Recursos estáticos
├── environments/               # Configuración de ambientes
├── theme/                      # Variables de tema
└── global.scss                 # Estilos globales
```

## 🎯 Mejores Prácticas de Código

### 1. **Componentes Standalone**
- Todos los componentes deben ser standalone
- Importar dependencias directamente en el componente
- Evitar NgModules cuando sea posible

```typescript
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonHeader]
})
export class ExampleComponent {
  // ...
}
```

### 2. **Signals para Reactividad**
- Utilizar signals para estado local
- Preferir signals sobre BehaviorSubjects cuando sea apropiado
- Usar `computed()` para valores derivados
- Usar `input()` y `output()` de Angular 16+ para comunicación componente-padre

```typescript
export class ExampleComponent {
  // Estado interno con signals
  private _data = signal<DataItem[]>([]);
  readonly data = this._data.asReadonly();
  
  // Inputs modernos (Angular 16+)
  readonly title = input.required<string>();
  readonly items = input<DataItem[]>([]);
  readonly maxItems = input<number>(10);
  
  // Outputs modernos (Angular 16+)
  readonly itemSelect = output<DataItem>();
  readonly formSubmit = output<FormData>();
  
  // Computed para valores derivados
  readonly filteredData = computed(() => {
    return this._data().filter(item => item.active).slice(0, this.maxItems());
  });
  
  readonly hasData = computed(() => this._data().length > 0);
  
  // Métodos para modificar estado
  addItem(item: DataItem) {
    this._data.update(current => [...current, item]);
  }
}
```

#### Uso del componente:
```html
<app-example
  [title]="'Mi Lista'"
  [items]="dataItems"
  [maxItems]="5"
  (itemSelect)="onItemSelected($event)"
  (formSubmit)="onFormSubmitted($event)"
/>
```

#### Beneficios de input/output signals:
- ✅ Type safety en templates
- ✅ Transformaciones automáticas
- ✅ Mejor performance (change detection optimizada)
- ✅ Compatible con standalone components

### 3. **Inyección de Dependencias con inject()**
- Usar `inject()` en lugar de constructor injection
- Agrupar inyecciones al principio del componente

```typescript
export class ExampleComponent {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
}
```

### 4. **Límite de 300 Líneas por Archivo**
- Mantener componentes bajo 300 líneas
- Extraer lógica compleja a servicios separados
- Dividir componentes grandes en subcomponentes

### 5. **Tipado Fuerte**
- Definir interfaces para todos los modelos de datos
- **Guardar interfaces en archivos separados** (una interface por archivo o interfaces relacionadas juntas)
- Evitar `any` siempre que sea posible
- Usar tipos union para valores limitados

```typescript
// En archivo: vehicle.interface.ts
export interface Vehicle {
  id: string;
  plate: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastUpdate: Date;
}

// En archivo: vehicle-status.interface.ts
export type VehicleStatus = 'active' | 'inactive' | 'maintenance';

// Importar donde se necesite
import { Vehicle, VehicleStatus } from '../interfaces/vehicle.interface';
```

## 🔧 Componentes Core Reutilizables

### PageHeaderComponent
```typescript
// Uso:
<app-page-header
  title="Gestión de Vehículos"
  subtitle="Control y monitoreo de flota"
  actionLabel="Agregar Vehículo"
  (actionClick)="onAddVehicle()"
/>
```

### DataToolbarComponent
```typescript
// Uso:
<app-data-toolbar
  searchPlaceholder="Buscar vehículo..."
  [filterOptions]="filterOptions"
  (searchChange)="onSearch($event)"
  (filterChange)="onFilterChange($event)"
/>
```

### ModalSearchableGridComponent
```typescript
// Para selecciones con búsqueda y grid
<app-modal-searchable-grid
  [isOpen]="isModalOpen"
  [data]="availableItems"
  [columns]="gridColumns"
  (selectionChange)="onItemSelect($event)"
  (close)="onModalClose()"
/>
```

## 🌐 Integración con Backend API

### Base URL
- **Development:** https://staging.americas-iot.com/api
- **Production:** Configurado en environment.prod.ts

### Autenticación
- Bearer Token via JWT
- Token almacenado en localStorage
- Interceptor automático para añadir Authorization header

```typescript
// AuthService pattern
login(credentials: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
    tap(response => {
      this.setToken(response.accessToken);
      this.isAuthenticated.set(true);
    })
  );
}
```

### Estructura de Servicios
```typescript
@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/vehicles`;

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.apiUrl);
  }

  createVehicle(vehicle: CreateVehicleRequest): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }
}
```

## 📱 Patrones UI/UX

### Ionic Components
- Usar componentes Ionic para consistencia
- Aprovecha ion-grid para layouts responsivos
- Utilizar ion-card para contenedor de contenido

### Responsive Design
```scss
// Breakpoints estándar
@media (max-width: 768px) {
  // Estilos móvil
}

@media (min-width: 769px) and (max-width: 1024px) {
  // Estilos tablet
}

@media (min-width: 1025px) {
  // Estilos desktop
}
```

### Variables CSS de Ionic
```scss
.my-component {
  background: var(--ion-background-color);
  color: var(--ion-text-color);
  border: 1px solid var(--ion-color-light);
}
```

## 🗂️ Gestión de Estado

### Signals Pattern - Privadas vs Públicas
```typescript
export class FleetManagerComponent {
  // **Signals PRIVADAS** - Estado interno del componente
  private readonly _vehicles = signal<Vehicle[]>([]);
  private readonly _selectedVehicle = signal<Vehicle | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // **Signals PÚBLICAS** - Expuestas al template (readonly)
  readonly vehicles = this._vehicles.asReadonly();
  readonly selectedVehicle = this._selectedVehicle.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // **Computed PÚBLICOS** - Estado derivado
  readonly activeVehicles = computed(() => 
    this.vehicles().filter(v => v.status === 'active')
  );

  readonly hasVehicles = computed(() => this.vehicles().length > 0);

  // **Métodos PÚBLICOS** - Para modificar estado privado
  loadVehicles() {
    this._isLoading.set(true);
    this._error.set(null);
    // ... lógica de carga
  }

  selectVehicle(vehicle: Vehicle) {
    this._selectedVehicle.set(vehicle);
  }
}
```

### Signals en Servicios
```typescript
@Injectable({ providedIn: 'root' })
export class VehicleStateService {
  // **Signals PRIVADAS** del servicio
  private readonly _vehicles = signal<Vehicle[]>([]);
  private readonly _selectedVehicleId = signal<string | null>(null);
  private readonly _loadingStates = signal<Record<string, boolean>>({});

  // **Signals PÚBLICAS** para consumo de componentes
  readonly vehicles = this._vehicles.asReadonly();
  readonly selectedVehicleId = this._selectedVehicleId.asReadonly();
  readonly loadingStates = this._loadingStates.asReadonly();

  // **Computed PÚBLICOS**
  readonly selectedVehicle = computed(() => 
    this.vehicles().find(v => v.id === this.selectedVehicleId())
  );

  readonly isLoading = computed(() => 
    Object.values(this.loadingStates()).some(loading => loading)
  );

  // **Métodos PÚBLICOS** para modificar estado
  setVehicles(vehicles: Vehicle[]) {
    this._vehicles.set(vehicles);
  }

  selectVehicle(vehicleId: string) {
    this._selectedVehicleId.set(vehicleId);
  }

  setLoading(operation: string, loading: boolean) {
    this._loadingStates.update(states => ({
      ...states,
      [operation]: loading
    }));
  }
}
```

### Comunicación entre Componentes
- **Usar services con signals** para estado compartido (preferido)
- Utilizar outputs/inputs para comunicación directa padre-hijo
- Considerar BehaviorSubjects solo para streams de datos externos (HTTP, WebSocket)
- **Siempre usar signals privadas con públicas readonly** en servicios compartidos

## 🧪 Testing

### Unit Tests
- Cada componente debe tener su archivo .spec.ts
- Probar lógica de negocio y renderizado
- Mockear servicios y dependencias externas

```typescript
describe('VehicleComponent', () => {
  let component: VehicleComponent;
  let fixture: ComponentFixture<VehicleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleComponent],
      providers: [
        { provide: VehicleService, useValue: mockVehicleService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
```

## 🔒 Seguridad

### Validaciones
- Validar inputs en frontend y backend
- Sanitizar datos de usuario
- Evitar exponer información sensible

### Manejo de Errores
```typescript
private handleError(error: any) {
  console.error('Error en servicio:', error);
  this.error.set('Ocurrió un error. Por favor intenta nuevamente.');
  this.isLoading.set(false);
}
```

## 🚀 Despliegue y Build

### Comandos npm
```bash
# Desarrollo
npm start

# Build producción
npm run build

# Testing
npm test

# Linting
npm run lint
```

### Configuración de Ambientes
- `environment.ts`: Desarrollo
- `environment.prod.ts`: Producción
- Variables específicas por ambiente en `angular.json`

## 📏 Convenciones de Nomenclatura

### Archivos
- Components: `nombre.component.ts/html/scss`
- Services: `nombre.service.ts`
- Interfaces: `nombre.interface.ts`
- Models: `nombre.model.ts`

### Clases y Métodos
- PascalCase para clases y componentes
- camelCase para métodos y variables
- Prefijo `private readonly` para dependencias inyectadas

### Selectores CSS
- Kebab-case: `app-vehicle-list`
- Prefijo `app-` para todos los componentes

## 🔄 Ciclo de Vida de Componentes

### OnInit Pattern
```typescript
export class ExampleComponent implements OnInit {
  ngOnInit() {
    this.loadData();
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    // Cleanup de subscriptions
  }
}
```

## 📱 Mobile-First Patterns

### Detección de Mobile
```typescript
// ❌ NO usar window directamente (no es SSR-safe)
private get isMobile(): boolean {
  return window.innerWidth <= 768;
}

// ✅ Usar BreakpointObserver de Angular CDK
import { BreakpointObserver } from '@angular/cdk/layout';

export class MyComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  readonly isMobile = computed(() => 
    this.breakpointObserver.isMatched('(max-width: 768px)')
  );
}
```

## 🗺️ Geometrías y Mapas

### Tipado de Geometrías
```typescript
// src/app/features/geofences/interfaces/geometry.interface.ts
export type GeometryType = 'circle' | 'polygon' | 'rectangle';

export interface GeofenceGeometry {
  type: GeometryType;
  coordinates: GeoJSON.Position[] | GeoJSON.Position[][];
  radius?: number;
}
```

### Patrón TerraDraw
- Extraer lógica de dibujo a servicios dedicados
- No implementar TerraDraw directamente en componentes
- Usar adapter pattern para integrar con Google Maps

## 📝 Debugging y Logging

### Console Logs
**REGLA ESTRICTA:** Eliminar todos los console.logs antes de commit.

```typescript
// ❌ NO dejar logs de debugging
console.log('[Component] Debug message', data);

// ✅ Usar servicio de logging condicional
@Injectable({ providedIn: 'root' })
export class DebugService {
  private readonly isDev = isDevMode();
  
  log(component: string, message: string, data?: unknown): void {
    if (this.isDev) {
      console.log(`[${component}] ${message}`, data ?? '');
    }
  }
}
```

### Herramientas recomendadas
- **Angular DevTools:** Para inspección de componentes y signals
- **Augury:** Para debugging de estado
- **RxJS DevTools:** Para debugging de streams reactivos

## 📊 Manejo de Datos

### AG Grid Enterprise
- Configurar columnDefs según necesidad
- Usar cell renderers personalizados para datos complejos
- Implementar sorting, filtering y pagination

```typescript
columnDefs = [
  {
    headerName: 'Vehículo',
    field: 'plate',
    cellRenderer: VehicleCellRenderer
  },
  {
    headerName: 'Estado',
    field: 'status',
    cellRenderer: StatusBadgeRenderer
  }
];
```

## 🎨 Estilos y Temas

### SCSS Structure
```scss
// Componente específico
.vehicle-list {
  &__header {
    // Estilos header
  }

  &__content {
    // Estilos contenido
  }

  &--loading {
    // Modificador de estado
  }
}
```

### Variables de Tema
- Usar variables de Ionic para consistencia
- Definir colores personalizados en `theme/variables.scss`
- Mantener paleta de colores coherente

## ⚡ Optimización de Performance

### Lazy Loading
- Cargar componentes bajo demanda
- Usar `loadComponent()` en rutas
- Implementar virtual scrolling para listas largas

### Memory Management
- Limpiar subscriptions en ngOnDestroy
- Usar async pipe cuando sea posible
- Evitar memory leaks en signals

## 🔧 Herramientas de Desarrollo

### ESLint Configuration
- Configuración para Angular y TypeScript
- Reglas específicas del proyecto
- Integración con VS Code

#### Reglas recomendadas (agregar a .eslintrc.json):
```json
{
  "rules": {
    "max-lines": ["error", {
      "max": 300,
      "skipBlankLines": true,
      "skipComments": true
    }],
    "max-lines-per-function": ["warn", {
      "max": 50,
      "skipBlankLines": true,
      "skipComments": true
    }],
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": ["warn", { "allow": ["error", "warn"] }],
    "@angular-eslint/prefer-standalone": "error"
  }
}
```

### VS Code Extensions recomendadas
- Angular Language Service
- Ionic Snippets
- Prettier - Code: formatter
- ESLint
- Error Lens (muestra errores inline)
- Code: Spell Checker

### Configuración de VS Code: (settings.json):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "angular.enable-strict-mode-prompt": true
}
```

## 📋 Checklist para Nuevos Features

### Antes de Desarrollar
- [ ] Revisar arquitectura existente
- [ ] Identificar componentes core reutilizables
- [ ] Definir interfaces y modelos
- [ ] Planear estructura de archivos

### Durante Desarrollo
- [ ] Mantener archivos bajo 300 líneas
- [ ] Usar componentes standalone
- [ ] Implementar signals para estado
- [ ] Agregar manejo de errores
- [ ] Incluir loading states

### Antes de Commit
- [ ] Ejecutar `npm run lint`
- [ ] Verificar límite de 300 líneas por archivo
- [ ] Eliminar todos los `console.log` de debugging
- [ ] Verificar que no hay uso de `any` sin justificación
- [ ] Verificar que se usan `input()`/`output()` en lugar de decoradores legacy
- [ ] Probar funcionalidad
- [ ] Verificar responsive design
- [ ] Documentar componentes complejos

## 🚨 Manejo de Errores Comunes

### HTTP Errors
```typescript
this.http.get(url).subscribe({
  next: (data) => this.handleSuccess(data),
  error: (error) => {
    console.error('HTTP Error:', error);
    this.showErrorToast('Error al cargar datos');
  }
});
```

### Validation Errors
```typescript
// Reactive Forms pattern
this.vehicleForm = new FormGroup({
  plate: new FormControl('', [Validators.required, Validators.minLength(6)]),
  model: new FormControl('', Validators.required)
});
```

## ⚠️ Anti-patterns a Evitar

### 1. Uso de `any`
```typescript
// ❌ MAL - Sin tipado
const data = signal<any>(null);
const geometry: any = getGeometry();

// ✅ BIEN - Con tipado explícito
interface VehicleData { id: string; plate: string; }
const data = signal<VehicleData | null>(null);
const geometry: GeofenceGeometry = getGeometry();
```

### 2. Getters sin memoización
```typescript
// ❌ MAL - Se ejecuta en cada ciclo de detección
get filteredItems(): Item[] {
  return this.items().filter(item => item.active);
}

// ✅ BIEN - Computed memoiza el resultado
readonly filteredItems = computed(() => {
  return this.items().filter(item => item.active);
});
```

### 3. Event listeners manuales
```typescript
// ❌ MAL - Event listeners manuales
ngOnInit() {
  document.addEventListener('click', this.handleClick);
}

// ✅ BIEN - Usar outputs de Angular
@Component({
  template: `<button (click)="onButtonClick()">Click</button>`
})
export class MyComponent {
  buttonClick = output<void>();
  
  onButtonClick() {
    this.buttonClick.emit();
  }
}
```

### 4. Inputs/Outputs legacy
```typescript
// ❌ MAL - Decoradores legacy
@Input() vehicleId!: string;
@Output() select = new EventEmitter<string>();

// ✅ BIEN - Signals modernas
readonly vehicleId = input.required<string>();
readonly select = output<string>();
```

### 5. Archivos grandes sin refactorizar
```typescript
// ❌ MAL - Componente de 720 líneas
@Component({...})
export class MapComponent { // 720 líneas
  // TODO: Refactorizar
}

// ✅ BIEN - Separar en componentes especializados
// map.component.ts - 150 líneas (orquestación)
// map-controls.component.ts - 100 líneas (controles)
// map-alerts.component.ts - 120 líneas (alertas)
// terra-draw.service.ts - 200 líneas (lógica de dibujo)
```

### 6. Acceso directo a signals de servicios
```typescript
// ❌ MAL - Acceso directo sin método público
const geofence = this.geofenceService.geofences()
  .find(g => g.id === id);

// ✅ BIEN - Usar método del servicio
const geofence = this.geofenceService.getGeofenceById(id);
```

## 📚 Recursos Adicionales

### Documentación Oficial
- [Angular Documentation](https://angular.io/docs)
- [Ionic Documentation](https://ionicframework.com/docs)
- [AG Grid Documentation](https://www.ag-grid.com/docs/)

### Backend API
- Swagger UI: https://staging.americas-iot.com/swagger/index.html
- Base API: https://staging.americas-iot.com/api

---

**Nota:** Este documento debe actualizarse regularmente según evolucione el proyecto. Todas las nuevas funcionalidades deben seguir estas guías para mantener consistencia y calidad del código.
