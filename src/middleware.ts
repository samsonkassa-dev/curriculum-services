/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  
  // If token is invalid or expired, clear cookies and redirect to login
  if (!decoded || isTokenExpired(decoded)) {
    const response = NextResponse.redirect(new URL('/', req.url));
    response.cookies.delete('token'); // Clear the token cookie
    response.cookies.delete('company_info'); // Clear any other auth-related cookies
    return response;
  }

  // Define curriculum-related roles
  const curriculumRoles = [
    'ROLE_SUB_CURRICULUM_ADMIN',
    'ROLE_CURRICULUM_ADMIN',
    'ROLE_CONTENT_DEVELOPER'
  ];

  // Handle curriculum-related roles
  if (decoded.role && curriculumRoles.includes(decoded.role)) {
    // If at root, redirect to appropriate dashboard
    if (pathname === '/') {
      const baseRoute = getRoleBaseRoute(decoded.role);
      return NextResponse.redirect(new URL(`/${baseRoute}/dashboard`, req.url));
    }

    // Check if trying to access allowed routes
    const baseRoute = getRoleBaseRoute(decoded.role);
    const allowedPaths = [
      `/${baseRoute}/training`,
      `/${baseRoute}/dashboard`,
      `/${baseRoute}/settings`
    ];

    // Allow access to training routes and their nested routes
    if (pathname.startsWith(`/${baseRoute}/training`)) {
      return NextResponse.next();
    }

    // Check if current path is in allowed paths
    if (allowedPaths.includes(pathname)) {
      return NextResponse.next();
    }

    // Redirect to unauthorized for any other routes
    return NextResponse.redirect(new URL('/unauthorized', req.url));
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
    if (pathname === '/company-profile' && decoded.profileStatus==="REJECTED" || !decoded.isProfileFilled) {
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

// Helper function to check token expiration
function isTokenExpired(decodedToken: any): boolean {
  if (!decodedToken.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000;
  return decodedToken.exp < currentTime;
}

// Helper function to get base route based on role
function getRoleBaseRoute(role: string): string {
  switch (role) {
    case 'ROLE_SUB_CURRICULUM_ADMIN':
      return 'sub-curriculum-admin';
    case 'ROLE_CURRICULUM_ADMIN':
      return 'curriculum-admin';
    case 'ROLE_CONTENT_DEVELOPER':
      return 'content-developer';
    default:
      return 'unauthorized';
  }
}

// Add global axios interceptor to handle 401s
if (typeof window !== 'undefined') {
  const axios = require('axios').default;
  
  axios.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response?.status === 401) {
        // Clear auth data
        localStorage.removeItem('auth_token');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'company_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Redirect to login
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next/.*|public/|unauthorized|settings).*)'
  ],
};