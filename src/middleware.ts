
import { type NextRequest } from 'next/server'
import { updateSession } from '@/shared/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Matcher simplificado para evitar erros com grupos de captura
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 