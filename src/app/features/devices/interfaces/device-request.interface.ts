export interface CreateDeviceRequest {
  imei: string;
  clientId: string | null;
  protocol: string;
  deviceModelId: string;
  simPhoneNumber: string;
  simCarrierCode: string;
  alias: string;
  isActive: boolean;
}

export interface UpdateDeviceRequest {
  imei: string;
  clientId: string | null;
  protocol: string;
  deviceModelId: string;
  simPhoneNumber: string;
  simCarrierCode: string;
  alias: string;
  isActive: boolean;
}
