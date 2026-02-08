import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // For Docker builds

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
