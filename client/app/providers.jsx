"use client";

import { Provider as ReduxProvider } from "react-redux";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { store } from "../lib/store/index.js";
import { useAppDispatch, useAppSelector } from "../lib/store/hooks.js";
import { loadSession, selectAuthToken } from "../lib/store/slices/authSlice.js";
import { fetchWallet } from "../lib/store/slices/walletSlice.js";
import { fetchDashboard } from "../lib/store/slices/dashboardSlice.js";

const ThemeContext = createContext({ theme: "light", setTheme: () => {}, toggleTheme: () => {} });

const SessionInitializer = ({ children }) => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);

  useEffect(() => {
    dispatch(loadSession());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(fetchWallet());
      dispatch(fetchDashboard());
    }
  }, [token, dispatch]);

  return children;
};

export const Providers = ({ children }) => {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("aa-theme") : null;
    if (stored) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("aa-theme", theme);
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <ReduxProvider store={store}>
        <SessionInitializer>{children}</SessionInitializer>
      </ReduxProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
