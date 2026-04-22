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
type Aliment = { id_aliment: string; nom: string };

export default function JournalPage() {
  const { token, profile } = useAuth();
  const [users, setUsers] = useState<PickUser[]>([]);
  const [aliments, setAliments] = useState<Aliment[]>([]);
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

  const [dateEntree, setDateEntree] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [alimentId, setAlimentId] = useState("");
  const [quantite, setQuantite] = useState("1");

  useEffect(() => {
    if (!token || !profile) return;
    let cancelled = false;
    (async () => {
      try {
        const [u, a] = await Promise.all([
          fetchUsersForPicker(token, profile),
          apiFetch<Aliment[]>("/aliments", { token }),
        ]);
        if (cancelled) return;
        setUsers(u);
        setAliments(Array.isArray(a) ? a : []);
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
    if (aliments.length && !alimentId) setAlimentId(aliments[0].id_aliment);
  }, [aliments, alimentId]);

  useEffect(() => {
    if (!token || !userId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<Row[]>("/journal", {
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
    if (!token || !userId || !alimentId) return;
    setErr(null);
    setMsg(null);
    try {
      const q = parseFloat(quantite);
      if (!q || q <= 0) throw new Error("Quantité invalide");
      await apiFetch("/journal", {
        method: "POST",
        token,
        body: JSON.stringify({
          id_utilisateur: userId,
          id_aliment: alimentId,
          quantite: q,
          date_consommation: new Date(dateEntree).toISOString(),
        }),
      });
      setMsg("Entrée enregistrée.");
      const data = await apiFetch<Row[]>("/journal", {
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
      <div className="text-zinc-500">
        Aucun utilisateur disponible pour le journal.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">📔 Journal alimentaire</h1>
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

      <JsonTable rows={rows} columns={[]} emptyMessage="Aucune entrée pour cette période" />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 max-w-xl space-y-3">
        <h2 className="text-white font-medium text-sm">Ajouter une entrée</h2>
        {!aliments.length ? (
          <p className="text-zinc-500 text-sm">Aucun aliment en base.</p>
        ) : (
          <form onSubmit={onAdd} className="space-y-2">
            <input
              type="date"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
              value={dateEntree}
              onChange={(e) => setDateEntree(e.target.value)}
            />
            <select
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
              value={alimentId}
              onChange={(e) => setAlimentId(e.target.value)}
            >
              {aliments.map((a) => (
                <option key={a.id_aliment} value={a.id_aliment}>
                  {a.nom}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.1"
              min="0.1"
              placeholder="Quantité"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm text-white"
            >
              Ajouter
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
