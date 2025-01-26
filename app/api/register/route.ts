import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import Provider from "@/models/Provider"
import User from "@/models/User"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Helper function to upload to Cloudinary
async function uploadToCloudinary(file: File) {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "service_marketplace" },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result.secure_url)
          }
        }
      )

      uploadStream.end(buffer)
    })
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw new Error("Failed to upload image")
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()

    const formData = await request.formData()
    const role = formData.get("role")
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Check if user/provider already exists
    const existingUser = role === "user" 
      ? await User.findOne({ email }) 
      : await Provider.findOne({ email })

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Handle image upload if present
    let imageUrl = null
    const profilePhoto = formData.get("profilePhoto") as File
    if (profilePhoto && profilePhoto.size > 0) {
      try {
        imageUrl = await uploadToCloudinary(profilePhoto)
      } catch (error) {
        console.error("Image upload error:", error)
        return NextResponse.json(
          { message: "Failed to upload image" },
          { status: 500 }
        )
      }
    }

    if (role === "provider") {
      const providerData = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: hashedPassword,
        profilePhoto: imageUrl,
        businessName: formData.get("businessName"),
        ownerName: formData.get("ownerName"),
        phoneNumber: formData.get("phoneNumber"),
        businessAddress: formData.get("businessAddress"),
        services: formData.get("services"),
        contactInfo: formData.get("contactInfo"),
        licenseNumber: formData.get("licenseNumber"),
      }

      try {
        const provider = new Provider(providerData)
        await provider.save()

        return NextResponse.json(
          { message: "Provider registered successfully" },
          { status: 201 }
        )
      } catch (error) {
        console.error("Provider creation error:", error)
        return NextResponse.json(
          { 
            message: "Failed to create provider account",
            error: error.message 
          },
          { status: 500 }
        )
      }
    } else {
      const userData = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: hashedPassword,
        profilePhoto: imageUrl,
      }

      try {
        const user = new User(userData)
        await user.save()

        return NextResponse.json(
          { message: "User registered successfully" },
          { status: 201 }
        )
      } catch (error) {
        console.error("User creation error:", error)
        return NextResponse.json(
          { 
            message: "Failed to create user account",
            error: error.message 
          },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { 
        message: "Error during registration", 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
