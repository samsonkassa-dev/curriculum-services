import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Create base response
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear the cookie multiple ways to ensure it's removed
  const cookieOptions = {
    name: 'token',
    value: '',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
    secure: true,
    sameSite: 'lax' as const,
    httpOnly: true
  };

  // Set cookie in response
  response.cookies.set(cookieOptions);
  
  // Also try to clear it from cookies API
  (await
    // Also try to clear it from cookies API
    cookies()).set(cookieOptions);

  return response;
} 