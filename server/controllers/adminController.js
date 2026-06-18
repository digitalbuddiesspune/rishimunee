import httpStatus from "http-status";
import { Admin } from "../models/Admin.js";
import { User } from "../models/User.js";
import { Astrologer } from "../models/Astrologer.js";
import { Order } from "../models/Order.js";
import { Booking } from "../models/Booking.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { signToken } from "../utils/token.js";

export const createAdmin = asyncHandler(async (req, res) => {
  const { email, password, role, permissions } = req.body;
  const exists = await Admin.findOne({ email });
  if (exists) {
    throw Object.assign(new Error("Admin already exists"), {
      statusCode: httpStatus.CONFLICT,
    });
  }

  const admin = await Admin.create({ email, password, role, permissions });
  return successResponse(
    res,
    { id: admin._id, email: admin.email },
    "Admin created",
    httpStatus.CREATED
  );
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin) {
    throw Object.assign(new Error("Invalid credentials"), {
      statusCode: httpStatus.UNAUTHORIZED,
    });
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw Object.assign(new Error("Invalid credentials"), {
      statusCode: httpStatus.UNAUTHORIZED,
    });
  }

  const adminAccessToken = signToken({ id: admin._id, role: admin.role, scope: "admin" });
  return successResponse(
    res,
    { adminAccessToken, admin: { id: admin._id, email: admin.email, role: admin.role } },
    "Admin login successful"
  );
});

export const getAdminDashboardMetrics = asyncHandler(async (_req, res) => {
  const [
    userCount,
    astrologerCount,
    orderCount,
    totalRevenue,
    pendingBookings,
  ] = await Promise.all([
    User.countDocuments(),
    Astrologer.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Booking.find({ status: "pending" })
      .limit(10)
      .populate("userId astrologerId"),
  ]);

  const revenue = totalRevenue?.[0]?.total || 0;

  return successResponse(res, {
    metrics: {
      userCount,
      astrologerCount,
      orderCount,
      revenue,
    },
    pendingBookings,
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);
  return successResponse(res, { users });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;
  const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
  return successResponse(res, { user }, "User status updated");
});
