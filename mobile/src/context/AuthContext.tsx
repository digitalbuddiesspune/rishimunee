import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProfile } from "@services/api/auth";
import { clearToken, getToken, saveToken } from "@utils/storage";
import { setAuthToken } from "@services/api/client";

type User = any;

type AuthContextType = {
  user: User | null;
  token: string | null;
  initializing: boolean;
  completeAuthentication: (response: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    try {
      const stored = await getToken();
      if (stored) {
        setAuthToken(stored);
        setToken(stored);
        try {
          const me = await getProfile();
          setUser(me?.data?.user || me?.user || me);
        } catch {}
      }
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const completeAuthentication = useCallback(async (res: any) => {
    const t = res?.data?.token || res?.token;
    if (t) {
      await saveToken(t);
      setAuthToken(t);
      setToken(t);
      setUser(res?.data?.user || res?.user || null);
    } else {
      throw new Error("Token not found in response");
    }
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const me = await getProfile();
    setUser(me?.data?.user || me?.user || me);
  }, []);

  const value = useMemo(
    () => ({ user, token, initializing, completeAuthentication, logout, refreshProfile }),
    [user, token, initializing, completeAuthentication, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};
