
import { createBrowserSupabaseClient } from "@/shared/lib/supabase";
import {
  EmailCheckResponse,
  PasswordResetRequest,
  PasswordServiceResponse,
  PasswordUpdateRequest
} from "../types/password.types";

/**
 * Serviço responsável por gerenciar operações relacionadas a senhas
 * 
 * O sistema tem dois fluxos distintos:
 * 1. Redefinição de senha (reset): Para usuários existentes que esqueceram a senha
 *    - Usa resetPasswordForEmail
 *    - Redireciona para /reset-password
 *    - Processa com access_token
 * 
 * 2. Definição de senha (set): Para novos usuários que receberam convite
 *    - Usa inviteUserByEmail
 *    - Redireciona para /set-password
 *    - Processa com refresh_token
 */
export const passwordService = {
  /**
   * Envia um email de redefinição de senha para o usuário
   * Usado no fluxo de recuperação de senha (forgot password)
   * 
   * @param params - Parâmetros para redefinição de senha
   */
  sendResetPasswordEmail: async (
    params: PasswordResetRequest
  ): Promise<PasswordServiceResponse> => {
    try {
      const supabase = createBrowserSupabaseClient();
      
      const { error } = await supabase.auth.resetPasswordForEmail(params.email, {
        redirectTo: params.redirectUrl
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error("Erro no serviço de redefinição de senha:", error);
      throw error;
    }
  },
  
  /**
   * Verifica se um email existe no sistema
   * @param email - Email a ser verificado
   */
  checkEmailExists: async (email: string): Promise<EmailCheckResponse> => {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // Esta é uma abordagem simplificada para verificar se o email existe
      // O Supabase não fornece um endpoint direto para verificar a existência do email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      
      // Se não houver erro ou o erro não for "Email não encontrado", consideramos que o email existe
      const exists = !error || !error.message.includes("not found");
      
      return { exists };
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      return { exists: false };
    }
  },
  
  /**
   * Atualiza a senha do usuário
   * Usado tanto no fluxo de redefinição quanto no fluxo de definição após convite
   * 
   * @param params - Parâmetros para atualização de senha
   */
  updatePassword: async (
    params: PasswordUpdateRequest
  ): Promise<PasswordServiceResponse> => {
    try {
      const supabase = createBrowserSupabaseClient();
      
      const { data, error } = await supabase.auth.updateUser({
        password: params.password
      });
      
      if (error) {
        throw error;
      }
      
      return { 
        success: true, 
        user: {
          id: data.user.id,
          email: data.user.email,
          ...Object.fromEntries(
            Object.entries(data.user).filter(([key]) => key !== 'id' && key !== 'email')
          )
        } 
      };
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      throw error;
    }
  }
}; 