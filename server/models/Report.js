import mongoose from "mongoose";
import { SERVICE_TYPES } from "../utils/constants.js";

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    serviceType: {
      type: String,
      enum: [
        SERVICE_TYPES.KUNDLI,
        SERVICE_TYPES.KUNDLI_MATCHING,
        SERVICE_TYPES.HOROSCOPE_LAL_KITAB,
        SERVICE_TYPES.HOROSCOPE_GOCHAR,
        SERVICE_TYPES.LIFE_REPORT,
        SERVICE_TYPES.YEAR_ANALYSIS,
        SERVICE_TYPES.BABY_NAME,
        SERVICE_TYPES.MANGAL_DOSHA,
        SERVICE_TYPES.KAL_SARP_DOSH,
        SERVICE_TYPES.CAREER
      ],
      required: true
    },
    payload: mongoose.Schema.Types.Mixed,
    result: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
