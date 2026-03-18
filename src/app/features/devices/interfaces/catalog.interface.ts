export interface DeviceBrand {
  id: string;
  name: string;
}

export interface DeviceModel {
  id: string;
  name: string;
  brandId: string;
  protocolCode: string;
  defaultPort: number;
}

export interface SimCarrier {
  code: string;
  displayName: string;
}

export interface VehicleBrand {
  id: string;
  name: string;
}

export interface VehicleType {
  code: string;
  displayName: string;
}

export interface Driver {
  id: string;
  fullName: string;
}
