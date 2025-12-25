import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const url = request.nextUrl.clone()

  // Allow access to login page without auth
  if (path === "/login") {
    return NextResponse.next()
  }

  // Allow access to static files
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/static/") ||
    path.includes(".")
  ) {
    return NextResponse.next()
  }

  // For other routes, check authentication client-side
  // (Firebase Hosting static export doesn't support server-side middleware)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
