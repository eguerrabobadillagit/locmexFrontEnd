import { Device } from '../interfaces/device.model';

export const mockDevices: Device[] = [
  {
    id: '1',
    tenantId: '00000000-0000-0000-0000-000000000001',
    clientId: '20000000-0000-0000-0000-000000000001',
    imei: '123456789012345',
    deviceModelId: 'a1111111-1111-1111-1111-111111111111',
    brandName: 'Teltonika',
    modelName: 'FMB920',
    protocol: 'tcp',
    simPhoneNumber: '1234567890',
    simCarrierCode: 'telcel',
    alias: 'Dispositivo 1',
    isActive: true,
    createdAtUtc: '2026-03-01T00:00:00Z'
  },
  {
    id: '2',
    tenantId: '00000000-0000-0000-0000-000000000001',
    clientId: '20000000-0000-0000-0000-000000000001',
    imei: '234567890123456',
    deviceModelId: 'a2222222-2222-2222-2222-222222222222',
    brandName: 'Queclink',
    modelName: 'GV500MAP',
    protocol: 'tcp',
    simPhoneNumber: '2345678901',
    simCarrierCode: 'movistar',
    alias: 'Dispositivo 2',
    isActive: true,
    createdAtUtc: '2026-03-02T00:00:00Z'
  },
  {
    id: '3',
    tenantId: '00000000-0000-0000-0000-000000000001',
    clientId: '20000000-0000-0000-0000-000000000001',
    imei: '345678901234567',
    deviceModelId: 'a3333333-3333-3333-3333-333333333333',
    brandName: 'Concox',
    modelName: 'GT06N',
    protocol: 'gt06',
    simPhoneNumber: '3456789012',
    simCarrierCode: 'att',
    alias: 'Dispositivo 3',
    isActive: true,
    createdAtUtc: '2026-03-03T00:00:00Z'
  },
  {
    id: '4',
    tenantId: '00000000-0000-0000-0000-000000000001',
    clientId: '20000000-0000-0000-0000-000000000001',
    imei: '456789012345678',
    deviceModelId: 'a4444444-4444-4444-4444-444444444444',
    brandName: 'CalAmp',
    modelName: 'LMU-2630',
    protocol: 'udp',
    simPhoneNumber: '4567890123',
    simCarrierCode: 'telcel',
    alias: 'Dispositivo 4',
    isActive: true,
    createdAtUtc: '2026-03-04T00:00:00Z'
  },
  {
    id: '5',
    tenantId: '00000000-0000-0000-0000-000000000001',
    clientId: '20000000-0000-0000-0000-000000000001',
    imei: '567890123456789',
    deviceModelId: 'a5555555-5555-5555-5555-555555555555',
    brandName: 'Suntech',
    modelName: 'ST4340',
    protocol: 'tcp',
    simPhoneNumber: '5678901234',
    simCarrierCode: 'movistar',
    alias: 'Dispositivo 5',
    isActive: false,
    createdAtUtc: '2026-03-05T00:00:00Z'
  }
];
