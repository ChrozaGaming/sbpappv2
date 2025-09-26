"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";

type Role = "superadmin" | "pegawaikantor" | "pegawaigudang";

export default function CreateUsersPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("pegawaikantor");
  const [loading, setLoading] = useState(false);

  const getSwal = async () => (await import("sweetalert2")).default;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const Swal = await getSwal();

    if (!name.trim() || !email.trim()) {
      await Swal.fire({ icon: "warning", title: "Data belum lengkap", text: "Nama Lengkap dan Email wajib diisi.", confirmButtonText: "OK" });
      return;
    }

    const ask = await Swal.fire({
      icon: "question",
      title: "Buat pengguna baru?",
      html: `<div style="text-align:left">
        <div><b>Nama</b>: ${name}</div>
        <div><b>Email</b>: ${email}</div>
        <div><b>Role</b>: ${role}</div>
      </div>`,
      showCancelButton: true,
      confirmButtonText: "Buat",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusConfirm: true,
    });
    if (!ask.isConfirmed) return;

    setLoading(true);
    Swal.fire({ title: "Memproses…", html: "Mohon tunggu sebentar", allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading() });

    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), roles: role }),
      });
      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        Swal.close();
        if (res.status === 409) {
          await Swal.fire({ icon: "info", title: "Email sudah terdaftar", text: data?.message ?? "Gunakan email lain.", confirmButtonText: "OK" });
          return;
        }
        await Swal.fire({ icon: "error", title: "Gagal menyimpan", text: data?.message ?? "Terjadi kesalahan tak terduga.", confirmButtonText: "Tutup" });
        return;
      }

      Swal.close();
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        html: `<div style="text-align:left;line-height:1.6">
          <div><b>Nama</b>: ${data?.name ?? name}</div>
          <div><b>Email</b>: ${data?.email ?? email}</div>
          <div><b>Role</b>: ${data?.roles ?? role}</div>
          ${data?.license_key ? `<div><b>License Key</b>: <code>${data.license_key}</code></div>` : ""}
        </div>`,
        confirmButtonText: "Selesai",
      });

      setName("");
      setEmail("");
      setRole("pegawaikantor");
    } catch {
      Swal.close();
      await Swal.fire({ icon: "warning", title: "Tidak terhubung", text: "Periksa koneksi atau server backend Anda.", confirmButtonText: "Mengerti" });
    } finally {
      setLoading(false);
    }
  };

  const RoleCheckbox = ({ value, label, description }: { value: Role; label: string; description: string }) => (
    <label className={["flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition", role === value ? "border-gray-800 bg-gray-50" : "border-gray-200 hover:bg-gray-50"].join(" ")}>
      <input type="checkbox" checked={role === value} onChange={() => setRole(value)} className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400" />
      <span className="block">
        <span className="block text-[15px] font-semibold text-gray-900">{label}</span>
        <span className="block text-[12.5px] text-gray-500">{description}</span>
      </span>
    </label>
  );

  return (
    <main className="min-h-dvh bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:px-8">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <header className="border-b border-gray-200 px-5 py-4 sm:px-6">
            <h1 className="text-xl font-semibold text-gray-900">Create User</h1>
            <p className="mt-1 text-sm text-gray-500">Tambahkan pengguna baru. Password dikosongkan (tidak ditampilkan).</p>
          </header>

          <form onSubmit={onSubmit} className="space-y-5 px-5 py-5 sm:px-6">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Nama Lengkap</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-gray-300" />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-gray-300" />
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700">Roles <span className="font-normal text-gray-500">(pilih satu)</span></p>
              <div className="grid gap-2 sm:grid-cols-3">
                <RoleCheckbox value="superadmin" label="Super Admin" description="Akses penuh ke semua fitur." />
                <RoleCheckbox value="pegawaikantor" label="Pegawai Kantor" description="Akses fitur kantor." />
                <RoleCheckbox value="pegawaigudang" label="Pegawai Gudang" description="Akses fitur gudang." />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="inline-flex items-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
