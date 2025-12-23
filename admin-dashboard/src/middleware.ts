import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Custom middleware logic here
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Redirect to login if not authenticated
    if (!token && path !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Redirect to overview if already authenticated and trying to access login
    if (token && path === "/login") {
      return NextResponse.redirect(new URL("/overview", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
