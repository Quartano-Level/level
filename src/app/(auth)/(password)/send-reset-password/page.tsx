'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSendResetPassword } from '@/features/auth/hooks/useSendResetPassword'
import { FormInput } from '@/shared/components/ui/form-input'

export default function ResetPasswordPage() {
  const { 
    email, 
    handleEmailChange, 
    loading, 
    message, 
    formErrors,
    handleSendResetPasswordEmail 
  } = useSendResetPassword()
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex justify-center">
          <Image src="/logo.svg" alt="Logo" width={200} height={200} />
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Recuperar senha</h2>
          <p className="text-sm text-gray-600 mt-2">
            Enviaremos um link para redefinir sua senha
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <form className="space-y-2" onSubmit={handleSendResetPasswordEmail}>
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
              error={formErrors?.email}
            />
            
            {message && (
              <div className={`text-sm ${message.includes('Erro') ? 'text-red-500' : 'text-green-500'}`}>
                {message}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || Boolean(formErrors.email)}
              className="w-full py-2 px-4 rounded-md text-white font-medium bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar link'}
            </button>
            
            <div className="text-center">
              <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Voltar para login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 