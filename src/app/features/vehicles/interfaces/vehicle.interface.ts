export interface Vehicle {
  id: string;
  plate: string;
  driver: string;
  model: string;
  status: 'moving' | 'stopped' | 'no-signal';
  statusText: string;
  lastUpdate: string;
  speed: number;
  battery: number;
  motorOn: boolean;
}

export function getVehicleStatusClass(status: string): string {
  switch (status) {
    case 'moving': return 'status-moving';
    case 'stopped': return 'status-stopped';
    case 'no-signal': return 'status-no-signal';
    default: return '';
  }
}
