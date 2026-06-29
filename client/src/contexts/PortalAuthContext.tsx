import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export type PortalRole = "booking_client" | "artist" | "brand" | "admin";

export interface PortalUser {
  id: number;
  email: string;
  name: string;
  role: PortalRole;
  displayName?: string;
}

interface PortalAuthState {
  user: PortalUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface PortalAuthContextValue extends PortalAuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: PortalRole;
  displayName?: string;
  company?: string;
}

const PortalAuthContext = createContext<PortalAuthContextValue | null>(null);

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortalAuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/me", { credentials: "include" });
      if (res.ok) {
        const user = await res.json();
        setState({ user, loading: false, isAuthenticated: true });
      } else {
        setState({ user: null, loading: false, isAuthenticated: false });
      }
    } catch {
      setState({ user: null, loading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setState({ user: data.user, loading: false, isAuthenticated: true });
        return { success: true };
      }
      return { success: false, error: data.error || "Login failed" };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const register = useCallback(async (d: RegisterData) => {
    try {
      const res = await fetch("/api/portal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(d),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setState({ user: data.user, loading: false, isAuthenticated: true });
        return { success: true };
      }
      return { success: false, error: data.error || "Registration failed" };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/portal/logout", { method: "POST", credentials: "include" });
    setState({ user: null, loading: false, isAuthenticated: false });
  }, []);

  const refresh = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  return (
    <PortalAuthContext.Provider value={{ ...state, login, register, logout, refresh }}>
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) throw new Error("usePortalAuth must be used within PortalAuthProvider");
  return ctx;
}
