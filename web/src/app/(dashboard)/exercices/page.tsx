"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api";
import { JsonTable } from "@/components/json-table";

type Row = Record<string, unknown>;

export default function ExercicesPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<Row[]>("/exercices", { token });
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const cols = ["nom", "type", "groupe_musculaire", "niveau", "equipement"];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">🏋️ Exercices</h1>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <JsonTable rows={rows} columns={cols} />
    </div>
  );
}
