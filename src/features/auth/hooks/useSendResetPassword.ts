'use client'

import { useState, useCallback, useEffect } from "react"
import { usePasswordService } from "./usePasswordService"
import { resetPasswordEmailSchema } from "@/utils/validations"

export function useSendResetPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Use the password service hook
  const { sendResetPasswordEmail, checkEmailExists, isLoading: loading } = usePasswordService()
  
  // Validar email em tempo real
  const validateEmail = useCallback(() => {
    if (email) {
      const result = resetPasswordEmailSchema.safeParse({ email })
      
      if (!result.success) {
        // Converter erros do Zod para o formato esperado
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach(err => {
          if (err.path.length > 0) {
            const fieldName = err.path[0].toString();
            fieldErrors[fieldName] = err.message;
          }
        });
        setFormErrors(fieldErrors);
      } else {
        setFormErrors({});
      }
    }
  }, [email]);
  
  // Validar sempre que o email mudar
  useEffect(() => {
    validateEmail();
  }, [email, validateEmail]);
  
  // Função para atualizar o email com validação
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  
  /**
   * Envia um email de redefinição de senha para o usuário
   */
  const handleSendResetPasswordEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar novamente antes de enviar
    validateEmail();
    
    // Se houver erros, não prosseguir
    if (Object.keys(formErrors).length > 0) {
      return;
    }
    
    try {
      setMessage(null)
      
      // Configurar URL de redirecionamento para página de redefinição de senha
      // Importante: manter o redirectUrl como /reset-password para seguir o padrão do sistema
      const redirectUrl = `${window.location.origin}/reset-password`
      
      // Usar o serviço para enviar o email de redefinição
      await sendResetPasswordEmail({ email, redirectUrl })
      
      // Mostrar mensagem de sucesso
      setMessage("Email enviado com sucesso! Verifique sua caixa de entrada.")
    } catch (error: unknown) {
      console.error("Erro ao processar solicitação:", error)
      setMessage(error instanceof Error ? error.message : "Erro ao enviar email. Tente novamente.")
    }
  }
  
  return {
    email,
    setEmail,
    handleEmailChange,
    loading,
    message,
    setMessage,
    formErrors,
    handleSendResetPasswordEmail,
    checkEmailExists: (emailToCheck: string) => checkEmailExists(emailToCheck)
  }
} 