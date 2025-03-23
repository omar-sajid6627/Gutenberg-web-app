/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required by the Dockerfile's runner stage.
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    domains: ['www.gutenberg.org', 'images.unsplash.com'],
  },
};

module.exports = nextConfig;