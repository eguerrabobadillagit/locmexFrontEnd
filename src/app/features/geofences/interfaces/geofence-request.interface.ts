import { GeofenceType, GeofenceStatus } from './geofence.model';

export interface CreateGeofenceRequest {
  clientId: string;
  name: string;
  description: string;
  geoJson: string; // GeoJSON string representation
  geometryType: string; // 'circular', 'polygon', 'rectangle'
  alertOnEnter: boolean;
  alertOnExit: boolean;
  vehicleId?: string; // Optional single vehicle ID
}

export interface UpdateGeofenceRequest extends Partial<CreateGeofenceRequest> {
  id: string;
}

export interface GeofenceResponse {
  id: string;
  tenantId: string;
  clientId: string;
  name: string;
  isActive: boolean;
  alertOnEnter: boolean;
  alertOnExit: boolean;
  updatedAtUtc: string;
  geoJson: string;
  geometryType: string; // 'circular', 'polygon', 'rectangle'
  vehicleId?: string; // Vehicle ID linked to this geofence
  // Optional fields for frontend use
  description?: string;
  type?: GeofenceType;
  status?: GeofenceStatus;
  clientName?: string;
  color?: string;
  // Legacy fields for backward compatibility
  center?: {
    lat: number;
    lng: number;
  };
  radius?: number;
  coordinates?: Array<{
    lat: number;
    lng: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}
