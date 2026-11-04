# Octa Hub & Syailendra Engineering Rules (Version 53)
Rule 75: Odoo In-Container Module Upgrade Port Conflict Invariant
When executing an in-container Odoo module upgrade via CLI (`docker exec <odoo-container> odoo -u <module> -d <db> --stop-after-init`), the secondary Odoo CLI process defaults to binding `0.0.0.0:8069`. This triggers `OSError: [Errno 98] Address already in use` because the main web server process is actively holding port 8069. Always supply an alternative port (e.g. `--http-port 8079 --stop-after-init`), followed by `docker restart <odoo-container>`.
