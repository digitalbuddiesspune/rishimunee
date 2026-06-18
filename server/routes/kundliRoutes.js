import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validator.js";
import {
  generateKundli,
  matchKundli,
  getMangalDosha,
  getKalSarpDosh,
  getBabyNameSuggestions,
  getLalKitab,
  getGocharPhal,
  getCareerCounselling,
  getLifeReport,
  getYearAnalysis,
  getServiceHistory,
} from "../controllers/kundliController.js";

const router = Router();

router.post(
  "/generate",
  authenticate(),
  validate([
    body("date").notEmpty(),
    body("time").notEmpty(),
    body("place").notEmpty(),
  ]),
  generateKundli
);

router.post("/match", authenticate(), matchKundli);

router.post("/mangal-dosha", authenticate(), getMangalDosha);
router.post("/kal-sarp", authenticate(), getKalSarpDosh);
router.post("/baby-names", authenticate(), getBabyNameSuggestions);
router.post("/lal-kitab", authenticate(), getLalKitab);
router.post("/gochar", authenticate(), getGocharPhal);
router.post("/career", authenticate(), getCareerCounselling);
router.post("/life-report", authenticate(), getLifeReport);
router.post("/year-analysis", authenticate(), getYearAnalysis);
router.get("/history", authenticate(), getServiceHistory);

export default router;
