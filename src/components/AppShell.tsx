"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

const SIDEBAR_WIDTH = "w-72"; // 18rem — harus sinkron dengan Sidebar

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-gray-50 md:pl-72">
      {/* --- Sidebar fixed desktop --- */}
      <div className={`fixed inset-y-0 left-0 z-40 hidden md:block ${SIDEBAR_WIDTH}`}>
        <Sidebar className="h-dvh" />
      </div>

      {/* --- Top bar (mobile) --- */}
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 bg-white px-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open sidebar"
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-100"
        >
          <BurgerIcon />
        </button>
        <span className="text-sm font-semibold text-gray-900">SBP App</span>
      </div>

      {/* --- Main content --- */}
      <main className="min-w-0">
        <div className="mx-auto max-w-[1400px] p-4 sm:p-6 md:p-8">{children}</div>
      </main>

      {/* --- Mobile drawer --- */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className={`fixed inset-y-0 left-0 z-50 md:hidden ${SIDEBAR_WIDTH}`}>
            <Sidebar />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs text-gray-700 shadow hover:bg-white"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function BurgerIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
