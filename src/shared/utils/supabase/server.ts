import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Variáveis de ambiente do Supabase não estão definidas')
  }
  
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        async getAll() {
          const allCookies = (await cookieStore).getAll()
          return allCookies.map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        async setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              (await cookieStore).set({
                name,
                value,
                ...options,
              })
            }
          } catch {
            // Ignorar erro quando tentamos definir cookies em um context somente de leitura
          }
        },
      },
    }
  )
} 