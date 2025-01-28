// backend/models/user.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  lastname: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  verified: { type: Boolean, default: false },
  verificationToken: String,
  tokenExpires: Date,
});

export const User = mongoose.model("User", userSchema);
