import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login`, {
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
      ...data,
      message: data.message || 'Successfully logged in'
    });

    // Set cookie in the response headers
    res.cookies.set({
      name: 'token',
      value: data.token,
      path: '/',
      secure: true,
      sameSite: 'lax',
      httpOnly: true
    });

    return res;
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error },


    );
  }
} 