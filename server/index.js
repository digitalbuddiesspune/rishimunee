import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import astrologerRoutes from "./routes/astrologerRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import kundliRoutes from "./routes/kundliRoutes.js";
import panchangRoutes from "./routes/panchangRoutes.js";
import horoscopeRoutes from "./routes/horoscopeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import serviceReportRoutes from "./routes/serviceReportRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import realtimeRoutes from "./routes/realtimeRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./utils/logger.js";
import mongoose from "mongoose";

const app = express();

const allowedOrigins = process.env.CLIENT_URL?.split(",")?.map((url) => url.trim()).filter(Boolean) || ["*"];

const isDevClientOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
    );
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV !== "production" && isDevClientOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/readyz", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not_ready",
    database: ready ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/astrologers", astrologerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/kundli", kundliRoutes);
app.use("/api/panchang", panchangRoutes);
app.use("/api/horoscope", horoscopeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/realtime", realtimeRoutes);
app.use("/api/service-reports", serviceReportRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
app.get("/", (_req, res) => {
  res.json({ success: true, message: "Welcome to the RisheeMuni API" });
});
app.use(errorHandler);

const port = process.env.PORT || 5000;
let httpServer;

const validateProductionConfig = () => {
  if (process.env.NODE_ENV !== "production") return;
  const required = [
    "MONGODB_URI",
    "JWT_SECRET",
    "OPENAI_API_KEY",
    "CLIENT_URL",
    "SERVER_PUBLIC_URL",
    "PAYU_KEY",
    "PAYU_SALT",
    "PAYU_SUCCESS_URL",
    "PAYU_FAILURE_URL",
    "EMAIL_FROM",
    "MERCHANT_INVOICE_EMAIL"
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
  if (!process.env.RESEND_API_KEY && !process.env.SMTP_HOST) {
    throw new Error("Configure RESEND_API_KEY or SMTP_HOST for production email delivery");
  }
  if (process.env.EMAIL_OTP_STUB === "true" || process.env.PAYU_MOCK_ENABLED === "true") {
    throw new Error("Mock OTP and PayU modes must be disabled in production");
  }
};

const bootstrap = async () => {
  try {
    validateProductionConfig();
    await connectDatabase();
    httpServer = app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
  }
};

bootstrap();

const shutdown = async (signal) => {
  logger.info("Shutting down server", { signal });
  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }
  await mongoose.connection.close();
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
