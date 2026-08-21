import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/v1/:path*',
        destination: `${BACKEND_URL}/v1/:path*`,
      },
    ];
  },
  turbopack: {},
  webpack: (config, { webpack, isServer }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        'import.meta.env': JSON.stringify({
          DEV: process.env.NODE_ENV !== 'production',
          PROD: process.env.NODE_ENV === 'production',
          SSR: isServer,
          VITE_LOG_LEVEL: 'info',
          MODE: process.env.NODE_ENV || 'development',
        }),
        'import.meta.env.DEV': JSON.stringify(process.env.NODE_ENV !== 'production'),
        'import.meta.env.PROD': JSON.stringify(process.env.NODE_ENV === 'production'),
        'import.meta.env.SSR': JSON.stringify(isServer),
        'import.meta.env.VITE_LOG_LEVEL': JSON.stringify('info'),
        'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV || 'development'),
      })
    );
    return config;
  },
};

export default nextConfig;
