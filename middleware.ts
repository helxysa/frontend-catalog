import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Pega o cookie de autenticação
  const authSession = request.cookies.get('auth_session')
  
  // Pega o caminho atual
  const { pathname } = request.nextUrl

  // Se estiver na página de login e tiver autenticação, redireciona para /proprietario
  if (pathname === '/login' && authSession) {
    return NextResponse.redirect(new URL('/proprietario', request.url))
  }

  // Se não estiver na página de login e não tiver autenticação, redireciona para /login
  if (pathname !== '/login' && !authSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Configurar em quais caminhos o middleware será executado
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (pasta de imagens públicas)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}