import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Keep fallback consistent with auth-utils to avoid token verification mismatches
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);
const SESSION_MAX_AGE = 5 * 60; // 5 minutes of inactivity

function refreshSessionCookie(token: string) {
  const response = NextResponse.next();
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page and auth APIs (including password reset)
  if (
    pathname === '/admin/login' ||
    pathname === '/admin/reset-password' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/api/auth/') ||
    pathname === '/api/admin/auth/login' ||
    pathname === '/api/admin/auth/forgot-password' ||
    pathname === '/api/admin/auth/reset-password' ||
    pathname === '/api/admin/auth/validate-reset-token' ||
    pathname === '/api/admin/users/init'
  ) {
    return NextResponse.next();
  }

  // Protect customer routes
  if (pathname.startsWith('/account') || pathname.startsWith('/api/customer')) {
    const token = request.cookies.get('auth-token');

    if (!token) {
      if (pathname.startsWith('/api/customer')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token.value, JWT_SECRET);

      if (payload.role !== 'CUSTOMER') {
        if (pathname.startsWith('/api/customer')) {
          return NextResponse.json(
            { error: 'Customer access required' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      return refreshSessionCookie(token.value);
    } catch (error) {
      if (pathname.startsWith('/api/customer')) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('auth-token');

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
      const { payload } = await jwtVerify(token.value, JWT_SECRET);

      if (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
        if (pathname.startsWith('/api/admin')) {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/account', request.url));
      }

      return refreshSessionCookie(token.value);
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
  matcher: ['/admin/:path*', '/api/admin/:path*', '/account/:path*', '/api/customer/:path*'],
};

