import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/india-cyber-threat-map",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: "/india-cyber-threat-map",
  },
};

export default nextConfig;
