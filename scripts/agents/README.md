# scripts/agents

Helpers for the Antigravity agent workspace (`.agents/`).

| Script | Purpose |
| :--- | :--- |
| `curate-skills.sh` | Move non-core skills from `.agents/skills/` into `.agents/skills-library/` (dry run by default; `--apply`; `--restore`) |
| `install-skills.sh --force` | Rebuild the whole bundle from the local libraries, preserving the previous tree in a dated backup |
| `validate_agent_workspace.py` | Mechanical validation of rules, subagents, skills and MCP JSON |

## Skill lifecycle

- `.agents/skills-core.txt` — the curated index: skill directory names that Antigravity
  should see on every turn.
- `.agents/skills/` — what Antigravity scans (currently the core set only).
- `.agents/skills-library/` — every other skill on disk, gitignored, not scanned.
- `.agents/skills-manifest.json` — provenance for every installed skill: source library,
  source path, byte count, file count, SKILL.md hash, core flag.

`curate-skills.sh` deliberately uses POSIX shell + coreutils only, because the
code-server container has no `python3`. `install-skills.sh --force` needs Python 3 and Bash; it refuses to run without the explicit
`--force` flag and preserves a dated backup rather than deleting existing skills.

## Validation

```bash
python3 scripts/agents/validate_agent_workspace.py .
```

Exit 0 means: every rule has a valid `trigger`, every subagent has `name` and
`description` and references existing skills, every indexed skill has a `SKILL.md` with
a `description`, and `mcp_config.json` parses.
