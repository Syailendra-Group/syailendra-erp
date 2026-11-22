/**
 * manifest.ts — PWA manifest configuration for the Mitra portal.
 * Syailendra Group ERP
 *
 * Serve this object at /manifest.json with Content-Type: application/manifest+json
 * (public/manifest.json or an app route) and reference it from the document head:
 * <link rel="manifest" href="/manifest.json" />
 */

const MASKABLE_SVG = (text: string) =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="%23004E52"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-size="120" font-family="sans-serif" font-weight="700">${text}</text></svg>`

export interface MitraPwaManifest {
  name: string
  short_name: string
  start_url: string
  display: 'standalone'
  orientation: 'portrait'
  background_color: string
  theme_color: string
  icons: Array<{
    src: string
    sizes: string
    type: string
    purpose: 'any' | 'maskable' | 'any maskable'
  }>
}

export const manifest: MitraPwaManifest = {
  name: 'Portal Mitra Syailendra',
  short_name: 'Portal Mitra',
  start_url: '/mitra',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#004E52',
  theme_color: '#004E52',
  icons: [
    { src: MASKABLE_SVG('SM'), sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
    { src: MASKABLE_SVG('SM'), sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
  ]
}

export default function getManifest(): MitraPwaManifest {
  return manifest
}
