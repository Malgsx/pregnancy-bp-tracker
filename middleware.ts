import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Define which routes require authentication
        const protectedPaths = [
          '/dashboard',
          '/profile',
          '/readings',
          '/export',
          '/settings'
        ]
        
        const isProtectedPath = protectedPaths.some(path => 
          req.nextUrl.pathname.startsWith(path)
        )
        
        // Allow access if not a protected path or if user has valid token
        return !isProtectedPath || !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/readings/:path*',
    '/export/:path*',
    '/settings/:path*'
  ]
}