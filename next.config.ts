import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@tanstack/react-table'],
  /* config options here */
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
        basePath: false
      },
    ];
  },
  images: {
    domains: ['localhost', '10.111.32.67', 'api-catalog.mpap.mp.br'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api-catalog.mpap.mp.br',
        port: '',
        pathname: '/tmp/upload/logo/**',
      },
    ],
  },
};

export default nextConfig;
