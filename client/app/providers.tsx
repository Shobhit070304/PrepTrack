"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { api, setUnauthorizedHandler } from "@/lib/api";
import type { User } from "@/types";

import { createContext, useContext } from "react";

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  acceptGoogleCredential: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AppProviders.");
  return value;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } } }));
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const expirationHandled = useRef(false);

  const clearSession = useCallback(() => {
    if (expirationHandled.current) return;
    expirationHandled.current = true;
    setUser(null);
    setReady(true);
    queryClient.clear();
    void api<void>("/api/auth/logout", { method: "POST", skipUnauthorizedHandling: true }).catch(() => undefined);
    toast.error("Session expired, please sign in again");
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  useEffect(() => {
    let active = true;
    api<User>("/api/me", { skipUnauthorizedHandling: true })
      .then((currentUser) => { if (active) setUser(currentUser); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  const acceptGoogleCredential = useCallback(async (idToken: string) => {
    const loggedIn = await api<User>("/api/auth/google", { method: "POST", skipUnauthorizedHandling: true, body: JSON.stringify({ idToken }) });
    setUser(loggedIn);
    expirationHandled.current = false;
    setReady(true);
    queryClient.clear();
    toast.success(`Welcome, ${loggedIn.name.split(" ")[0]}`);
  }, [queryClient]);

  const logout = useCallback(async () => {
    try { await api<void>("/api/auth/logout", { method: "POST", skipUnauthorizedHandling: true }); }
    finally { setUser(null); setReady(true); expirationHandled.current = false; queryClient.clear(); }
  }, [queryClient]);

  const app = <QueryClientProvider client={queryClient}><AuthContext.Provider value={{ user, ready, acceptGoogleCredential, logout }}>{children}<Toaster position="top-right" theme="dark" richColors/></AuthContext.Provider></QueryClientProvider>;
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  return clientId ? <GoogleOAuthProvider clientId={clientId}>{app}</GoogleOAuthProvider> : app;
}
