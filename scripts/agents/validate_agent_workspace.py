#!/usr/bin/env python3
"""Validate an Antigravity `.agents/` workspace. Stdlib only.

Usage:  python3 validate_agent_workspace.py [repo-root]

Checks
  rules/*.md      frontmatter + valid `trigger` (+ `globs` when trigger=glob)
  agents/*.md     required `name`/`description`, and every referenced `skills/<x>` exists
  skills/*/       SKILL.md present and carrying a `description`
  mcp_config.json parses; prints the enabled/disabled split
  secret scan     obvious literal credential patterns (placeholders are reported, not failed)

Exit code 0 = all structural checks passed.
"""

import json
import pathlib
import re
import sys

TRIGGERS = {"always_on", "model_decision", "glob", "manual"}
SECRET_PATTERNS = [
    r"-----BEGIN [A-Z ]*PRIVATE KEY-----",
    r"ghp_[A-Za-z0-9]{20,}",
    r"sk-[A-Za-z0-9]{20,}",
    r"AKIA[0-9A-Z]{16}",
]


def frontmatter(text):
    if not text.startswith("---"):
        return None
    parts = text.split("---", 2)
    return parts[1] if len(parts) >= 3 else None


def main() -> int:
    root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    agents = root / ".agents"
    if not agents.is_dir():
        print(f"FAIL: {agents} not found")
        return 2

    failures, warnings = [], []

    rules_dir = agents / "rules"
    rules = sorted(rules_dir.glob("*.md")) if rules_dir.is_dir() else []
    nested = [p for p in rules_dir.rglob("*.md") if p.parent != rules_dir] if rules_dir.is_dir() else []
    for f in rules:
        fm = frontmatter(f.read_text(encoding="utf-8", errors="replace"))
        if fm is None:
            failures.append(f"rule {f.name}: no frontmatter (silently discarded)")
            continue
        m = re.search(r"^trigger:\s*(\S+)", fm, re.M)
        if not m:
            failures.append(f"rule {f.name}: no trigger key (silently discarded)")
            continue
        if m.group(1) not in TRIGGERS:
            failures.append(f"rule {f.name}: invalid trigger {m.group(1)!r}")
        if m.group(1) == "glob" and not re.search(r"^globs?:", fm, re.M):
            failures.append(f"rule {f.name}: trigger=glob without globs")
    for f in nested:
        failures.append(
            f"rule {f.relative_to(rules_dir)}: nested under rules/ — not scanned unless registered in .agents/rules.json"
        )

    agents_dir = agents / "agents"
    subagents = sorted(agents_dir.glob("*.md")) if agents_dir.is_dir() else []
    for f in subagents:
        fm = frontmatter(f.read_text(encoding="utf-8", errors="replace"))
        if fm is None:
            failures.append(f"subagent {f.name}: no frontmatter")
            continue
        for key in ("name:", "description:"):
            if key not in fm:
                failures.append(f"subagent {f.name}: missing {key[:-1]}")
        for m in re.finditer(r"^\s+-\s+skills/([\w./-]+)\s*$", fm, re.M):
            if not (agents / "skills" / m.group(1)).exists():
                failures.append(f"subagent {f.name}: references missing skill {m.group(1)}")

    skills_dir = agents / "skills"
    skills = [d for d in sorted(skills_dir.iterdir()) if d.is_dir()] if skills_dir.is_dir() else []
    no_md = [d.name for d in skills if not (d / "SKILL.md").exists()]
    no_fm = []
    no_desc = []
    for d in skills:
        md = d / "SKILL.md"
        if not md.exists():
            continue
        text = md.read_text(encoding="utf-8", errors="replace")
        fm = frontmatter(text)
        if fm is None:
            no_fm.append(d.name)
        elif "description:" not in fm:
            no_desc.append(d.name)
    for name in no_md:
        failures.append(f"skill {name}: no SKILL.md")
    for name in no_fm:
        failures.append(f"skill {name}: no frontmatter (invisible to the agent)")
    for name in no_desc:
        failures.append(f"skill {name}: frontmatter without description (invisible)")

    mcp_path = agents / "mcp_config.json"
    enabled, disabled = [], []
    servers = {}
    if mcp_path.exists():
        try:
            servers = json.loads(mcp_path.read_text(encoding="utf-8")).get("mcpServers", {})
        except json.JSONDecodeError as exc:
            failures.append(f"mcp_config.json: invalid JSON ({exc})")
        for name, cfg in servers.items():
            (disabled if cfg.get("disabled") else enabled).append(name)
            if "command" not in cfg and not ("serverUrl" in cfg or "url" in cfg):
                failures.append(f"mcp {name}: needs `command` (stdio) or `serverUrl`/`url`")
            if "httpUrl" in cfg:
                failures.append(f"mcp {name}: `httpUrl` is unsupported; use serverUrl (Streamable HTTP)")
    else:
        warnings.append(".agents/mcp_config.json not present")

    secret_hits = []
    for path in agents.rglob("*"):
        if not path.is_file() or "/skills/" in str(path):
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for pat in SECRET_PATTERNS:
            if re.search(pat, text):
                secret_hits.append(f"{path.relative_to(agents)} :: {pat}")

    print(f"root                  : {root}")
    print(f"rules                 : {len(rules)} (nested/ignored: {len(nested)})")
    print(f"subagents             : {len(subagents)}")
    print(f"skills                : {len(skills)}  no SKILL.md: {len(no_md)}  no frontmatter: {len(no_fm)}  no description: {len(no_desc)}")
    print(f"mcp servers           : {len(servers)}  enabled: {enabled}  disabled: {len(disabled)}")
    for w in warnings:
        print(f"WARN  {w}")
    for s in secret_hits:
        print(f"LOOK  possible credential (verify it is a placeholder): {s}")
    for f in failures:
        print(f"FAIL  {f}")
    print(f"EXIT={1 if failures else 0}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
