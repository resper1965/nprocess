/**
 * Next.js Middleware for Route Protection
 * 
 * Note: Firebase Auth verification cannot happen in Edge Runtime.
 * This middleware provides basic route structure.
 * Actual auth checks are done in AuthProvider (client-side).
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require any authentication
const PUBLIC_ROUTES = ['/login', '/waiting-room'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // For all other routes, let the AuthProvider handle redirects
  // (Firebase token verification requires client-side code)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
