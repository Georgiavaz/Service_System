"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface ProfileData {
  _id: string
  name: string
  email: string
  profilePhoto?: string
  phone?: string
  address?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await axios.get("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProfile(response.data)
    } catch (error: any) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load profile",
        variant: "destructive",
      })
      if (error.response?.status === 401) {
        router.push("/login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("image", file)

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post("/api/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      setProfile((prev) => (prev ? { ...prev, profilePhoto: response.data.url } : null))
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      })
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await axios.put(
        "/api/user/profile",
        {
          phone: profile?.phone,
          address: profile?.address,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setProfile(response.data)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout")
      localStorage.removeItem("token")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.profilePhoto} />
                <AvatarFallback>{profile?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <div>
              <Input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="profile-photo" />
              <Button
                variant="outline"
                onClick={() => document.getElementById("profile-photo")?.click()}
                disabled={isUploading}
              >
                Change Photo
              </Button>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={profile?.name || ""} disabled className="bg-gray-100" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile?.email || ""} disabled className="bg-gray-100" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile?.phone || ""}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={profile?.address || ""}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, address: e.target.value } : null))}
              />
            </div>

            <div className="flex justify-between">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
              <Button type="button" variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

