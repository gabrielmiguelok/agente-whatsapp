import { NextResponse } from "next/server"
import { getSessionWithDbCheck } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSessionWithDbCheck()
  if (session) {
    return NextResponse.json({ authenticated: true, user: session })
  } else {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
