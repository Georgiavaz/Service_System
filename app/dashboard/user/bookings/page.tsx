"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Star, Calendar, Clock, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Booking {
  _id: string
  service: {
    _id: string
    title: string
    price: number
  }
  provider: {
    _id: string
    name: string
  }
  date: string
  time: string
  status: string
  reviewed: boolean
}

interface Review {
  rating: number
  comment: string
}

interface Service {
  _id: string
  title: string
  price: number
  provider: {
    _id: string
    name: string
  }
}

export default function BookingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Record<string, Review>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [newBooking, setNewBooking] = useState({
    serviceId: "",
    date: "",
    time: "",
  })

  useEffect(() => {
    fetchBookings()
    fetchServices()
  }, [])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await axios.get("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setBookings(response.data.bookings)
    } catch (error: any) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load booking history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await axios.get("/api/services")
      setServices(response.data)
    } catch (error: any) {
      console.error("Error fetching services:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load services",
        variant: "destructive",
      })
    }
  }

  const handleSubmitReview = async (bookingId: string) => {
    try {
      const token = localStorage.getItem("token")
      const review = reviews[bookingId]

      if (!review?.rating || !review?.comment) {
        toast({
          title: "Error",
          description: "Please provide both rating and comment",
          variant: "destructive",
        })
        return
      }

      await axios.post(
        "/api/reviews",
        {
          booking: bookingId,
          rating: review.rating,
          comment: review.comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setBookings(bookings.map((booking) => (booking._id === bookingId ? { ...booking, reviewed: true } : booking)))

      toast({
        title: "Success",
        description: "Review submitted successfully",
      })
    } catch (error: any) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      })
    }
  }

  const handleNewBooking = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      if (!newBooking.serviceId || !newBooking.date || !newBooking.time) {
        toast({
          title: "Error",
          description: "Please fill in all booking details",
          variant: "destructive",
        })
        return
      }

      const response = await axios.post("/api/bookings", newBooking, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setBookings([...bookings, response.data.booking])
      setNewBooking({ serviceId: "", date: "", time: "" })

      toast({
        title: "Success",
        description: "Booking created successfully",
      })
    } catch (error: any) {
      console.error("Error creating booking:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create booking",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>New Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="service">Service</Label>
              <select
                id="service"
                className="w-full p-2 border rounded"
                value={newBooking.serviceId}
                onChange={(e) => setNewBooking({ ...newBooking, serviceId: e.target.value })}
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.title} - ${service.price}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newBooking.date}
                onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newBooking.time}
                onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
              />
            </div>
          </div>
          <Button className="mt-4" onClick={handleNewBooking}>
            Create Booking
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bookings found. Start by booking a service!</div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <Card key={booking._id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{booking.service.title}</h3>
                        <p className="text-gray-600">Provider: {booking.provider.name}</p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(new Date(booking.date), "MMM dd, yyyy")}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {booking.time}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />${booking.service.price}
                      </div>
                    </div>

                    {booking.status === "completed" && !booking.reviewed && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">Leave Review</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Review for {booking.service.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Rating</div>
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-6 h-6 cursor-pointer ${
                                      (reviews[booking._id]?.rating || 0) >= star
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                    onClick={() =>
                                      setReviews({
                                        ...reviews,
                                        [booking._id]: {
                                          ...reviews[booking._id],
                                          rating: star,
                                        },
                                      })
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Comment</div>
                              <Textarea
                                placeholder="Share your experience..."
                                value={reviews[booking._id]?.comment || ""}
                                onChange={(e) =>
                                  setReviews({
                                    ...reviews,
                                    [booking._id]: {
                                      ...reviews[booking._id],
                                      comment: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                            <Button className="w-full" onClick={() => handleSubmitReview(booking._id)}>
                              Submit Review
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {booking.status === "completed" && booking.reviewed && (
                      <Badge variant="outline" className="bg-green-50">
                        Reviewed
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

