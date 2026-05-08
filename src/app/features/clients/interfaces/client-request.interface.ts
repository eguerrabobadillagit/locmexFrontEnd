export interface CreateClientRequest {
  name: string;
  clientType: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  externalCode?: string;
  isActive?: boolean;
}

export interface UpdateClientRequest {
  name?: string;
  clientType?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  externalCode?: string;
  isActive?: boolean;
}

export interface ClientResponse {
  id: string;
  tenantId: string;
  name: string;
  clientType: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  externalCode?: string;
  isActive: boolean;
  createdAtUtc: string;
}
