import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@tanstack/react-table'],
  /* config options here */
  experimental: {
    optimizePackageImports: ['lucide-react'], // Otimiza importações de ícones
    inlineCss: true, // Inline CSS para melhorar o LCP
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
    formats: ['image/avif', 'image/webp'], // Adiciona suporte a formatos modernos
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Otimiza tamanhos de dispositivos
    minimumCacheTTL: 60, // Adiciona cache mínimo de 60 segundos
  },
};

export default nextConfig;
