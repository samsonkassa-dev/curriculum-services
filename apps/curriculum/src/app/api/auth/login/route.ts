import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('API route: Login request for email:', body.email);
    
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('API route: Login error:', data.message || 'Authentication failed');
      return NextResponse.json(
        { error: data.message || 'Authentication failed' },
        { status: apiResponse.status }
      );
    }

    console.log('API route: Login successful for:', body.email, 'Role:', data.role);

    const res = NextResponse.json({
      ...data,
      message: data.message || 'Successfully logged in'
    });

    // Set cookie in the response headers with secure settings
    const expiration = 24 * 60 * 60; // 24 hours in seconds
    console.log('API route: Setting token cookie for', expiration, 'seconds');
    
    res.cookies.set({
      name: 'token',
      value: data.token,
      path: '/',
      // Use secure in production, but allow non-secure in development
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false, // Important! Setting to false to allow JS access for debugging
      maxAge: expiration
    });

    // Set separate cookie for role to troubleshoot
    res.cookies.set({
      name: 'user_role',
      value: data.role,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false,
      maxAge: expiration
    });

    console.log('API route: Cookies set in response');
    return res;
  } catch (error) {
    console.error('API route: Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
} 