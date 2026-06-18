import { Router } from "express";
import { body } from "express-validator";
import { createAdmin, loginAdmin, getAdminDashboardMetrics, listUsers, updateUserStatus } from "../controllers/adminController.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";
import { validate } from "../middlewares/validator.js";

const router = Router();

router.post(
  "/login",
  validate([
    body("email").isEmail(),
    body("password").notEmpty()
  ]),
  loginAdmin
);

router.post(
  "/create",
  authenticate({ allowAdmin: true }),
  authorizeRoles("superadmin"),
  createAdmin
);

router.get(
  "/dashboard",
  authenticate({ allowAdmin: true }),
  authorizeRoles("admin", "superadmin"),
  getAdminDashboardMetrics
);

router.get(
  "/users",
  authenticate({ allowAdmin: true }),
  authorizeRoles("admin", "superadmin", "editor"),
  listUsers
);

router.patch(
  "/users/:userId",
  authenticate({ allowAdmin: true }),
  authorizeRoles("admin", "superadmin"),
  updateUserStatus
);

export default router;

