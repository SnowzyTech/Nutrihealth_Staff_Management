import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/features', '/pricing', '/about', '/contact', '/auth/login', '/auth/forgot-password', '/auth/change-password', '/api'];

  // Check if route is public
  const isPublic = publicRoutes.some(route => pathname === route || (route !== '/' && pathname.startsWith(route)));

  if (isPublic) {
    return NextResponse.next();
  }

  // Find Supabase auth token from cookies
  // Supabase stores auth in cookies with format: sb-<project-ref>-auth-token
  const cookies = request.cookies.getAll();
  const supabaseAuthCookie = cookies.find(c => 
    c.name.includes('sb-') && c.name.includes('-auth-token')
  );
  
  // If no auth cookie found, redirect to login
  if (!supabaseAuthCookie && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // For protected routes with auth cookie, let the page handle role verification
  // This avoids the RLS recursion issue in middleware
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
