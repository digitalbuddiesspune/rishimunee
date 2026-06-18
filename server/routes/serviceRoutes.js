import { Router } from "express";
import { listServices, getServiceBySlug, createService, updateService, toggleServiceStatus, upsertServices } from "../controllers/serviceController.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";
import { servicesCatalog } from "../services/servicesCatalog.js";

const router = Router();

router.get("/", listServices);
router.get("/:slug", getServiceBySlug);

router.post("/", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin"), createService);
router.put("/:id", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin", "editor"), updateService);
router.patch("/:id/toggle", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin"), toggleServiceStatus);
router.post("/upsert", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin", "editor"), upsertServices);

// Convenience route for one-click seeding from internal catalog
router.post(
  "/upsert-catalog",
  authenticate({ allowAdmin: true }),
  authorizeRoles("admin", "superadmin", "editor"),
  async (req, res, next) => {
    try {
      req.body = { services: servicesCatalog };
      return upsertServices(req, res);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

