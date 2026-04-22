"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api";
import {
  fetchUsersForPicker,
  labelUser,
  type PickUser,
} from "@/lib/picker-users";
import { JsonTable } from "@/components/json-table";

type Row = Record<string, unknown>;

export default function SessionsPage() {
  const { token, profile } = useAuth();
  const [users, setUsers] = useState<PickUser[]>([]);
  const [userId, setUserId] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [dateDebut, setDateDebut] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [dateFin, setDateFin] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  const [dateSession, setDateSession] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [duree, setDuree] = useState("30");
  const [intensite, setIntensite] = useState<
    "faible" | "moderee" | "elevee"
  >("moderee");

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

  useEffect(() => {
    if (!token || !userId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<Row[]>("/sessions", {
          token,
          params: {
            utilisateur_id: userId,
            date_debut: dateDebut,
            date_fin: dateFin,
          },
        });
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, userId, dateDebut, dateFin]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !userId) return;
    setErr(null);
    setMsg(null);
    try {
      const d = parseInt(duree, 10);
      if (!d || d < 1) throw new Error("Durée invalide");
      await apiFetch("/sessions", {
        method: "POST",
        token,
        body: JSON.stringify({
          id_utilisateur: userId,
          duree: d,
          intensite,
          date_session: new Date(dateSession).toISOString(),
        }),
      });
      setMsg("Session enregistrée.");
      const data = await apiFetch<Row[]>("/sessions", {
        token,
        params: {
          utilisateur_id: userId,
          date_debut: dateDebut,
          date_fin: dateFin,
        },
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    }
  }

  if (!users.length) {
    return (
      <div className="text-zinc-500">Aucun utilisateur pour les sessions.</div>
    );
  }

  const cols = ["date_session", "duree", "intensite", "created_at"];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">🏃 Sessions sport</h1>
      {err && <p className="text-sm text-red-400">{err}</p>}
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Utilisateur</label>
          <select
            className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white min-w-[200px]"
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
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Date début</label>
          <input
            type="date"
            className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Date fin</label>
          <input
            type="date"
            className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />
        </div>
      </div>

      <JsonTable rows={rows} columns={cols} emptyMessage="Aucune session sur la période" />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 max-w-xl space-y-3">
        <h2 className="text-white font-medium text-sm">Nouvelle session</h2>
        <p className="text-xs text-zinc-500">
          Champs alignés sur le schéma API (<code className="text-zinc-400">duree</code>,{" "}
          <code className="text-zinc-400">intensite</code>,{" "}
          <code className="text-zinc-400">date_session</code>).
        </p>
        <form onSubmit={onAdd} className="space-y-2">
          <input
            type="date"
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
            value={dateSession}
            onChange={(e) => setDateSession(e.target.value)}
          />
          <input
            type="number"
            min={1}
            placeholder="Durée (minutes)"
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
            value={duree}
            onChange={(e) => setDuree(e.target.value)}
          />
          <select
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
            value={intensite}
            onChange={(e) =>
              setIntensite(e.target.value as "faible" | "moderee" | "elevee")
            }
          >
            <option value="faible">faible</option>
            <option value="moderee">moderee</option>
            <option value="elevee">elevee</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm text-white"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}
