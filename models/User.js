import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  profilePhoto: String,
  role: {
    type: String,
    default: "user",
  },
  phone: String,
  address: String,
  paymentMethods: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.User || mongoose.model("User", UserSchema)

