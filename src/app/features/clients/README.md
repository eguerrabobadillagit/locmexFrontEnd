# Feature: Clientes

## Descripción
Módulo para la gestión de clientes de la plataforma GPS.

## Estructura

```
clients/
├── clients.page.ts          # Componente principal
├── clients.page.html         # Template
├── clients.page.scss         # Estilos
├── interfaces/               # Interfaces TypeScript
│   └── client-request.interface.ts
├── services/                 # Servicios
│   └── client.service.ts
├── utils/                    # Utilidades
│   ├── column-definitions.util.ts
│   └── grid-config.util.ts
├── mock/                     # Datos de prueba
│   └── clients.mock.ts
└── README.md                 # Documentación
```

## Funcionalidades Implementadas

### ✅ Vista de Grid (AG Grid)
- Tabla con columnas: Nombre, Email, Empresa, Teléfono, Estado, Acciones
- Búsqueda rápida en todas las columnas
- Filtros por estado (Todos, Activos, Inactivos)
- Ordenamiento por columnas
- Paginación (10, 20, 50, 100 registros por página)
- Botones de acción: Editar y Eliminar
- Datos mock para desarrollo

### 🚧 Pendientes de Implementar

1. **Servicio de Clientes**
   - CRUD completo (Create, Read, Update, Delete)
   - Integración con API backend
   - Manejo de estados y errores

2. **Modal de Creación/Edición**
   - Formulario para agregar nuevos clientes
   - Validaciones de campos
   - Edición de clientes existentes

3. **Confirmación de Eliminación**
   - Alert de confirmación antes de eliminar
   - Manejo de errores en eliminación

4. **Detalles del Cliente**
   - Vista detallada con toda la información
   - Historial de vehículos asignados
   - Dispositivos GPS asociados

## Navegación

- **Ruta**: `/home/clientes`
- **Menú**: Gestión > Clientes
- **Icono**: `person-outline`

## Datos del Cliente

```typescript
interface ClientResponse {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  rfc?: string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
  vehicleCount?: number;
  userCount?: number;
}
```

## Próximos Pasos

1. ✅ ~~Crear servicio y interfaces~~
2. ✅ ~~Implementar AG Grid con columnas personalizadas~~
3. ✅ ~~Agregar filtros y búsqueda~~
4. 🚧 Crear modal de formulario para crear/editar clientes
5. 🚧 Conectar con API backend real
6. 🚧 Implementar validaciones de formulario
7. 🚧 Agregar exportación a Excel/PDF

## Notas

- Sigue el mismo patrón que el feature de Usuarios
- Usa AG Grid para la tabla de datos
- Angular Signals para reactividad
- Componentes reutilizables: PageHeader, DataToolbar
- Datos mock mientras no hay backend
- Estilos consistentes con el resto de la aplicación

## Cómo usar datos reales

En `client.service.ts`, descomentar la línea del HTTP y comentar el mock:

```typescript
// Cambiar de:
return of(MOCK_CLIENTS);

// A:
return this.http.get<ClientResponse[]>(this.apiUrl);
```
