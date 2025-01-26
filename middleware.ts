import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const publicPaths = ["/login", "/register", "/"]
  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = request.cookies.get("token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const decoded = await verifyToken(token)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("user", JSON.stringify(decoded))

    if (request.nextUrl.pathname.startsWith("/dashboard/provider") && decoded.role !== "provider") {
      return NextResponse.redirect(new URL("/dashboard/user", request.url))
    }

    if (request.nextUrl.pathname.startsWith("/dashboard/user") && decoded.role !== "user") {
      return NextResponse.redirect(new URL("/dashboard/provider", request.url))
    }

    return NextResponse.next({
      headers: requestHeaders,
    })
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}

