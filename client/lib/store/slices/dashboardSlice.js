import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "../../api-client.js";

export const fetchDashboard = createAsyncThunk("dashboard/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get("/auth/overview");
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to load dashboard");
  }
});

const initialState = {
  metrics: {
    orders: 0,
    chats: 0,
    reports: 0,
    bookings: 0
  },
  recentOrders: [],
  upcomingBookings: [],
  recentTransactions: [],
  status: "idle",
  error: null
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    resetDashboard: () => ({ ...initialState })
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.metrics = action.payload?.metrics || initialState.metrics;
        state.recentOrders = action.payload?.recentOrders || [];
        state.upcomingBookings = action.payload?.upcomingBookings || [];
        state.recentTransactions = action.payload?.recentTransactions || [];
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message;
      });
  }
});

export const { resetDashboard } = dashboardSlice.actions;

export const selectDashboard = (state) => state.dashboard;

export const dashboardReducer = dashboardSlice.reducer;
