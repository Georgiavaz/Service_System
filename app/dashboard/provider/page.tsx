"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Upload, DollarSign, Users, CalendarIcon, BarChart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

interface Service {
  _id: string
  title: string
  description: string
  price: number
  duration: number
  category: string
  image: string
  isActive: boolean
}

interface Booking {
  _id: string
  service: Service
  user: {
    name: string
    email: string
  }
  date: string
  time: string
  status: string
}

interface Review {
  _id: string
  user: {
    name: string
    profilePhoto?: string
  }
  rating: number
  comment: string
  createdAt: string
}

interface BusinessHours {
  [key: string]: { open: string; close: string }
}

export default function ProviderDashboard() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [newService, setNewService] = useState<Partial<Service>>({
    title: "",
    description: "",
    price: 0,
    duration: 30,
    category: "",
    image: "",
    isActive: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalBookings: 0,
    upcomingAppointments: 0,
    averageRating: 0,
  })
  const [profile, setProfile] = useState({
    businessName: "",
    ownerName: "",
    phoneNumber: "",
    businessAddress: "",
    cities: [],
    servicesOffered: [],
    description: "",
    businessHours: {} as BusinessHours,
    profilePicture: "",
  })
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [openTime, setOpenTime] = useState("09:00")
  const [closeTime, setCloseTime] = useState("17:00")

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const categories = ["Cleaning", "Plumbing", "Electrical", "Carpentry", "Painting", "Gardening", "Other"]

  useEffect(() => {
    fetchProviderData()
  }, [])

  const fetchProviderData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const [servicesRes, bookingsRes, reviewsRes, profileRes] = await Promise.all([
        axios.get("/api/provider/services", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/provider/bookings", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/provider/reviews", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/provider/profile", { headers: { Authorization: `Bearer ${token}` } }),
      ])

      setServices(servicesRes.data)
      setBookings(bookingsRes.data)
      setReviews(reviewsRes.data)
      setProfile(profileRes.data)

      // Calculate stats
      const totalEarnings = bookingsRes.data
        .filter((booking: Booking) => booking.status === "completed")
        .reduce((sum: number, booking: Booking) => sum + booking.service.price, 0)
      const upcomingAppointments = bookingsRes.data.filter(
        (booking: Booking) => booking.status === "confirmed" || booking.status === "pending",
      ).length
      const averageRating =
        reviewsRes.data.reduce((sum: number, review: Review) => sum + review.rating, 0) / reviewsRes.data.length || 0

      setStats({
        totalEarnings,
        totalBookings: bookingsRes.data.length,
        upcomingAppointments,
        averageRating,
      })

      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching provider data:", error)
      toast({
        title: "Error",
        description: "Failed to load provider data. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleAddService = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Error",
          description: "You must be logged in to add a service.",
          variant: "destructive",
        })
        return
      }

      if (
        !newService.title ||
        !newService.description ||
        !newService.price ||
        !newService.duration ||
        !newService.category
      ) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      const response = await axios.post("/api/provider/services", newService, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setServices([...services, response.data])
      setNewService({
        title: "",
        description: "",
        price: 0,
        duration: 30,
        category: "",
        image: "",
        isActive: true,
      })
      toast({
        title: "Success",
        description: "New service added successfully.",
      })
    } catch (error) {
      console.error("Error adding new service:", error)
      toast({
        title: "Error",
        description: "Failed to add new service. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append("file", file)

      try {
        const token = localStorage.getItem("token")
        const response = await axios.post("/api/upload", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })

        if (response.data.url) {
          setNewService({ ...newService, image: response.data.url })
          toast({
            title: "Success",
            description: "Image uploaded successfully.",
          })
        } else {
          throw new Error("No URL returned from upload")
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to upload image. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        "/api/provider/bookings",
        { bookingId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setBookings(bookings.map((booking) => (booking._id === bookingId ? { ...booking, status: newStatus } : booking)))
      toast({
        title: "Success",
        description: "Booking status updated successfully.",
      })
    } catch (error) {
      console.error("Error updating booking status:", error)
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const updatedProfile = {
        ...profile,
        businessHours: selectedDays.reduce((acc, day) => {
          acc[day] = { open: openTime, close: closeTime }
          return acc
        }, {} as BusinessHours),
      }
      const response = await axios.put("/api/provider/profile", updatedProfile, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProfile(response.data)
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append("file", file)

      try {
        const token = localStorage.getItem("token")
        const response = await axios.post("/api/upload", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })

        if (response.data.url) {
          setProfile({ ...profile, profilePicture: response.data.url })
          toast({
            title: "Success",
            description: "Profile picture uploaded successfully.",
          })
        } else {
          throw new Error("No URL returned from upload")
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error)
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to upload profile picture. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <h1 className="text-4xl font-bold text-gray-900">Provider Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <CalendarIcon className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-md rounded-lg">
          <TabsTrigger value="services" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Services
          </TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Bookings
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Reviews
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Service Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mb-4 bg-blue-500 hover:bg-blue-600">Add New Service</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Service</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleAddService()
                    }}
                    className="space-y-4 py-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="title">Service Title</Label>
                      <Input
                        id="title"
                        value={newService.title}
                        onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newService.price}
                        onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newService.duration}
                        onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newService.category}
                        onValueChange={(value) => setNewService({ ...newService, category: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Service Image</Label>
                      <div className="flex items-center space-x-4">
                        <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} />
                        {newService.image && (
                          <img
                            src={newService.image || "/placeholder.svg"}
                            alt="Service preview"
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={newService.isActive}
                        onCheckedChange={(checked) => setNewService({ ...newService, isActive: checked })}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                    <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                      Add Service
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card
                    key={service._id}
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <img
                      src={service.image || "/placeholder.svg"}
                      alt={service.title}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{service.category}</p>
                      <p className="text-gray-700 mb-4">{service.description}</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-blue-600">${service.price}</span>
                        <span className="text-sm text-gray-600">{service.duration} minutes</span>
                      </div>
                      <Badge variant={service.isActive ? "default" : "secondary"} className="mb-2">
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Booking Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Service</th>
                      <th className="px-4 py-2 text-left">Customer</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Time</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="border-b">
                        <td className="px-4 py-2">{booking.service.title}</td>
                        <td className="px-4 py-2">{booking.user.name}</td>
                        <td className="px-4 py-2">{booking.date}</td>
                        <td className="px-4 py-2">{booking.time}</td>
                        <td className="px-4 py-2">
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "completed"
                                  ? "success"
                                  : "secondary"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <Select
                            onValueChange={(value) => handleUpdateBookingStatus(booking._id, value)}
                            defaultValue={booking.status}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <Card key={review._id} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={review.user.profilePhoto} />
                          <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-lg">{review.user.name}</p>
                          <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Earnings Over Time</h3>
                  {/* Add a chart component here to display earnings over time */}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Popular Services</h3>
                  {/* Add a chart component here to display popular services */}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Customer Satisfaction</h3>
                  {/* Add a chart component here to display customer satisfaction trends */}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Profile Management</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleUpdateProfile()
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={profile.businessName}
                    onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner's Name</Label>
                  <Input
                    id="ownerName"
                    value={profile.ownerName}
                    onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Textarea
                    id="businessAddress"
                    value={profile.businessAddress}
                    onChange={(e) => setProfile({ ...profile, businessAddress: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cities">Cities Served (comma-separated)</Label>
                  <Input
                    id="cities"
                    value={profile.cities.join(", ")}
                    onChange={(e) =>
                      setProfile({ ...profile, cities: e.target.value.split(",").map((city) => city.trim()) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servicesOffered">Services Offered (comma-separated)</Label>
                  <Input
                    id="servicesOffered"
                    value={profile.servicesOffered.join(", ")}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        servicesOffered: e.target.value.split(",").map((service) => service.trim()),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    value={profile.description}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Hours</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      {daysOfWeek.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={day}
                            checked={selectedDays.includes(day)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedDays([...selectedDays, day])
                              } else {
                                setSelectedDays(selectedDays.filter((d) => d !== day))
                              }
                            }}
                          />
                          <Label htmlFor={day}>{day}</Label>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <Label htmlFor="openTimeHour">Open Time</Label>
                        <div className="flex space-x-2">
                          <Select
                            value={openTime.split(":")[0]}
                            onValueChange={(value) => setOpenTime(`${value}:${openTime.split(":")[1]}`)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                                <SelectItem key={hour} value={hour.toString().padStart(2, "0")}>
                                  {hour.toString().padStart(2, "0")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={openTime.split(":")[1]}
                            onValueChange={(value) => setOpenTime(`${openTime.split(":")[0]}:${value}`)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Minute" />
                            </SelectTrigger>
                            <SelectContent>
                              {["00", "15", "30", "45"].map((minute) => (
                                <SelectItem key={minute} value={minute}>
                                  {minute}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="closeTimeHour">Close Time</Label>
                        <div className="flex space-x-2">
                          <Select
                            value={closeTime.split(":")[0]}
                            onValueChange={(value) => setCloseTime(`${value}:${closeTime.split(":")[1]}`)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                                <SelectItem key={hour} value={hour.toString().padStart(2, "0")}>
                                  {hour.toString().padStart(2, "0")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={closeTime.split(":")[1]}
                            onValueChange={(value) => setCloseTime(`${closeTime.split(":")[0]}:${value}`)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Minute" />
                            </SelectTrigger>
                            <SelectContent>
                              {["00", "15", "30", "45"].map((minute) => (
                                <SelectItem key={minute} value={minute}>
                                  {minute}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture</Label>
                  <div className="flex items-center space-x-4">
                    <Input id="profilePicture" type="file" accept="image/*" onChange={handleProfileImageUpload} />
                    {profile.profilePicture && (
                      <img
                        src={profile.profilePicture || "/placeholder.svg"}
                        alt="Profile preview"
                        className="w-16 h-16 object-cover rounded-full"
                      />
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

