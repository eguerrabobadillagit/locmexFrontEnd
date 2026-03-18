# LogiTrack Pro - Plataforma GPS IoT

Plataforma de gestión y monitoreo GPS en tiempo real desarrollada con Angular 18 e Ionic 8. Sistema completo para rastreo vehicular, gestión de flotas y telemetría en tiempo real.

![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=flat&logo=angular)
![Ionic](https://img.shields.io/badge/Ionic-8-3880FF?style=flat&logo=ionic)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript)
![License](https://img.shields.io/badge/License-Proprietary-red)

## 🚀 Características Principales

### 📍 Monitoreo en Tiempo Real
- **Mapa en Vivo**: Visualización de vehículos en Google Maps con actualización en tiempo real
- **WebSocket/SignalR**: Conexión persistente para telemetría instantánea
- **Animaciones Suaves**: Interpolación de posiciones con easing para movimiento fluido
- **Panel de Flota**: Vista lateral con estado de vehículos (en movimiento, detenido, sin señal)

### 🚗 Gestión de Vehículos
- **CRUD Completo**: Crear, editar y eliminar vehículos
- **Wizard Multi-paso**: Formulario guiado para configuración de vehículos
- **Asignación de Dispositivos**: Vinculación de GPS con vehículos
- **Gestión de Conductores**: Asignación de conductores a unidades
- **Grid Avanzado**: AG Grid con filtros, búsqueda y agrupación

### 📡 Gestión de Dispositivos GPS
- **CRUD de Dispositivos**: Administración completa de dispositivos GPS
- **Comandos SMS**: Envío de comandos de configuración vía SMS
- **Wizard de Configuración**: Proceso guiado para alta de dispositivos
- **Catálogos**: Gestión de fabricantes, modelos y protocolos
- **Asignación de Clientes**: Vinculación de dispositivos con clientes

### 🔐 Autenticación y Seguridad
- **JWT Authentication**: Tokens de acceso seguros
- **Interceptor HTTP**: Inyección automática de tokens
- **Guards de Rutas**: Protección de rutas privadas
- **Logout Automático**: Cierre de sesión por expiración de token

### 📱 Responsive Design
- **Mobile First**: Optimizado para dispositivos móviles
- **Split Pane**: Menú lateral adaptativo (overlay en móvil, fixed en desktop)
- **Auto-close Menus**: Menús que se cierran automáticamente en móvil
- **Touch Optimized**: Controles táctiles optimizados

## 🛠️ Stack Tecnológico

### Frontend Framework
- **Angular 18**: Framework principal
- **Ionic 8**: Componentes UI y navegación
- **TypeScript 5.5**: Lenguaje de programación
- **RxJS**: Programación reactiva
- **Signals**: Sistema de reactividad de Angular

### UI/UX
- **Ionic Components**: Componentes nativos multiplataforma
- **AG Grid Community**: Grids empresariales avanzados
- **Google Maps API**: Mapas y geolocalización
- **Ionicons**: Biblioteca de iconos

### Comunicación en Tiempo Real
- **SignalR (@microsoft/signalr)**: WebSocket para telemetría
- **HTTP Client**: API REST
- **Environment Config**: Configuración por ambiente

### Build & Dev Tools
- **Angular CLI**: Herramientas de desarrollo
- **Capacitor**: Empaquetado para móviles
- **ESLint**: Linting de código
- **Karma/Jasmine**: Testing

## 📋 Requisitos Previos

- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **Angular CLI**: >= 18.x
- **Ionic CLI**: >= 7.x

## 🔧 Instalación

### 1. Clonar el Repositorio
```bash
git clone https://github.com/eguerrabobadillagit/locmexFrontEnd.git
cd locmexFrontEnd
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno

Edita los archivos de environment según tu entorno:

**Development (`src/environments/environment.ts`):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://staging.americas-iot.com/api'
};
```

**Production (`src/environments/environment.prod.ts`):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://staging.americas-iot.com/api'
};
```

### 4. Ejecutar en Desarrollo
```bash
# Servidor de desarrollo (puerto 8100)
ionic serve

# O con Angular CLI
ng serve
```

La aplicación estará disponible en `http://localhost:8100`

## 🏗️ Build para Producción

### Web Build
```bash
# Build optimizado
ionic build --prod

# O con Angular CLI
ng build --configuration production
```

Los archivos compilados estarán en `www/`

### Build para Móviles

#### Android
```bash
# Agregar plataforma Android
ionic capacitor add android

# Build y sincronizar
ionic build --prod
ionic capacitor sync android

# Abrir en Android Studio
ionic capacitor open android
```

#### iOS
```bash
# Agregar plataforma iOS
ionic capacitor add ios

# Build y sincronizar
ionic build --prod
ionic capacitor sync ios

# Abrir en Xcode
ionic capacitor open ios
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/                          # Módulos y servicios core
│   │   ├── components/                # Componentes compartidos
│   │   │   ├── page-header/          # Header de páginas
│   │   │   ├── data-toolbar/         # Toolbar con búsqueda y filtros
│   │   │   ├── user-menu/            # Menú de usuario
│   │   │   ├── wizard-stepper/       # Stepper para wizards
│   │   │   └── wizard-confirmation/  # Resumen de confirmación
│   │   ├── guards/                    # Guards de autenticación
│   │   ├── interceptors/              # HTTP interceptors
│   │   │   └── auth.interceptor.ts   # Inyección de JWT
│   │   ├── models/                    # Interfaces compartidas
│   │   └── utils/                     # Utilidades compartidas
│   │       ├── grid-cell-renderers.util.ts
│   │       └── grid-styles.config.ts
│   │
│   ├── features/                      # Módulos de funcionalidades
│   │   ├── auth/                      # Autenticación
│   │   │   ├── auth.page.ts
│   │   │   └── services/
│   │   │       └── auth.service.ts   # Login, logout, tokens
│   │   │
│   │   ├── home/                      # Dashboard principal
│   │   │   ├── home.page.ts
│   │   │   └── components/
│   │   │       ├── navbar/           # Menú lateral
│   │   │       ├── fleet-tracking-view/  # Panel de flota
│   │   │       └── vehicle-detail/   # Detalle de vehículo
│   │   │
│   │   ├── map/                       # Mapa en tiempo real
│   │   │   ├── map.component.ts
│   │   │   ├── interfaces/
│   │   │   │   └── vehicle-detail.interface.ts
│   │   │   └── service/
│   │   │       ├── vehicle-websocket.service.ts        # SignalR
│   │   │       ├── vehicle-animation.service.ts        # Animaciones
│   │   │       └── vehicle-websocket-simulator.service.ts
│   │   │
│   │   ├── vehicles/                  # Gestión de vehículos
│   │   │   ├── vehicles.page.ts
│   │   │   ├── components/
│   │   │   │   └── form-vehicle-wizard/  # Wizard de vehículos
│   │   │   ├── services/
│   │   │   │   └── vehicle.service.ts    # CRUD + API
│   │   │   ├── interfaces/
│   │   │   └── utils/
│   │   │       ├── column-definitions.util.ts
│   │   │       └── grid-config.util.ts
│   │   │
│   │   └── devices/                   # Gestión de dispositivos GPS
│   │       ├── devices.page.ts
│   │       ├── components/
│   │       │   └── form-device-wizard/   # Wizard de dispositivos
│   │       ├── services/
│   │       │   ├── device.service.ts     # CRUD + comandos SMS
│   │       │   ├── catalog.service.ts    # Catálogos
│   │       │   └── client.service.ts     # Clientes
│   │       └── interfaces/
│   │           ├── device-request.interface.ts
│   │           ├── device-response.interface.ts
│   │           └── device-command.interface.ts
│   │
│   └── services/                      # Servicios globales
│       └── vehicle-selection.ts       # Selección de vehículos
│
├── environments/                      # Configuración por ambiente
│   ├── environment.ts                # Development
│   └── environment.prod.ts           # Production
│
├── theme/                            # Estilos y temas
│   └── variables.scss               # Variables de Ionic
│
└── global.scss                       # Estilos globales
```

## 🔌 API Endpoints

### Base URL
```
https://staging.americas-iot.com/api
```

### Autenticación
- `POST /auth/login` - Login de usuario

### Vehículos
- `GET /vehicles` - Listar vehículos
- `POST /vehicles` - Crear vehículo
- `PUT /vehicles/{id}` - Actualizar vehículo
- `DELETE /vehicles/{id}` - Eliminar vehículo

### Dispositivos
- `GET /devices` - Listar dispositivos
- `POST /devices` - Crear dispositivo
- `PUT /devices/{id}` - Actualizar dispositivo
- `DELETE /devices/{id}` - Eliminar dispositivo
- `POST /devices/{id}/commands` - Enviar comando SMS

### Tiempo Real
- `GET /realtime/sidebar-units` - Estado de unidades
- `WS /hubs/telemetry` - WebSocket de telemetría (SignalR)

### Catálogos
- `GET /catalogs/manufacturers` - Fabricantes
- `GET /catalogs/models` - Modelos
- `GET /catalogs/protocols` - Protocolos
- `GET /catalogs/vehicle-types` - Tipos de vehículos
- `GET /catalogs/vehicle-brands` - Marcas de vehículos

## 🔐 Autenticación

La aplicación usa JWT (JSON Web Tokens) para autenticación:

1. **Login**: El usuario ingresa credenciales
2. **Token**: El servidor devuelve un `accessToken` y `expiresAtUtc`
3. **Storage**: El token se guarda en `localStorage`
4. **Interceptor**: Todas las peticiones HTTP incluyen el token automáticamente
5. **Logout**: El token se elimina y el usuario es redirigido al login

## 📡 WebSocket / SignalR

### Configuración
```typescript
// vehicle-websocket.service.ts
private readonly hubUrl = `${environment.apiUrl.replace('/api', '')}/hubs/telemetry`;

// Conexión
this.connection = new signalR.HubConnectionBuilder()
  .withUrl(this.hubUrl, {
    accessTokenFactory: () => this.authService.accessToken() || ''
  })
  .withAutomaticReconnect()
  .build();
```

### Eventos
- `telemetry:position` - Actualización de posición de vehículo

### Protocolo
- Filtro: `teltonika-avl`

## 🎨 Personalización

### Colores del Tema
Edita `src/theme/variables.scss` para personalizar los colores:

```scss
:root {
  --ion-color-primary: #3b82f6;
  --ion-color-secondary: #10b981;
  --ion-color-tertiary: #f59e0b;
  // ...
}
```

### Scrollbars
Los scrollbars están personalizados en `src/global.scss`:
- Ancho: 6px
- Auto-hide en menús
- Estilos consistentes en todos los navegadores

## 🧪 Testing

```bash
# Unit tests
ng test

# E2E tests
ng e2e

# Coverage
ng test --code-coverage
```

## 📦 Dependencias Principales

```json
{
  "@angular/core": "^18.0.0",
  "@ionic/angular": "^8.0.0",
  "@microsoft/signalr": "^8.0.7",
  "ag-grid-angular": "^32.3.2",
  "ag-grid-community": "^32.3.2",
  "ag-grid-enterprise": "^32.3.2",
  "@angular/google-maps": "^18.0.6"
}
```

## 🚀 Deployment

### Netlify / Vercel
```bash
# Build
ionic build --prod

# Deploy (la carpeta www/)
```

### Firebase Hosting
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar
firebase init hosting

# Deploy
firebase deploy
```

## 📝 Convenciones de Código

- **Componentes**: PascalCase (e.g., `VehicleListComponent`)
- **Servicios**: PascalCase + Service (e.g., `VehicleService`)
- **Interfaces**: PascalCase (e.g., `Vehicle`, `CreateVehicleRequest`)
- **Archivos**: kebab-case (e.g., `vehicle-list.component.ts`)
- **Variables/Funciones**: camelCase (e.g., `loadVehicles()`)
- **Constantes**: UPPER_SNAKE_CASE (e.g., `API_URL`)

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 8100 already in use"
```bash
# Cambiar puerto
ionic serve --port 8101
```

### Error de CORS
Verifica que el backend tenga configurado CORS para tu dominio.

### WebSocket no conecta
- Verifica que la URL del hub sea correcta
- Confirma que el token JWT sea válido
- Revisa la consola del navegador para errores

## 📄 Licencia

Propietario - Americas IoT © 2026

## 👥 Equipo

- **Desarrollo**: Americas IoT Team
- **Plataforma**: Marca Blanca

## 📞 Soporte

Para soporte técnico, contacta a: support@americas-iot.com

---

**Versión**: 13.0  
**Última actualización**: Marzo 2026
