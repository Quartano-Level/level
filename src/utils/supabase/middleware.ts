

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Cria uma resposta vazia que será modificada posteriormente
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Variáveis de ambiente do Supabase não estão definidas')
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          cookiesToSet.forEach(({ name, value, options }) => 
            response.cookies.set({
              name,
              value,
              ...options,
            })
          )
        },
      },
    }
  )

  // IMPORTANTE: Evite escrever qualquer lógica entre createServerClient e
  // supabase.auth.getUser(). Um simples erro pode tornar muito difícil depurar
  // problemas com usuários sendo desconectados aleatoriamente.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Verificar a rota atual - apenas o caminho base, ignorando parâmetros e fragmentos
  const path = request.nextUrl.pathname
  console.log('Middleware - Path acessado:', path)
  
  // Definir rotas protegidas específicas que exigem autenticação
  const rotasProtegidas = ['/notas', '/historico', '/configuracoes']
  const isRotaProtegida = rotasProtegidas.some(rota => path.startsWith(rota))
  
  // Se o usuário não está autenticado e está tentando acessar uma rota protegida específica
  if (!user && isRotaProtegida) {
    console.log('Redirecionando para a página inicial - Usuário não autenticado tentando acessar rota protegida')
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
} 