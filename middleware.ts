import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "crm-onia-secret-key-2024")
const COOKIE_NAME = "auth_token"

const PUBLIC_PATHS = ["/login", "/api/auth"]
const USER_ALLOWED_PATHS = ["/no-autorizado", "/api/auth"]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

function isUserAllowedPath(pathname: string): boolean {
  return USER_ALLOWED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
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

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const role = payload.role as string

    if (role !== "admin") {
      if (isUserAllowedPath(pathname)) {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL("/no-autorizado", request.url))
    }

    if (pathname === "/no-autorizado" && role === "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  } catch {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete(COOKIE_NAME)
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
