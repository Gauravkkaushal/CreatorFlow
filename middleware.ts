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
  const token =
    req.cookies.get('authjs.session-token') ||
    req.cookies.get('__Secure-authjs.session-token') ||
    req.cookies.get('next-auth.session-token')

  const isDemoMode = process.env.DEMO_MODE === 'true'

  if (token) {
    return NextResponse.next()
  }

  // Allow unauthenticated preview of workspace UI pages and demo-enabled script generation in demo mode,
  // while keeping other API routes protected
  if (
    isDemoMode &&
    (!pathname.startsWith('/api') || pathname === '/api/ai/generate-script')
  ) {
    return NextResponse.next()
  }

  // Reject unauthenticated API requests with 401 JSON instead of redirecting to HTML page
  if (pathname.startsWith('/api')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // Protect live dashboard routes
  const signInUrl = new URL('/auth/signin', req.url)
  signInUrl.searchParams.set('callbackUrl', pathname)
  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
