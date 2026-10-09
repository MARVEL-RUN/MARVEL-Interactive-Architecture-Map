import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: { position: "bottom-right" },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gitdiagram.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
