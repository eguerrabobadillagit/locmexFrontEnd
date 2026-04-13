export interface VehicleDetail {
  id: string;
  plate: string;
  status: string;
  model: string;
  driver: string;
  imei: string;
  speed: number;
  fuel: number;
  heading: number;
  motorHours: number;
  latitude: number;
  longitude: number;
  satellites: number;
  altitude: number;
  odometer: number;
  lastReport: string;
  address?: string;
}
