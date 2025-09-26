"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type TokenResponse = {
  token: string;
  user: { id: number; name: string; email: string };
};

export default function Page() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const canCheck = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  const probeLicenseFlow = async (address: string) => {
    const r = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: address, password: "" }),
    });
    const d = await r.json().catch(() => ({} as any));
    if (r.status === 202 && d?.license_required) {
      router.push(`/verifikasipengguna?email=${encodeURIComponent(address)}`);
      return true;
    }
    return false;
  };

  const checkEmail = async () => {
    setError("");
    if (!canCheck) {
      setError("Masukkan email yang valid");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/auth/check-email?email=${encodeURIComponent(email)}`, {
        method: "GET",
        cache: "no-store",
      });
      const d = await r.json().catch(() => ({} as any));
      if (!r.ok) {
        setError(d?.message ?? "Gagal memeriksa email");
        return;
      }
      if (!d?.exists) {
        setError("Email belum terdaftar. Hubungi admin untuk dibuatkan akun.");
        return;
      }
      const redirected = await probeLicenseFlow(email);
      if (!redirected) setStep("password");
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: Partial<TokenResponse & { license_required?: boolean; email?: string }> = await res
        .json()
        .catch(() => ({} as any));

      if (res.status === 202 && (data as any)?.license_required) {
        router.push(`/verifikasipengguna?email=${encodeURIComponent(email)}`);
        return;
      }

      if (!res.ok) {
        setError((data as any)?.message ?? "Login gagal");
        return;
      }
      if (!data?.token || !data?.user) {
        setError("Format respons tidak sesuai");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ name: data.user.name, email: data.user.email }));
      localStorage.setItem("loggedInAt", new Date().toISOString());

      router.push("/dashboard");
    } catch {
      setError("Tidak dapat menghubungi server. Periksa API_BASE atau CORS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-hero">
      <div className="mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 md:grid-cols-2">
        <section className="mx-auto hidden w-full max-w-xl md:block">
          <HeroIllustration />
        </section>

        <section className="card w-full max-w-xl md:ml-auto">
          <header className="mb-6">
            <h2 className="text-2xl font-semibold text-[color:var(--color-primary)]">Welcome to</h2>
            <h1 className="text-4xl font-extrabold tracking-tight text-[color:var(--color-accent)]">SBP App</h1>
          </header>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === "email" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                checkEmail();
              }}
              className="space-y-4"
            >
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center">
                  <MailIcon className="h-5 w-5 text-[color:var(--color-accent)]" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="example@gmail.com"
                  autoComplete="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Memeriksa…" : "Lanjut"}
              </button>
              <p className="text-xs text-gray-500">Masukkan email Anda terlebih dahulu.</p>
            </form>
          )}

          {step === "password" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                login();
              }}
              className="space-y-4"
            >
              <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">{email}</div>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center">
                  <KeyIcon className="h-5 w-5 text-[color:var(--color-accent)]" />
                </span>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-2.5 my-1.5 inline-flex items-center justify-center rounded-lg px-2.5
                             text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-secondary)]/60
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/40"
                >
                  {showPwd ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Memproses…" : "Masuk"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

function MailIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor" opacity=".15" />
      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
function KeyIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M8 14a4 4 0 1 1 5.66 3.58L18 22l2-2-2-2 2-2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    </svg>
  );
}
function EyeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}
function EyeOffIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2.5 12S6 6.5 12 6.5c2.1 0 4 .5 5.6 1.3M21.5 12S18 17.5 12 17.5c-2.1 0-4-.5-5.6-1.3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
function HeroIllustration() {
  return (
    <svg viewBox="0 0 640 520" className="w-full">
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0" stopColor="#D8EBF4" />
          <stop offset="1" stopColor="#567AAA" />
        </linearGradient>
      </defs>
      <rect x="40" y="60" width="560" height="400" rx="200" fill="#D8EBF4" />
      <circle cx="120" cy="120" r="36" fill="#E9B1B1" />
      <rect x="200" y="90" width="220" height="360" rx="28" fill="url(#g1)" stroke="#667081" strokeWidth="3" />
      <rect x="230" y="170" width="160" height="36" rx="8" fill="#ffffff" opacity=".9" />
      <rect x="230" y="220" width="160" height="36" rx="8" fill="#ffffff" opacity=".9" />
      <rect x="260" y="310" width="100" height="36" rx="10" fill="#ffffff" opacity=".85" />
      <path d="M80 420c40-80 120-50 150-20" fill="none" stroke="#567AAA" strokeWidth="6" opacity=".4" />
      <circle cx="120" cy="120" r="18" fill="#ffffff" />
      <path d="M112 120h16" stroke="#567AAA" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
