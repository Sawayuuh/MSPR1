"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api";
import { JsonTable } from "@/components/json-table";

type Row = Record<string, unknown>;

export default function AlimentsPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [nom, setNom] = useState("");
  const [calories, setCalories] = useState("0");
  const [proteines, setProteines] = useState("0");
  const [glucides, setGlucides] = useState("0");
  const [lipides, setLipides] = useState("0");
  const [fibres, setFibres] = useState("0");
  const [unite, setUnite] = useState("100g");
  const [source, setSource] = useState("manuel");

  const reload = useCallback(async () => {
    if (!token) return;
    const data = await apiFetch<Row[]>("/aliments", { token });
    setRows(Array.isArray(data) ? data : []);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, reload]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !nom.trim()) return;
    setErr(null);
    setMsg(null);
    try {
      await apiFetch("/aliments", {
        method: "POST",
        token,
        body: JSON.stringify({
          nom: nom.trim(),
          calories: parseFloat(calories) || 0,
          proteines: parseFloat(proteines) || 0,
          glucides: parseFloat(glucides) || 0,
          lipides: parseFloat(lipides) || 0,
          fibres: parseFloat(fibres) || 0,
          unite,
          source,
        }),
      });
      setMsg("Aliment ajouté.");
      setNom("");
      await reload();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    }
  }

  const cols = [
    "nom",
    "calories",
    "proteines",
    "glucides",
    "lipides",
    "fibres",
    "unite",
    "source",
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">🍎 Aliments</h1>
      {err && <p className="text-sm text-red-400">{err}</p>}
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 max-w-xl space-y-3">
        <h2 className="text-white font-medium text-sm">Ajouter un aliment</h2>
        <form onSubmit={onAdd} className="space-y-2">
          <input
            placeholder="Nom *"
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="Calories"
              className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
            <input
              type="number"
              step="0.1"
              placeholder="Protéines"
              className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
              value={proteines}
              onChange={(e) => setProteines(e.target.value)}
            />
            <input
              type="number"
              step="0.1"
              placeholder="Glucides"
              className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
              value={glucides}
              onChange={(e) => setGlucides(e.target.value)}
            />
            <input
              type="number"
              step="0.1"
              placeholder="Lipides"
              className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
              value={lipides}
              onChange={(e) => setLipides(e.target.value)}
            />
            <input
              type="number"
              step="0.1"
              placeholder="Fibres"
              className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
              value={fibres}
              onChange={(e) => setFibres(e.target.value)}
            />
            <input
              placeholder="Unité"
              className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
              value={unite}
              onChange={(e) => setUnite(e.target.value)}
            />
          </div>
          <input
            placeholder="Source"
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm text-white"
          >
            Ajouter
          </button>
        </form>
      </div>

      <JsonTable rows={rows} columns={cols} />
    </div>
  );
}
