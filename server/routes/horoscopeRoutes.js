import { Router } from "express";
import { fetchHoroscope, updateHoroscope } from "../controllers/horoscopeController.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";

const router = Router();

router.get("/", fetchHoroscope);
router.post("/", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin", "editor"), updateHoroscope);

export default router;

