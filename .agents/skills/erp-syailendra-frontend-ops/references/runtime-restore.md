# Runtime Restore to Clean HEAD

When the working tree holds changes that must not be served — typically a build that
reads backend fields the production addon does not have yet — restore the demo by
building a clean checkout of `HEAD` in an isolated directory and pointing the runtime at
it. The working tree stays untouched.

## Procedure

1. Extract `HEAD` into an isolated directory under the workspace mount so the container
   can see it:

   ```bash
   ssh -F /opt/data/.ssh/config octa-host
   cd /opt/octa/workspace/erp-syailendra
   rm -rf /opt/octa/workspace/.head-restore
   mkdir -p /opt/octa/workspace/.head-restore
   git archive HEAD | tar -x -C /opt/octa/workspace/.head-restore
   chown -R 1000:1000 /opt/octa/workspace/.head-restore
   ```

2. Inside the container, copy the env file and clone `node_modules` with hardlinks.
   A symlink is rejected by Turbopack (`Filesystem root used for resolution`); a full
   copy wastes time and disk:

   ```bash
   docker exec code-server bash -lc '
     cp /home/coder/project/erp-syailendra/.env.local /home/coder/project/.head-restore/.env.local
     chmod 600 /home/coder/project/.head-restore/.env.local
     cd /home/coder/project/.head-restore
     cp -al /home/coder/project/erp-syailendra/node_modules ./node_modules
     export PATH=/opt/node/bin:$PATH && npm run build'
   ```

3. Swap the runtime (PATH export is mandatory — see SKILL.md §3):

   ```bash
   docker exec code-server bash -lc "pkill -f '[n]ext-server'; sleep 2"
   docker exec -d code-server bash -lc "export PATH=/opt/node/bin:\$PATH && cd /home/coder/project/.head-restore && nohup npm run start > /tmp/next-restore.log 2>&1 &"
   ```

4. Prove the swap by process cwd and BUILD_ID — HTTP status cannot distinguish routes
   behind the auth proxy (every unauthenticated path answers 307):

   ```bash
   docker exec code-server bash -lc 'for p in $(pgrep -f "[n]ext-server"); do readlink /proc/$p/cwd; done'
   cat /opt/octa/workspace/.head-restore/.next/BUILD_ID
   ```

5. Delete the restore directory only after the real release lands and the main repo
   build is serving again.
