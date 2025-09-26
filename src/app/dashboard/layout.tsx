"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type User = { name?: string; email?: string };

function useWibClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour12: false,
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const tick = () => setNow(fmt.format(new Date()) + " WIB");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useAuthGuard(): User | null {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) throw new Error("invalid token");
        const d = await res.json();
        const u = { name: d?.name, email: d?.email };
        localStorage.setItem("user", JSON.stringify(u));
        setUser(u);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/");
      }
    })();
  }, [router]);

  return user;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthGuard();
  const now = useWibClock();

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/");
  };

  if (!user) {
    return (
      <AppShell>
        <div className="h-24 rounded-2xl bg-gray-200" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <p className="text-sm text-gray-500">Selamat datang</p>
            <h1 className="truncate text-2xl font-semibold leading-tight text-gray-900">
              {user.name && user.name.trim() !== "" ? user.name : "Pengguna"}
            </h1>
            <p className="truncate text-sm text-gray-500">{user.email ?? "email@domain.com"}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-700" aria-hidden>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
              <span className="tabular-nums" suppressHydrationWarning>
                {now || "—"}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              aria-label="Keluar"
              title="Keluar"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path
                  d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9M10 17l5-5-5-5M15 12H3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Keluar
            </button>
          </div>
        </div>
      </section>

      {children}
    </AppShell>
  );
}
