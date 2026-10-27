import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public routes that don't require auth
  const publicRoutes = ['/', '/auth/signin', '/auth/error', '/auth/callback']
  const isPublicRoute =
    publicRoutes.some((route) => pathname === route) ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check auth session token from cookies (Edge-safe, no Node.js/mongodb dependencies)
  // NOTE: In DEMO_MODE the NextAuth strategy is 'jwt', so a valid session cookie is still
  // issued after the demo sign-in. We do NOT skip this check in demo mode — demo users
  // must still hold a valid JWT cookie, which they receive automatically on "Try Demo" login.
  const token =
    req.cookies.get('authjs.session-token') ||
    req.cookies.get('__Secure-authjs.session-token') ||
    req.cookies.get('next-auth.session-token')

  // Protect dashboard and API routes
  if (!token) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
