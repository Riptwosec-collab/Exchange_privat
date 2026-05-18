import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: process.cwd()
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"]
  }
};

export default nextConfig;
