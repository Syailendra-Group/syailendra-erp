# Skill discovery, MCP audit, and scope-then-decide

Use before planning a change to unfamiliar territory, and whenever the owner asks you to
"search and install skills/MCP first".

## 1. Search, then judge on evidence

```bash
npx skills find "<domain> <task>"        # e.g. "nextjs image performance"
npx skills find "<domain>" --owner <owner>
```

Judge each hit before recommending:

| Signal | Rule |
| :--- | :--- |
| Installs | Prefer 1K+. Treat < 100 as unproven; < 25 is noise |
| Source | Official orgs (`vercel-labs`, `anthropics`, `microsoft`) over unknown authors |
| Overlap | Check the local catalog first — an installed local skill beats an external one |

Report the search as a table (query → candidates → install counts → decision) and state the
skip reason explicitly. "No installs found above threshold" is a valid, reportable outcome;
silently installing a 3-install skill is not.

## 2. Check local coverage before adding anything

Run `skills_list` against the domain keywords. In this ecosystem the answer is frequently
"already covered": frontend design, Odoo, shadcn, Next.js, file uploads, image processing,
technical SEO, and Telegram formatting all have local skills. Duplicating them with an
external install splits knowledge across two sources that then disagree.

## 3. MCP audit

Look for a server whose tools act on the real target (database, repo, deploy). If none
exists, say so and fall back to read-only CLI/RPC probes — do not describe a capability you
wanted as if it were available.

## 4. Put numbered decisions inside the plan; do not block plan delivery

A multi-part change request is not one decision. First prepare the requested plan from verified
facts, then include unresolved decisions as explicit stop-gates in that plan. Do not make a user
answer every design question before receiving the plan when their request is specifically to
review a plan before execution. Do not execute a dependent step until the relevant decision is
answered and the plan is approved.

Include only decisions that materially change scope or safety, such as:

1. **Priority** — this work vs. other queued work.
2. **Architecture/identity provider** — preserve the owner-approved source of truth; do not
   infer approval from an uncommitted integration or an installed service.
3. **Structure** — menu/route layout and ownership boundaries.
4. **Storage/migration** — where data lands and whether schema or production gates are needed.
5. **Operational choices** — credential delivery, rollout order, rollback authority, or scope.

For each unresolved choice, show a recommended option first and state its concrete consequence.
Keep already-answered owner decisions locked; do not re-ask them as open questions. A later
explicit owner decision supersedes repository artifacts and earlier assumptions.

## 5. Diagnose root cause from live code, not from the complaint

The owner describes symptoms. Recover the mechanism with a read-only probe before planning:

| Symptom | Probe | Typical mechanism |
| :--- | :--- | :--- |
| "table is empty but summary has numbers" | read the list service's domain; `psql` the column type | summary and table use different queries; filter targets an unpopulated or JSONB column |
| "page is slow" | read the list query's field list | heavy blob/base64 fields included in a paginated read |
| "filters don't work" | `grep -c "onFilterChange\|filterConfigs"` per table file | no filter control exists, or the URL-state handler overwrites sibling filters |
| "header shows the old name" | `grep` the label key in both locales | two independent label blocks (`items.*` vs route-key) for one route |
| "detail page is missing" | `find src/app -path '*<entity>*'` | only `create`/`edit` routes exist |
| "still a modal" | `grep -n ActionDialog` in the feature's `dialogs.tsx` | form never migrated to a page route |

Every symptom must land in the plan with a `file:line` or query result behind it. A plan
built on the complaint text alone produces fixes that miss the mechanism.

## 6. Single-skill applicability check

Before writing the plan, ask whether it needs a new skill at all. If the domain already has
a class-level skill covering the environment, gates, and release mechanics, the plan is a
document in the project vault — not a new skill. Skills capture durable procedure; project
plans capture this week's decisions.
