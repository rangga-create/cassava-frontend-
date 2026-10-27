/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ]
  },
  experimental: {
    turbo: {
      enableReactServerComponents: true,
      enableUrlSanitization: false,
    },
  },
}

module.exports = nextConfig