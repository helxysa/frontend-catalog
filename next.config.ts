import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@tanstack/react-table'],
  /* config options here */
  experimental: {
    optimizePackageImports: ['lucide-react'], // Otimiza importações de ícones
  },
  images: {
    unoptimized: true, // Set to true to bypass Next.js image optimization
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3333',
        pathname: '/tmp/upload/logo/**',
      },
      {
        protocol: 'http',
        hostname: '10.111.32.67',
        port: '3333',
        pathname: '/tmp/upload/logo/**',
      },
      {
        protocol: 'https',
        hostname: 'api-catalog.mpap.mp.br',
        port: '',
        pathname: '/tmp/upload/logo/**',
      },
    ],
    formats: ['image/avif', 'image/webp'], 
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], 
    minimumCacheTTL: 60, 
  },
};

export default nextConfig;
