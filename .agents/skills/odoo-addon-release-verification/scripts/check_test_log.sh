#!/usr/bin/env bash
# check_test_log.sh — summarize an Odoo --test-enable run and fail on dirty logs.
# Usage: check_test_log.sh <logfile> [module]
set -uo pipefail

log=${1:?usage: check_test_log.sh <logfile> [module]}
module=${2:-}

if [[ ! -f $log ]]; then
  echo "missing log: $log" >&2
  exit 2
fi

errors=$(grep -cE '^[0-9]{4}-[0-9]{2}-[0-9]{2}.* (ERROR|CRITICAL) ' "$log" || true)
failures=$(grep -cE '(FAIL|Traceback \(most recent call last\))' "$log" || true)
stats=$(grep -E 'odoo\.tests\.stats:' "$log" | tail -n 5 || true)

printf 'errors=%s failures=%s\n' "${errors:-0}" "${failures:-0}"
if [[ -n $stats ]]; then
  printf '%s\n' "$stats"
else
  echo 'no odoo.tests.stats line found — tests may not have run' >&2
fi

if [[ ${errors:-0} -gt 0 || ${failures:-0} -gt 0 ]]; then
  exit 1
fi
exit 0
