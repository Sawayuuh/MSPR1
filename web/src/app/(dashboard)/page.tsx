"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api";

type Stats = { utilisateurs: number; aliments: number; exercices: number };

export default function HomePage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats>({
    utilisateurs: 0,
    aliments: 0,
    exercices: 0,
  });
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      const next: Stats = { utilisateurs: 0, aliments: 0, exercices: 0 };
      let ok = true;
      for (const [key, path] of [
        ["utilisateurs", "/utilisateurs"],
        ["aliments", "/aliments"],
        ["exercices", "/exercices"],
      ] as const) {
        try {
          const rows = await apiFetch<unknown[]>(path, { token });
          next[key] = Array.isArray(rows) ? rows.length : 0;
        } catch {
          ok = false;
        }
      }
      if (!cancelled) {
        setStats(next);
        setApiOk(ok);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const cards = [
    { icon: "👥", value: stats.utilisateurs, label: "Utilisateurs" },
    { icon: "🍎", value: stats.aliments, label: "Aliments" },
    { icon: "🏋️", value: stats.exercices, label: "Exercices" },
  ];

  return (
    <div className="space-y-8">
      <div
        className="rounded-2xl p-8 text-center text-white shadow-lg"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 12px 48px rgba(102,126,234,0.35)",
        }}
      >
        <div className="text-4xl mb-2">💪</div>
        <h1 className="text-3xl font-extrabold">HealthAI Coach</h1>
        <p className="text-white/90 mt-2 max-w-xl mx-auto">
          Plateforme de coaching santé — données métier via l’API FastAPI.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1 text-sm font-semibold">
          {apiOk === null
            ? "…"
            : apiOk
              ? "● Système opérationnel"
              : "● API partiellement indisponible"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-2xl font-bold text-white">{c.value}</div>
            <div className="text-sm text-zinc-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          Navigation rapide
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/utilisateurs"
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm hover:border-violet-500/40 transition-colors"
          >
            👤 Utilisateurs
          </Link>
          <Link
            href="/aliments"
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm hover:border-violet-500/40 transition-colors"
          >
            🍎 Aliments
          </Link>
          <Link
            href="/exercices"
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm hover:border-violet-500/40 transition-colors"
          >
            🏋️ Exercices
          </Link>
        </div>
      </div>

      <div className="text-xs text-zinc-600 border-t border-zinc-800 pt-6 space-y-1">
        <div>
          <a
            href="http://localhost:8002/docs"
            className="text-violet-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Swagger UI
          </a>
          {" · "}
          <a
            href="http://localhost:54323"
            className="text-violet-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Supabase Studio
          </a>
        </div>
      </div>
    </div>
  );
}
