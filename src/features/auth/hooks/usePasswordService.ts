import { useState } from 'react';
import { passwordService } from '../services/passwordService';
import { 
  EmailCheckResponse, 
  PasswordResetRequest, 
  PasswordServiceResponse, 
  PasswordUpdateRequest 
} from '../types/password.types';

/**
 * Hook para gerenciar operações relacionadas a senhas
 * Este hook encapsula a lógica de negócio para operações de senha
 */
export const usePasswordService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Envia um email de redefinição de senha
   */
  const sendResetPasswordEmail = async (params: PasswordResetRequest): Promise<PasswordServiceResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await passwordService.sendResetPasswordEmail(params);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao enviar email de redefinição'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verifica se um email existe
   */
  const checkEmailExists = async (email: string): Promise<EmailCheckResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await passwordService.checkEmailExists(email);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao verificar email'));
      return { exists: false };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza a senha do usuário
   */
  const updatePassword = async (params: PasswordUpdateRequest): Promise<PasswordServiceResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await passwordService.updatePassword(params);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao atualizar senha'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendResetPasswordEmail,
    checkEmailExists,
    updatePassword,
    isLoading,
    error
  };
}; 