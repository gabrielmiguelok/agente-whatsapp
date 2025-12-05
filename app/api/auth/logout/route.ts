import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import pool from "@/lib/db"

const COOKIE_NAME = "agentewhatsappAuth"
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "localhost"

async function findUserByJwd(jwd: string) {
  try {
    const [rows]: any = await pool.query(
      `SELECT id FROM users WHERE jwd = ?`,
      [jwd]
    )
    return rows[0] || null
  } catch (error) {
    console.error("[logout] Error finding user:", error)
    return null
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies()
    const jwd = cookieStore.get(COOKIE_NAME)?.value

    if (jwd) {
      const user = await findUserByJwd(jwd)
      if (user?.id) {
        await pool.query("UPDATE users SET jwd = '' WHERE id = ?", [user.id])
      }
    }

    const response = NextResponse.json({ success: true, message: "Sesion cerrada" })

    response.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: COOKIE_DOMAIN,
      maxAge: 0,
      expires: new Date(0),
    })

    return response
  } catch (error) {
    console.error("Error al cerrar sesion:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
