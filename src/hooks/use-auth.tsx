"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { TinyAuth, type TinyUser } from "@/lib/tinyauth";

interface AuthContextValue {
  user: TinyUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  deleteAccount: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TinyUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate from localStorage on mount
    setUser(TinyAuth.getCurrentUser());
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (email: string, password: string) => {
        const u = await TinyAuth.signIn(email, password);
        setUser(u);
      },
      signUp: async (email: string, password: string) => {
        const u = await TinyAuth.signUp(email, password);
        setUser(u);
      },
      signOut: () => {
        TinyAuth.signOut();
        setUser(null);
      },
      deleteAccount: () => {
        if (user) {
          TinyAuth.deleteAccount(user.id);
          setUser(null);
        }
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
