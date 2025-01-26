import { NextResponse } from "next/server"
import { headers } from "next/headers"
import dbConnect from "@/lib/dbConnect"
import Provider from "@/models/Provider"
import { verifyToken } from "@/lib/auth"
import { ApiError, handleApiError } from "@/lib/api-error"

export async function GET(request: Request) {
  try {
    const headersList = headers()
    const token = headersList.get("authorization")?.split(" ")[1]

    if (!token) {
      throw new ApiError(401, "Unauthorized")
    }

    const decoded = await verifyToken(token)
    await dbConnect()

    const provider = await Provider.findById(decoded.userId).select("-password")
    if (!provider) {
      throw new ApiError(404, "Provider not found")
    }

    return NextResponse.json(provider)
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

export async function PUT(request: Request) {
  try {
    const headersList = headers()
    const token = headersList.get("authorization")?.split(" ")[1]

    if (!token) {
      throw new ApiError(401, "Unauthorized")
    }

    const decoded = await verifyToken(token)
    await dbConnect()

    const body = await request.json()
    const updatedProvider = await Provider.findByIdAndUpdate(decoded.userId, body, { new: true }).select("-password")

    if (!updatedProvider) {
      throw new ApiError(404, "Provider not found")
    }

    return NextResponse.json(updatedProvider)
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

