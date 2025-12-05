import { NextResponse, type NextRequest } from "next/server"
import { google } from "googleapis"
import crypto from "crypto"
import pool from "@/lib/db"

const TOKEN_BYTES = Number(process.env.AUTH_JWD_BYTES) || 64
const COOKIE_NAME = "agentewhatsappAuth"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "localhost"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://agentewhatsapp.space"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${BASE_URL}/api/auth/google`,
)

const genJwd = () => crypto.randomBytes(TOKEN_BYTES).toString("hex")

function sanitizeRedirect(url = "/") {
  try {
    if (url.startsWith("/")) return url
    const u = new URL(url, BASE_URL)
    if (u.origin === BASE_URL) return u.pathname + u.search + u.hash
  } catch {}
  return "/"
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: "Use GET para OAuth de Google" }, { status: 405 })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const email = searchParams.get("email")
  const redirect = searchParams.get("redirect")

  const requestedRedirect = redirect || "/crm-whatsapp"
  const redirectUrl = sanitizeRedirect(requestedRedirect)

  if (!code) {
    console.log("[google-auth] OAuth launcher, redirect:", redirectUrl)
    const stateData = JSON.stringify({ redirect: redirectUrl })
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["email", "profile"],
      prompt: "consent",
      state: stateData,
      login_hint: email || undefined,
    })
    return NextResponse.redirect(authUrl)
  }

  let parsedState = { redirect: "/crm-whatsapp" }
  try {
    if (state) {
      parsedState = JSON.parse(state)
    }
  } catch {
    parsedState.redirect = state || "/crm-whatsapp"
  }
  const finalRedirect = sanitizeRedirect(parsedState.redirect)

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const oauthUser = google.oauth2({ auth: oauth2Client, version: "v2" })
    const { data } = await oauthUser.userinfo.get()

    const {
      email: userEmail,
      given_name: firstName = "",
      family_name: lastName = "",
      name: fullName = "",
      picture = "",
      locale = "",
      id: googleId,
    } = data

    if (!userEmail) {
      console.warn("[google-auth] Google did not send email")
      return NextResponse.redirect(`${BASE_URL}/?error=no_email`)
    }

    const newJwd = genJwd()

    let userId: number
    let isNew = false

    try {
      const [existingUsers]: any = await pool.query(
        `SELECT id, google_id FROM users WHERE email = ? LIMIT 1`,
        [userEmail.toLowerCase()]
      )

      if (existingUsers.length > 0) {
        userId = existingUsers[0].id
        await pool.query(
          `UPDATE users SET
            jwd = ?,
            google_id = ?,
            first_name = ?,
            last_name = ?,
            full_name = ?,
            picture = ?,
            locale = ?,
            last_login = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [newJwd, googleId, firstName, lastName, fullName, picture, locale, userId]
        )
        console.log(`[google-auth] Usuario existente actualizado: ${userEmail} (ID: ${userId})`)
      } else {
        const [result]: any = await pool.query(
          `INSERT INTO users
            (email, google_id, first_name, last_name, full_name, picture, locale, jwd, role, estado)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'user', 'confirmado')`,
          [userEmail.toLowerCase(), googleId, firstName, lastName, fullName, picture, locale, newJwd]
        )
        userId = result.insertId
        isNew = true
        console.log(`[google-auth] Nuevo usuario creado: ${userEmail} (ID: ${userId})`)
      }
    } catch (dbInsertError) {
      console.error("[google-auth] Database INSERT/UPDATE failed:", dbInsertError)
      return NextResponse.redirect(`${BASE_URL}/?error=db_save_failed`)
    }

    const eventType = isNew ? "REGISTRO" : "LOGIN"
    console.log(`[google-auth] ${eventType} for ${userEmail}`)

    const response = NextResponse.redirect(new URL(finalRedirect, BASE_URL))
    response.cookies.set({
      name: COOKIE_NAME,
      value: newJwd,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      domain: COOKIE_DOMAIN,
      maxAge: COOKIE_MAX_AGE,
    })

    return response
  } catch (err) {
    console.error("[google-auth] GET Error:", err)
    return NextResponse.redirect(`${BASE_URL}/?error=auth_failed`)
  }
}
