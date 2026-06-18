import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { generateCareerReport, generateLifeReport, generateYearAnalysis } from "../controllers/serviceReportController.js";

const router = Router();

router.post("/career", authenticate(), generateCareerReport);
router.post("/life", authenticate(), generateLifeReport);
router.post("/year", authenticate(), generateYearAnalysis);

export default router;

