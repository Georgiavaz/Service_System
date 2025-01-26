import mongoose from "mongoose"

const ReviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Provider",
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Update provider's average rating when a review is created
ReviewSchema.post("save", async function () {
  const Provider = mongoose.model("Provider")
  const reviews = await this.constructor.find({ provider: this.provider })
  const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
  await Provider.findByIdAndUpdate(this.provider, {
    rating: avgRating,
    reviewCount: reviews.length,
  })
})

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema)

