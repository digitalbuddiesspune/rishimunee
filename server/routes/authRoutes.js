import { Router } from "express";
import { body } from "express-validator";
import {
  requestRegistrationOtp,
  verifyRegistrationOtp,
  login,
  resendAuthOtp,
  getProfile,
  updateProfile,
  getUserOverview
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validator.js";

const router = Router();

const registrationValidation = validate([
  body("name").notEmpty(),
  body("email").isEmail(),
  body("phone").isLength({ min: 10, max: 15 }),
  body("password").isLength({ min: 6 })
]);

const loginValidation = validate([
  body("email").isEmail(),
  body("password").notEmpty()
]);

router.post(
  "/register/request-otp",
  registrationValidation,
  requestRegistrationOtp
);

router.post(
  "/register/verify-otp",
  validate([
    body("challengeId").notEmpty(),
    body("otp").isLength({ min: 6, max: 6 })
  ]),
  verifyRegistrationOtp
);

// Compatibility alias for older app builds. Login no longer creates an OTP.
router.post("/login/request-otp", loginValidation, login);

router.post("/otp/resend", validate([body("challengeId").notEmpty()]), resendAuthOtp);

router.post("/register", registrationValidation, requestRegistrationOtp);
router.post("/login", loginValidation, login);

router.get("/me", authenticate(), getProfile);
router.put("/me", authenticate(), updateProfile);
router.get("/overview", authenticate(), getUserOverview);

export default router;
