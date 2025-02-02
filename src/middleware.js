import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/register';

  // Get the token and validate session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect logic for public paths
  if (isPublicPath) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (path.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if user has admin role
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect API routes
  if (path.startsWith('/api/admin')) {
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'authentication required' }),
        { status: 401 }
      );
    }

    if (token.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'unauthorized' }),
        { status: 403 }
      );
    }
  }

  // Allow the request to continue
  return NextResponse.next();
}
