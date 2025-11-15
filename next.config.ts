import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
      {
        protocol: "https",
        hostname: "**.logo.clearbit.com",
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
