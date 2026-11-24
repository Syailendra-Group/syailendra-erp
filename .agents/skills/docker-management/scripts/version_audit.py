#!/usr/bin/env python3
"""Read-only image version audit: Docker Hub API v2 + GHCR + GitHub Releases.

No docker pull, no mutations — safe to run against production hosts.

Usage:
    python3 version_audit.py [spec.json]

Edit SPEC below or pass a JSON file with this shape:
  {
    "docker_hub": {"n8n-base": ["library/postgres", "18"]},
    "ghcr":       {"9router": ["decolua/9router", "0.5.116"]},
    "github":     {"n8n": ["n8n-io/n8n", "2.47.4"]}
  }
Each entry maps a display name -> [repository, installed_tag].
Prints, per component: installed tag -> latest stable candidates
(family-filtered when the installed tag is a floating major like "18" or "8").
"""
import json
import re
import sys
import urllib.request

SPEC = {
    "docker_hub": {},
    "ghcr": {},
    "github": {},
}

UA = {"User-Agent": "octa-version-audit/1.0"}


def http_json(url, headers=None, timeout=20):
    h = dict(UA)
    h.update(headers or {})
    with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=timeout) as r:
        return json.loads(r.read().decode())


def semver_key(tag):
    # re.search (NOT anchored): prefixed tags like "noweb-2026.10.1" or
    # "rc.13-v0.23.2" must still parse. Missing patch segment -> 0.
    m = re.search(r"v?(\d+)\.(\d+)(?:\.(\d+))?", tag)
    if not m:
        return None
    return tuple(int(x) if x else 0 for x in m.groups())


def is_stable(tag):
    return not re.search(r"rc|beta|alpha|canary|pre|next|snapshot|dev", tag, re.I)


def family_prefix(installed):
    # "18" / "18.0" / "2-alpine" -> r"^18\." ; None for non-major tags ("alpine", "latest")
    m = re.match(r"^v?(\d+)(?:\.\d+)?(?:-alpine)?$", installed or "")
    return (r"^%s\." % m.group(1)) if m else None


def hub_tags(repo, pages=4):
    """Docker Hub tags: paginated + lexicographic -> refetch pages, sort ourselves."""
    tags, url = [], "https://hub.docker.com/v2/repositories/%s/tags?page_size=100" % repo
    for _ in range(pages):
        d = http_json(url)
        tags += [t["name"] for t in d.get("results", [])]  # items are dicts, tag is ["name"]
        url = d.get("next")
        if not url:
            break
    return tags


def ghcr_tags(repo, pages=3):
    tok = http_json("https://ghcr.io/token?scope=repository:%s:pull&service=ghcr.io" % repo)["token"]
    tags, last = [], ""
    for _ in range(pages):
        url = "https://ghcr.io/v2/%s/tags/list?n=100" % repo + ("&last=%s" % last if last else "")
        d = http_json(url, headers={"Authorization": "Bearer %s" % tok})
        batch = d.get("tags") or []
        tags += batch
        if len(batch) < 100:
            break
        last = batch[-1]
    return tags


def gh_releases(repo, n=10):
    rels = http_json("https://api.github.com/repos/%s/releases?per_page=%d" % (repo, n))
    return [(r["tag_name"], bool(r.get("prerelease")), (r.get("published_at") or "")[:10]) for r in rels]


def summarize_registry(name, installed, tags):
    stable = sorted((t for t in tags if semver_key(t) and is_stable(t)), key=semver_key, reverse=True)
    pref = family_prefix(installed)
    fam = [t for t in stable if pref and re.match(pref, t)]
    print("%s: installed=%s | latest candidates: %s" % (name, installed, (fam or stable)[:5]))


def main():
    spec = SPEC
    if len(sys.argv) > 1:
        with open(sys.argv[1]) as f:
            spec = json.load(f)
    for name, (repo, installed) in spec.get("docker_hub", {}).items():
        try:
            summarize_registry(name, installed, hub_tags(repo))
        except Exception as e:
            print("%s: ERROR %s" % (name, e))
    for name, (repo, installed) in spec.get("ghcr", {}).items():
        try:
            summarize_registry(name, installed, ghcr_tags(repo))
        except Exception as e:
            print("%s: ERROR %s" % (name, e))
    for name, (repo, installed) in spec.get("github", {}).items():
        try:
            rels = gh_releases(repo)
            stable = [r for r in rels if not r[1]]
            print("%s: installed=%s | latest stable release: %s | recent: %s"
                  % (name, installed, stable[0][0] if stable else "n/a", [r[0] for r in rels[:5]]))
        except Exception as e:
            print("%s: ERROR %s" % (name, e))


if __name__ == "__main__":
    main()
