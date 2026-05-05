import { UserResponse } from '../interfaces/user-request.interface';
import { RoleInfo } from '../interfaces/user.model';

export const mockUsers: UserResponse[] = [
  {
    id: '1',
    tenantId: 'tenant-1',
    fullName: 'Admin LogiTrack',
    email: 'admin@logitrack.com',
    roleCode: 'platform_admin',
    clientId: 'company-1',
    clientName: 'LogiTrack Pro Mazatlan',
    phone: '+52 669 123 0001',
    vehicleCount: 0,
    isActive: true,
    createdAtUtc: '2024-01-15T10:00:00Z',
    updatedAtUtc: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    tenantId: 'tenant-1',
    fullName: 'Carlos Distribuidora',
    email: 'carlos@distribuidora.com',
    roleCode: 'partner_admin',
    clientId: 'company-2',
    clientName: 'Distribuidora del Norte',
    phone: '+52 669 234 5678',
    vehicleCount: 15,
    isActive: true,
    expirationDate: '2025-12-31',
    createdAtUtc: '2024-02-10T14:30:00Z',
    updatedAtUtc: '2024-02-10T14:30:00Z'
  },
  {
    id: '3',
    tenantId: 'tenant-1',
    fullName: 'María Cliente',
    email: 'maria@cliente.com',
    roleCode: 'customer_admin',
    clientId: 'company-3',
    clientName: 'Transportes del Pacífico',
    phone: '+52 669 345 6789',
    vehicleCount: 8,
    isActive: true,
    expirationDate: '2025-06-30',
    createdAtUtc: '2024-03-05T09:15:00Z',
    updatedAtUtc: '2024-03-05T09:15:00Z'
  },
  {
    id: '4',
    tenantId: 'tenant-1',
    fullName: 'Juan Operador',
    email: 'juan@operador.com',
    roleCode: 'operator',
    clientId: 'company-3',
    clientName: 'Transportes del Pacífico',
    phone: '+52 669 456 7890',
    vehicleCount: 5,
    isActive: true,
    createdAtUtc: '2024-04-20T11:45:00Z',
    updatedAtUtc: '2024-04-20T11:45:00Z'
  },
  {
    id: '5',
    tenantId: 'tenant-1',
    fullName: 'Ana Supervisora',
    email: 'ana@supervisor.com',
    roleCode: 'customer_admin',
    clientId: 'company-4',
    clientName: 'Logística Express',
    phone: '+52 669 567 8901',
    vehicleCount: 12,
    isActive: false,
    expirationDate: '2024-12-31',
    createdAtUtc: '2024-05-12T16:20:00Z',
    updatedAtUtc: '2024-05-12T16:20:00Z'
  }
];

export const roleDefinitions: RoleInfo[] = [
  {
    id: 'platform_admin',
    name: 'Dueño',
    description: 'Acceso total. Gestiona todos los usuarios y configuraciones',
    icon: 'shield-checkmark',
    permissions: [
      { name: 'Gestionar todos los usuarios', enabled: true, type: 'success' },
      { name: 'Configurar plataforma', enabled: true, type: 'success' },
      { name: 'Ver todos los reportes', enabled: true, type: 'success' },
      { name: 'Administrar empresas', enabled: true, type: 'success' }
    ]
  },
  {
    id: 'partner_admin',
    name: 'Distribuidor',
    description: 'Crea Clientes y Operadores. Gestiona vehículos para sus clientes',
    icon: 'git-network',
    permissions: [
      { name: 'Crear clientes y operadores', enabled: true, type: 'success' },
      { name: 'Gestionar vehículos de clientes', enabled: true, type: 'success' },
      { name: 'Ver reportes de clientes', enabled: true, type: 'success' },
      { name: 'No puede crear distribuidores', enabled: false, type: 'warning' }
    ]
  },
  {
    id: 'customer_admin',
    name: 'Cliente',
    description: 'Crea Operadores. Administra recursos asignados y reportes',
    icon: 'briefcase',
    permissions: [
      { name: 'Crear operadores', enabled: true, type: 'success' },
      { name: 'Administrar recursos asignados', enabled: true, type: 'success' },
      { name: 'Ver reportes propios', enabled: true, type: 'success' },
      { name: 'No puede crear clientes', enabled: false, type: 'warning' }
    ]
  },
  {
    id: 'operator',
    name: 'Operador',
    description: 'Monitorea vehículos asignados. Sin creación de usuarios',
    icon: 'headset',
    permissions: [
      { name: 'Monitorear vehículos asignados', enabled: true, type: 'success' },
      { name: 'Ver reportes', enabled: true, type: 'success' },
      { name: 'No puede crear usuarios', enabled: false, type: 'warning' }
    ]
  }
];
