export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
  EDITOR: "editor"
};

export const SERVICE_TYPES = {
  AI_CHAT: "ai_chat",
  KUNDLI: "kundli",
  KUNDLI_MATCHING: "kundli_matching",
  PANCHANG: "panchang",
  HOROSCOPE_DAILY: "daily_horoscope",
  HOROSCOPE_LAL_KITAB: "lal_kitab",
  HOROSCOPE_GOCHAR: "gochar_phal",
  CAREER: "career_counselling",
  LIFE_REPORT: "life_report",
  YEAR_ANALYSIS: "year_analysis",
  BABY_NAME: "baby_name",
  MANGAL_DOSHA: "mangal_dosha",
  KAL_SARP_DOSH: "kal_sarp_dosh",
  GEMSTONE: "gemstone"
};

export const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded"
};

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
};

export const PAYMENT_GATEWAYS = {
  STRIPE: "stripe",
  RAZORPAY: "razorpay",
  PAYTM: "paytm",
  PAYU: "payu",
  WALLET: "wallet",
  COD: "cod"
};

export const WALLET_TRANSACTION_TYPES = {
  CREDIT: "credit",
  DEBIT: "debit"
};

export const WALLET_TRANSACTION_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed"
};
