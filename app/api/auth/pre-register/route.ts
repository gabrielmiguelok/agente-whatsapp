import { NextResponse, type NextRequest } from "next/server"
import pool from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, error: "Email requerido" }, { status: 400 })
    }

    const emailLower = email.trim().toLowerCase()

    const [existingUsers]: any = await pool.query(
      `SELECT id, google_id FROM users WHERE email = ? LIMIT 1`,
      [emailLower]
    )

    if (existingUsers.length > 0) {
      return NextResponse.json({
        success: false,
        alreadyRegistered: true,
        error: "Este email ya esta registrado"
      })
    }

    return NextResponse.json({
      success: true,
      message: "Email disponible para registro"
    })
  } catch (error) {
    console.error("[pre-register] Error:", error)
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
  }
}
