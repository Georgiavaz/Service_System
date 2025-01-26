import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Provider from "@/models/Provider"
import bcrypt from "bcryptjs"
import { ApiError, handleApiError } from "@/lib/api-error"
import { signToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { email, password, role } = body

    if (!email || !password || !role) {
      throw new ApiError(400, "Missing required fields", {
        fields: ["email", "password", "role"].filter((field) => !body[field]),
      })
    }

    let user = null
    if (role === "provider") {
      user = await Provider.findOne({ email })
    } else {
      user = await User.findOne({ email })
    }

    if (!user) {
      throw new ApiError(401, "Invalid credentials")
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw new ApiError(401, "Invalid credentials")
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: role as "user" | "provider",
    })

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

