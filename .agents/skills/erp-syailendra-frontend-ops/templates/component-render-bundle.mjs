/**
 * Component render harness bundler — copy into <host>/.scratch/ and edit CONFIG.
 *
 * Builds an IIFE bundle of a REAL form entry with every data/transport boundary
 * replaced by an explicit stub, plus an index.html to serve over plain HTTP.
 *
 *   node component-render-bundle.mjs <repoRoot> <outDir>
 *
 * Serve the output with `python3 -m http.server <port> --directory <outDir>` and open
 * http://127.0.0.1:<port>/index.html. Add `?mode=edit` to mount the edit fixture.
 */
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = process.argv[2]
const out = process.argv[3]
if (!root || !out) throw new Error('usage: node component-render-bundle.mjs <repoRoot> <outDir>')

const BS = String.fromCharCode(92) // backslash: keeps the resolve filters readable
const require = createRequire(path.join(root, 'package.json'))
const esbuild = require('esbuild')
mkdirSync(out, { recursive: true })

// ------------------------------------------------------------------ CONFIG
const FORM = 'src/features/scm/suppliers/form/index.tsx' // EDIT: entry under test
const NS = 'scm/suppliers'                                // EDIT: messages/<locale>/<ns>.json
const LOCALE = 'id'

// Components that must render for real. Everything else under @/components
// resolves to an empty module — a named import from it then fails the build.
const REAL_COMPONENTS = [
  '@/components/form/form-field-wrapper',
  '@/components/form/text-field',
  '@/components/form/textarea-field',
  '@/components/form/number-field',
  '@/components/form/select-form',
  '@/components/form/switch-field',
  '@/components/button/pill-tabs',
  '@/components/button/loading-button',
  '@/components/card/section-card',
  '@/components/shared/detail-row',
  '@/components/shared/page-header'
]

// Hook module basename -> exported hook name returning fixture rows.
const DATA_HOOKS = {
  'use-countries': 'useCountriesQuery',
  'use-provinces': 'useProvincesQuery',
  'use-regencies': 'useRegenciesQuery',
  'use-districts': 'useDistrictsQuery',
  'use-villages': 'useVillagesQuery'
}

const FIXTURE = JSON.stringify({ id: 100, name: 'TEST_REGION', latitude: -6, longitude: 106 })
const EDIT_FIXTURE = process.env.EDIT_FIXTURE_JSON || 'null' // EDIT: compact record JSON
const COMPONENT = 'SupplierForm' // EDIT: exported form component name
const MESSAGE_KEY = NS.split('/').pop() // namespace registers under its pillar

const entry = `import React from 'react';
import {createRoot} from 'react-dom/client';
import {NextIntlClientProvider} from 'next-intl';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {${COMPONENT}} from '${root}/${FORM}';
import common from '${root}/src/messages/${LOCALE}/common/common.json';
import ns from '${root}/src/messages/${LOCALE}/${NS}.json';
const qc=new QueryClient({defaultOptions:{queries:{retry:false}}});
window.__writes=[];
const fx=${EDIT_FIXTURE};
const props=new URLSearchParams(location.search).get('mode')==='edit'&&fx?{initialData:fx,isEdit:true}:{};
createRoot(document.getElementById('root')).render(<QueryClientProvider client={qc}><NextIntlClientProvider locale="${LOCALE}" messages={{common, scm: {${MESSAGE_KEY}: ns}}}><${COMPONENT} {...props} /></NextIntlClientProvider></QueryClientProvider>);`

const source = entry

await esbuild.build({
  stdin: { contents: source, loader: 'tsx', resolveDir: root },
  bundle: true,
  outfile: path.join(out, 'bundle.js'),
  jsx: 'automatic',
  format: 'iife',
  platform: 'browser',
  tsconfig: path.join(root, 'tsconfig.json'),
  define: {
    'process.env.NODE_ENV': '"development"',
    'process.env.SESSION_SECRET': 'undefined',
    'process.env._next_intl_trailing_slash': 'undefined',
    'process.env._next_intl_base_path': '""',
    'process.env.ODOO_BASE_URL': 'undefined',
    'process.env.ODOO_DB': 'undefined',
    'process.env.ODOO_USERNAME': 'undefined',
    'process.env.ODOO_PASSWORD': 'undefined',
    'process.env.ODOO_API_KEY': 'undefined'
  },
  plugins: [{
    name: 'explicit-test-boundaries',
    setup(build) {
      build.onResolve({ filter: new RegExp('^next(' + BS + '/|$)') }, (args) => {
        if (args.path === 'next/image') return { path: 'image', namespace: 'test-stub' }
        if (args.importer) console.error('NEXT_IMPORT', args.path, '<-', args.importer)
        return { path: 'next', namespace: 'test-stub' }
      })
      build.onResolve({ filter: new RegExp('^leaflet(' + BS + '/|$)') }, () => ({ path: 'leaflet', namespace: 'test-stub' }))
      build.onResolve({ filter: new RegExp('^@' + BS + '/hooks' + BS + '/(scm|others)' + BS + '/') }, (args) => {
        const name = args.path.split('/').pop()
        return { path: name, namespace: 'test-stub' }
      })
      build.onResolve({ filter: /^@\/i18n\/navigation$/ }, () => ({ path: 'navigation', namespace: 'test-stub' }))
      build.onResolve({ filter: new RegExp('^@' + BS + '/components' + BS + '/') }, (args) => {
        if (args.importer && /action|service/.test(args.path)) {
          console.error('APP_IMPORT', args.path, '<-', args.importer) // a real boundary leaked
        }
        if (REAL_COMPONENTS.includes(args.path)) return null
        if (args.path.startsWith('@/components/ui/')) return null
        const name = args.path.split('/').pop().replace(/\.tsx?$/, '')
        return { path: name, namespace: 'test-stub' }
      })
      build.onLoad({ filter: /.*/, namespace: 'test-stub' }, (args) => {
        const resolveDir = root
        switch (args.path) {
          case 'next':
            return { resolveDir, loader: 'js', contents: `export const useRouter=()=>({push:()=>{},replace:()=>{},back:()=>{},refresh:()=>{},prefetch:()=>{}});export const usePathname=()=>'/test';export const useSearchParams=()=>new URLSearchParams();export const redirect=()=>{};export const notFound=()=>{};` }
          case 'navigation':
            return { resolveDir, loader: 'tsx', contents: `import React from 'react';export function useRouter(){return {push:()=>{}}}export function Link({href,children,...p}){return <a href={href} {...p}>{children}</a>}` }
          case 'image':
            return { resolveDir, loader: 'tsx', contents: `import React from 'react';export default function Img(p){return <img {...p} alt={p.alt||''}/>}export function ImageViewer({alt}){return <span>{alt}</span>}` }
          case 'leaflet':
            return { resolveDir, loader: 'js', contents: 'export default {};' }
          case 'map-picker':
            return { resolveDir, loader: 'tsx', contents: `import React from 'react';export function MapPicker(){return <div data-testid="map-boundary">TEST MAP</div>}` }
          default:
            if (DATA_HOOKS[args.path]) {
              return { resolveDir, loader: 'js', contents: `export function ${DATA_HOOKS[args.path]}(){return {data:[${FIXTURE}]}}` }
            }
            return { resolveDir, loader: 'js', contents: 'export default {};' }
        }
      })
    }
  }]
})

writeFileSync(path.join(out, 'index.html'), `<!doctype html><html lang="${LOCALE}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>component regression harness — synthetic fixtures</title><style>body{font:16px sans-serif;margin:20px}input,textarea{display:block;margin-bottom:12px}[role=tablist]{display:flex;gap:12px;flex-wrap:wrap}</style><div id="root"></div><script src="/bundle.js"></script></html>`)
console.log('COMPONENT_HARNESS_BUNDLED explicit mocked data/navigation/map boundaries; no production access')
