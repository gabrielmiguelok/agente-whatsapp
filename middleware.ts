import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const COOKIE_NAME = "auth_token"
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "agentewhatsapp-jwt-secret-2024-secure"
)

const PUBLIC_PATHS = ["/", "/login", "/api/auth", "/no-autorizado"]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isStaticAsset(pathname) || isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token || token.trim() === "") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      )
    }
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    if (!payload.id || !payload.email) {
      throw new Error("Token inválido")
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", String(payload.id))
    requestHeaders.set("x-user-email", String(payload.email))
    requestHeaders.set("x-user-role", String(payload.role || "user"))

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Token inválido o expirado" },
        { status: 401 }
      )
    }
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete(COOKIE_NAME)
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
