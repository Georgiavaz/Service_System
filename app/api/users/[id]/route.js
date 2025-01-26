import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

export async function GET(request, { params }) {
  const { id } = params
  await dbConnect()
  const user = await User.findById(id)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  return NextResponse.json(user)
}

export async function PUT(request, { params }) {
  const { id } = params
  const body = await request.json()
  await dbConnect()
  const updatedUser = await User.findByIdAndUpdate(id, body, { new: true })
  if (!updatedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  return NextResponse.json(updatedUser)
}

