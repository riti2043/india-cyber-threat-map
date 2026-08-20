import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/india-cyber-threat-map",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
