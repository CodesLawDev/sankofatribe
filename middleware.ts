import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page and auth APIs (including password reset)
  if (
    pathname === '/admin/login' ||
    pathname === '/admin/reset-password' ||
    pathname.startsWith('/api/auth/') ||
    pathname === '/api/admin/auth/login' ||
    pathname === '/api/admin/auth/forgot-password' ||
    pathname === '/api/admin/auth/reset-password' ||
    pathname === '/api/admin/auth/validate-reset-token' ||
    pathname === '/api/admin/users/init'
  ) {
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('admin-token');

    if (!token) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await jwtVerify(token.value, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
