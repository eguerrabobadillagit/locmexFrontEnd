export interface VehicleHistoryPoint {
  fixTimeUtc: string;
  serverTimeUtc: string;
  latitude: number;
  longitude: number;
  speedKph: number;
  heading: number | null;
  altitudeM: number | null;
  satellites: number | null;
  hdop: number | null;
}

export interface VehicleHistoryRequest {
  vehicleId: string;
  fromUtc: string;
  toUtc: string;
  // Campos opcionales para mantener la referencia original
  fromDate?: string;
  fromHour?: string;
  fromMinute?: string;
  toDate?: string;
  toHour?: string;
  toMinute?: string;
}

export interface FormattedHistoryPoint {
  index: number;
  time: string;
  location: string;
  speedKph: number;
  latitude: number;
  longitude: number;
  status: 'moving' | 'stopped';
}

export type PlaybackSpeed = 0.5 | 1 | 2 | 4;
