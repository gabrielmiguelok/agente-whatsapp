import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const correctPassword = process.env.APP_PASSWORD;

    if (!correctPassword) {
      console.error('APP_PASSWORD no está configurada en .env.local');
      return NextResponse.json(
        { success: false, error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Contraseña incorrecta' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud' },
      { status: 400 }
    );
  }
}
