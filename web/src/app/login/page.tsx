"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, isApiError } from "@/contexts/auth-context";

export default function LoginPage() {
  const { token, profile, loading, login, register } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [password2, setPassword2] = useState("");

  useEffect(() => {
    if (!loading && token && profile) {
      router.replace("/");
    }
  }, [loading, token, profile, router]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email || !password) {
      setErr("Saisissez l’email et le mot de passe.");
      return;
    }
    setPending(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (ex) {
      setErr(isApiError(ex) ? ex.message : String(ex));
    } finally {
      setPending(false);
    }
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email || !password) {
      setErr("Email et mot de passe obligatoires.");
      return;
    }
    if (password !== password2) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }
    setPending(true);
    try {
      await register(email, password, prenom, nom);
      router.replace("/");
    } catch (ex) {
      setErr(isApiError(ex) ? ex.message : String(ex));
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">💪</div>
          <h1 className="text-xl font-bold text-white">HealthAI Coach</h1>
          <p className="text-sm text-zinc-500 mt-1">Connexion à l’application</p>
        </div>

        <div className="flex rounded-lg bg-zinc-950 p-1 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              tab === "login"
                ? "bg-violet-600 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            onClick={() => setTab("login")}
          >
            Se connecter
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              tab === "register"
                ? "bg-violet-600 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            onClick={() => setTab("register")}
          >
            Créer un compte
          </button>
        </div>

        {err && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
            {err}
          </div>
        )}

        {tab === "login" ? (
          <form onSubmit={onLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Email</label>
              <input
                type="email"
                autoComplete="email"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium"
            >
              {pending ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        ) : (
          <form onSubmit={onRegister} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Email *</label>
              <input
                type="email"
                required
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Prénom</label>
                <input
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Nom</label>
                <input
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                Mot de passe *
              </label>
              <input
                type="password"
                required
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                Confirmer *
              </label>
              <input
                type="password"
                required
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium"
            >
              {pending ? "Création…" : "Créer mon compte"}
            </button>
          </form>
        )}

        <p className="mt-6 text-xs text-zinc-600 text-center">
          API et Supabase doivent être accessibles. JWT_SECRET côté API = secret
          JWT du projet Supabase.
        </p>
      </div>
    </div>
  );
}
