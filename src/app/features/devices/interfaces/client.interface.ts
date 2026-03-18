export interface Client {
  id: string;
  tenantId: string;
  name: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  externalCode: string;
  isActive: boolean;
  createdAtUtc: string;
}
