"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => JSX.Element;
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { label: "Penawaran", href: "/penawaran", icon: FileIcon },
  { label: "Surat PO", href: "/surat-po", icon: ClipboardIcon },
  { label: "Absensi", href: "/dashboard/absensi/create-absensi", icon: AbsensiIcon },
];

const SUPERADMIN_NAV: NavItem[] = [
  { label: "Create Absensi", href: "/superadmin/create-absensi", icon: PlusDocIcon },
];

const normalize = (s: string) => {
  if (!s) return "/";
  const out = s.replace(/\/+$/g, "");
  return out.length ? out : "/";
};

function isSegmentPrefix(base: string, path: string) {
  base = normalize(base);
  path = normalize(path);
  if (base === "/") return path === "/";
  if (path === base) return true;
  return path.startsWith(base + "/");
}

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "/";
  const [openSuper, setOpenSuper] = useState(false);
  const [year, setYear] = useState<string>("");

  useEffect(() => setYear(String(new Date().getFullYear())), []);

  const activeItem = useMemo(() => {
    const path = normalize(pathname);
    const all = [...NAV, ...SUPERADMIN_NAV];
    const matches = all.filter((i) => isSegmentPrefix(i.href, path));
    matches.sort((a, b) => normalize(b.href).length - normalize(a.href).length);
    return matches[0] ?? null;
  }, [pathname]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("sbp.sidebar.superadmin") : null;
    const inSuper = SUPERADMIN_NAV.some((i) => isSegmentPrefix(i.href, pathname));
    setOpenSuper(inSuper || saved === "1");
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sbp.sidebar.superadmin", openSuper ? "1" : "0");
    }
  }, [openSuper]);

  return (
    <aside
      className={[
        "h-full w-72 bg-white border-r border-gray-200 shadow-sm",
        "flex flex-col",
        className,
      ].join(" ")}
      aria-label="Sidebar utama"
    >
      {/* Brand */}
      <div className="relative flex h-20 items-center gap-3 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800 px-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
          <LogoMark />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[17px] font-semibold text-white">SBP</p>
          <p className="truncate text-[11px] text-gray-300">Super App</p>
        </div>
      </div>

      {/* Nav utama */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Menu
        </p>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = activeItem?.href === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "group relative flex items-center gap-3 rounded-xl px-5 py-3 text-[15px] font-medium outline-none transition",
                    active ? "bg-gray-900 text-white shadow-sm" : "text-gray-700 hover:bg-gray-100",
                    "focus-visible:ring-2 focus-visible:ring-gray-300",
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className={[
                      "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r",
                      active ? "bg-white/90" : "bg-transparent",
                    ].join(" ")}
                  />
                  <item.icon
                    className={[
                      "h-5 w-5 transition-colors",
                      active ? "text-white" : "text-gray-500 group-hover:text-gray-700",
                    ].join(" ")}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}

          {/* Superadmin dropdown */}
          <li className="mt-3">
            <button
              type="button"
              aria-expanded={openSuper}
              onClick={() => setOpenSuper((s) => !s)}
              className={[
                "group flex w-full items-center justify-between rounded-xl px-5 py-3 text-left text-[15px] font-semibold transition",
                openSuper ? "bg-gray-900 text-white" : "text-gray-800 hover:bg-gray-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
              ].join(" ")}
            >
              <span className="flex items-center gap-3">
                <ShieldIcon
                  className={[
                    "h-5 w-5",
                    openSuper ? "text-white" : "text-gray-600 group-hover:text-gray-800",
                  ].join(" ")}
                />
                <span>Superadmin</span>
              </span>
              <ChevronIcon
                className={[
                  "h-4 w-4 transition-transform",
                  openSuper ? "rotate-180" : "rotate-0",
                  openSuper ? "text-white" : "text-gray-500",
                ].join(" ")}
              />
            </button>

            <div
              className={[
                "overflow-hidden transition-[grid-template-rows] duration-300",
                openSuper ? "grid grid-rows-[1fr]" : "grid grid-rows-[0fr]",
              ].join(" ")}
            >
              <ul className="min-h-0 space-y-1 pl-3 pr-2 pt-2">
                {SUPERADMIN_NAV.map((item) => {
                  const active = activeItem?.href === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={[
                          "group flex items-center gap-3 rounded-lg px-4 py-2.5 text-[14px] font-medium transition",
                          active ? "bg-gray-900 text-white shadow-sm" : "text-gray-700 hover:bg-gray-100",
                        ].join(" ")}
                      >
                        <item.icon
                          className={[
                            "h-[18px] w-[18px]",
                            active ? "text-white" : "text-gray-500 group-hover:text-gray-700",
                          ].join(" ")}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            © <span suppressHydrationWarning>{year}</span> SBP
          </span>
          <span className="text-[11px] text-gray-400">v1.0</span>
        </div>
      </div>
    </aside>
  );
}

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function HomeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V20a2 2 0 0 1-2 2h-4v-6h-4v6H6a2 2 0 0 1-2-2v-9.5Z" fill="currentColor" />
    </svg>
  );
}
function FileIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z" fill="currentColor" opacity=".14" />
      <path d="M14 2v5h5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
function ClipboardIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="6" y="4" width="12" height="16" rx="2" fill="currentColor" opacity=".12" />
      <path d="M9 4h6v2H9zM8 10h8M8 14h8M8 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
function AbsensiIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
      <path d="M16 17l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3l7 3v6c0 4.5-3.1 8.6-7 9-3.9-.4-7-4.5-7-9V6l7-3Z" />
      <path d="M9.5 12.5l1.8 1.8 3.7-3.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M6 9l6 6 6-6" fill="currentColor" />
    </svg>
  );
}
function PlusDocIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M14 2H8a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V8l-4-6Z" fill="currentColor" opacity=".14" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M12 11v6M9 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
