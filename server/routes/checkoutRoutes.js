import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { initiateProductCheckout } from "../controllers/checkoutController.js";

const router = Router();

router.post("/initiate", authenticate(), initiateProductCheckout);

export default router;

