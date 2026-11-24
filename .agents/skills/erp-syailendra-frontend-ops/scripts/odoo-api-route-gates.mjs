import { execSync } from 'child_process'

const route = process.argv[2]
if (!route) {
  console.error('Usage: node odoo-api-route-gates.mjs <route-path>')
  process.exit(1)
}

function run(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' })
    return true
  } catch (e) {
    return false
  }
}

let ok = true

console.log(`== typecheck (filtered to ${route}) ==`)
ok = run(`npm run typecheck 2>&1 | grep -E '${route.replace(///g, '\/')}'`) && ok

console.log(`== prettier --check ==`)
ok = run(`./node_modules/.bin/prettier --check '${route}'`) && ok

console.log(`== eslint ==`)
ok = run(`npx eslint '${route}'`) && ok

process.exit(ok ? 0 : 1)
