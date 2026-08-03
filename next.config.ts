import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    qualities: [72, 75, 80, 84],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}

export default nextConfig
