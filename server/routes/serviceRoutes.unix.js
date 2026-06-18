import { Router } from "express";
import { listServices, getServiceBySlug, createService, updateService, toggleServiceStatus, upsertServices } from "../controllers/serviceController.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";

const router = Router();

router.get("/", listServices);
router.get("/:slug", getServiceBySlug);

router.post("/", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin"), createService);
router.put("/:id", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin", "editor"), updateService);
router.patch("/:id/toggle", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin"), toggleServiceStatus);
router.post("/upsert", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin", "editor"), upsertServices);

export default router;