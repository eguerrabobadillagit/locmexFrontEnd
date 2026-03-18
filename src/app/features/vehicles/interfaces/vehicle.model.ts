export interface Vehicle {
  id: string;
  unit: string;
  model: string;
  driver: string;
  driverRole: string;
  status: VehicleStatus;
  gpsSignal: GPSSignal;
  speed: number;
  fuel: number;
  motor: MotorStatus;
  lastUpdate: Date;
}

export type VehicleStatus = 'active' | 'in-route' | 'inactive';

export interface GPSSignal {
  status: 'strong' | 'weak' | 'none';
  lastConnection: string;
}

export type MotorStatus = 'on' | 'off';
