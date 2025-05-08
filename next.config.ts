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
    domains: ['localhost', 'http://10.111.32.67:8012'],
    
  },
};

export default nextConfig;
