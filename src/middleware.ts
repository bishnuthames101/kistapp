import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the NextAuth session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

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
  ],
};
