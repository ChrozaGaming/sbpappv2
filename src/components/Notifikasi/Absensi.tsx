"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  domAnimation,
  motion,
} from "framer-motion";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";

type Props = { email?: string };

export default function NotifikasiAbsensi({ email }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [scrollLocked, setScrollLocked] = useState(false);

  const gid = useId();
  const gA = `${gid}-blueA`;
  const gB = `${gid}-blueB`;
  const gC = `${gid}-blueC`;
  const gSoft = `${gid}-soft`;
  const rGlow = `${gid}-glow`;

  const today = (() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}`;
  })();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!email) {
          if (mounted) {
            setOpen(false);
            setChecking(false);
          }
          return;
        }
        const q = new URLSearchParams({ email, tanggal: today }).toString();
        const res = await fetch(`${API_BASE}/api/absensi/today?${q}`, {
          method: "GET",
          cache: "no-store",
        });
        if (!mounted) return;
        if (!res.ok) {
          setOpen(false);
          setChecking(false);
          return;
        }
        const data = (await res.json()) as { exists?: boolean };
        setOpen(!Boolean(data?.exists));
      } catch {
        if (mounted) setOpen(false);
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [email, today]);

  useEffect(() => {
    if (open) setScrollLocked(true);
  }, [open]);
  useEffect(() => {
    if (!scrollLocked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [scrollLocked]);

  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) primaryBtnRef.current?.focus();
  }, [open]);

  const onDialogKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      primaryBtnRef.current?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (checking || !open) return null;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const goAbsen = async () => {
    setOpen(false);
    await sleep(340);
    router.push("/dashboard/absensi/create-absensi");
  };

  const backdrop = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } as const;

  const dialogInitial = { opacity: 0, y: 24, scale: 0.98 };
  const dialogAnimate = {
    opacity: 1,
    y: 0,
    scale: [0.98, 1.015, 1],
    transition: {
      opacity: { duration: 0.18 },
      y: { type: "spring", stiffness: 520, damping: 38, mass: 0.85 },
      scale: { duration: 0.34, ease: [0.22, 1, 0.36, 1], times: [0, 0.72, 1] },
    },
  };
  const dialogExit = {
    opacity: 0,
    y: 16,
    scale: 0.985,
    transition: {
      opacity: { duration: 0.22 },
      y: { type: "tween", duration: 0.28, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <AnimatePresence
          initial={true}
          mode="wait"
          onExitComplete={() => setScrollLocked(false)}
        >
          {open && (
            <>
              <motion.div
                className="fixed inset-0 z-[1000] bg-black/45 backdrop-blur-md"
                style={{ willChange: "opacity" }}
                {...backdrop}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              />

              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="notif-absensi-title"
                className="fixed left-1/2 top-1/2 z-[1001] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 outline-none"
                onKeyDown={onDialogKeyDown}
                initial={dialogInitial}
                animate={dialogAnimate}
                exit={dialogExit}
                style={{
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                }}
              >
                <div
                  className="relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transform-gpu"
                  onMouseDown={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest("button[data-primary]")) return;
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <section
                    className="relative isolate h-[172px] sm:h-[205px] w-full overflow-hidden bg-white"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 1280 360"
                      className="absolute inset-0 h-full w-full"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id={gA} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#77BEFF" />
                          <stop offset="100%" stopColor="#2D87FF" />
                        </linearGradient>
                        <linearGradient id={gB} x1="0" y1="1" x2="1" y2="0">
                          <stop offset="0%" stopColor="#D4EDFF" />
                          <stop offset="100%" stopColor="#78C2FF" />
                        </linearGradient>
                        <linearGradient id={gC} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#2A7CFF" />
                          <stop offset="100%" stopColor="#57CCFF" />
                        </linearGradient>
                        <radialGradient id={rGlow} cx="50%" cy="50%" r="60%">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </radialGradient>
                        <linearGradient id={gSoft} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>
                      </defs>

                      <g opacity="1">
                        <path
                          d="M 0,0 L 0,360 C 70,330 135,295 175,255 C 215,214 220,178 205,146 C 187,109 192,81 245,56 C 300,30 375,28 435,50 C 395,15 310,0 0,0 Z"
                          fill={`url(#${gB})`}
                        />
                        <path
                          d="M 0,30 L 0,330 C 75,305 132,275 165,236 C 195,199 200,170 190,142 C 175,100 205,72 268,50 C 320,33 387,40 438,68 C 360,8 255,10 0,30 Z"
                          fill={`url(#${gA})`}
                          opacity="0.95"
                        />
                        <path
                          d="M 0,36 C 120,26 230,30 300,54 C 210,28 100,24 0,28 Z"
                          fill={`url(#${gSoft})`}
                          opacity="0.6"
                        />
                        <circle cx="455" cy="66" r="7.5" fill="#66BFFF" opacity="0.95" />
                        <circle cx="410" cy="98" r="3.8" fill="#8FD0FF" opacity="0.9" />
                      </g>

                      <g opacity="1">
                        <path
                          d="M 1280,0 L 1280,360 C 1145,360 1052,334 1012,302 C 964,265 958,227 980,186 C 998,153 1028,131 1086,113 C 1144,95 1188,70 1218,42 C 1239,23 1258,10 1280,6 Z"
                          fill={`url(#${gA})`}
                          opacity="0.96"
                        />
                        <path
                          d="M 1280,18 L 1280,360 C 1126,360 1046,330 1008,300 C 962,264 952,224 972,184 C 995,139 1050,118 1108,100 C 1163,83 1204,62 1229,44 C 1252,27 1266,18 1280,18 Z"
                          fill={`url(#${gC})`}
                          opacity="0.75"
                        />
                        <path
                          d="M 1280,22 C 1258,24 1236,34 1212,52 C 1184,74 1140,90 1092,104 C 1038,120 996,140 974,182"
                          fill="none"
                          stroke="rgba(255,255,255,0.35)"
                          strokeWidth="2"
                        />
                        <circle cx="1012" cy="74" r="9.5" fill="#A7DCFF" opacity="0.95" />
                        <circle cx="1046" cy="96" r="4.2" fill="#86CDFF" opacity="0.95" />
                      </g>

                      <rect x="0" y="0" width="1280" height="360" fill={`url(#${rGlow})`} />
                    </svg>

                    <div className="relative z-10 mx-auto flex h-full max-w-3xl items-center px-5">
                      <div className="max-w-md">
                        <h2
                          id="notif-absensi-title"
                          className="text-[28px] sm:text-[34px] leading-none font-extrabold tracking-tight text-gray-700"
                        >
                          BELUM ABSEN
                        </h2>
                        <h3 className="-mt-0.5 text-[15px] sm:text-[18px] font-semibold tracking-[0.18em] text-gray-500">
                          HARI INI
                        </h3>
                        <p className="mt-2 max-w-sm text-[13px] sm:text-[14px] leading-6 text-gray-500">
                          Absen dulu yuk — UI &amp; UX yang nyaman dengan sentuhan warna.
                        </p>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-black/5" />
                  </section>

                  <div className="p-5">
                    <button
                      type="button"
                      data-primary
                      ref={primaryBtnRef}
                      onClick={goAbsen}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                    >
                      Absen Sekarang
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>
  );
}
