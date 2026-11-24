# Merging skill libraries into a workspace bundle

A "install every skill I have" request usually spans several libraries that were never
designed to be merged: a shared library, a per-profile library, a profile's own
Antigravity-format library, and a host-wide `.agents/skills`. Merge them deliberately and
report measured numbers.

## 1. Inventory before copying

Enumerate every `SKILL.md` per library, excluding archive directories, and group by parent
directory name (the skill id Antigravity will use):

```python
for tag, base in LIBRARIES:                 # e.g. ('shared', Path('/opt/data/skills'))
    for skill_md in base.rglob('SKILL.md'):
        if '.archive' in skill_md.relative_to(base).parts:
            continue
        inventory.setdefault(skill_md.parent.name, []).append((tag, skill_md.parent))
```

Report unique names, collision count, payload bytes and file count *before* the copy — the
size number is what the owner needs to decide whether the bundle belongs in Git.

## 2. Collision policy: keep both, suffix deterministically

A directory-name collision must never resolve by overwriting. Install libraries in a fixed
order and suffix the later copies:

```
dest = name if name not in used else f'{name}--{tag}'
while dest in used: dest = f'{name}--{tag}{n}'; n += 1
```

Record `source_library` and `source_path` for each installed directory so a future session
can tell which copy is authoritative.

## 3. Copy rules

- Copy the whole skill directory, preserving `references/`, `scripts/`, `templates/`,
  `assets/` — a bundle that ships only `SKILL.md` breaks every skill that points at a file.
- Skip VCS/bytecode noise: `.git`, `node_modules`, `__pycache__`, `.venv`.
- Skip dangling symlinks instead of failing the copy; count them and put the number in the
  report.
- Preserve uid expectations of the destination repo (see `ssh-remote-hosts.md` for the
  chown/probe step when the destination is a bind-mounted container repo).

## 4. Frontmatter repair is mandatory, and must be recorded

An Antigravity skill without `description` is invisible. For any imported `SKILL.md` that
lacks frontmatter, prepend one derived mechanically:

```
---
name: <dest-name>
description: "Imported skill from <tag> library: <first heading>. Use when this topic is relevant to the task."
---
```

Set `frontmatter_added: true` for those entries in the manifest, and name them in the
report. Do the same repair for a file that has frontmatter but no `description` key.

## 5. Manifest fields

Per installed skill: `dest`, `source_library`, `source_path`, `core` (curated flag),
`files`, `bytes`, `broken_symlinks_skipped`, `frontmatter_added`, `sha256_skill_md`.
Plus a `totals` object and the library list with tags. The manifest is what makes curation,
deduplication and re-install reproducible instead of a one-off shell script.

## 6. Curation: the index cost is per turn

Antigravity injects the name + description of every available skill into every turn. A few
hundred skills is a real, recurring context cost and it dilutes selection. Ship two scripts
next to the bundle:

- `install-skills.sh` — re-runs the merge from the libraries (regenerates the directory
  tree; keeps the manifest).
- `curate-skills.sh` — **dry-run by default**, `--apply` moves every `core: false` skill
  into `.agents/skills-library/`, which the scanner does not read. Print the counts before
  and after.

Add `.agents/skills-library/` to `.gitignore` in the same change, so a later curation does
not silently re-add tens of megabytes to the index.

## 7. Reporting numbers that came from a command

Measure with the tool, never from memory: `find <dir> -maxdepth 1 -mindepth 1 -type d | wc -l`
for the skill count, `du -sh` plus summed bytes for size, and a validator pass
(`scripts/validate_agent_workspace.py`) for structural correctness. State the measured skill
count, the payload bytes, the collision count and the frontmatter repairs in the hand-off.
