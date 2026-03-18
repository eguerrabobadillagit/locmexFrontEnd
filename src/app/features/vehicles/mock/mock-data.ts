import { Vehicle } from '../interfaces/vehicle.model';

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    unit: 'ABC-123-CD',
    model: 'Mercedes Sprinter 2022',
    driver: 'Juan Pérez',
    driverRole: 'Jelonka',
    status: 'active',
    gpsSignal: { status: 'strong', lastConnection: '27 min' },
    speed: 45,
    fuel: 85,
    motor: 'on',
    lastUpdate: new Date('2025-02-05T10:45:00')
  },
  {
    id: '2',
    unit: 'DEF-456-GH',
    model: 'Ford Transit 2021',
    driver: 'María García',
    driverRole: 'Quezon',
    status: 'in-route',
    gpsSignal: { status: 'weak', lastConnection: '17 min' },
    speed: 65,
    fuel: 62,
    motor: 'on',
    lastUpdate: new Date('2025-01-13T11:43:00')
  },
  {
    id: '3',
    unit: 'UK-789-LM',
    model: 'Nissan Navara 2021',
    driver: 'Carlos López',
    driverRole: 'Jelonka',
    status: 'active',
    gpsSignal: { status: 'strong', lastConnection: '1 hora' },
    speed: 0,
    fuel: 45,
    motor: 'on',
    lastUpdate: new Date('2025-02-05T09:48:00')
  },
  {
    id: '4',
    unit: 'NOP-012-QR',
    model: 'Nissan NP300 2022',
    driver: 'Ana Martínez',
    driverRole: 'Condos',
    status: 'inactive',
    gpsSignal: { status: 'none', lastConnection: '1 día' },
    speed: 0,
    fuel: 90,
    motor: 'off',
    lastUpdate: new Date('2025-01-13T10:48:00')
  },
  {
    id: '5',
    unit: 'XYZ-789-AB',
    model: 'Toyota Hilux 2023',
    driver: 'Roberto Sánchez',
    driverRole: 'Ceban',
    status: 'inactive',
    gpsSignal: { status: 'none', lastConnection: '1 semana' },
    speed: 0,
    fuel: 30,
    motor: 'off',
    lastUpdate: new Date('2025-02-23T10:48:00')
  }
];
