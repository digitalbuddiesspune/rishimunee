import httpStatus from "http-status";
import { Product } from "../models/Product.js";
import { uploadBufferToS3 } from "../config/storage.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const listProducts = asyncHandler(async (req, res) => {
  const sort = { isFeatured: -1, createdAt: -1, _id: -1 };
  const limitParam = req.query.limit;

  if (limitParam != null && limitParam !== "") {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(limitParam) || 100));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments()
    ]);

    return successResponse(res, {
      products,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + products.length < total
      }
    });
  }

  const products = await Product.find().sort(sort);
  return successResponse(res, { products });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    throw Object.assign(new Error("Product not found"), { statusCode: httpStatus.NOT_FOUND });
  }
  return successResponse(res, { product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  // If images uploaded, push to S3 and store CDN URLs
  if (Array.isArray(req.files) && req.files.length) {
    const uploaded = await Promise.all(
      req.files.map(async (file) => {
        return uploadBufferToS3({ buffer: file.buffer, contentType: file.mimetype, keyPrefix: `products/${body.slug || "generic"}/` });
      })
    );
    body.images = uploaded.slice(0, 4);
  }
  // Normalize numeric fields
  if (body.price != null) body.price = Number(body.price);
  if (body.stock != null) body.stock = Number(body.stock);
  const product = await Product.create(body);
  return successResponse(res, { product }, "Product created", httpStatus.CREATED);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (Array.isArray(req.files) && req.files.length) {
    const uploaded = await Promise.all(
      req.files.map(async (file) => uploadBufferToS3({ buffer: file.buffer, contentType: file.mimetype, keyPrefix: `products/${body.slug || "generic"}/` }))
    );
    body.images = uploaded.slice(0, 4);
  }
  if (body.price != null) body.price = Number(body.price);
  if (body.stock != null) body.stock = Number(body.stock);
  const product = await Product.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  return successResponse(res, { product }, "Product updated");
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  return successResponse(res, {}, "Product deleted", httpStatus.NO_CONTENT);
});
