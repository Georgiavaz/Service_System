import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      console.error("No file provided in the request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary environment variables are not set")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: "service_marketplace" }, (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error)
          reject(error)
        } else {
          resolve(result)
        }
      })

      uploadStream.end(buffer)
    })

    const result = (await uploadPromise) as any

    console.log("File uploaded successfully:", result.secure_url)
    return NextResponse.json({ url: result.secure_url })
  } catch (error) {
    console.error("Error in upload route:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}

