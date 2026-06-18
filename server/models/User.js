import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { USER_ROLES } from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true, select: false },
    phone: { type: String },
    subscriptionPlan: {
      type: String,
      default: "free"
    },
    walletBalance: {
      type: Number,
      default: 0
    },
    walletCurrency: {
      type: String,
      default: "INR"
    },
    dateOfBirth: { type: Date },
    gender: { type: String },
    placeOfBirth: { type: String },
    chatHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active"
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  if (/^\$2[aby]\$\d{2}\$/.test(this.password)) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function compare(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model("User", userSchema);
