import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slices/authSlice.js";
import { walletReducer } from "./slices/walletSlice.js";
import { dashboardReducer } from "./slices/dashboardSlice.js";
import { chatReducer } from "./slices/chatSlice.js";
import { adminAuthReducer } from "./slices/adminAuthSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminAuth: adminAuthReducer,
    wallet: walletReducer,
    dashboard: dashboardReducer,
    chat: chatReducer
  }
});
