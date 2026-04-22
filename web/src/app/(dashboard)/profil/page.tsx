"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch } from "@/lib/api";

const OBJECTIFS = [
  "perte de poids",
  "musculation",
  "forme",
  "cardio",
  "flexibilité",
  "endurance",
];

export default function ProfilPage() {
  const { token, profile, refreshProfile } = useAuth();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [poids, setPoids] = useState("");
  const [taille, setTaille] = useState("");
  const [objectifs, setObjectifs] = useState<string[]>([]);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setPrenom(profile.prenom ?? "");
    setNom(profile.nom ?? "");
    setAge(profile.age != null && profile.age > 0 ? String(profile.age) : "");
    setSexe(profile.sexe ?? "");
    setPoids(
      profile.poids != null && profile.poids > 0 ? String(profile.poids) : "",
    );
    setTaille(
      profile.taille != null && profile.taille > 0
        ? String(profile.taille)
        : "",
    );
    setObjectifs(
      Array.isArray(profile.objectifs) ? [...profile.objectifs] : [],
    );
    setPremium(
      (profile.type_abonnement ?? "freemium").toLowerCase() === "premium",
    );
  }, [profile]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setErr(null);
    setMsg(null);
    setSaving(true);
    const ageN = parseInt(age, 10);
    const poidsN = parseFloat(poids);
    const tailleN = parseFloat(taille);
    const payload: Record<string, unknown> = {
      prenom: prenom.trim() || null,
      nom: nom.trim() || null,
      objectifs,
      type_abonnement: premium ? "premium" : "freemium",
      age: ageN > 0 ? ageN : null,
      sexe: sexe || null,
      poids: !Number.isNaN(poidsN) && poidsN > 0 ? poidsN : null,
      taille: !Number.isNaN(tailleN) && tailleN > 0 ? tailleN : null,
    };
    try {
      await apiFetch("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
        token,
      });
      await refreshProfile();
      setMsg("Profil enregistré.");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : String(ex));
    } finally {
      setSaving(false);
    }
  }

  function toggleObjectif(o: string) {
    setObjectifs((prev) =>
      prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o],
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">🙋 Mon profil</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Mise à jour via <code className="text-zinc-400">PATCH /api/v1/auth/me</code>
        </p>
      </div>

      {msg && (
        <div className="text-sm text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-lg px-3 py-2">
          {msg}
        </div>
      )}
      {err && (
        <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
          <h2 className="text-white font-medium">Informations personnelles</h2>
          <div>
            <label className="text-xs text-zinc-500">Email (lecture seule)</label>
            <input
              disabled
              className="mt-1 w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-500"
              value={profile?.email ?? ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500">Prénom</label>
              <input
                className="mt-1 w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Nom</label>
              <input
                className="mt-1 w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500">Âge (0 = non renseigné)</label>
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Sexe</label>
              <select
                className="mt-1 w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={sexe}
                onChange={(e) => setSexe(e.target.value)}
              >
                <option value="">(non indiqué)</option>
                <option value="M">M</option>
                <option value="F">F</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500">Poids (kg)</label>
              <input
                type="number"
                step="0.1"
                className="mt-1 w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={poids}
                onChange={(e) => setPoids(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Taille (cm)</label>
              <input
                type="number"
                step="0.1"
                className="mt-1 w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={taille}
                onChange={(e) => setTaille(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <h2 className="text-white font-medium">Objectifs</h2>
          <div className="flex flex-wrap gap-2">
            {OBJECTIFS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => toggleObjectif(o)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  objectifs.includes(o)
                    ? "bg-violet-600/30 border-violet-500 text-violet-200"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <h2 className="text-white font-medium">Formule</h2>
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={premium}
              onChange={(e) => setPremium(e.target.checked)}
            />
            Premium (démo — pas de paiement)
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-6 py-2.5 text-sm font-medium text-white"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
