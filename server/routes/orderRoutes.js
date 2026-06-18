import { Router } from "express";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";
import { listUserOrders, getOrderById, getPaymentStatus, updateOrderStatus, consumeEntitlement } from "../controllers/orderController.js";

const router = Router();

router.get("/me", authenticate(), listUserOrders);
router.post("/consume", authenticate(), consumeEntitlement);
router.get("/:id/payment-status", authenticate(), getPaymentStatus);
router.get("/:id", authenticate({ allowAdmin: true }), getOrderById);
router.patch("/:id", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin"), updateOrderStatus);

export default router;
