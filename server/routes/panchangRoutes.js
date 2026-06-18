import { Router } from "express";
import { fetchPanchang } from "../controllers/panchangController.js";

const router = Router();

router.get("/", fetchPanchang);

export default router;

