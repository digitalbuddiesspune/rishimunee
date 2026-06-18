import mongoose from "mongoose";

const horoscopeSchema = new mongoose.Schema(
  {
    zodiacSign: { type: String, required: true },
    date: { type: Date, required: true },
    daily: {
      mood: String,
      love: String,
      health: String,
      finance: String,
      spiritual: String,
      summary: String
    },
    lalKitab: { type: String },
    gocharPhal: { type: String },
    career: { type: String },
    yearAnalysis: { type: String }
  },
  { timestamps: true }
);

horoscopeSchema.index({ zodiacSign: 1, date: 1 }, { unique: true });

export const Horoscope = mongoose.model("Horoscope", horoscopeSchema);

