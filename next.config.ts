import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // ✅ Build estático para Capacitor
  images: {
    unoptimized: true,
  },
};

export default nextConfig;