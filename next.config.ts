import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "172.20.10.2",
    "172.20.10.2:3000",
    "localhost",
    "localhost:3000",
  ],
  images: {
    // Suppress warnings for local assets with intrinsic aspect ratios
    remotePatterns: [],
  },
};

export default nextConfig;
