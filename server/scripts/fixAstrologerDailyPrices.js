import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { Astrologer } from "../models/Astrologer.js";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const randomPrice = () => {
  // Random integer between 100 and 999 inclusive
  return Math.floor(Math.random() * 900) + 100;
};

async function main() {
  try {
    await connectDatabase();
    const astrologers = await Astrologer.find({}, "_id name dailyChatPrice");
    let updated = 0;
    for (const a of astrologers) {
      const price = a.dailyChatPrice && a.dailyChatPrice > 0 ? a.dailyChatPrice : randomPrice();
      if (a.dailyChatPrice !== price) {
        a.dailyChatPrice = price;
        await a.save();
        updated += 1;
        console.log(`Set dailyChatPrice for ${a.name} -> Rs ${price}`);
      } else {
        console.log(`Keeping dailyChatPrice for ${a.name} -> Rs ${price}`);
      }
    }
    console.log(`Done. ${updated} astrologers updated.`);
  } catch (err) {
    console.error("Failed to update daily prices:", err?.message || err);
    process.exitCode = 1;
  } finally {
    try { await mongoose.connection.close(); } catch (_) {}
  }
}

main();

