import { NextResponse } from "next/server"
import { headers } from "next/headers"
import dbConnect from "@/lib/dbConnect"
import Service from "@/models/Service"
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

    const services = await Service.find({ provider: decoded.userId })
    return NextResponse.json(services)
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

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
    const provider = await Provider.findById(decoded.userId)

    if (!provider) {
      throw new ApiError(404, "Provider not found")
    }

    const newService = new Service({
      ...body,
      provider: decoded.userId,
    })

    const savedService = await newService.save()
    return NextResponse.json(savedService, { status: 201 })
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

