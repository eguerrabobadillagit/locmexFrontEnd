export interface CreateVehicleRequest {
  plate: string;
  brandId: string;
  model: string;
  vehicleYear: number;
  vehicleTypeCode: string;
  label?: string;
  vin?: string;
  statusCode?: string;
  isActive: boolean;
  clientId?: string | null;
  deviceId?: string | null;
  driverId?: string | null;
}

export interface VehicleResponse {
  id: string;
  tenantId: string;
  plate: string;
  brandId: string | null;
  brandName: string | null;
  model: string | null;
  vehicleYear: number | null;
  vehicleTypeCode: string | null;
  vehicleTypeName: string | null;
  label: string;
  vin: string;
  statusCode: string;
  isActive: boolean;
  clientId: string | null;
  deviceId: string | null;
  driverId: string | null;
  createdAtUtc: string;
}
