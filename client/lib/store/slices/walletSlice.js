import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "../../api-client.js";

export const fetchWallet = createAsyncThunk("wallet/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get("/wallet");
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Unable to fetch wallet");
  }
});

const initialState = {
  balance: 0,
  currency: "INR",
  transactions: [],
  status: "idle",
  error: null
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    resetWallet: () => ({ ...initialState })
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.balance = action.payload?.balance ?? 0;
        state.currency = action.payload?.currency || "INR";
        state.transactions = action.payload?.transactions || [];
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message;
      });
  }
});

export const { resetWallet } = walletSlice.actions;

export const selectWallet = (state) => state.wallet;
export const selectWalletBalance = (state) => state.wallet.balance;

export const walletReducer = walletSlice.reducer;
