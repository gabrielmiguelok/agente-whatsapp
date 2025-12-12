import { NextResponse } from "next/server"
import { getSessionWithDbCheck } from "@/lib/auth"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getSessionWithDbCheck()

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const [rows]: any = await pool.query(
      `SELECT id, email, role, full_name, first_name, last_name, picture, locale, estado, created_at, updated_at, last_login
       FROM users WHERE id = ? LIMIT 1`,
      [session.id]
    )

    if (!rows[0]) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const user = rows[0]

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        picture: user.picture,
        locale: user.locale,
        estado: user.estado || "confirmado",
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login,
      },
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
