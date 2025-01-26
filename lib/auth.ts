import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export function signToken(payload: {
  userId: string
  email: string
  role: "user" | "provider"
}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      role: "user" | "provider"
    }
  } catch {
    return null
  }
}

export function logout() {
  cookies().delete("token")
}
