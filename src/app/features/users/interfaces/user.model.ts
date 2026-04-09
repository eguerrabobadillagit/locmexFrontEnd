export type UserRole = 'owner' | 'distributor' | 'client' | 'operator';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  company: string;
  phone: string;
  vehicleCount: number;
  status: UserStatus;
  expirationDate?: string;
}

export interface RoleInfo {
  id: UserRole;
  name: string;
  description: string;
  icon: string;
  permissions: Permission[];
}

export interface Permission {
  name: string;
  enabled: boolean;
  type: 'success' | 'warning';
}
