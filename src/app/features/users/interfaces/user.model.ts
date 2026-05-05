export type UserRole = 'platform_admin' | 'partner_admin' | 'customer_admin' | 'operator';

export interface User {
  id: string;
  fullName: string;
  email: string;
  roleCode: string;
  company?: string;
  phone?: string;
  vehicleCount?: number;
  isActive: boolean;
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
