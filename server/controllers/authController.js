import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { Booking } from "../models/Booking.js";
import { Chat } from "../models/Chat.js";
import { Report } from "../models/Report.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { signToken } from "../utils/token.js";
import { getWalletSnapshot } from "../services/walletService.js";
import { createOtpChallenge, resendOtpChallenge, verifyOtpChallenge } from "../services/otpService.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

export const requestRegistrationOtp = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    throw Object.assign(new Error("Missing required fields"), {
      statusCode: httpStatus.BAD_REQUEST,
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw Object.assign(new Error("User already exists"), {
      statusCode: httpStatus.CONFLICT,
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const challenge = await createOtpChallenge({
    email,
    purpose: "register",
    payload: { name, email: String(email).trim().toLowerCase(), passwordHash, phone }
  });

  return successResponse(
    res,
    challenge,
    "Verification code sent",
    httpStatus.CREATED
  );
});

export const verifyRegistrationOtp = asyncHandler(async (req, res) => {
  const challenge = await verifyOtpChallenge({
    challengeId: req.body.challengeId,
    otp: req.body.otp,
    purpose: "register"
  });
  const existing = await User.findOne({ email: challenge.email });
  if (existing) {
    throw Object.assign(new Error("User already exists"), { statusCode: httpStatus.CONFLICT });
  }
  const user = await User.create({
    name: challenge.payload.name,
    email: challenge.email,
    password: challenge.payload.passwordHash,
    phone: challenge.payload.phone
  });
  const token = signToken({ id: user._id, role: user.role });
  return successResponse(res, { token, user: publicUser(user) }, "Registration successful", httpStatus.CREATED);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw Object.assign(new Error("Email and password are required"), {
      statusCode: httpStatus.BAD_REQUEST,
    });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw Object.assign(new Error("Invalid credentials"), {
      statusCode: httpStatus.UNAUTHORIZED,
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw Object.assign(new Error("Invalid credentials"), {
      statusCode: httpStatus.UNAUTHORIZED,
    });
  }
  if (user.status === "blocked") {
    throw Object.assign(new Error("Account is blocked"), { statusCode: httpStatus.FORBIDDEN });
  }

  const token = signToken({ id: user._id, role: user.role });
  return successResponse(res, { token, user: publicUser(user) }, "Login successful");
});

export const resendAuthOtp = asyncHandler(async (req, res) => {
  const challenge = await resendOtpChallenge({ challengeId: req.body.challengeId });
  return successResponse(res, challenge, "Verification code resent");
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw Object.assign(new Error("User not found"), {
      statusCode: httpStatus.NOT_FOUND,
    });
  }

  return successResponse(res, { user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = (({
    name,
    phone,
    dateOfBirth,
    placeOfBirth,
    gender,
  }) => ({
    name,
    phone,
    dateOfBirth,
    placeOfBirth,
    gender,
  }))(req.body);

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });
  return successResponse(res, { user }, "Profile updated");
});

export const getUserOverview = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [
    ordersCount,
    chatsCount,
    reportsCount,
    bookingsCount,
    recentOrders,
    upcomingBookings,
    walletSnapshot,
  ] = await Promise.all([
    Order.countDocuments({ userId }),
    Chat.countDocuments({ userId }),
    Report.countDocuments({ userId }),
    Booking.countDocuments({ userId }),
    Order.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    Booking.find({ userId, date: { $gte: new Date() } })
      .populate("astrologerId", "name")
      .sort({ date: 1 })
      .limit(5)
      .lean(),
    getWalletSnapshot(userId, 9),
  ]);

  const metrics = {
    orders: ordersCount,
    chats: chatsCount,
    reports: reportsCount,
    bookings: bookingsCount,
  };

  const transactions = walletSnapshot?.transactions || [];

  const recentTransactions = transactions.map((txn) => ({
    _id: txn._id,
    amount: txn.amount,
    type: txn.type,
    status: txn.status,
    description: txn.description,
    createdAt: txn.createdAt,
  }));

  const mappedOrders = recentOrders.map((order) => ({
    _id: order._id,
    serviceType: order.serviceType,
    amount: order.amount,
    status: order.status,
    createdAt: order.createdAt,
  }));

  const mappedBookings = upcomingBookings.map((booking) => ({
    _id: booking._id,
    astrologer: booking.astrologerId
      ? { id: booking.astrologerId._id, name: booking.astrologerId.name }
      : null,
    date: booking.date,
    timeSlot: booking.timeSlot,
    status: booking.status,
  }));

  return successResponse(res, {
    metrics,
    recentOrders: mappedOrders,
    upcomingBookings: mappedBookings,
    recentTransactions,
  });
});
