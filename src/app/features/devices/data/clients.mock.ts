import { Client } from '../interfaces/client.interface';

export const MOCK_CLIENTS: Client[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    tenantId: '00000000-0000-0000-0000-000000000010',
    name: 'Mi cuenta (Admin LogiTrack)',
    contactName: 'Admin LogiTrack',
    contactPhone: '555-0100',
    contactEmail: 'admin@logitrack.com',
    externalCode: 'ADM-001',
    isActive: true,
    createdAtUtc: '2026-02-25T20:36:13.482525Z'
  },
  {
    id: '2',
    tenantId: '00000000-0000-0000-0000-000000000010',
    name: 'Distribuidora Pacífico',
    contactName: 'Contacto Pacífico',
    contactPhone: '555-0101',
    contactEmail: 'contacto@distpacifico.com',
    externalCode: 'CL-002',
    isActive: true,
    createdAtUtc: '2026-02-25T20:36:13.482525Z'
  },
  {
    id: '3',
    tenantId: '00000000-0000-0000-0000-000000000010',
    name: 'Transportes del Mar',
    contactName: 'Info Mar',
    contactPhone: '555-0102',
    contactEmail: 'info@transportesmar.com',
    externalCode: 'CL-003',
    isActive: true,
    createdAtUtc: '2026-02-25T20:36:13.482525Z'
  },
  {
    id: '4',
    tenantId: '00000000-0000-0000-0000-000000000010',
    name: 'Logística Mazatlán Express',
    contactName: 'Contacto Express',
    contactPhone: '555-0103',
    contactEmail: 'contacto@mazatlanexpress.com',
    externalCode: 'CL-004',
    isActive: true,
    createdAtUtc: '2026-02-25T20:36:13.482525Z'
  },
  {
    id: '5',
    tenantId: '00000000-0000-0000-0000-000000000010',
    name: 'Entregas Rápidas MZT',
    contactName: 'Ventas Rápidas',
    contactPhone: '555-0104',
    contactEmail: 'ventas@entregasrapidas.com',
    externalCode: 'CL-005',
    isActive: true,
    createdAtUtc: '2026-02-25T20:36:13.482525Z'
  },
  {
    id: '6',
    tenantId: '00000000-0000-0000-0000-000000000010',
    name: 'Grupo Transportista del Norte',
    contactName: 'Admin GTN',
    contactPhone: '555-0105',
    contactEmail: 'admin@gtn.com.mx',
    externalCode: 'CL-006',
    isActive: true,
    createdAtUtc: '2026-02-25T20:36:13.482525Z'
  },
  {
    id: '7',
    tenantId: '00000000-0000-0000-0000-000000000010',
    name: 'Servicios Logísticos Sinaloa',
    contactName: 'Info SLS',
    contactPhone: '555-0106',
    contactEmail: 'info@slslogistica.com',
    externalCode: 'CL-007',
    isActive: true,
    createdAtUtc: '2026-02-25T20:36:13.482525Z'
  }
];
