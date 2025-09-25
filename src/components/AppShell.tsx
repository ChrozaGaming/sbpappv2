"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  domAnimation,
  motion,
} from "framer-motion";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const prevOverflowRef = useRef<string>("");

  useEffect(() => {
    if (!open) return;
    prevOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflowRef.current;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey, { passive: true });
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const drawerVariants = {
    hidden: { x: -320 },
    show: { x: 0 },
    exit: { x: -360 },
  } as const;

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <span className="font-semibold text-gray-900">SBP App</span>
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden h-dvh w-72 md:block">
        <Sidebar className="h-full" />
      </aside>

      <div className="w-full md:pl-72">
        <main className="px-4 py-4 sm:px-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      <LazyMotion features={domAnimation}>
        <MotionConfig
          reducedMotion="user"
          transition={{ type: "spring", stiffness: 460, damping: 36, mass: 0.9 }}
        >
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  key="backdrop"
                  className="fixed inset-0 z-50 bg-black/40 md:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  onClick={close}
                  style={{ willChange: "opacity", contain: "paint" }}
                />
                <motion.aside
                  key="drawer"
                  className="fixed inset-y-0 left-0 z-50 w-72 md:hidden transform-gpu"
                  variants={drawerVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  style={{
                    willChange: "transform",
                    backfaceVisibility: "hidden",
                    WebkitFontSmoothing: "antialiased",
                    contain: "layout paint size",
                  }}
                >
                  <div className="relative h-full shadow-xl">
                    <button
                      type="button"
                      aria-label="Close menu"
                      onClick={close}
                      className="absolute right-3 top-3 z-10 rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                    <Sidebar className="h-full bg-white" />
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </MotionConfig>
      </LazyMotion>
    </div>
  );
}
