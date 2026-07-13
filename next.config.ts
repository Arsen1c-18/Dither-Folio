import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // React Three Fiber + drei ship as ESM; transpile for stable builds.
  transpilePackages: ["three"],
};

export default nextConfig;
