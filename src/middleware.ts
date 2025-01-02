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
    // Get company info from cookies for newly created profiles
    const companyInfo = req.cookies.get('company_info')?.value;
    const companyData = companyInfo ? JSON.parse(companyInfo) : null;

    // If at root with valid token
    if (pathname === '/') {
      // Check both token and cookie for company profile info
      const hasProfile = decoded.isProfileFilled || companyData?.id;
      const profileId = decoded.companyProfileId || companyData?.id;

      if (hasProfile && profileId) {
        return NextResponse.redirect(new URL(`/${profileId}/dashboard`, req.url));
      }
      return NextResponse.redirect(new URL('/company-profile', req.url));
    }

    // Allow access to company profile page only if profile isn't filled
    if (pathname === '/company-profile' && !decoded.isProfileFilled && !companyData?.id) {
      return NextResponse.next();
    }

    // Check if trying to access company routes
    const profileId = decoded.companyProfileId || companyData?.id;
    const isCompanyRoute = profileId && pathname.startsWith(`/${profileId}/`);
    
    if (!isCompanyRoute) {
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