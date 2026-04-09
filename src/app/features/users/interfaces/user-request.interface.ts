import { UserRole, UserStatus } from './user.model';

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  companyId: string;
  phone: string;
  status: UserStatus;
  expirationDate?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  companyId?: string;
  phone?: string;
  status?: UserStatus;
  expirationDate?: string;
}

export interface UserResponse {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  role: UserRole;
  companyId: string;
  companyName: string;
  phone: string;
  vehicleCount: number;
  status: UserStatus;
  expirationDate?: string;
  createdAtUtc: string;
}
