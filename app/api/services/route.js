import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Service from "@/models/Service"

export async function GET() {
  await dbConnect()
  const services = await Service.find({})
  return NextResponse.json(services)
}

export async function POST(request) {
  const body = await request.json()
  await dbConnect()
  const newService = new Service(body)
  const savedService = await newService.save()
  return NextResponse.json(savedService, { status: 201 })
}

