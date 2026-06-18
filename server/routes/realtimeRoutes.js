import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { createRealtimeSession } from "../controllers/realtimeController.js";

const router = express.Router();

// Create an ephemeral OpenAI Realtime session token
router.post("/session", authenticate(), createRealtimeSession);

export default router;

