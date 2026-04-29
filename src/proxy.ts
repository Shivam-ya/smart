import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const protectedRoutes = ['/dashboard', '/api/classes', '/api/students', '/api/attendance', '/api/reports', '/api/leave', '/api/analytics'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return handleUnauthorized(req);
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return handleUnauthorized(req);
    }

    // Role-based protection: /dashboard/admin is only for ADMIN
    if (pathname.startsWith('/dashboard/admin') && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/student', req.url));
    }

    // Role-based protection: /dashboard/student is only for STUDENT
    if (pathname.startsWith('/dashboard/student') && payload.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/dashboard/admin', req.url));
    }
    
    // Add user info to headers so API routes can access it if needed (though it's better to fetch from token in API)
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-role', payload.role as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

function handleUnauthorized(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/login', req.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
