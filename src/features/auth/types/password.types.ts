/**
 * Tipos relacionados ao serviço de senha
 */

export interface PasswordResetRequest {
  email: string;
  redirectUrl: string;
}

export interface PasswordUpdateRequest {
  password: string;
}

export interface PasswordServiceResponse {
  success: boolean;
  user?: {
    id: string;
    email?: string;
    [key: string]: unknown;
  };
}

export interface EmailCheckResponse {
  exists: boolean;
} 