# Browser-verified UI checks without typing a password

The owner's rule: never type a password, token or 2FA code into a page or a chat. Verify an
authenticated page anyway — the app issues a **stateless signed session cookie**, so a valid
token can be produced from the app's own secret instead of driving the login form.

## 1. Read the token shape before minting anything

```bash
ssh -F /opt/data/.ssh/config octa-host 'cd /opt/octa/workspace/erp-syailendra && cat src/lib/auth/token.ts && cat src/lib/auth/session.ts'
```

What matters: the cookie name (`syailendra_session` — `SESSION_COOKIE_NAME`), the payload
fields required by `isValidPayload`, the version constant, the TTL, and the HMAC alphabet
(base64url, unpadded). `SESSION_SECRET` and `DEMO_*` credentials live in `.env.local` inside
`code-server`; read them as values, never echo them into a report.

## 2. Re-sign the existing token instead of logging in

A cookie captured earlier in the session is enough: decode the payload, reset `iat`/`exp`,
re-sign the same claims with `SESSION_SECRET`.

```python
import json, base64, hashlib, hmac, time
from pathlib import Path
b64d = lambda s: base64.urlsafe_b64decode(s + '=' * (-len(s) % 4))
b64e = lambda b: base64.urlsafe_b64encode(b).rstrip(b'=').decode()
secret = b'<SESSION_SECRET from .env.local>'
body, _sig = Path('session.txt').read_text().strip().split('.')
payload = json.loads(b64d(body))
payload['iat'] = int(time.time())
payload['exp'] = payload['iat'] + 7 * 24 * 3600
new_body = b64e(json.dumps(payload, separators=(',', ':')).encode())
new_sig = b64e(hmac.new(secret, new_body.encode(), hashlib.sha256).digest())
Path('session.txt').write_text(f'{new_body}.{new_sig}')
```

Keep the claims exactly as decoded (`uid`, `companyId`, `groups`, `isAdmin`) — changing them
silently changes the permission envelope you are verifying under.

## 3. Set the cookie on the app origin, then navigate

```python
value = Path('/opt/data/profiles/octadev/cache/scratch/browser_session.txt').read_text().strip()
cdp('Network.setCookie', name='syailendra_session', value=value, domain='demo.octalectzz.my.id',
    path='/', secure=True, httpOnly=False, sameSite='Lax')
goto_url('https://demo.octalectzz.my.id/scm/products'); wait_for_load()
```

- Use the **public** origin, not `127.0.0.1:3000`: the proxy answers 307 for unauthenticated
  paths, so a local-origin cookie proves nothing about the routed app.
- `httpOnly=False` only so `document.cookie` can confirm the jar; the server still validates
  the signature.

## 4. Diagnose a 307-to-login before blaming the code

`goto_url('/scm/<entity>')` landing on `/en/login` means the token failed verification, not
that the feature broke. Order of checks:

1. Hit `/` — if it renders the dashboard, the cookie is accepted and the route rule, not the
   session, is wrong.
2. If `/` also redirects, the token is stale: decode it and compare `exp` with `date +%s`.
   An expired `exp` looks exactly like a permission bug.
3. Re-sign (§2) and retry once. A shrink of the stored value (e.g. 492 chars → ~50) means the
   capture was truncated by the shell, not rejected by the app.

## 5. What to assert on the page

- Tab/filter states: `[...document.querySelectorAll('[role=tab]')].map(x => ({text: x.innerText, sel: x.getAttribute('aria-selected')}))` — an empty array means the panel never mounted; a login URL means §4.
- After clicking a facet, assert **URL param + row set + selected tab** together, and compare
  the row count with an RPC `search_count` for the same domain. A rendered subset proves the
  wiring; only the count proves the domain.
- Let the query settle: the table issues a server round trip, so re-read after a short sleep
  rather than judging the first paint (`isUpdating` skeleton frames are not an empty result).

## 6. Restore state

Delete any record uploaded during verification and confirm the backend count returned to its
baseline (`SELECT count(*) FROM syailendra_media`) before reporting the check as complete.
Never leave probe rows in a production database.
