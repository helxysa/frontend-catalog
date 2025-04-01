import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@tanstack/react-table'],
  /* config options here */
  async redirects() {
    return [
      {
        source: '/',
        destination: '/proprietario',
        permanent: false,
        basePath: false
      },
    ];
  },
};

export default nextConfig;
