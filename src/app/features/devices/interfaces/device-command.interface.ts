export interface CommandRequest {
  actionCode: string;
  params?: Record<string, string>;
}

export interface CommandResponse {
  success: boolean;
  message?: string;
}
