import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v3b.fal.media',
      },
      {
        protocol: 'https',
        hostname: 'fal.media',
      },
      {
        protocol: 'https',
        hostname: 'fal.ai',
      },
      {
        protocol: 'https',
        hostname: 'cdn.fashn.ai',
      },
    ],
  },
};

export default nextConfig;
