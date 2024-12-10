import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJWT } from "./lib/utils";

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (token) {
    const decoded = decodeJWT(token);
    
    // If company admin and profile not filled, redirect to profile form
    if (decoded?.role === 'CompanyAdmin' && !decoded?.isProfileFilled) {
      if (req.nextUrl.pathname !== '/company-profile') {
        return NextResponse.redirect(new URL('/company-profile', req.url));
      }
    }

    // If profile is filled, they can access their dashboard
    if (decoded?.role === 'CompanyAdmin' && decoded?.isProfileFilled && decoded?.companyId) {
      if (req.nextUrl.pathname === '/company-profile') {
        return NextResponse.redirect(new URL(`/${decoded.companyId}/dashboard`, req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};