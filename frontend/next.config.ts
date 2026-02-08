import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // For Docker builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
