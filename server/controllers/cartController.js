import httpStatus from "http-status";
import mongoose from "mongoose";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

const ensureCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
};

export const getCart = asyncHandler(async (req, res) => {
  const cart = await ensureCart(req.user.id);
  // Populate product details for client display
  const detailed = await Cart.findById(cart._id).populate("items.productId");
  return successResponse(res, { cart: detailed });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  if (!productId || !mongoose.isValidObjectId(productId)) {
    throw Object.assign(new Error("Valid productId required"), { statusCode: httpStatus.BAD_REQUEST });
  }
  const product = await Product.findById(productId);
  if (!product) {
    throw Object.assign(new Error("Product not found"), { statusCode: httpStatus.NOT_FOUND });
  }
  const cart = await ensureCart(req.user.id);
  const idx = cart.items.findIndex((i) => i.productId.toString() === productId);
  if (idx >= 0) {
    cart.items[idx].quantity += Number(quantity) || 1;
  } else {
    cart.items.push({ productId, quantity: Number(quantity) || 1 });
  }
  await cart.save();
  const detailed = await Cart.findById(cart._id).populate("items.productId");
  return successResponse(res, { cart: detailed }, "Added to cart");
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body || {};
  if (!productId || typeof quantity !== "number" || quantity < 1) {
    throw Object.assign(new Error("productId and valid quantity required"), { statusCode: httpStatus.BAD_REQUEST });
  }
  const cart = await ensureCart(req.user.id);
  const item = cart.items.find((i) => i.productId.toString() === productId);
  if (!item) {
    throw Object.assign(new Error("Item not in cart"), { statusCode: httpStatus.NOT_FOUND });
  }
  item.quantity = quantity;
  await cart.save();
  const detailed = await Cart.findById(cart._id).populate("items.productId");
  return successResponse(res, { cart: detailed }, "Cart updated");
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.body || {};
  const cart = await ensureCart(req.user.id);
  cart.items = cart.items.filter((i) => i.productId.toString() !== String(productId));
  await cart.save();
  const detailed = await Cart.findById(cart._id).populate("items.productId");
  return successResponse(res, { cart: detailed }, "Item removed");
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await ensureCart(req.user.id);
  cart.items = [];
  await cart.save();
  return successResponse(res, { cart }, "Cart cleared");
});

