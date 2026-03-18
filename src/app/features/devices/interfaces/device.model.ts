export interface Device {
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

export type TelemetryCapability = 'CAN' | 'Bluetooth' | 'WiFi' | 'Temperature' | 'Fuel' | 'RFID' | 'Camera';
