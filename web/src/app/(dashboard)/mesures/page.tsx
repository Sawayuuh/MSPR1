"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api";
import {
  fetchUsersForPicker,
  labelUser,
  type PickUser,
} from "@/lib/picker-users";
import { JsonTable } from "@/components/json-table";

type Row = Record<string, unknown>;

export default function MesuresPage() {
  const { token, profile } = useAuth();
  const [users, setUsers] = useState<PickUser[]>([]);
  const [userId, setUserId] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [poids, setPoids] = useState("70");
  const [fc, setFc] = useState("70");
  const [sommeil, setSommeil] = useState("7");
  const [calories, setCalories] = useState("0");

  useEffect(() => {
    if (!token || !profile) return;
    let cancelled = false;
    (async () => {
      try {
        const u = await fetchUsersForPicker(token, profile);
        if (cancelled) return;
        setUsers(u);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, profile]);

  useEffect(() => {
    if (users.length && !userId) setUserId(users[0].id_utilisateur);
  }, [users, userId]);

  const loadMesures = useCallback(
    async (uid: string) => {
      if (!token || !uid) return;
      const data = await apiFetch<Row[]>("/mesures", {
        token,
        params: { utilisateur_id: uid, limit: 200 },
      });
      setRows(Array.isArray(data) ? data : []);
    },
    [token],
  );

  useEffect(() => {
    if (!token || !userId) return;
    let cancelled = false;
    (async () => {
      try {
        await loadMesures(userId);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, userId, loadMesures]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !userId) return;
    setErr(null);
    setMsg(null);
    try {
      const p = parseFloat(poids);
      const f = parseInt(fc, 10);
      const s = parseFloat(sommeil);
      const c = parseFloat(calories);
      await apiFetch("/mesures", {
        method: "POST",
        token,
        body: JSON.stringify({
          id_utilisateur: userId,
          poids: p > 0 ? p : null,
          frequence_cardiaque: f > 0 ? f : null,
          sommeil: s > 0 ? s : null,
          calories_brulees: c > 0 ? c : null,
        }),
      });
      setMsg("Mesure enregistrée.");
      await loadMesures(userId);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    }
  }

  if (!users.length) {
    return (
      <div className="text-zinc-500">Aucun utilisateur pour les mesures.</div>
    );
  }

  const cols = [
    "date_mesure",
    "poids",
    "frequence_cardiaque",
    "sommeil",
    "calories_brulees",
  ];

  const sorted = [...rows].sort((a, b) => {
    const da = String(a.date_mesure ?? "");
    const db = String(b.date_mesure ?? "");
    return db.localeCompare(da);
  });
  const derniere = sorted[0];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">📊 Mesures biométriques</h1>
      {err && <p className="text-sm text-red-400">{err}</p>}
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}

      <div>
        <label className="text-xs text-zinc-500 block mb-1">Utilisateur</label>
        <select
          className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white min-w-[240px]"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >
          {users.map((u) => (
            <option key={u.id_utilisateur} value={u.id_utilisateur}>
              {labelUser(u)}
            </option>
          ))}
        </select>
      </div>

      {derniere && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(
            [
              ["Poids (kg)", derniere.poids],
              ["FC (bpm)", derniere.frequence_cardiaque],
              ["Sommeil (h)", derniere.sommeil],
              ["Calories", derniere.calories_brulees],
            ] as [string, unknown][]
          ).map(([label, val]) => (
            <div
              key={label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <div className="text-xs text-zinc-500">{label}</div>
              <div className="text-lg font-semibold text-white">
                {val != null ? String(val) : "—"}
              </div>
            </div>
          ))}
        </div>
      )}

      <JsonTable
        rows={sorted}
        columns={cols}
        emptyMessage="Aucune mesure pour cet utilisateur"
      />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 max-w-xl space-y-3">
        <h2 className="text-white font-medium text-sm">Nouvelle mesure</h2>
        <form onSubmit={onAdd} className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="0.1"
            placeholder="Poids kg"
            className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
          />
          <input
            type="number"
            placeholder="Fréq. cardiaque"
            className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
            value={fc}
            onChange={(e) => setFc(e.target.value)}
          />
          <input
            type="number"
            step="0.5"
            placeholder="Sommeil h"
            className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
            value={sommeil}
            onChange={(e) => setSommeil(e.target.value)}
          />
          <input
            type="number"
            step="1"
            placeholder="Calories brûlées"
            className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
          <button
            type="submit"
            className="col-span-2 rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm text-white"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}
