export interface Alert {
  alertId: string;
  deviceId: string;
  vehicleId: string;
  vehicleLabel: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  geofenceName: string;
  positionTimeUtc: string;
  createdAtUtc: string;
  latitude: number;
  longitude: number;
  isRead: boolean;
  readAtUtc: string | null;
}

export type AlertType =
  | 'geofence_exit'
  | 'geofence_enter'
  | 'speeding'
  | 'geofence'
  | 'low_battery'
  | 'panic'
  | 'ignition'
  | 'maintenance'
  | 'towing'
  | 'device_offline'
  | 'device_online'
  | 'fuel_level'
  | 'temperature'
  | 'unknown';

export interface AlertResponse {
  items: Alert[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  count: number;
}

export type AlertSeverity = 'warning' | 'info' | 'error';
