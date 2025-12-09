import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import pool from "@/lib/db"

export const dynamic = "force-dynamic"

const COOKIE_NAME = "agentewhatsappAuth"
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "agentewhatsapp-jwt-secret-2024-secure"
)

async function findUserById(id: number) {
  try {
    const [rows]: any = await pool.query(
      `SELECT id, email, google_id, first_name, last_name, full_name, picture, locale, role, estado, created_at, updated_at, last_login
       FROM users WHERE id = ?`,
      [id]
    )
    return rows[0] || null
  } catch (error) {
    console.error("[verify] Error finding user by id:", error)
    return null
  }
}

async function findUserByJwd(jwd: string) {
  try {
    const [rows]: any = await pool.query(
      `SELECT id, email, google_id, first_name, last_name, full_name, picture, locale, role, estado, created_at, updated_at, last_login
       FROM users WHERE jwd = ?`,
      [jwd]
    )
    return rows[0] || null
  } catch (error) {
    console.error("[verify] Error finding user by jwd:", error)
    return null
  }
}

async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  })
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (!token || token.trim() === "") {
      return NextResponse.json(
        {
          authenticated: false,
          error: "No session cookie",
          action: "none",
        },
        { status: 401 },
      )
    }

    let user = null

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)

      if (payload.id && payload.email) {
        user = await findUserById(payload.id as number)

        if (!user) {
          user = {
            id: payload.id,
            email: payload.email,
            role: payload.role || "user",
            full_name: payload.name || null,
            first_name: null,
            last_name: null,
            google_id: null,
            picture: null,
            locale: null,
            estado: "confirmado",
            created_at: null,
            updated_at: null,
            last_login: null,
          }
        }
      }
    } catch {
      user = await findUserByJwd(token)
    }

    if (!user) {
      console.log("[verify] Invalid token detected, clearing cookie")
      await clearSessionCookie()

      return NextResponse.json(
        {
          authenticated: false,
          error: "Invalid session token",
          action: "cookie_cleared",
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        googleId: user.google_id,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name,
        picture: user.picture,
        locale: user.locale,
        role: user.role,
        estado: user.estado || "confirmado",
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login,
      },
    })
  } catch (error) {
    console.error("[verify] Verification error:", error)
    await clearSessionCookie()

    return NextResponse.json(
      {
        authenticated: false,
        error: "Verification failed",
        action: "cookie_cleared",
      },
      { status: 401 },
    )
  }
}
