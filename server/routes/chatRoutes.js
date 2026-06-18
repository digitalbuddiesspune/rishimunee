import { Router } from "express";
import { startChatSession, sendChatMessage, fetchChatHistory, streamChatMessage, quoteChatAccess, confirmChatAccess } from "../controllers/chatController.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/start", authenticate(), startChatSession);
router.post("/:chatId/messages", authenticate(), sendChatMessage);
router.post("/:chatId/messages/stream", authenticate(), streamChatMessage);
router.get("/history", authenticate(), fetchChatHistory);
router.get("/access/quote", authenticate(), quoteChatAccess);
router.post("/access/confirm", authenticate(), confirmChatAccess);

export default router;
