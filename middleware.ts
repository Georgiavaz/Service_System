import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Redirect authenticated users from login/register pages
  if (token && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
  ]
}
