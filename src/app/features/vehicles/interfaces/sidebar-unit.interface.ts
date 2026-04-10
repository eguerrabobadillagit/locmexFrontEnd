export interface SidebarUnit {
  deviceId: string;
  vehicleId: string;
  unitLabel: string;
  plate: string;
  driverName: string;
  statusCode: string;
  statusSinceUtc: string;
  lastMessageAtUtc: string;
  ignitionOn: boolean;
  speedKph: number | null;
  batteryLevel: number | null;
  latitude: number | null;
  longitude: number | null;
}
