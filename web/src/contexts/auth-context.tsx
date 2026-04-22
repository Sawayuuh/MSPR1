"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { readToken, writeToken } from "@/lib/auth-storage";

export type UserProfile = {
  email?: string;
  id_utilisateur?: string;
  app_role?: string;
  type_abonnement?: string;
  prenom?: string | null;
  nom?: string | null;
  age?: number | null;
  sexe?: string | null;
  poids?: number | null;
  taille?: number | null;
  objectifs?: string[];
};

type AuthState = {
  token: string | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    prenom?: string,
    nom?: string,
  ) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<UserProfile | null>;
  setAuthError: (msg: string | null) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const applyProfileError = useCallback((err: unknown) => {
    const s = err instanceof Error ? err.message : String(err);
    if (
      s.includes("401") ||
      s.includes("403") ||
      /invalide|expir/i.test(s)
    ) {
      setAuthError(
        "Session rejetée par l’API — vérifiez que JWT_SECRET dans `.env` correspond au secret JWT Supabase, puis redémarrez le conteneur `api`.",
      );
    } else {
      setAuthError(`Impossible de charger le profil : ${s}`);
    }
    writeToken(null);
    setToken(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    const t = readToken();
    if (!t) {
      setProfile(null);
      return null;
    }
    try {
      const p = await apiFetch<UserProfile>("/auth/me", { token: t });
      setProfile(p);
      setAuthError(null);
      return p;
    } catch (e) {
      applyProfileError(e);
      return null;
    }
  }, [applyProfileError]);

  useEffect(() => {
    const t = readToken();
    setToken(t);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    (async () => {
      if (!token) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const p = await apiFetch<UserProfile>("/auth/me", { token });
        if (!cancelled) {
          setProfile(p);
          setAuthError(null);
        }
      } catch (e) {
        if (!cancelled) applyProfileError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, token, applyProfileError]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    const r = await apiFetch<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
      skipAuth: true,
    });
    writeToken(r.access_token);
    setToken(r.access_token);
  }, []);

  const register = useCallback(
    async (email: string, password: string, prenom?: string, nom?: string) => {
      setAuthError(null);
      const payload: Record<string, string> = {
        email: email.trim(),
        password,
      };
      if (prenom?.trim()) payload.prenom = prenom.trim();
      if (nom?.trim()) payload.nom = nom.trim();

      const res = await apiFetch<{
        access_token?: string;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
        skipAuth: true,
      });

      let t = res.access_token;
      if (!t) {
        const loginRes = await apiFetch<{ access_token: string }>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({ email: email.trim(), password }),
            skipAuth: true,
          },
        );
        t = loginRes.access_token;
      }
      if (!t) {
        throw new Error(
          "Inscription enregistrée mais aucun jeton reçu — utilisez l’onglet Connexion.",
        );
      }
      writeToken(t);
      setToken(t);
    },
    [],
  );

  const logout = useCallback(() => {
    writeToken(null);
    setToken(null);
    setProfile(null);
    setAuthError(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      profile,
      loading,
      authError,
      login,
      register,
      logout,
      refreshProfile,
      setAuthError,
    }),
    [
      token,
      profile,
      loading,
      authError,
      login,
      register,
      logout,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }
  return ctx;
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
