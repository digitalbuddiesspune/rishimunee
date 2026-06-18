import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from "../controllers/cartController.js";

const router = Router();

router.get("/", authenticate(), getCart);
router.post("/add", authenticate(), addToCart);
router.patch("/item", authenticate(), updateCartItem);
router.post("/remove", authenticate(), removeCartItem);
router.post("/clear", authenticate(), clearCart);

export default router;

