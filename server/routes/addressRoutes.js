import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { listAddresses, createAddress, updateAddress, deleteAddress } from "../controllers/addressController.js";

const router = Router();

router.get("/", authenticate(), listAddresses);
router.post("/", authenticate(), createAddress);
router.put("/:id", authenticate(), updateAddress);
router.delete("/:id", authenticate(), deleteAddress);

export default router;

