/**
 * Respuesta de validación inicial del token
 * GET /api/public/tracking/{token}
 */
export interface PublicTrackingInfo {
  vehicleId: string;
  deviceId: string;
  vehicleLabel: string;
  plate: string;
  expiresAtUtc: string;
}

/**
 * Respuesta de posición del vehículo
 * GET /api/public/tracking/{token}/position
 */
export interface PublicTrackingPosition {
  vehicleId: string;
  deviceId: string;
  vehicleLabel: string;
  plate: string;
  statusCode: string;
  fixTimeUtc: string;
  lastMessageAtUtc: string;
  latitude: number;
  longitude: number;
  speedKph: number;
  ignitionOn: boolean;
  isOnline: boolean;
  expiresAtUtc: string;
}

/**
 * Payload del evento SignalR
 * Event: tracking:position
 */
export interface TrackingPositionEvent {
  vehicleId: string;
  deviceId: string;
  vehicleLabel: string;
  plate: string;
  statusCode: string;
  fixTimeUtc: string;
  lastMessageAtUtc: string;
  latitude: number;
  longitude: number;
  speedKph: number;
  ignitionOn: boolean;
  isOnline: boolean;
  expiresAtUtc: string;
}
