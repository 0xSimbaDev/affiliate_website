import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Transpile workspace packages
  transpilePackages: [
    '@affiliate/api',
    '@affiliate/database',
    '@affiliate/types',
    '@affiliate/ui',
    '@affiliate/utils',
  ],

  images: {
    // Allow local uploads to bypass optimization (works in all environments)
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
    ],
    // Allow local images in development
    localPatterns: [
      {
        pathname: '/uploads/**',
      },
    ],
  },

  experimental: {
    // Optimize package imports for monorepo
    optimizePackageImports: [
      '@affiliate/ui',
      '@affiliate/utils',
      'lucide-react',
    ],
  },
};

export default nextConfig;
