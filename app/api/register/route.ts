import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Provider from "@/models/Provider"
import { v2 as cloudinary } from "cloudinary"
import bcrypt from "bcryptjs"
import { ApiError, handleApiError } from "@/lib/api-error"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    await dbConnect()

    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      throw new ApiError(400, "Content type must be multipart/form-data")
    }

    const formData = await request.formData()

    const email = formData.get("email")?.toString()
    const password = formData.get("password")?.toString()
    const name = formData.get("name")?.toString()
    const role = formData.get("role")?.toString()

    if (!email || !password || !name || !role) {
      throw new ApiError(400, "Missing required fields", {
        fields: ["email", "password", "name", "role"].filter((field) => !formData.get(field)),
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ApiError(400, "Invalid email format")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let profilePhotoUrl = ""
    const profilePhoto = formData.get("profilePhoto")
    if (profilePhoto instanceof Blob) {
      try {
        const bytes = await profilePhoto.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64Image = buffer.toString("base64")
        const dataURI = `data:${profilePhoto.type};base64,${base64Image}`

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "service_marketplace/profiles",
        })
        profilePhotoUrl = result.secure_url
      } catch (error) {
        console.error("Cloudinary upload error:", error)
        throw new ApiError(500, "Failed to upload profile photo")
      }
    }

    if (role === "provider") {
      const businessName = formData.get("businessName")?.toString()
      const services = formData.get("services")?.toString()
      const contactInfo = formData.get("contactInfo")?.toString()
      const licenseNumber = formData.get("licenseNumber")?.toString()

      if (!businessName || !services || !contactInfo || !licenseNumber) {
        throw new ApiError(400, "Missing provider fields", {
          fields: ["businessName", "services", "contactInfo", "licenseNumber"].filter((field) => !formData.get(field)),
        })
      }

      const existingProvider = await Provider.findOne({ email })
      if (existingProvider) {
        throw new ApiError(409, "Email already registered as a provider")
      }

      const provider = await Provider.create({
        email,
        password: hashedPassword,
        name,
        profilePhoto: profilePhotoUrl,
        role,
        businessName,
        services,
        contactInfo,
        licenseNumber,
      })

      const providerResponse = provider.toObject()
      delete providerResponse.password

      return NextResponse.json(
        {
          success: true,
          message: "Provider registration successful.",
          provider: providerResponse,
        },
        { status: 201 },
      )
    } else {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        throw new ApiError(409, "Email already registered as a user")
      }

      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        profilePhoto: profilePhotoUrl,
        role,
      })

      const userResponse = user.toObject()
      delete userResponse.password

      return NextResponse.json(
        {
          success: true,
          message: "User registration successful",
          user: userResponse,
        },
        { status: 201 },
      )
    }
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

