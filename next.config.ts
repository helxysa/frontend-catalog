import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
