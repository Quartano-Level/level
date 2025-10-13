
import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Mostrar todas as chaves de ambiente disponíveis para debug
console.log('Chaves de ambiente disponíveis:', Object.keys(process.env))
console.log('NODE_ENV:', process.env.NODE_ENV)

// Capturar as variáveis de ambiente necessárias
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Verificar se as variáveis estão definidas
if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL não está definido')
}

if (!supabaseAnonKey) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY não está definido')
}

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY não está definido')
}

// Cria um cliente Supabase para uso no navegador
export const createBrowserSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis de ambiente do Supabase não estão configuradas corretamente')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Cria um cliente Supabase para uso no servidor com a chave de serviço
export const supabaseAdmin = createSupabaseClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) 