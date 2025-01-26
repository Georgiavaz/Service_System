import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Review from "@/models/Review"
import { verifyToken } from "@/lib/auth"
import { ApiError, handleApiError } from "@/lib/api-error"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      throw new ApiError(401, "Unauthorized")
    }

    const decoded = await verifyToken(token)
    await dbConnect()

    const reviews = await Review.find({ provider: decoded.userId })
      .populate("user", "name profilePhoto")
      .sort({ createdAt: -1 })

    return NextResponse.json(reviews)
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

