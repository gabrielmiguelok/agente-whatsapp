// app/api/auth/register/route.ts
import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createUser, findUserByEmail } from "@/lib/db"
import { createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    // Validaciones básicas
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    // Duplicados
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "Ya existe una cuenta con este email" }, { status: 409 })
    }

    // Hash y creación
    const passwordHash = await bcrypt.hash(password, 12)
    const name = `${firstName} ${lastName}`.trim()
    const userId = await createUser({ email, name, passwordHash, role: "user", picture: null as any })

    // Obtener usuario recién creado y crear sesión coherente (cookie: auth_token_econatural)
    const newUser = await findUserByEmail(email)
    if (!newUser) {
      return NextResponse.json({ error: "Error al cargar usuario recién creado" }, { status: 500 })
    }
    await createSession(newUser)

    return NextResponse.json({
      success: true,
      message: "Cuenta creada exitosamente",
      user: { id: userId, email, name, role: "user" },
    })
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
