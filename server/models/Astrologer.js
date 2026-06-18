import mongoose from "mongoose";

const astrologerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    specialty: {
      type: [String],
      enum: ["Vedic", "Tarot", "Numerology", "Palmistry", "Western", "KP"],
      default: ["Vedic"]
    },
    type: {
      type: String,
      enum: ["AI", "REAL"],
      default: "AI"
    },
    prompts: {
      persona: { type: String },
      system: { type: String }
    },
    avatar: { type: String },
    availability: {
      days: [{ type: String }],
      timeSlots: [{ type: String }]
    },
    pricePerSession: { type: Number, default: 0 },
    // Per-minute chat pricing for Talk to Astrologer
    pricePerMinute: { type: Number, default: 100 },
    // Legacy: daily chat access price (24 hours access) - deprecated
    dailyChatPrice: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    experienceYears: { type: Number, default: 1 },
    languages: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    // Allow admins to hide astrologers from public listings
    isHidden: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Astrologer = mongoose.model("Astrologer", astrologerSchema);
