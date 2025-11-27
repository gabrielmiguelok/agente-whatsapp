import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import type { RowDataPacket, ResultSetHeader } from "mysql2"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT id, email, first_name, last_name, full_name, role, picture, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `)
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    return NextResponse.json({ success: false, error: "Error del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, field, value } = await request.json()

    if (!id || !field) {
      return NextResponse.json({ success: false, error: "ID y campo requeridos" }, { status: 400 })
    }

    const allowedFields = ["first_name", "last_name", "full_name", "role", "email"]
    if (!allowedFields.includes(field)) {
      return NextResponse.json({ success: false, error: "Campo no permitido" }, { status: 400 })
    }

    if (field === "role" && !["user", "admin"].includes(value)) {
      return NextResponse.json({ success: false, error: "Rol inválido" }, { status: 400 })
    }

    await pool.execute(`UPDATE users SET ${field} = ? WHERE id = ?`, [value, id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando usuario:", error)
    return NextResponse.json({ success: false, error: "Error del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, first_name, last_name, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email y contraseña requeridos" }, { status: 400 })
    }

    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase()]
    )
    if ((existing as RowDataPacket[]).length > 0) {
      return NextResponse.json({ success: false, error: "El email ya existe" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const fullName = `${first_name || ""} ${last_name || ""}`.trim()

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO users (email, password_hash, first_name, last_name, full_name, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email.toLowerCase(), passwordHash, first_name || "", last_name || "", fullName, role || "user"]
    )

    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error("Error creando usuario:", error)
    return NextResponse.json({ success: false, error: "Error del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 })
    }

    await pool.execute("DELETE FROM users WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando usuario:", error)
    return NextResponse.json({ success: false, error: "Error del servidor" }, { status: 500 })
  }
}
