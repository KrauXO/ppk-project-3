import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that are public
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isApiAuth = pathname.startsWith('/api/auth');
  const isStatic =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.includes('.') || // static files like favicon.ico, images
    pathname === '/favicon.ico';

  if (isStatic || isApiAuth) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = sessionCookie ? await verifySessionToken(sessionCookie) : null;
  const isAuthenticated = !!user;

  // If trying to access login/register while already authenticated -> redirect to dashboard
  if (isAuthPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protected route (e.g. root '/' / dashboard): If not authenticated -> redirect to /login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

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
};
