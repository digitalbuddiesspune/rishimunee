import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "astrologer", "system"], required: true },
    text: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: { createdAt: "timestamp", updatedAt: false } }
);

const chatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: "Astrologer" },
    astrologerSlug: { type: String },
    serviceType: { type: String, default: "ai_chat" },
    messages: [messageSchema],
    sessionStatus: { type: String, enum: ["active", "closed"], default: "active" }
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);

