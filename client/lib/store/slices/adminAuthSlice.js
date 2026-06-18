import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { setAdminToken } from "../adminTokenManager.js";

const STORAGE_KEY = "aa-admin-session";

const readSession = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Failed to parse stored admin session", error);
    return null;
  }
};

const writeSession = (session) => {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const loadAdminSession = createAsyncThunk("adminAuth/loadSession", async () => {
  return readSession();
});

const initialState = {
  admin: null,
  adminAccessToken: null
};

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    setAdminCredentials: (state, action) => {
      const { admin, adminAccessToken } = action.payload || {};
      state.admin = admin || null;
      state.adminAccessToken = adminAccessToken || null;
      setAdminToken(adminAccessToken);
      writeSession(adminAccessToken ? { admin, adminAccessToken } : null);
    },
    clearAdminCredentials: (state) => {
      state.admin = null;
      state.adminAccessToken = null;
      setAdminToken(null);
      writeSession(null);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loadAdminSession.fulfilled, (state, action) => {
      const payload = action.payload;
      if (payload?.adminAccessToken) {
        state.admin = payload.admin;
        state.adminAccessToken = payload.adminAccessToken;
        setAdminToken(payload.adminAccessToken);
      }
    });
  }
});

export const { setAdminCredentials, clearAdminCredentials } = adminAuthSlice.actions;

export const selectCurrentAdmin = (state) => state.adminAuth.admin;
export const selectAdminAccessToken = (state) => state.adminAuth.adminAccessToken;

export const adminAuthReducer = adminAuthSlice.reducer;

