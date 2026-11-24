#!/usr/bin/env bash
# Rebuild the Antigravity skill bundle from the local Octa Hub skill libraries.
#
# Usage: bash scripts/agents/install-skills.sh --force
#
# --force is mandatory because rebuilding replaces the current indexed bundle and
# skills-library. Existing trees are first moved into a dated backup directory under
# .agents/; they are not deleted. Review/restore that backup manually if needed.
# Requires bash, Python 3, and access to the four source paths below.
set -eu

if [ "${1:-}" != "--force" ]; then
  echo "Usage: bash scripts/agents/install-skills.sh --force" >&2
  echo "Rebuild is destructive to the two target trees; --force preserves a dated backup." >&2
  exit 2
fi

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
AGENTS="$REPO_ROOT/.agents"
DEST="$AGENTS/skills"
LIBRARY="$AGENTS/skills-library"
CORE_FILE="$AGENTS/skills-core.txt"
MANIFEST="$AGENTS/skills-manifest.json"

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is required to rebuild the skill bundle." >&2
  exit 1
fi

BACKUP="$AGENTS/skills-backup-$(date +%Y%m%d-%H%M%S)"
[ -d "$DEST" ] && mv "$DEST" "$BACKUP-indexed"
[ -d "$LIBRARY" ] && mv "$LIBRARY" "$BACKUP-library"
mkdir -p "$DEST" "$LIBRARY"

if ! python3 - "$DEST" "$LIBRARY" "$CORE_FILE" "$MANIFEST" <<'PY'
import hashlib, json, shutil, sys
from pathlib import Path

dest, library, core_file, manifest = map(Path, sys.argv[1:5])
sources = [
    (Path('/opt/data/skills'), 'shared'),
    (Path('/opt/data/profiles/octadev/skills'), 'profile'),
    (Path('/opt/data/profiles/octadev/home/.agents/skills'), 'profile-agents'),
    (Path('/opt/data/.agents/skills'), 'global-agents'),
]
SKIP = {'__pycache__', 'node_modules', '.git', '.venv', 'venv'}
core = {line.strip() for line in core_file.read_text().splitlines() if line.strip()}
used, records = set(), []

def first_heading(text: str) -> str:
    for line in text.splitlines():
        if line.strip().startswith('#'):
            return line.strip().lstrip('#').strip()
    return 'Imported skill'

def repair_frontmatter(path: Path, name: str, tag: str) -> bool:
    text = path.read_text(encoding='utf-8', errors='replace')
    valid = text.startswith('---') and text.count('---') >= 2
    fm = text.split('---', 2)[1] if valid else ''
    if valid and 'description:' in fm:
        return False
    desc = f'Imported skill from {tag} library: {first_heading(text)}. Use when this topic is relevant to the task.'
    # JSON strings are valid YAML double-quoted scalars.
    path.write_text(f'---\nname: {name}\ndescription: {json.dumps(desc)}\n---\n\n{text}', encoding='utf-8')
    return True

for base, tag in sources:
    if not base.exists():
        print(f'WARN: source library missing: {base}')
        continue
    for skill_md in sorted(p for p in base.rglob('SKILL.md')
                           if '.archive' not in p.relative_to(base).parts):
        src = skill_md.parent
        name = src.name
        candidate = name if name not in used else f'{name}--{tag}'
        n = 2
        while candidate in used:
            candidate = f'{name}--{tag}{n}'; n += 1
        used.add(candidate)
        is_core = candidate in core
        target = (dest if is_core else library) / candidate
        files = size = 0
        for f in src.rglob('*'):
            rel = f.relative_to(src)
            if any(part in SKIP for part in rel.parts):
                continue
            if f.is_symlink() and not f.exists():
                continue
            if f.is_dir():
                (target / rel).mkdir(parents=True, exist_ok=True)
                continue
            if not f.is_file():
                continue
            (target / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(f, target / rel, follow_symlinks=True)
            files += 1; size += f.stat().st_size
        repaired = repair_frontmatter(target / 'SKILL.md', candidate, tag)
        records.append({
            'dest': candidate, 'source_library': tag, 'source_path': str(src),
            'core': is_core, 'installed_location': 'skills' if is_core else 'skills-library',
            'files': files, 'bytes': size, 'frontmatter_added': repaired,
            'sha256_skill_md': hashlib.sha256((target / 'SKILL.md').read_bytes()).hexdigest(),
        })

missing_core = sorted(core - used)
if missing_core:
    print('WARN: core skill names absent from source libraries:', ', '.join(missing_core))
manifest.write_text(json.dumps({
    'generated_by': 'scripts/agents/install-skills.sh',
    'source_libraries': [{'tag': t, 'path': str(p)} for p, t in sources],
    'curation': {'core_list': '.agents/skills-core.txt', 'indexed': sum(1 for r in records if r['core']),
                 'library': sum(1 for r in records if not r['core'])},
    'totals': {'skills': len(records), 'indexed': sum(1 for r in records if r['core']),
               'library': sum(1 for r in records if not r['core']),
               'bytes': sum(r['bytes'] for r in records)},
    'skills': sorted(records, key=lambda r: r['dest']),
}, indent=1, ensure_ascii=False) + '\n')
print(f"installed {len(records)} skills ({sum(1 for r in records if r['core'])} indexed, "
      f"{sum(1 for r in records if not r['core'])} in library)")
PY
then
  echo "ERROR: bundle rebuild failed. Existing bundle preserved at $BACKUP-indexed and $BACKUP-library." >&2
  exit 1
fi

# Keep the backup in place for manual review/rollback; never auto-delete it.
echo "Backup preserved under: $BACKUP-indexed and $BACKUP-library"
