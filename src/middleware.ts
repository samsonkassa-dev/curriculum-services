import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJWT } from "./lib/utils";

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // If no token, redirect to root for login
  if (!token) {
    return pathname === '/' 
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/', req.url));
  }

  const decoded = decodeJWT(token);
  
  if (!decoded) {
    // Invalid token, redirect to root
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Check for ICOG_ADMIN first
  if (decoded.role === 'ROLE_ICOG_ADMIN') {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Prevent access to company-admin routes
    if (pathname.startsWith('/(company-admin)')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // If at root with valid token, redirect based on user status
  if (pathname === '/') {
    if (decoded.role === 'ROLE_COMPANY_ADMIN') {
      if (!decoded.isProfileFilled) {
        return NextResponse.redirect(new URL('/company-profile', req.url));
      }
      return NextResponse.redirect(new URL(`/${decoded.companyProfileId}/dashboard`, req.url));
    }
  }

  // Company admin specific redirects
  if (decoded.role === 'ROLE_COMPANY_ADMIN') {
    if (!decoded.isProfileFilled && pathname !== '/company-profile') {
      return NextResponse.redirect(new URL('/company-profile', req.url));
    }
    if (decoded.isProfileFilled && pathname === '/company-profile') {
      return NextResponse.redirect(new URL(`/${decoded.companyProfileId}/dashboard`, req.url));
    }
  }

  return NextResponse.next();
}



export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next/.*|public/).*)'
  ],
};