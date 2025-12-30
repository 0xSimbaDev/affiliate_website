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
