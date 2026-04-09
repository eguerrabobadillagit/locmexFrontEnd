export type GeofenceType = 'circular' | 'polygon';
export type GeofenceStatus = 'active' | 'inactive';

export interface Geofence {
  id: string;
  name: string;
  description?: string;
  type: GeofenceType;
  status: GeofenceStatus;
  clientId: string;
  clientName?: string;
  color: string;
  // Circular geofence properties
  center?: {
    lat: number;
    lng: number;
  };
  radius?: number; // in meters
  // Polygon geofence properties
  coordinates?: Array<{
    lat: number;
    lng: number;
  }>;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}
