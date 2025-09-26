"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";
type Status = "hadir" | "telat" | "izin";

export default function AbsensiPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("hadir");
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState<{ lat?: number; lng?: number }>({});
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  const getSwal = async () => (await import("sweetalert2")).default;

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.name) setName(u.name);
        if (u?.email) setEmail(u.email);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let mounted = true;
    let timedOut = false;
    const t = setTimeout(() => {
      timedOut = true;
      if (mounted) setServerOk(false);
    }, 4000);
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/health`, { method: "GET", cache: "no-store" });
        if (!mounted) return;
        if (!timedOut) {
          clearTimeout(t);
          setServerOk(r.ok);
          if (!r.ok) {
            const Swal = await getSwal();
            await Swal.fire({
              icon: "warning",
              title: "Tidak Terhubung",
              text: "Anda harus masuk ke Wi-Fi Kantor pada perangkat Anda.",
              confirmButtonText: "Mengerti",
            });
          }
        }
      } catch {
        if (!mounted) return;
        if (!timedOut) {
          clearTimeout(t);
          setServerOk(false);
          const Swal = await getSwal();
          await Swal.fire({
            icon: "warning",
            title: "Tidak Terhubung",
            text: "Anda harus masuk ke Wi-Fi Kantor pada perangkat Anda.",
            confirmButtonText: "Mengerti",
          });
        }
      }
    })();
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  function formatWIB(d: Date) {
    const date = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
    const time = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .format(d)
      .replace(/:/g, ".");
    return `${date} ${time} WIB`;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    let Swal: any | null = null;
    let loadingShown = false;

    const closeLoading = () => {
      try {
        if (Swal && loadingShown) {
          Swal.close();
          loadingShown = false;
        }
      } catch {}
    };

    try {
      Swal = (await import("sweetalert2")).default;

      if (serverOk === false) {
        await Swal.fire({
          icon: "warning",
          title: "Tidak Terhubung",
          text: "Anda harus masuk ke Wi-Fi Kantor pada perangkat Anda.",
          confirmButtonText: "Mengerti",
        });
        return;
      }

      const htmlConfirm = `
        <div style="text-align:left">
          <div><b>Nama</b>: ${name || "-"}</div>
          <div><b>Email</b>: ${email || "-"}</div>
          <div><b>Status</b>: ${status}</div>
        </div>
      `;
      const confirm = await Swal.fire({
        icon: "question",
        title: "Konfirmasi Absensi",
        html: htmlConfirm,
        showCancelButton: true,
        confirmButtonText: "Kirim",
        cancelButtonText: "Batal",
        reverseButtons: true,
        focusConfirm: true,
      });
      if (!confirm.isConfirmed) return;

      Swal.fire({
        title: "Memproses...",
        html: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      loadingShown = true;

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const tanggal_absensi = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const waktu_absensi = `${tanggal_absensi} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const token = localStorage.getItem("token") ?? "";

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);

      let res: Response;
      try {
        res = await fetch(`${API_BASE}/api/absensi`, {
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
          signal: ctrl.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        closeLoading();
        if (res.status === 409) {
          await Swal.fire({
            icon: "info",
            title: "Sudah Absen",
            text: data?.message ?? "Anda sudah absen pada tanggal ini.",
            confirmButtonText: "OK",
          });
          return;
        }
        await Swal.fire({
          icon: "error",
          title: "Gagal",
          text:
            data?.message ??
            (serverOk === false
              ? "Anda harus masuk ke Wi-Fi Kantor pada perangkat Anda."
              : "Gagal membuat absensi."),
          confirmButtonText: "Tutup",
        });
        return;
      }

      closeLoading();

      const waktuDisplay = formatWIB(now);
      await Swal.fire({
        icon: "success",
        title: "Absensi Berhasil",
        html: `<div style="text-align:left; line-height:1.6">
                 <div><b>Status</b>: ${status}</div>
                 <div><b>Waktu</b>: ${waktuDisplay}</div>
               </div>`,
        confirmButtonText: "Selesai",
      });

      setStatus("hadir");
    } catch (err: any) {
      closeLoading();
      const s = Swal ?? (await import("sweetalert2")).default;
      const isAbort = err?.name === "AbortError";
      await s.fire({
        icon: "warning",
        title: isAbort ? "Timeout" : "Tidak Terhubung",
        text: isAbort ? "Permintaan melebihi 15 detik. Coba lagi." : "Anda harus masuk ke Wi-Fi Kantor pada perangkat Anda.",
        confirmButtonText: "Mengerti",
      });
    } finally {
      closeLoading();
      setLoading(false);
    }
  };

  const formDisabled = loading || serverOk === false;

  return (
    <main className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">Form Absensi</h1>
        <form
          onSubmit={submit}
          className={`relative space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${formDisabled ? "opacity-90" : ""}`}
        >
          {formDisabled && <div className="pointer-events-auto absolute inset-0 z-10 rounded-2xl bg-white/60 backdrop-blur-[1px]" />}
          <div className={formDisabled ? "pointer-events-none" : ""}>
            <div className="mb-3">
              <label className="mb-1 block text-sm text-gray-600">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="hadir">Hadir</option>
                <option value="telat">Telat</option>
                <option value="izin">Izin</option>
              </select>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
              Lokasi: {pos.lat ? `${pos.lat.toFixed(5)}, ${pos.lng?.toFixed(5)}` : "— (opsional)"}
            </div>
            <button
              type="submit"
              disabled={formDisabled}
              className="mt-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              title={serverOk === false ? "Hubungkan ke Wi-Fi Kantor" : ""}
            >
              {loading ? "Memproses…" : "Kirim Absensi"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
