import { Router } from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";
import { createBooking, listBookings, updateBookingStatus } from "../controllers/bookingController.js";

const router = Router();

router.post("/", authenticate(), createBooking);
router.get("/", authenticate({ allowAdmin: true }), listBookings);
router.patch("/:id", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin", "editor"), updateBookingStatus);

export default router;

