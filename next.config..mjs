/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This stops Lucide-React from freezing your compiler!
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;