import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API}/authentication/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: data.message || 'Authentication failed' },
        { status: apiResponse.status }
      );
    }

    const res = NextResponse.json({
      id: data.id,
      email: data.email,
      role: data.role,
      token: data.token,
      isFirstTimeLogin: false,
      message: 'Successfully logged in with Google'
    });

    // Set auth cookie securely
    res.cookies.set({
      name: 'token',
      value: data.token,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    // If company profile info is available, set it in a separate cookie
    if (data.companyProfileId) {
      res.cookies.set({
        name: 'company_info',
        value: JSON.stringify({ id: data.companyProfileId }),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60
      });
    }

    return res;
  } catch (error) {
    console.error('Google login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 