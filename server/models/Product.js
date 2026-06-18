import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    longDescription: { type: String },
    category: { type: String, default: "other", index: true },
    gemstoneType: { type: String },
    price: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    images: {
      type: [{ type: String }],
      validate: [
        function limit(val) {
          return !val || val.length <= 4;
        },
        "You can add up to 4 images"
      ]
    },
    stock: { type: Number, default: 0 },
    attributes: mongoose.Schema.Types.Mixed,
    details: mongoose.Schema.Types.Mixed,
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
