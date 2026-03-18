export interface CreateDeviceResponse {
  id: string;
  tenantId: string;
  imei: string;
  protocol: string;
  model: string;
  alias: string;
  isActive: boolean;
  createdAtUtc: string;
}

export interface DeviceResponse {
  id: string;
  tenantId: string;
  clientId: string;
  imei: string;
  deviceModelId: string;
  brandName: string;
  modelName: string;
  protocol: string;
  simPhoneNumber: string;
  simCarrierCode: string;
  alias: string;
  isActive: boolean;
  createdAtUtc: string;
}
