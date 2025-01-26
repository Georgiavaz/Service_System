import mongoose from "mongoose"

const ProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minLength: [2, "Name must be at least 2 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [6, "Password must be at least 6 characters"]
  },
  profilePhoto: {
    type: String,
    default: null
  },
  businessName: {
    type: String,
    required: [true, "Business name is required"],
    minLength: [2, "Business name must be at least 2 characters"]
  },
  ownerName: {
    type: String,
    required: [true, "Owner name is required"],
    minLength: [2, "Owner name must be at least 2 characters"]
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    minLength: [10, "Phone number must be at least 10 characters"]
  },
  businessAddress: {
    type: String,
    required: [true, "Business address is required"],
    minLength: [5, "Business address must be at least 5 characters"]
  },
  services: {
    type: String,
    required: [true, "Services are required"],
    minLength: [2, "Services must be at least 2 characters"]
  },
  contactInfo: {
    type: String,
    required: [true, "Contact info is required"],
    minLength: [10, "Contact info must be at least 10 characters"]
  },
  licenseNumber: {
    type: String,
    required: [true, "License number is required"],
    minLength: [5, "License number must be at least 5 characters"]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.models.Provider || mongoose.model("Provider", ProviderSchema)
