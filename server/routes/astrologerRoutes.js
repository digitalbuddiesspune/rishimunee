import { Router } from "express";
import { createAstrologer, listAstrologers, getAstrologerById, updateAstrologer, deleteAstrologer } from "../controllers/astrologerController.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";

const router = Router();

router.get("/", listAstrologers);
router.get("/:id", getAstrologerById);

router.post("/", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin", "editor"), createAstrologer);
router.put("/:id", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin", "editor"), updateAstrologer);
router.delete("/:id", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin"), deleteAstrologer);

export default router;

