import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { setAuthToken } from "../tokenManager.js";

const STORAGE_KEY = "aa-session";

const readSession = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Failed to parse stored session", error);
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

export const loadSession = createAsyncThunk("auth/loadSession", async () => {
  return readSession();
});

const initialState = {
  user: null,
  token: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload || {};
      state.user = user || null;
      state.token = token || null;
      setAuthToken(token);
      writeSession(token ? { user, token } : null);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      setAuthToken(null);
      writeSession(null);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loadSession.fulfilled, (state, action) => {
      const payload = action.payload;
      if (payload?.token) {
        state.user = payload.user;
        state.token = payload.token;
        setAuthToken(payload.token);
      }
    });
  }
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;

export const authReducer = authSlice.reducer;
