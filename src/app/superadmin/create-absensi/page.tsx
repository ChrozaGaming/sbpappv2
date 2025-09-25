"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://192.168.1.77:8080";

export default function CreateAbsensiPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"hadir"|"telat"|"izin">("hadir");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState<{lat?: number; lng?: number}>({});

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
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const tanggal_absensi = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
      const waktu_absensi = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const token = localStorage.getItem("token") ?? "";

      const res = await fetch(`${API_BASE}/api/absensi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tanggal_absensi,
          "Nama Lengkap": name,
          email,
          waktu_absensi,
          // ip_device DIHAPUS dari payload
          location_device_lat: pos.lat ?? null,
          location_device_lng: pos.lng ?? null,
          status,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.message ?? "Gagal membuat absensi");
        return;
      }
      setMessage("Absensi berhasil dibuat!");
      setName("");
      setEmail("");
      setStatus("hadir");
    } catch {
      setMessage("Tidak dapat menghubungi server. Periksa API_BASE atau CORS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">Create Absensi</h1>

        {message && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
            {message}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Nama Lengkap</label>
            <input value={name} onChange={e=>setName(e.target.value)} required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-gray-300" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-gray-300" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-gray-300">
              <option value="hadir">Hadir</option>
              <option value="telat">Telat</option>
              <option value="izin">Izin</option>
            </select>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
            <div>Lokasi: {pos.lat ? `${pos.lat.toFixed(5)}, ${pos.lng?.toFixed(5)}` : "—"}</div>
          </div>

          <button type="submit" disabled={loading}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60">
            {loading ? "Memproses..." : "Kirim Absensi"}
          </button>
        </form>
      </div>
    </main>
  );
}
