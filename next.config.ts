import createNextIntlPlugin from 'next-intl/plugin'

import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/scm/crops', destination: '/scm/commodities', permanent: true },
      { source: '/:locale/scm/crops', destination: '/:locale/scm/commodities', permanent: true }
    ]
  },
  experimental: {
    cpus: 4,
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['app.syailendra.group', '*.syailendra.group', 'demo.octalectzz.my.id', '*.octalectzz.my.id', 'localhost:3000']
    }
  }
}

export default withNextIntl(nextConfig)
