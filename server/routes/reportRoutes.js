import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { listReports, getReportById } from "../controllers/reportController.js";

const router = Router();

router.get("/", authenticate(), listReports);
router.get("/:id", authenticate(), getReportById);

export default router;

