import { NextResponse } from "next/server"
import { headers } from "next/headers"
import dbConnect from "@/lib/dbConnect"
import Booking from "@/models/Booking"
import User from "@/models/User"
import Provider from "@/models/Provider"
import Service from "@/models/Service"
import { ApiError, handleApiError } from "@/lib/api-error"
import { verifyToken } from "@/lib/auth"
import { sendServiceConfirmationEmail } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const headersList = headers()
    const token = headersList.get("authorization")?.split(" ")[1]

    if (!token) {
      throw new ApiError(401, "Unauthorized")
    }

    const decoded = await verifyToken(token)
    await dbConnect()

    const body = await request.json()
    const { serviceId, date, time, specialRequests } = body

    if (!serviceId || !date || !time) {
      throw new ApiError(400, "Missing required fields")
    }

    // Fetch necessary data
    const user = await User.findById(decoded.userId)
    const service = await Service.findById(serviceId)
    const provider = await Provider.findById(service.provider)

    if (!user || !service || !provider) {
      throw new ApiError(404, "User, service, or provider not found")
    }

    // Create booking
    const booking = await Booking.create({
      user: user._id,
      service: service._id,
      provider: provider._id,
      date,
      time,
      status: "pending",
      specialRequests,
      price: service.price,
    })

    // Send notification to provider (you might want to implement real-time notifications here)
    // For now, we'll just send an email to the user
    await sendServiceConfirmationEmail(user.email, user.name, {
      name: service.title,
      provider: provider.name,
      date,
      time,
      price: service.price,
    })

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      booking,
    })
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

export async function GET(request: Request) {
  try {
    const headersList = headers()
    const token = headersList.get("authorization")?.split(" ")[1]

    if (!token) {
      throw new ApiError(401, "Unauthorized")
    }

    const decoded = await verifyToken(token)
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const providerId = searchParams.get("providerId")

    let query = {}
    if (userId) {
      // Users can only see their own bookings
      if (decoded.userId !== userId) {
        throw new ApiError(403, "Forbidden")
      }
      query = { user: userId }
    } else if (providerId) {
      // Providers can only see their own bookings
      if (decoded.role !== "provider" || decoded.userId !== providerId) {
        throw new ApiError(403, "Forbidden")
      }
      query = { provider: providerId }
    }

    const bookings = await Booking.find(query)
      .populate("service")
      .populate("user", "name email")
      .populate("provider", "name")
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      bookings,
    })
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

