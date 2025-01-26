import mongoose from "mongoose"

const BookingSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  provider: String,
  date: String,
  time: String,
  status: String,
  reviewed: Boolean,
})

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema)

