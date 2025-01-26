import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Service from "@/models/Service"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
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
          if (error) reject(error)
          else resolve(result.secure_url)
        }
      )
      uploadStream.end(buffer)
    })
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw new Error("Failed to upload image")
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')

    await dbConnect()
    
    if (providerId) {
      const services = await Service.find({ provider: providerId })
        .populate('provider', 'businessName email')
      return NextResponse.json(services)
    } else {
      const services = await Service.find({})
        .populate('provider', 'businessName email')
      return NextResponse.json(services)
    }
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { message: "Error fetching services" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()

    // Verify authentication
    const cookieStore = cookies()
    const token = cookieStore.get("token")

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token.value)
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    
    const serviceData = {
      title: formData.get("title"),
      description: formData.get("description"),
      price: parseFloat(formData.get("price") as string),
      duration: parseInt(formData.get("duration") as string),
      category: formData.get("category"),
      isActive: formData.get("isActive") === "true",
      provider: decoded.userId,
      image: ""
    }

    // Validate required fields
    if (!serviceData.title || !serviceData.description || !serviceData.price || 
        !serviceData.duration || !serviceData.category) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Handle image upload
    const imageFile = formData.get("image") as File
    if (imageFile && imageFile.size > 0) {
      try {
        const imageUrl = await uploadToCloudinary(imageFile)
        serviceData.image = imageUrl as string
      } catch (error) {
        console.error("Image upload error:", error)
        return NextResponse.json(
          { message: "Error uploading image" },
          { status: 500 }
        )
      }
    }

    const newService = new Service(serviceData)
    const savedService = await newService.save()

    const populatedService = await Service.findById(savedService._id)
      .populate('provider', 'businessName email')

    return NextResponse.json(populatedService, { status: 201 })

  } catch (error) {
    console.error("Service creation error:", error)
    return NextResponse.json(
      { message: "Error creating service" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect()

    // Verify authentication
    const cookieStore = cookies()
    const token = cookieStore.get("token")

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token.value)
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const serviceId = formData.get("id")

    // Check if service exists and belongs to provider
    const existingService = await Service.findOne({
      _id: serviceId,
      provider: decoded.userId
    })

    if (!existingService) {
      return NextResponse.json(
        { message: "Service not found or unauthorized" },
        { status: 404 }
      )
    }

    const updateData = {
      title: formData.get("title"),
      description: formData.get("description"),
      price: parseFloat(formData.get("price") as string),
      duration: parseInt(formData.get("duration") as string),
      category: formData.get("category"),
      isActive: formData.get("isActive") === "true"
    }

    // Handle image update
    const imageFile = formData.get("image") as File
    if (imageFile && imageFile.size > 0) {
      try {
        const imageUrl = await uploadToCloudinary(imageFile)
        updateData.image = imageUrl as string
      } catch (error) {
        console.error("Image upload error:", error)
        return NextResponse.json(
          { message: "Error uploading image" },
          { status: 500 }
        )
      }
    }

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      updateData,
      { new: true }
    ).populate('provider', 'businessName email')

    return NextResponse.json(updatedService)

  } catch (error) {
    console.error("Service update error:", error)
    return NextResponse.json(
      { message: "Error updating service" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect()

    // Verify authentication
    const cookieStore = cookies()
    const token = cookieStore.get("token")

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token.value)
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("id")

    // Check if service exists and belongs to provider
    const service = await Service.findOne({
      _id: serviceId,
      provider: decoded.userId
    })

    if (!service) {
      return NextResponse.json(
        { message: "Service not found or unauthorized" },
        { status: 404 }
      )
    }

    await Service.findByIdAndDelete(serviceId)

    return NextResponse.json(
      { message: "Service deleted successfully" },
      { status: 200 }
    )

  } catch (error) {
    console.error("Service deletion error:", error)
    return NextResponse.json(
      { message: "Error deleting service" },
      { status: 500 }
    )
  }
}
