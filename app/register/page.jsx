"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

const MAX_FILE_SIZE = 5000000
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profilePhoto: z
    .any()
    .refine(
      (files) => files?.length == 0 || (files?.length == 1 && files[0].size <= MAX_FILE_SIZE),
      `Max file size is 5MB.`,
    )
    .refine(
      (files) => files?.length == 0 || (files?.length == 1 && ACCEPTED_IMAGE_TYPES.includes(files[0].type)),
      "Only .jpg, .png and .webp formats are supported.",
    )
    .optional(),
})

const providerSchema = userSchema.extend({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  businessAddress: z.string().min(5, "Business address must be at least 5 characters"),
  services: z.string().min(2, "Services must be at least 2 characters"),
  contactInfo: z.string().min(10, "Contact info must be at least 10 characters"),
  licenseNumber: z.string().min(5, "License number must be at least 5 characters"),
})

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const role = searchParams.get("role") || "user"
  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  const form = useForm({
    resolver: zodResolver(role === "user" ? userSchema : providerSchema),
    defaultValues:
      role === "user"
        ? { 
            name: "", 
            email: "", 
            password: "", 
            profilePhoto: undefined 
          }
        : {
            name: "",
            email: "",
            password: "",
            profilePhoto: undefined,
            businessName: "",
            ownerName: "",
            phoneNumber: "",
            businessAddress: "",
            services: "",
            contactInfo: "",
            licenseNumber: "",
          },
  })

  async function onSubmit(values) {
    setIsLoading(true)
    try {
      const formData = new FormData()
      Object.keys(values).forEach((key) => {
        if (key === "profilePhoto" && values[key]?.[0]) {
          formData.append(key, values[key][0])
        } else {
          formData.append(key, values[key])
        }
      })
      formData.append("role", role)

      const response = await axios.post("/api/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      
      toast({
        title: "Registration Successful",
        description: "Your account has been successfully created.",
        variant: "success",
      })
      
      router.push("/login?role=" + role)
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "An error occurred during registration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {role === "user" ? "User" : "Provider"} Registration
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter your password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profilePhoto"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Profile Photo (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        onChange(e.target.files)
                        handleImageChange(e)
                      }}
                      {...rest}
                    />
                  </FormControl>
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="mt-2 rounded-full w-20 h-20 object-cover"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {role === "provider" && (
              <>
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your business name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter owner name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter business address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Services Offered</FormLabel>
                      <FormControl>
                        <Textarea placeholder="List your services" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Information</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your contact information" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your license number" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default function Register() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
