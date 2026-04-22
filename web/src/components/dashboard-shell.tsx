"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const nav = [
  { href: "/", label: "Accueil", icon: "🏠" },
  { href: "/profil", label: "Mon profil", icon: "🙋" },
  { href: "/utilisateurs", label: "Utilisateurs", icon: "👤", admin: true },
  { href: "/aliments", label: "Aliments", icon: "🍎" },
  { href: "/exercices", label: "Exercices", icon: "🏋️" },
  { href: "/journal", label: "Journal alimentaire", icon: "📔" },
  { href: "/sessions", label: "Sessions sport", icon: "🏃" },
  { href: "/mesures", label: "Mesures", icon: "📊" },
  { href: "/analytics", label: "Analytics", icon: "📈", admin: true },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, logout } = useAuth();
  const isAdmin = profile?.app_role === "admin";

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100">
      <aside className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-900/80 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <div className="text-2xl text-center mb-1">💪</div>
          <div className="font-bold text-center text-sm">HealthAI Coach</div>
          <div className="text-[10px] text-zinc-500 text-center">MSPR — interface web</div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {nav
            .filter((item) => !item.admin || isAdmin)
            .map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-violet-600/25 text-violet-200 border border-violet-500/30"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
        </nav>
        <div className="p-3 border-t border-zinc-800 text-xs text-zinc-500 space-y-2">
          <div>
            <div className="text-zinc-400 font-medium truncate">
              {profile?.email ?? "—"}
            </div>
            <div>
              Rôle : {isAdmin ? "🛡️ Admin" : "👤 Utilisateur"}
            </div>
            <div>
              Plan :{" "}
              {profile?.type_abonnement === "freemium" || !profile?.type_abonnement
                ? "Gratuit"
                : profile.type_abonnement}
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full rounded-md bg-zinc-800 py-2 text-zinc-200 hover:bg-zinc-700 text-xs"
          >
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
