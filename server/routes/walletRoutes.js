import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { getWalletDetails, initiateWalletTopUp, confirmWalletTopUp } from "../controllers/walletController.js";

const router = Router();

router.get("/", authenticate(), getWalletDetails);
router.post("/topup", authenticate(), initiateWalletTopUp);
router.post("/confirm", authenticate(), confirmWalletTopUp);

export default router;
