import { ClientResponse } from '../interfaces/client-request.interface';

export const MOCK_CLIENTS: ClientResponse[] = [
  {
    id: '1',
    tenantId: 'tenant-1',
    name: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    phone: '555-1234',
    company: 'Transportes del Norte',
    address: 'Av. Principal 123, Culiacán',
    rfc: 'PEXJ850101ABC',
    isActive: true,
    createdAtUtc: '2024-01-15T10:00:00Z',
    updatedAtUtc: '2024-01-15T10:00:00Z',
    vehicleCount: 15,
    userCount: 3
  },
  {
    id: '2',
    tenantId: 'tenant-1',
    name: 'María González',
    email: 'maria.gonzalez@logistica.com',
    phone: '555-5678',
    company: 'Logística Express',
    address: 'Calle Comercio 456, Mazatlán',
    rfc: 'GOXM900202DEF',
    isActive: true,
    createdAtUtc: '2024-02-10T14:30:00Z',
    updatedAtUtc: '2024-02-10T14:30:00Z',
    vehicleCount: 8,
    userCount: 2
  },
  {
    id: '3',
    tenantId: 'tenant-1',
    name: 'Carlos Ramírez',
    email: 'carlos.ramirez@distribuidora.com',
    phone: '555-9012',
    company: 'Distribuidora del Pacífico',
    address: 'Blvd. Industrial 789, Los Mochis',
    rfc: 'RAXC950303GHI',
    isActive: false,
    createdAtUtc: '2024-03-05T09:15:00Z',
    updatedAtUtc: '2024-03-20T16:45:00Z',
    vehicleCount: 0,
    userCount: 1
  },
  {
    id: '4',
    tenantId: 'tenant-1',
    name: 'Ana Martínez',
    email: 'ana.martinez@comercial.com',
    phone: '555-3456',
    company: 'Comercial Sinaloa',
    address: 'Av. Insurgentes 321, Guasave',
    rfc: 'MAXA880404JKL',
    isActive: true,
    createdAtUtc: '2024-04-12T11:20:00Z',
    updatedAtUtc: '2024-04-12T11:20:00Z',
    vehicleCount: 12,
    userCount: 4
  },
  {
    id: '5',
    tenantId: 'tenant-1',
    name: 'Roberto Sánchez',
    email: 'roberto.sanchez@fletes.com',
    phone: '555-7890',
    company: 'Fletes y Mudanzas RS',
    address: 'Calle Reforma 654, Navolato',
    rfc: 'SAXR920505MNO',
    isActive: true,
    createdAtUtc: '2024-05-01T08:00:00Z',
    updatedAtUtc: '2024-05-01T08:00:00Z',
    vehicleCount: 6,
    userCount: 2
  }
];
