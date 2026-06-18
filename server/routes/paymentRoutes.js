import { Router } from "express";
import {
  initiatePayment,
  verifyPayment,
  listOrders,
  payuSuccess,
  payuFailure,
  payuMockCheckout,
  payuLaunch
} from "../controllers/paymentController.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/payu/success", payuSuccess);
router.post("/payu/failure", payuFailure);
router.post("/payu/mock", payuMockCheckout);
router.get("/payu/launch", payuLaunch);
router.post("/initiate", authenticate(), initiatePayment);
router.post("/verify", authenticate(), verifyPayment);
router.get("/orders", authenticate({ allowAdmin: true }), listOrders);

export default router;
