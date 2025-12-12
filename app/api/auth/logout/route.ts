import { NextResponse } from "next/server"
import { destroySession } from "@/lib/auth"

export async function POST() {
  try {
    await destroySession()

    return NextResponse.json({ success: true, message: "Sesión cerrada" })
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
