import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/staff');

  if (isLoggedIn && isAuthPage) {
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', req.url));
    if (role === 'SMM') return NextResponse.redirect(new URL('/staff', req.url));
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (!isLoggedIn && isProtected) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};