"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { fetchAll } from "@/lib/fetch-all";

type Counts = {
  utilisateurs: number;
  aliments: number;
  exercices: number;
  mesures: number;
  journal: number;
  sessions: number;
};

export default function AnalyticsPage() {
  const { token, profile } = useAuth();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token || profile?.app_role !== "admin") return;
    let cancelled = false;
    (async () => {
      try {
        const [u, a, e, m, j, s] = await Promise.all([
          fetchAll<unknown>("/utilisateurs", token),
          fetchAll<unknown>("/aliments", token),
          fetchAll<unknown>("/exercices", token),
          fetchAll<unknown>("/mesures", token),
          fetchAll<unknown>("/journal", token),
          fetchAll<unknown>("/sessions", token),
        ]);
        if (!cancelled) {
          setCounts({
            utilisateurs: u.length,
            aliments: a.length,
            exercices: e.length,
            mesures: m.length,
            journal: j.length,
            sessions: s.length,
          });
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, profile?.app_role]);

  if (profile?.app_role !== "admin") {
    return (
      <div className="text-red-400">
        Analytics réservé aux administrateurs.
      </div>
    );
  }

  const items = counts
    ? [
        ["Utilisateurs", counts.utilisateurs],
        ["Aliments", counts.aliments],
        ["Exercices", counts.exercices],
        ["Mesures", counts.mesures],
        ["Entrées journal", counts.journal],
        ["Sessions", counts.sessions],
      ]
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">📈 Analytics</h1>
      <p className="text-sm text-zinc-500">
        Totaux approximatifs (pagination agrégée côté client, limite 2000 par
        ressource).
      </p>
      {err && <p className="text-sm text-red-400">{err}</p>}
      {!counts && !err && (
        <p className="text-zinc-500">Chargement des agrégats…</p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(([label, n]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <div className="text-zinc-500 text-sm">{label}</div>
            <div className="text-3xl font-bold text-violet-300 mt-1">{n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
