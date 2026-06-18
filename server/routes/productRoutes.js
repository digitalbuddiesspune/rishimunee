import { Router } from "express";
import { listProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";
import { productImageUpload } from "../middlewares/upload.js";

const router = Router();

router.get("/", listProducts);
router.get("/:slug", getProductBySlug);
router.post("/", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin", "editor"), productImageUpload, createProduct);
router.put("/:id", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin", "editor"), productImageUpload, updateProduct);
router.delete("/:id", authenticate({ allowAdmin: true }), authorizeRoles("admin", "superadmin"), deleteProduct);

export default router;
