import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET!

export interface TokenPayload {
  userId: string
  email: string
  role: "user" | "provider"
}

export const signToken = (payload: TokenPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

export const verifyToken = async (token: string): Promise<TokenPayload> => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export const setAuthCookie = (token: string) => {
  cookies().set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

export const removeAuthCookie = () => {
  cookies().delete("token")
}

export const getCurrentUser = async () => {
  const token = cookies().get("token")?.value
  if (!token) return null

  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

