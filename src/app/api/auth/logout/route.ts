import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Delete the token cookie
    response.cookies.set({
      name: 'token',
      value: '',
      expires: new Date(0), // Set expiry to the past
      path: '/',
      secure: true,
      sameSite: 'lax',
      httpOnly: true
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
} 