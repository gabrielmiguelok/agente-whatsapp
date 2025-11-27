import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { authenticate, createSession, createUser, findUserByEmail } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // ✅ 1) Soporte de admin por defecto desde .env
    const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL
    const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD

    if (
      DEFAULT_ADMIN_EMAIL &&
      DEFAULT_ADMIN_PASSWORD &&
      email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() &&
      password === DEFAULT_ADMIN_PASSWORD
    ) {
      let user = await findUserByEmail(email)

      if (!user) {
        // Crear admin por defecto si no existe
        const hash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12)
        await createUser({
          email,
          firstName: "Default",
          lastName: "Admin",
          fullName: "Default Admin",
          passwordHash: hash,
          role: "admin",
          picture: null,
        })
        user = await findUserByEmail(email)
        if (!user) {
          return NextResponse.json({ error: "No se pudo crear el usuario admin por defecto" }, { status: 500 })
        }
      } else if (user.role !== "admin") {
        // Asegurar rol admin
        await db.query("UPDATE users SET role = 'admin' WHERE id = ?", [user.id])
        user = await findUserByEmail(email)
      }

      await createSession(user)
      const name = user.full_name || [user.first_name, user.last_name].filter(Boolean).join(" ") || null

      return NextResponse.json({
        message: "Login exitoso (admin por defecto)",
        user: { id: user.id, email: user.email, role: user.role, name },
      })
    }

    // 🔐 2) Login normal contra DB
    const user = await authenticate(email, password)
    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    await createSession(user)

    const displayName =
      user.full_name ||
      [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      null

    return NextResponse.json({
      message: "Login exitoso",
      user: { id: user.id, email: user.email, role: user.role, name: displayName },
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
