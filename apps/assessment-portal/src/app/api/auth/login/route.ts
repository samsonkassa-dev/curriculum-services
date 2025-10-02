import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await apiResponse.json()

    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: data.message || 'Authentication failed' },
        { status: apiResponse.status }
      )
    }

    const res = NextResponse.json({
      ...data,
      message: data.message || 'Successfully logged in',
    })

    // Token cookie for client-side checks
    const expiration = 24 * 60 * 60 // 24 hours in seconds
    res.cookies.set({
      name: 'token',
      value: data.token,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false,
      maxAge: expiration,
    })

    if (data.role) {
      res.cookies.set({
        name: 'user_role',
        value: data.role,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: false,
        maxAge: expiration,
      })
    }

    return res
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    )
  }
}


