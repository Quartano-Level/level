import { useState, useEffect, useCallback } from "react"
import { usePasswordService } from "./usePasswordService"
import { createBrowserSupabaseClient } from "@/shared/lib/supabase"
import { useRouter } from "next/navigation"
import { passwordSchema } from "@/shared/utils/validations"

/**
 * Hook para gerenciar a definição de senha para usuários convidados
 */
export function useSetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  
  // Use the password service hook
  const { updatePassword, isLoading: loading, error: serviceError } = usePasswordService()
  
  // Extrair token da URL quando o componente for montado
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Esperar um momento para garantir que a URL esteja completamente carregada
      setTimeout(() => {
        const hash = window.location.hash
        
        if (hash) {
          const urlParams = new URLSearchParams(hash.substring(1))
          const token = urlParams.get("access_token")
          
          if (token) {
            setAccessToken(token)
          } else {
            setLocalError("Link de convite inválido ou expirado. Solicite um novo convite.")
          }
        } else {
          setLocalError("Nenhum token encontrado na URL. Verifique se o link está correto ou solicite um novo convite.")
        }
      }, 500)
    }
  }, [])
  
  // Validar os campos em tempo real
  const validateFields = useCallback(() => {
    if (password || confirmPassword) {
      const result = passwordSchema.safeParse({ password, confirmPassword })
      
      if (!result.success) {
        // Converte os erros do Zod para o formato que esperamos
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
  }, [password, confirmPassword]);
  
  // Efeito para validar os campos sempre que mudarem
  useEffect(() => {
    validateFields();
  }, [password, confirmPassword, validateFields]);
  
  // Função para atualizar a senha com validação
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  
  // Função para atualizar a confirmação de senha com validação
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };
  
  /**
   * Valida e define a senha do usuário convidado
   */
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar novamente antes de enviar
    validateFields();
    
    // Se houver erros, não prosseguir
    if (Object.keys(formErrors).length > 0) {
      return;
    }
    
    if (!accessToken) {
      setLocalError("Token de acesso não encontrado")
      return
    }
    
    try {
      setLocalError(null)
      
      const supabase = createBrowserSupabaseClient()
      
      // Configurar a sessão com o token de acesso
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: "",
      })
      
      // Obter os dados do usuário atual para preservar metadados
      const { data: { user }, error: getUserError } = await supabase.auth.getUser()
      
      if (getUserError || !user) {
        throw new Error(getUserError?.message || "Não foi possível identificar o usuário")
      }
      
      // Atualizar a senha do usuário
      await updatePassword({ password })
      
      // Definir sucesso e redirecionar após um delay
      setSuccess(true)
      
      // Redirecionar para o dashboard após 3 segundos
      setTimeout(() => {
        router.push("/notas")
      }, 3000)
    } catch (error: unknown) {
      console.error("Erro ao definir senha:", error)
      setLocalError(error instanceof Error ? error.message : "Erro ao definir sua senha. Tente novamente.")
    }
  }
  
  // Combine errors
  const error = localError || serviceError?.message || null;
  
  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handlePasswordChange,
    handleConfirmPasswordChange,
    loading,
    error,
    formErrors,
    success,
    handleSetPassword
  }
} 