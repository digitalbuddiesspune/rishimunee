import httpStatus from "http-status";
import { Booking } from "../models/Booking.js";
import { Astrologer } from "../models/Astrologer.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { BOOKING_STATUS } from "../utils/constants.js";

export const createBooking = asyncHandler(async (req, res) => {
  const { astrologerId, date, timeSlot, notes } = req.body;
  const astrologer = await Astrologer.findById(astrologerId);
  if (!astrologer) {
    throw Object.assign(new Error("Astrologer not found"), { statusCode: httpStatus.NOT_FOUND });
  }

  const booking = await Booking.create({
    userId: req.user.id,
    astrologerId,
    date,
    timeSlot,
    notes
  });

  return successResponse(res, { booking }, "Booking created", httpStatus.CREATED);
});

export const listBookings = asyncHandler(async (req, res) => {
  const filter = req.user.role === "user" ? { userId: req.user.id } : {};
  const bookings = await Booking.find(filter).populate("astrologerId userId").sort({ createdAt: -1 });
  return successResponse(res, { bookings });
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, meetingLink } = req.body;
  if (!Object.values(BOOKING_STATUS).includes(status)) {
    throw Object.assign(new Error("Invalid booking status"), { statusCode: httpStatus.BAD_REQUEST });
  }
  const booking = await Booking.findByIdAndUpdate(id, { status, meetingLink }, { new: true });
  return successResponse(res, { booking }, "Booking updated");
});

