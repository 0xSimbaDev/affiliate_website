import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith('/users')

    // Admin-only routes - redirect non-admins to sites page
    if (isAdminRoute && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/sites', req.url))
    }

    // Site-specific routes - check ownership
    const siteMatch = req.nextUrl.pathname.match(/\/sites\/([^/]+)/)
    if (siteMatch && token?.role !== 'ADMIN') {
      const siteId = siteMatch[1]
      const userSites = token?.sites as Array<{ id: string }> | undefined
      if (!userSites?.some((s) => s.id === siteId)) {
        return NextResponse.redirect(new URL('/sites', req.url))
      }
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
  // Exclude static files, uploads, and public routes from auth middleware
  matcher: ['/((?!api|_next/static|_next/image|uploads|favicon.ico|login|forgot-password).*)'],
}
