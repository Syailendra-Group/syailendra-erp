#!/usr/bin/env bash
# Curation for the Antigravity skill bundle.
#
# Antigravity lists every available skill in the prompt index on every turn, so a
# multi-hundred-skill bundle is a recurring context cost. This script moves the
# non-core skills out of `.agents/skills/` (scanned) into `.agents/skills-library/`
# (not scanned) while keeping them on disk for restoration.
#
#   bash scripts/agents/curate-skills.sh            # dry run (default)
#   bash scripts/agents/curate-skills.sh --apply    # perform the move
#   bash scripts/agents/curate-skills.sh --restore  # move everything back
#
# Core membership comes from `.agents/skills-core.txt`. Portable: POSIX shell + coreutils,
# no Python dependency (the code-server container does not ship python3).
set -eu

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SKILLS_DIR="$REPO_ROOT/.agents/skills"
LIBRARY_DIR="$REPO_ROOT/.agents/skills-library"
CORE_FILE="$REPO_ROOT/.agents/skills-core.txt"

MODE="${1:-}"
is_core() { grep -qxF "$1" "$CORE_FILE"; }

mkdir -p "$SKILLS_DIR" "$LIBRARY_DIR"

if [ "$MODE" = "--restore" ]; then
  moved=0
  for d in "$LIBRARY_DIR"/*/; do
    [ -d "$d" ] || continue
    name="$(basename "$d")"
    if [ ! -e "$SKILLS_DIR/$name" ]; then
      mv "$d" "$SKILLS_DIR/$name"
      moved=$((moved + 1))
    fi
  done
  echo "Restored $moved skill(s) from skills-library."
  echo "Indexed skills now: $(find "$SKILLS_DIR" -maxdepth 1 -mindepth 1 -type d | wc -l)"
  exit 0
fi

if [ ! -f "$CORE_FILE" ]; then
  echo "ERROR: $CORE_FILE not found. It defines the curated skill index." >&2
  exit 1
fi

total=0; noncore=0
for d in "$SKILLS_DIR"/*/; do
  [ -d "$d" ] || continue
  total=$((total + 1))
  is_core "$(basename "$d")" || noncore=$((noncore + 1))
done

echo "Indexed skills : $total"
echo "Non-core       : $noncore"
echo "Core list      : $(grep -c . "$CORE_FILE")"

if [ "$MODE" != "--apply" ]; then
  echo "Dry run. Re-run with --apply to move $noncore skill(s) into .agents/skills-library/."
  exit 0
fi

moved=0
for d in "$SKILLS_DIR"/*/; do
  [ -d "$d" ] || continue
  name="$(basename "$d")"
  if ! is_core "$name"; then
    if [ -e "$LIBRARY_DIR/$name" ]; then
      echo "SKIP (already in library): $name"
      continue
    fi
    mv "$d" "$LIBRARY_DIR/$name"
    moved=$((moved + 1))
  fi
done

echo "Moved $moved skill(s) to .agents/skills-library/."
echo "Indexed skills now: $(find "$SKILLS_DIR" -maxdepth 1 -mindepth 1 -type d | wc -l)"
