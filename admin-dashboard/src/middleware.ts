import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const url = req.nextUrl.clone()

    // Allow access to login page without auth
    if (path === "/login") {
      if (token) {
        // Already authenticated, redirect to overview
        url.pathname = "/overview"
        return NextResponse.redirect(url)
      }
      return NextResponse.next()
    }

    // Allow access to API routes
    if (path.startsWith("/api/")) {
      return NextResponse.next()
    }

    // Redirect to login if not authenticated (with proper callbackUrl)
    if (!token) {
      url.pathname = "/login"
      url.searchParams.set("callbackUrl", path)
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow login page without auth
        if (req.nextUrl.pathname === "/login") {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes - handled by NextAuth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
