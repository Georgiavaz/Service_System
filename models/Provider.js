import mongoose from "mongoose"

const ProviderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  businessAddress: {
    type: String,
    required: true,
  },
  cities: [String],
  servicesOffered: [String],
  description: String,
  businessHours: {
    type: Map,
    of: {
      open: String,
      close: String,
    },
  },
  profilePicture: String,
  rating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Provider || mongoose.model("Provider", ProviderSchema)

