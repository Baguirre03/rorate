import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.logo.dev",
      },
    ],
    localPatterns: [
      {
        pathname: "/api/logo",
      },
      {
        pathname: "/google.png",
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
