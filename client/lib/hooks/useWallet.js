"use client";

import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWallet, selectWallet } from "../store/slices/walletSlice.js";
import { selectAuthToken } from "../store/slices/authSlice.js";

export const useWallet = () => {
  const dispatch = useDispatch();
  const wallet = useSelector(selectWallet);
  const token = useSelector(selectAuthToken);

  useEffect(() => {
    if (token && wallet.status === "idle") {
      dispatch(fetchWallet());
    }
  }, [token, wallet.status, dispatch]);

  const refresh = useCallback(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  return {
    balance: wallet.balance,
    currency: wallet.currency,
    transactions: wallet.transactions,
    isLoading: wallet.status === "loading",
    error: wallet.error,
    refresh
  };
};
