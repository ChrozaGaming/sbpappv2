// src/app/superadmin/create-absensi/page.tsx
"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";

export default function CreateAbsensiPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"hadir" | "telat" | "izin">("hadir");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState<{ lat?: number; lng?: number }>({});
  const [serverOk, setServerOk] = useState<boolean | null>(null); // null=checking, true=ok, false=down

  // Health check (dengan abort yang rapi + tanpa warning)
  useEffect(() => {
    let mounted = true;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort("timeout"), 4000);

    (async () => {
      try {
        const r = await fetch(`${API_BASE}/health`, {
          method: "GET",
          signal: ctrl.signal,
          cache: "no-store",
        });
        if (mounted) setServerOk(r.ok);
      } catch (err: any) {
        if (err?.name !== "AbortError" && mounted) setServerOk(false);
      } finally {
        clearTimeout(timer);
      }
    })();

    return () => {
      mounted = false;
      clearTimeout(timer);
      ctrl.abort("unmount");
    };
  }, []);

  // Lokasi (opsional)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setPos({})
    );
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // Jika server down → langsung kasih notifikasi yang diminta
      if (serverOk === false) {
        setMessage("Anda harus masuk ke Wi-Fi Kantor pada perangkat Anda.");
        return;
      }

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const tanggal_absensi = `${now.getFullYear()}-${pad(
        now.getMonth() + 1
      )}-${pad(now.getDate())}`;
      const waktu_absensi = `${tanggal_absensi} ${pad(now.getHours())}:${pad(
        now.getMinutes()
      )}:${pad(now.getSeconds())}`;

      const token = localStorage.getItem("token") ?? "";

      const res = await fetch(`${API_BASE}/api/absensi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tanggal_absensi,
          nama_lengkap: name,
          email,
          waktu_absensi,
          location_device_lat: pos.lat ?? null,
          location_device_lng: pos.lng ?? null,
          status,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Jika backend tolak karena jaringan/IP, tetap tampilkan pesan user-friendly
        const fallback =
          serverOk === false
            ? "Anda harus masuk ke Wi-Fi Kantor pada perangkat Anda."
            : "Gagal membuat absensi";
        setMessage(data?.message ?? fallback);
        return;
      }

      setMessage("✅ Absensi berhasil dibuat!");
      setName("");
      setEmail("");
      setStatus("hadir");
    } catch {
      // Jaringan/CORS: arahkan user ke pesan Wi-Fi kantor
      setMessage("Anda harus masuk ke Wi-Fi Kantor pada perangkat Anda.");
    } finally {
      setLoading(false);
    }
  };

  const formDisabled = loading || serverOk === false;

  return (
    <main className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">
          Create Absensi
        </h1>

        {/* Notifikasi: ganti badge → banner jika server down */}
        {serverOk === false && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Anda harus masuk ke Wi-Fi Kantor pada perangkat Anda.
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
            {message}
          </div>
        )}

        <form
          onSubmit={submit}
          className={`relative space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${
            formDisabled ? "opacity-90" : ""
          }`}
        >
          {formDisabled && (
            <div className="pointer-events-auto absolute inset-0 z-10 rounded-2xl bg-white/60 backdrop-blur-[1px]" />
          )}

          <div className={formDisabled ? "pointer-events-none" : ""}>
            <div className="mb-3">
              <label className="mb-1 block text-sm text-gray-600">
                Nama Lengkap
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-sm text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-sm text-gray-600">Status</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "hadir" | "telat" | "izin")
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="hadir">Hadir</option>
                <option value="telat">Telat</option>
                <option value="izin">Izin</option>
              </select>
            </div>

            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
              Lokasi:{" "}
              {pos.lat ? `${pos.lat.toFixed(5)}, ${pos.lng?.toFixed(5)}` : "—"}
            </div>

            <button
              type="submit"
              disabled={formDisabled}
              className="mt-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              title={serverOk === false ? "Hubungkan ke Wi-Fi Kantor" : ""}
            >
              {loading ? "Memproses..." : "Kirim Absensi"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
