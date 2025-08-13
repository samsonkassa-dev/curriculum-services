/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function buildLoginRedirect(req: NextRequest) {
  const url = req.nextUrl.clone()
  const redirect = encodeURIComponent(url.pathname + (url.search || ''))
  url.pathname = '/login'
  url.search = `?redirect=${redirect}`
  return NextResponse.redirect(url)
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  const isAnswersRoute = /^\/survey\/answers\/[\w-]+\/[\w-]+$/.test(pathname)
  const isPmRoute = /^\/pm\/[\w-]+\/[\w-]+$/.test(pathname)

  if (!isAnswersRoute && !isPmRoute) return NextResponse.next()

  // Only gate by presence of token at the edge to avoid decode issues in middleware
  if (!token) return buildLoginRedirect(req)

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/survey/answers/:path*',
    '/pm/:path*',
  ],
}


