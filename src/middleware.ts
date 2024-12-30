import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJWT } from "./lib/utils";

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // Allow access to unauthorized page
  if (pathname === '/unauthorized') {
    return NextResponse.next();
  }

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

  // ICOG_ADMIN route restrictions
  if (decoded.role === 'ROLE_ICOG_ADMIN') {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Prevent access to company-specific routes (routes with IDs)
    if (pathname.match(/\/[a-zA-Z0-9-]+\/[a-zA-Z-]+$/)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    return NextResponse.next();
  }

  // COMPANY_ADMIN route restrictions
  if (decoded.role === 'ROLE_COMPANY_ADMIN') {
    // If at root with valid token
    if (pathname === '/') {
      if (!decoded.isProfileFilled) {
        return NextResponse.redirect(new URL('/company-profile', req.url));
      }
      return NextResponse.redirect(new URL(`/${decoded.companyProfileId}/dashboard`, req.url));
    }

    // Allow access to company profile page if profile not filled
    if (!decoded.isProfileFilled && pathname !== '/company-profile') {
      return NextResponse.redirect(new URL('/company-profile', req.url));
    }

    // Prevent access to non-company routes
    const isCompanyRoute = pathname.startsWith(`/${decoded.companyProfileId}/`);
    const isCompanyProfileRoute = pathname === '/company-profile';
    
    if (!isCompanyRoute && !isCompanyProfileRoute) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next/.*|public/|unauthorized|settings).*)'
  ],
};