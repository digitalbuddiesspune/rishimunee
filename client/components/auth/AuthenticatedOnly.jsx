"use client";

import { useAppSelector } from "../../lib/store/hooks.js";
import { selectAuthToken } from "../../lib/store/slices/authSlice.js";

export default function AuthenticatedOnly({ children }) {
  const token = useAppSelector(selectAuthToken);
  return token ? children : null;
}

