// =============================================================================
// FILE: /app/api/auth/verify/route.ts
// =============================================================================
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  if (session) {
    return NextResponse.json({ authenticated: true, user: session })
  } else {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
