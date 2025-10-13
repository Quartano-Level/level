'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Image from 'next/image'
import Link from 'next/link'
import { FormInput } from '@/shared/components/ui/form-input'
import { loginSchema } from '@/utils/validations'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  
  // Validar os campos em tempo real
  const validateFields = useCallback(() => {
    if (email || password) {
      const result = loginSchema.safeParse({ email, password })
      
      if (!result.success) {
        // Converte os erros do Zod para o formato que esperamos
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach(err => {
          if (err.path.length > 0) {
            const fieldName = err.path[0].toString();
            fieldErrors[fieldName] = err.message;
          }
        });
        setFormErrors(oldErrors => {
          const newErrors = { ...oldErrors, ...fieldErrors };
          delete newErrors._form; // Remover erro geral quando validando campos
          return newErrors;
        });
      } else {
        // Limpar apenas erros de campo, manter erro geral se existir
        setFormErrors(oldErrors => {
          const newErrors = { ...oldErrors };
          delete newErrors.email;
          delete newErrors.password;
          return newErrors;
        });
      }
    }
  }, [email, password]);
  
  // Validar campos quando mudarem
  useEffect(() => {
    validateFields();
  }, [email, password, validateFields]);
  
  // Manipuladores de eventos para os campos
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar novamente antes de enviar
    validateFields();
    
    // Se houver erros de campo, não prosseguir
    if (formErrors.email || formErrors.password) {
      return;
    }
    
    setLoading(true)
    
    try {
      await signIn(email, password)
    } catch (err: unknown) {
      setFormErrors({ _form: err instanceof Error ? err.message : 'Erro ao fazer login' })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex justify-center">
          <Image src="/logo.svg" alt="Logo" width={200} height={200} />
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Bem-vindo</h2>
          <p className="text-sm text-gray-600 mt-2">Faça login para acessar sua conta</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          {formErrors._form && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
              {formErrors._form}
            </div>
          )}
          
          <form className="space-y-2" onSubmit={handleSubmit}>
            <FormInput
              label="Email"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={handleEmailChange}
              error={formErrors.email}
            />
            
            <FormInput
              label="Senha"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="********"
              required
              value={password}
              onChange={handlePasswordChange}
              error={formErrors.password}
            />
            
            <div className="text-sm text-right">
              <Link href="/send-reset-password" className="font-medium text-green-600 hover:text-green-500">
                Esqueceu sua senha?
              </Link>
            </div>
            
            <button
              type="submit"
              disabled={loading || Boolean(formErrors.email || formErrors.password)}
              className="w-full py-2 px-4 rounded-md text-white font-medium bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
