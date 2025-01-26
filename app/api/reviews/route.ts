import { NextResponse } from "next/server"
import { headers } from "next/headers"
import dbConnect from "@/lib/dbConnect"
import Review from "@/models/Review"
import Booking from "@/models/Booking"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: Request) {
  try {
    const headersList = headers()
    const token = headersList.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const body = await request.json()

    await dbConnect()

    const booking = await Booking.findById(body.booking).populate("service").populate("provider")

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    if (booking.reviewed) {
      return NextResponse.json({ message: "Booking already reviewed" }, { status: 400 })
    }

    const review = await Review.create({
      booking: body.booking,
      user: decoded.userId,
      provider: booking.provider._id,
      service: booking.service._id,
      rating: body.rating,
      comment: body.comment,
    })

    await Booking.findByIdAndUpdate(body.booking, { reviewed: true })

    return NextResponse.json(review)
  } catch (error) {
    console.error("Review creation error:", error)
    return NextResponse.json({ message: "Error creating review" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get("providerId")
    const serviceId = searchParams.get("serviceId")

    await dbConnect()

    const query: any = {}
    if (providerId) query.provider = providerId
    if (serviceId) query.service = serviceId

    const reviews = await Review.find(query)
      .populate("user", "name profilePhoto")
      .populate("service", "title")
      .sort({ createdAt: -1 })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Review fetch error:", error)
    return NextResponse.json({ message: "Error fetching reviews" }, { status: 500 })
  }
}

