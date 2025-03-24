/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    domains: ['www.gutenberg.org', 'images.unsplash.com'],
  },
};

module.exports = nextConfig;