// src/app/register/page.tsx
"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string>("");
  const [ok, setOk] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message ?? "Registrasi gagal");
        return;
      }
      setOk("Registrasi berhasil. Silakan login.");
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      setError("Tidak dapat menghubungi server. Periksa API_BASE atau CORS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-hero">
      <div className="mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 md:grid-cols-2">
        {/* LEFT ILLUSTRATION */}
        <section className="mx-auto hidden w-full max-w-xl md:block">
          <HeroIllustration />
        </section>

        {/* RIGHT CARD */}
        <section className="card w-full max-w-xl md:ml-auto">
          <header className="mb-6">
            <h2 className="text-2xl font-semibold text-[color:var(--color-primary)]">Create your</h2>
            <h1 className="text-4xl font-extrabold tracking-tight text-[color:var(--color-accent)]">
              SBP    Account
            </h1>
          </header>

          {/* Alerts */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {ok && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {ok}
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Nama Lengkap */}
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center">
                <UserIcon className="h-5 w-5 text-[color:var(--color-accent)]" />
              </span>
              <input
                type="text"
                required
                placeholder="Nama Lengkap"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center">
                <MailIcon className="h-5 w-5 text-[color:var(--color-accent)]" />
              </span>
              <input
                type="email"
                required
                placeholder="Email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center">
                <KeyIcon className="h-5 w-5 text-[color:var(--color-accent)]" />
              </span>
              <input
                type={showPwd ? "text" : "password"}
                required
                placeholder="Password"
                className="input pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
              />
              <button
                type="button"
                aria-label={showPwd ? "Sembunyikan password" : "Tampilkan password"}
                onClick={() => setShowPwd((s) => !s)}
                className="absolute inset-y-0 right-2.5 my-1.5 inline-flex items-center justify-center rounded-lg px-2.5
                           text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-secondary)]/60
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/40"
              >
                {showPwd ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Memproses..." : "Register"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-[color:var(--color-primary)]/70">
            Sudah punya akun?{" "}
            <a
              href="/"
              className="font-semibold text-[color:var(--color-accent)] underline-offset-4 hover:underline"
            >
              Login
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}

/* ---------------- Icons & Illustration (inline, no deps) ---------------- */

function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="8" r="3.5" fill="currentColor" />
      <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
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
      <path d="M8 14a4 4 0 1 1 5.66 3.58L18 22l2-2-2-2 2-2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    </svg>
  );
}
function EyeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
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
  // Ilustrasi konsisten dengan palette baru
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
      <rect x="200" y="90" width="220" height="360" rx="28" fill="url(#g1)" stroke="#667081" strokeWidth="3"/>
      <rect x="230" y="170" width="160" height="36" rx="8" fill="#ffffff" opacity=".9"/>
      <rect x="230" y="220" width="160" height="36" rx="8" fill="#ffffff" opacity=".9"/>
      <rect x="260" y="310" width="100" height="36" rx="10" fill="#ffffff" opacity=".85"/>
      <path d="M80 420c40-80 120-50 150-20" fill="none" stroke="#567AAA" strokeWidth="6" opacity=".4"/>
      <circle cx="120" cy="120" r="18" fill="#ffffff" />
      <path d="M112 120h16" stroke="#567AAA" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}
