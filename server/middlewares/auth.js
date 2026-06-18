import httpStatus from "http-status";
import { verifyToken } from "../utils/token.js";
import { User } from "../models/User.js";
import { Admin } from "../models/Admin.js";

export const authenticate = ({ allowAdmin = false } = {}) => async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw Object.assign(new Error("Authorization token missing"), { statusCode: httpStatus.UNAUTHORIZED });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (decoded.scope === "admin" && allowAdmin) {
      const admin = await Admin.findById(decoded.id);
      if (!admin) {
        throw Object.assign(new Error("Admin not found"), { statusCode: httpStatus.UNAUTHORIZED });
      }
      req.user = { id: admin._id, role: admin.role, scope: "admin" };
      return next();
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw Object.assign(new Error("User not found"), { statusCode: httpStatus.UNAUTHORIZED });
    }

    req.user = { id: user._id, role: user.role, scope: "user" };
    return next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    next(Object.assign(new Error("Forbidden"), { statusCode: httpStatus.FORBIDDEN }));
    return;
  }
  next();
};
