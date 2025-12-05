import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import pool from "./db"
import type { RowDataPacket } from "mysql2"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "agentewhatsapp-secret-key-2024")
const COOKIE_NAME = "auth_token"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export interface User {
  id: number
  email: string
  password_hash: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  role: "user" | "admin"
  picture: string | null
  created_at: Date
  updated_at: Date
}

export interface SessionUser {
  id: number
  email: string
  role: "user" | "admin"
  name: string | null
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email.toLowerCase()]
  )
  return (rows[0] as User) || null
}

export async function createUser(data: {
  email: string
  passwordHash: string
  firstName?: string
  lastName?: string
  fullName?: string
  name?: string
  role?: "user" | "admin"
  picture?: string | null
  googleId?: string | null
}): Promise<number> {
  const firstName = data.firstName || ""
  const lastName = data.lastName || ""
  const fullName = data.fullName || data.name || `${firstName} ${lastName}`.trim()

  const [result] = await pool.execute(
    `INSERT INTO users (email, password_hash, first_name, last_name, full_name, role, picture)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.email.toLowerCase(),
      data.passwordHash,
      firstName,
      lastName,
      fullName,
      data.role || "user",
      data.picture || null,
    ]
  )
  return (result as any).insertId
}

export async function authenticate(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email)
  if (!user) return null

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return null

  return user
}

export async function createSession(user: User): Promise<void> {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)

    return {
      id: payload.id as number,
      email: payload.email as string,
      role: payload.role as "user" | "admin",
      name: (payload.name as string) || null,
    }
  } catch {
    return null
  }
}

export async function getSessionWithDbCheck(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.id as number

    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, email, role, full_name, first_name, last_name FROM users WHERE id = ? LIMIT 1",
      [userId]
    )

    if (!rows[0]) return null

    const user = rows[0] as User

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || null,
    }
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function verifySession(): Promise<SessionUser | null> {
  return getSession()
}
