"use client";

import { useEffect, useState } from "react";
import NotifikasiAbsensi from "@/components/Notifikasi/Absensi";

export default function DashboardPage() {
  const [email, setEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.email) setEmail(u.email as string);
      }
    } catch {}
  }, []);

  return (
    <>
      <NotifikasiAbsensi email={email} />
      <section className="space-y-4">
      </section>
    </>
  );
}