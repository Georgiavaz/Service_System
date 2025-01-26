import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Booking from "@/models/Booking"
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

    const bookings = await Booking.find({ provider: decoded.userId })
      .populate("service")
      .populate("user", "name email")
      .sort({ createdAt: -1 })

    return NextResponse.json(bookings)
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      throw new ApiError(401, "Unauthorized")
    }

    const decoded = await verifyToken(token)
    await dbConnect()

    const body = await request.json()
    const { bookingId, status } = body

    const updatedBooking = await Booking.findOneAndUpdate(
      { _id: bookingId, provider: decoded.userId },
      { status },
      { new: true },
    )

    if (!updatedBooking) {
      throw new ApiError(404, "Booking not found")
    }

    return NextResponse.json(updatedBooking)
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

