"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function UserDashboard() {
  const { toast } = useToast()
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [reviews, setReviews] = useState({})
  const [priceRange, setPriceRange] = useState([0, 100])
  const [minRating, setMinRating] = useState(0)
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card")
  const [searchTerm, setSearchTerm] = useState("")
  const [profile, setProfile] = useState({
    _id: "placeholder_user_id",
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    address: "123 Main St, City, Country",
    paymentMethods: ["Credit Card"],
  })

  useEffect(() => {
    fetchServices()
    fetchBookings()
    fetchProfile()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await axios.get("/api/services")
      setServices(response.data)
    } catch (error) {
      console.error("Error fetching services:", error)
      toast({
        title: "Error",
        description: "Failed to fetch services. Please try again.",
        status: "error",
      })
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`/api/bookings?userId=${profile._id}`)
      setBookings(response.data)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch bookings. Please try again.",
        status: "error",
      })
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${profile._id}`)
      setProfile(response.data)
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to fetch profile. Please try again.",
        status: "error",
      })
    }
  }

  const filteredServices = services.filter(
    (service) =>
      service.price >= priceRange[0] &&
      service.price <= priceRange[1] &&
      service.rating >= minRating &&
      (!showAvailableOnly || service.available) &&
      (selectedCategory === "All" || service.category === selectedCategory) &&
      (service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const categories = ["All", ...new Set(services.map((service) => service.category))]

  const handleBookService = async (serviceId) => {
    try {
      const response = await axios.post("/api/bookings", {
        service: serviceId,
        user: profile._id,
        provider: "Provider Name",
        date: selectedDate.toISOString().split("T")[0],
        time: "12:00",
        status: "Pending",
        reviewed: false,
      })
      fetchBookings()
      toast({
        title: "Booking Successful",
        description: "Your service has been booked successfully.",
        status: "success",
      })
    } catch (error) {
      console.error("Error booking service:", error)
      toast({
        title: "Booking Failed",
        description: "Failed to book the service. Please try again.",
        status: "error",
      })
    }
  }

  const handleUpdateProfile = async (updatedProfile) => {
    try {
      const response = await axios.put(`/api/users/${profile._id}`, updatedProfile)
      setProfile(response.data)
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        status: "success",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        status: "error",
      })
    }
  }

  const handleSubmitReview = async (bookingId) => {
    try {
      await axios.post("/api/reviews", {
        booking: bookingId,
        rating: reviews[bookingId].rating,
        comment: reviews[bookingId].comment,
      })
      fetchBookings()
      toast({
        title: "Review Submitted",
        description: "Your review has been submitted successfully.",
        status: "success",
      })
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Review Submission Failed",
        description: "Failed to submit your review. Please try again.",
        status: "error",
      })
    }
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <h1 className="text-4xl font-bold text-gray-900">User Dashboard</h1>
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white shadow-md rounded-lg">
          <TabsTrigger value="services" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Services
          </TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            My Bookings
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Available Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="mb-2 block">
                      Price Range: ${priceRange[0]} - ${priceRange[1]}
                    </Label>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <Label className="mb-2 block">Minimum Rating: {minRating}</Label>
                    <Slider
                      min={0}
                      max={5}
                      step={0.1}
                      value={[minRating]}
                      onValueChange={([value]) => setMinRating(value)}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="available-only" checked={showAvailableOnly} onCheckedChange={setShowAvailableOnly} />
                  <Label htmlFor="available-only">Show Available Only</Label>
                </div>
                <div>
                  <Label className="mb-2 block">Category</Label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
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
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(service.rating) ? "text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-600">{service.rating}</span>
                        </div>
                      </div>
                      <Badge className="mb-2" variant={service.available ? "default" : "secondary"}>
                        {service.available ? "Available" : "Unavailable"}
                      </Badge>
                    </CardContent>
                    <CardFooter>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full" disabled={!service.available}>
                            Book Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Book {service.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Select Date</Label>
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Payment Method</Label>
                              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="card" id="card" />
                                  <Label htmlFor="card">Credit Card</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="cash" id="cash" />
                                  <Label htmlFor="cash">Cash</Label>
                                </div>
                              </RadioGroup>
                            </div>
                            <div className="space-y-2">
                              <Label>Special Requests</Label>
                              <Textarea placeholder="Any special requests or notes for the service provider?" />
                            </div>
                            <Button onClick={() => handleBookService(service._id)} className="w-full">
                              Confirm Booking
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">My Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">{booking.service.title}</TableCell>
                      <TableCell>{booking.provider}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>{booking.time}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            booking.status === "Confirmed"
                              ? "default"
                              : booking.status === "Completed"
                                ? "success"
                                : "secondary"
                          }
                          className="capitalize"
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {booking.status === "Completed" && !booking.reviewed && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Leave Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Review for {booking.service.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Rating</Label>
                                  <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-6 h-6 cursor-pointer ${
                                          (reviews[booking._id]?.rating || 0) >= star
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                        onClick={() =>
                                          setReviews({
                                            ...reviews,
                                            [booking._id]: { ...reviews[booking._id], rating: star },
                                          })
                                        }
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Comment</Label>
                                  <Textarea
                                    placeholder="Write your review here..."
                                    value={reviews[booking._id]?.comment || ""}
                                    onChange={(e) =>
                                      setReviews({
                                        ...reviews,
                                        [booking._id]: { ...reviews[booking._id], comment: e.target.value },
                                      })
                                    }
                                  />
                                </div>
                                <Button onClick={() => handleSubmitReview(booking._id)} className="w-full">
                                  Submit Review
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        {booking.status === "Completed" && booking.reviewed && (
                          <Badge variant="outline">Reviewed</Badge>
                        )}
                        {booking.status !== "Completed" && (
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                  handleUpdateProfile(profile)
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-lg">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-lg">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-lg">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-lg">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-lg">Payment Methods</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="creditCard"
                      checked={profile.paymentMethods.includes("Credit Card")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setProfile({ ...profile, paymentMethods: [...profile.paymentMethods, "Credit Card"] })
                        } else {
                          setProfile({
                            ...profile,
                            paymentMethods: profile.paymentMethods.filter((m) => m !== "Credit Card"),
                          })
                        }
                      }}
                    />
                    <Label htmlFor="creditCard">Credit Card</Label>
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

