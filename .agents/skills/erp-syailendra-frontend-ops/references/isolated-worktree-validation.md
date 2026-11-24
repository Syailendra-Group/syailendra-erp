# Isolated validation when the shared worktree is dirty

Use this when multiple sessions share the ERP repository and a global build/typecheck is blocked by unrelated in-progress files. The goal is to validate only the current, explicitly owned change without editing or serving over another actor's work.

## Procedure

1. **Freeze scope.** Record `git rev-parse HEAD`, `git status --short`, and the exact paths owned by this change. For each existing dirty file, inspect its diff and distinguish this change's hunks from other work; do not copy the entire dirty tree into the verification clone.
2. **Create a sibling clone from the tracked baseline.** On `octa-host`, create an isolated directory under `/opt/octa/workspace/` and extract `git archive <baseline>` there. This excludes untracked files and other worktree edits by default.
3. **Overlay only the approved file set.** Copy each owned modified file and each owned new file by explicit path. Do not use `cp -a src/` or a whole-tree archive from the dirty worktree. Re-check the clone's changed-file list against the ownership list before running commands.
4. **Prepare dependencies without changing the main checkout.** Next/Turbopack must resolve `next/package.json` inside the clone; a symlink to the main checkout's `node_modules` fails with `Could not find the Next.js package` because the filesystem root is the clone. Copy from the host side with `cp -al <main>/node_modules <clone>/node_modules` (hard links, read-only build/test use); never run an install or mutate dependencies through that clone. Delete the clone's `node_modules` first, or the copy nests into itself and aborts. Keep generated `.next` output inside the isolated clone.
5. **Handle environment deliberately.** Do not copy `.env.local` wholesale into a clone, and never read a credential out of it to log in. The env file carries backend credentials that keep the build resolving; treat it as build input only. Do not point isolated verification at production services or databases beyond read-only list queries.
6. **Match filesystem ownership to the command runner.** For code-server (`uid 1000`), make the clone files writable by that user before Prettier or `next build` (`docker exec -u 0 code-server chown 1000:1000 <file>`); files created as root or over SSH otherwise fail with `EACCES: permission denied` on the format write or on `tsconfig.tsbuildinfo`. Do not recursively chown the shared main worktree as a shortcut — enumerate this change's files.
7. **Run the same relevant gates in the clone.** Execute the helper tests, typecheck, scoped ESLint/Prettier, and build. Capture each exact exit code and the build log; an isolated successful build proves the owned patch compiles against the selected baseline, not that unrelated dirty changes compile or that the result is deployed.
8. **For an isolated runtime check, use a dedicated port and the clone's own `.next`.** Start `next start -p <unused-port>` from the clone, verify the PID/cwd and request against that port, and stop only that process when authorized. Never replace the shared :3000 build to test an isolated artifact.
9. **Reconcile before release.** Once the other workstream finishes, re-audit the main worktree, overlay/merge the verified changes by explicit paths, then rerun the gates on the integrated tree. Isolated verification is a diagnostic/review gate, not a substitute for integrated validation or owner approval to rebuild/restart the shared runtime.

## Pitfalls

- A green isolated build does not verify authenticated UI behavior; a login page returning 200 proves only that the app boots. Use the approved browser-vault login flow and exercise the target page.
- Never "fix" unrelated route/type failures in the shared worktree merely to get the current feature through a gate; report the baseline blocker and keep the isolated diff bounded.
- Avoid linking `node_modules` when Turbopack reports that `next/package.json` cannot be found from the clone root; use the hard-link copy instead.
