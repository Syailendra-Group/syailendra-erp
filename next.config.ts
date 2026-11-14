import createNextIntlPlugin from 'next-intl/plugin'

import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    cpus: 4,
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['app.syailendra.group', '*.syailendra.group', 'demo.octalectzz.my.id', '*.octalectzz.my.id', 'localhost:3000']
    }
  }
}

export default withNextIntl(nextConfig)
