export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  roleCode: string;
  clientId: string;
  isActive?: boolean;
  expirationDate?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  password?: string;
  roleCode?: string;
  clientId?: string;
  isActive?: boolean;
  expirationDate?: string;
}

export interface UserResponse {
  id: string;
  tenantId: string;
  clientId: string;
  clientName: string;
  email: string;
  fullName: string;
  roleCode: string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
  // Campos opcionales que pueden venir del backend
  phone?: string;
  vehicleCount?: number;
  expirationDate?: string;
}
