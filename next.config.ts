// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow loading dev assets from these origins (LAN / local)
    allowedDevOrigins: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://192.168.1.77:3000",
      "http://172.20.10.3:3000",
    ],
  },
};

export default nextConfig;
