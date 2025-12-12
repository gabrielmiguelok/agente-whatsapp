import { NextResponse, type NextRequest } from "next/server"
import { google } from "googleapis"
import { findUserByEmail, createUser, createSession } from "@/lib/auth"
import pool from "@/lib/db"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://delegar.space"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${BASE_URL}/api/auth/google`
)

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

  const requestedRedirect = redirect || "/agente-whatsapp"
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

  let parsedState = { redirect: "/agente-whatsapp" }
  try {
    if (state) {
      parsedState = JSON.parse(state)
    }
  } catch {
    parsedState.redirect = state || "/agente-whatsapp"
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

    let user = await findUserByEmail(userEmail)
    let isNew = false

    if (user) {
      await pool.execute(
        `UPDATE users SET
          google_id = ?,
          first_name = ?,
          last_name = ?,
          full_name = ?,
          picture = ?,
          locale = ?,
          last_login = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [googleId, firstName, lastName, fullName, picture, locale, user.id]
      )
      console.log(`[google-auth] Usuario existente actualizado: ${userEmail} (ID: ${user.id})`)

      user = await findUserByEmail(userEmail)
      if (!user) {
        console.error("[google-auth] Failed to reload user after update")
        return NextResponse.redirect(`${BASE_URL}/?error=db_error`)
      }
    } else {
      const userId = await createUser({
        email: userEmail,
        firstName,
        lastName,
        fullName,
        picture,
        googleId,
        locale,
        role: "user",
      })
      isNew = true
      console.log(`[google-auth] Nuevo usuario creado: ${userEmail} (ID: ${userId})`)

      user = await findUserByEmail(userEmail)
      if (!user) {
        console.error("[google-auth] Failed to load newly created user")
        return NextResponse.redirect(`${BASE_URL}/?error=db_error`)
      }
    }

    const eventType = isNew ? "REGISTRO" : "LOGIN"
    console.log(`[google-auth] ${eventType} for ${userEmail}`)

    await createSession(user)

    return NextResponse.redirect(new URL(finalRedirect, BASE_URL))
  } catch (err) {
    console.error("[google-auth] GET Error:", err)
    return NextResponse.redirect(`${BASE_URL}/?error=auth_failed`)
  }
}
