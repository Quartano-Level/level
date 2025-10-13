'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/shared/lib/supabase'
import type { AuthUser, AuthSession } from '@supabase/supabase-js'

interface AuthContextType {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  getAuthToken: () => string | null
  authorizedFetch: (url: string, options?: RequestInit) => Promise<Response>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    
    // Verificar a sessão atual quando o componente é montado
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (session) {
          setSession(session)
          setUser(session.user)
        }
      } catch (error) {
        console.error('Erro ao carregar a sessão do usuário:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initializeAuth()
    
    // Configurar listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Verifica se o caminho atual é a página de set-password
        const isSetPasswordPage = pathname?.startsWith('/set-password')
        
        if (event === 'SIGNED_IN') {
          // NÃO redirecionar automaticamente se estiver na página de set-password
          if (!isSetPasswordPage) {
            // Comentado para não forçar redirecionamento na autenticação
            // router.push('/notas')
          }
        }
        
        if (event === 'SIGNED_OUT') {
          // Somente redirecionar para a página inicial se não estiver na página de set-password
          if (!isSetPasswordPage) {
            router.push('/')
          }
        }
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])
  
  const signIn = async (email: string, password: string) => {
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    // Redirecionar para a página de notas após login bem-sucedido
    router.push('/notas')
  }
  
  const signOut = async () => {
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) throw error
  }
  
  const getAuthToken = () => {
    console.log('session', session)
    return session?.access_token || null
  }
  
  const authorizedFetch = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken()
    
    const headers = {
      ...options.headers,
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    }
    
    return fetch(url, {
      ...options,
      headers,
    })
  }
  
  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut,
    getAuthToken,
    authorizedFetch,
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  
  return context
} 