import mongoose from "mongoose";
import { SERVICE_TYPES } from "../utils/constants.js";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    serviceType: {
      type: String,
      enum: Object.values(SERVICE_TYPES),
      required: true
    },
    basePrice: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    features: [{ type: String }],
    metadata: mongoose.Schema.Types.Mixed,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Service = mongoose.model("Service", serviceSchema);

