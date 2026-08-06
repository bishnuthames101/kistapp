import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { apiLimiter, getRateLimitHeaders } from '@/lib/ratelimit';

// Routes that run their own, stricter limiter and must not be double-counted,
// plus the health probe which uptime monitors poll frequently.
const RATE_LIMIT_EXEMPT = ['/api/auth', '/api/health'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the NextAuth session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token',
  });

  // Blanket rate limit for the API surface. Authenticated callers are bucketed
  // per user so that many patients behind one clinic NAT don't starve each other.
  if (
    pathname.startsWith('/api') &&
    !RATE_LIMIT_EXEMPT.some((prefix) => pathname.startsWith(prefix))
  ) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous';
    const identifier = token?.id ? `user:${token.id}` : `ip:${ip}`;

    // Fail open: this limiter now gates the entire API surface, so an Upstash
    // outage or a missing credential must not take booking and ordering down
    // with it. A dropped limit is far cheaper than a dead clinic API.
    try {
      const { success, limit, reset, remaining } = await apiLimiter.limit(identifier);
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests. Please slow down.' },
          { status: 429, headers: getRateLimitHeaders(limit, remaining, reset) }
        );
      }
    } catch (err) {
      console.error('Rate limiter unavailable, allowing request through:', err);
    }
  }

  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      // Not logged in, redirect to admin login
      const loginUrl = new URL('/admin-login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== 'admin') {
      // Logged in but not an admin, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Check if accessing patient dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      // Not logged in, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/:path*',
  ],
};
