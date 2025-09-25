"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";

type Status = "hadir" | "telat" | "izin";

export default function AbsensiPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("hadir");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [pos, setPos] = useState<{ lat?: number; lng?: number }>({});
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  const [locAllowed, setLocAllowed] = useState<boolean | null>(null);

  // Prefill dari hasil login
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

  // Health check (tanpa AbortController)
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
        }
      } catch {
        if (!mounted) return;
        if (!timedOut) {
          clearTimeout(t);
          setServerOk(false);
        }
      }
    })();

    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const denyAndRedirect = async () => {
      try {
        const Swal = (await import("sweetalert2")).default;
        await Swal.fire({
          icon: "warning",
          title: "Izin Lokasi Diperlukan",
          text: "Untuk membuat absensi, aktifkan layanan lokasi pada perangkat Anda.",
          confirmButtonText: "Kembali ke Dashboard",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
      } catch {
        alert("Izin lokasi diperlukan. Anda akan dikembalikan ke Dashboard.");
      } finally {
        router.replace("/dashboard");
      }
    };

    if (!("geolocation" in navigator)) {
      setLocAllowed(false);
      denyAndRedirect();
      return () => {
        mounted = false;
      };
    }

    const checkAndRequest = async () => {
      try {
        const permissions = (navigator as any).permissions;
        if (permissions?.query) {
          const s: PermissionStatus = await permissions.query({
            // @ts-ignore
            name: "geolocation",
          });
          if (!mounted) return;

          if (s.state === "denied") {
            setLocAllowed(false);
            return denyAndRedirect();
          }

          navigator.geolocation.getCurrentPosition(
            (p) => {
              if (!mounted) return;
              setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
              setLocAllowed(true);
            },
            () => {
              if (!mounted) return;
              setLocAllowed(false);
              denyAndRedirect();
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
          );
        } else {
          navigator.geolocation.getCurrentPosition(
            (p) => {
              if (!mounted) return;
              setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
              setLocAllowed(true);
            },
            () => {
              if (!mounted) return;
              setLocAllowed(false);
              denyAndRedirect();
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
          );
        }
      } catch {
        if (!mounted) return;
        setLocAllowed(false);
        denyAndRedirect();
      }
    };

    checkAndRequest();
    return () => {
      mounted = false;
    };
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (serverOk === false) {
        setMessage("Anda harus masuk ke Wi-Fi Kantor pada perangkat Anda.");
        return;
      }

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const tanggal_absensi = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const waktu_absensi = `${tanggal_absensi} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

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

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        if (res.status === 409) {
          setMessage(data?.message ?? "Anda sudah absen pada tanggal ini.");
          return;
        }
        const fallback =
          serverOk === false
            ? "Anda harus masuk ke Wi-Fi Kantor pada perangkat Anda."
            : "Gagal membuat absensi";
        setMessage(data?.message ?? fallback);
        return;
      }

      setMessage("✅ Absensi berhasil dibuat!");
      setStatus("hadir");
    } catch {
      setMessage("Anda harus masuk ke Wi-Fi Kantor pada perangkat Anda.");
    } finally {
      setLoading(false);
    }
  };

  const formDisabled =
    loading || serverOk === false || locAllowed === false || locAllowed === null;

  return (
    <main className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">Create Absensi</h1>

        {serverOk === false && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Anda harus masuk ke Wi-Fi Kantor pada perangkat Anda.
          </div>
        )}
        {locAllowed === null && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
            Memeriksa izin lokasi…
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
              Lokasi: {pos.lat ? `${pos.lat.toFixed(5)}, ${pos.lng?.toFixed(5)}` : "—"}
            </div>

            <button
              type="submit"
              disabled={formDisabled}
              className="mt-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              title={
                serverOk === false
                  ? "Hubungkan ke Wi-Fi Kantor"
                  : locAllowed === false
                  ? "Aktifkan lokasi"
                  : ""
              }
            >
              {loading ? "Memproses..." : "Kirim Absensi"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
