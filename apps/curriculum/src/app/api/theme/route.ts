/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { primaryColor } = await request.json()

    // Save to your database
    // await prisma.theme.update({
    //   where: { id: 'default' },
    //   data: { primaryColor }
    // })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    )
  }
} 