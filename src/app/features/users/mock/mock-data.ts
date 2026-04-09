import { UserResponse } from '../interfaces/user-request.interface';
import { RoleInfo } from '../interfaces/user.model';

export const mockUsers: UserResponse[] = [
  {
    id: '1',
    tenantId: 'tenant-1',
    fullName: 'Admin LogiTrack',
    email: 'admin@logitrack.com',
    role: 'owner',
    companyId: 'company-1',
    companyName: 'LogiTrack Pro Mazatlan',
    phone: '+52 669 123 0001',
    vehicleCount: 0,
    status: 'active',
    createdAtUtc: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    tenantId: 'tenant-1',
    fullName: 'Carlos Distribuidora',
    email: 'carlos@distribuidora.com',
    role: 'distributor',
    companyId: 'company-2',
    companyName: 'Distribuidora del Norte',
    phone: '+52 669 234 5678',
    vehicleCount: 15,
    status: 'active',
    expirationDate: '2025-12-31',
    createdAtUtc: '2024-02-10T14:30:00Z'
  },
  {
    id: '3',
    tenantId: 'tenant-1',
    fullName: 'María Cliente',
    email: 'maria@cliente.com',
    role: 'client',
    companyId: 'company-3',
    companyName: 'Transportes del Pacífico',
    phone: '+52 669 345 6789',
    vehicleCount: 8,
    status: 'active',
    expirationDate: '2025-06-30',
    createdAtUtc: '2024-03-05T09:15:00Z'
  },
  {
    id: '4',
    tenantId: 'tenant-1',
    fullName: 'Juan Operador',
    email: 'juan@operador.com',
    role: 'operator',
    companyId: 'company-3',
    companyName: 'Transportes del Pacífico',
    phone: '+52 669 456 7890',
    vehicleCount: 5,
    status: 'active',
    createdAtUtc: '2024-04-20T11:45:00Z'
  },
  {
    id: '5',
    tenantId: 'tenant-1',
    fullName: 'Ana Supervisora',
    email: 'ana@supervisor.com',
    role: 'client',
    companyId: 'company-4',
    companyName: 'Logística Express',
    phone: '+52 669 567 8901',
    vehicleCount: 12,
    status: 'inactive',
    expirationDate: '2024-12-31',
    createdAtUtc: '2024-05-12T16:20:00Z'
  }
];

export const roleDefinitions: RoleInfo[] = [
  {
    id: 'owner',
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
    id: 'distributor',
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
    id: 'client',
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
