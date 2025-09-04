/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['b4uesports.com', 'images.unsplash.com'],
  },
  // Enable static exports for Vercel
  output: 'export',
  trailingSlash: true,
}

module.exports = nextConfig
