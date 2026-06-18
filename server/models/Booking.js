import mongoose from "mongoose";
import { BOOKING_STATUS } from "../utils/constants.js";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: "Astrologer", required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING
    },
    notes: { type: String },
    paymentId: { type: String },
    meetingLink: { type: String }
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);

