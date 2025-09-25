import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Login • sbpapp",
  description: "Professional login page (Next.js + Tailwind)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
