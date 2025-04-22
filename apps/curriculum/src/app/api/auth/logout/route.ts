import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create base response
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear all auth-related cookies
    const cookieNames = ['token', 'company_info'];
    
    for (const name of cookieNames) {
      // Clear cookies in response
      response.cookies.set({
        name,
        value: '',
        path: '/',
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 