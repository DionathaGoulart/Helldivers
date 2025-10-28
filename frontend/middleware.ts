import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas (sem autenticação necessária)
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Se for rota raiz, permitir (já redireciona no componente)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Se for rota pública, permitir
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Para outras rotas, o AuthContext cuida da autenticação
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

