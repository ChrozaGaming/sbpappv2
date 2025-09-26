"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function VerifyPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const initialEmail = useMemo(() => sp.get("email") ?? "", [sp]);

  const [email, setEmail] = useState(initialEmail);
  const [key, setKey] = useState("");
  const [step, setStep] = useState<"verify" | "setpwd">("verify");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/license/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), key: key.trim() }),
      });
      const d = await r.json().catch(() => ({} as any));
      if (!r.ok) {
        setMsg(d?.message ?? "Verifikasi lisensi gagal");
        return;
      }
      if (!d?.token || !d?.user) {
        setMsg("Format respons tidak sesuai");
        return;
      }
      localStorage.setItem("token", d.token);
      localStorage.setItem("user", JSON.stringify({ name: d.user.name, email: d.user.email }));
      setStep("setpwd");
    } catch {
      setMsg("Tidak dapat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const setNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (password.length < 6) {
      setMsg("Password minimal 6 karakter");
      return;
    }
    if (password !== confirm) {
      setMsg("Konfirmasi password tidak sama");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token") ?? "";
      const r = await fetch(`${API_BASE}/api/auth/set-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password }),
      });
      const d = await r.json().catch(() => ({} as any));
      if (!r.ok) {
        setMsg(d?.message ?? "Gagal menyimpan password");
        return;
      }
      router.push("/dashboard");
    } catch {
      setMsg("Tidak dapat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-md px-4 py-10">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-xl font-semibold text-gray-900">Verifikasi Pengguna</h1>
          <p className="mt-1 text-sm text-gray-500">Masukkan license key untuk melanjutkan.</p>

          {msg && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {msg}
            </div>
          )}

          {step === "verify" && (
            <form onSubmit={verify} className="mt-5 space-y-4">
              <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">{email || "—"}</div>
              <input type="hidden" value={email} readOnly />
              <div>
                <label className="mb-1 block text-sm text-gray-600">License Key</label>
                <input
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="32 karakter heksadesimal"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {loading ? "Memproses…" : "Verifikasi"}
              </button>
            </form>
          )}

          {step === "setpwd" && (
            <>
              <div className="mt-5 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">{email}</div>
              <form onSubmit={setNewPassword} className="mt-3 space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Password Baru</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-gray-300"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Konfirmasi Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-gray-300"
                    placeholder="Ulangi password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                >
                  {loading ? "Menyimpan…" : "Simpan Password & Masuk"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
