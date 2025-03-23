/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required by the Dockerfile's runner stage.
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['app', 'components', 'lib', 'tests'],
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'www.gutenberg.org' }],
  },
};

module.exports = nextConfig;
