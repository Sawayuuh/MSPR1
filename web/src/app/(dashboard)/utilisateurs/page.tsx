"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api";
import { JsonTable } from "@/components/json-table";

type Row = Record<string, unknown>;

export default function UtilisateursPage() {
  const { token, profile } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token || profile?.app_role !== "admin") return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<Row[]>("/utilisateurs", { token });
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
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
        Cette page est réservée aux administrateurs.
      </div>
    );
  }

  const cols = [
    "nom",
    "prenom",
    "email",
    "age",
    "sexe",
    "poids",
    "taille",
    "type_abonnement",
    "app_role",
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">👤 Utilisateurs</h1>
      {err && (
        <p className="text-sm text-red-400">{err}</p>
      )}
      <JsonTable rows={rows} columns={cols} />
    </div>
  );
}
