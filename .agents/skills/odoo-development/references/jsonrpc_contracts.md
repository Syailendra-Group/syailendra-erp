# Odoo JSON-RPC 2.0 Contracts & Recipes

## 1. Request Envelope Structure

All requests target `POST /jsonrpc` with `Content-Type: application/json`.

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "common" | "object",
    "method": "authenticate" | "execute_kw",
    "args": [...]
  },
  "id": 1
}
```

## 2. Authentication Flow

Authenticate credentials to obtain the user ID (`uid`):

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "common",
    "method": "authenticate",
    "args": [
      "odoo_db_name",
      "username_or_email",
      "password_or_api_key",
      {}
    ]
  },
  "id": 1
}
```

**Success Response:** Returns numeric `uid` (e.g. `2`). Returns `false` on bad credentials.

## 3. ORM Query Recipes (`service: "object"`, `method: "execute_kw"`)

Format for `args`:
`[db, uid, password, model, method, method_args, method_kwargs]`

### A. Read Stock Balances (`stock.quant`)
Query physical on-hand and reserved inventory across internal locations:

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute_kw",
    "args": [
      "odoo_db_name",
      2,
      "user_password",
      "stock.quant",
      "search_read",
      [[["location_id.usage", "=", "internal"]]],
      {
        "fields": ["product_id", "location_id", "lot_id", "quantity", "reserved_quantity"],
        "limit": 50
      }
    ]
  },
  "id": 2
}
```

### B. Read Transfer Operations (`stock.picking`)
Fetch delivery orders, receipts, or internal transfers:

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute_kw",
    "args": [
      "odoo_db_name",
      2,
      "user_password",
      "stock.picking",
      "search_read",
      [[["state", "in", ["assigned", "confirmed"]]]],
      {
        "fields": ["name", "partner_id", "picking_type_id", "scheduled_date", "state", "origin"],
        "order": "scheduled_date desc",
        "limit": 25
      }
    ]
  },
  "id": 3
}
```

### C. Validate Transfer (`button_validate`)
Execute confirmation of a transfer directly into `done` state:

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute_kw",
    "args": [
      "odoo_db_name",
      2,
      "user_password",
      "stock.picking",
      "button_validate",
      [[15]]
    ]
  },
  "id": 4
}
```

### D. Lot Traceability Lineage Query (`stock.move.line`)
Query movements of a specific Lot from origin receipt to outgoing delivery:

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute_kw",
    "args": [
      "odoo_db_name",
      2,
      "user_password",
      "stock.move.line",
      "search_read",
      [[["lot_id", "=", 16], ["state", "=", "done"]]],
      {
        "fields": ["picking_id", "location_id", "location_dest_id", "quantity", "date"],
        "order": "date asc"
      }
    ]
  },
  "id": 5
}
```

### E. Attendance Check-In / Check-Out (`hr.attendance`)
Record employee attendance and calculate hours:

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute_kw",
    "args": [
      "odoo_db_name",
      2,
      "user_password",
      "hr.attendance",
      "create",
      [{ "employee_id": 1, "check_in": "2026-10-27 01:00:00" }]
    ]
  },
  "id": 6
}
```

Update check-out:
```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute_kw",
    "args": [
      "odoo_db_name",
      2,
      "user_password",
      "hr.attendance",
      "write",
      [[13], { "check_out": "2026-10-27 10:00:00" }]
    ]
  },
  "id": 7
}
```

### F. Create CRM Lead (`crm.lead` for Colabo Clone)
Create incoming lead/opportunity:

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute_kw",
    "args": [
      "odoo_db_name",
      2,
      "user_password",
      "crm.lead",
      "create",
      [{
        "name": "B2B Supply Contract",
        "partner_id": 64,
        "contact_name": "Ibu Ratna",
        "expected_revenue": 45000000.0,
        "probability": 70.0
      }]
    ]
  },
  "id": 8
}
```

### G. Query Dynamic Company Identity (`res.company`)
Fetch company branding, contact information, and logo for frontend navigation:

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute_kw",
    "args": [
      "odoo_db_name",
      2,
      "user_password",
      "res.company",
      "search_read",
      [[]],
      {
        "fields": ["name", "email", "phone", "street", "city", "website", "report_header", "report_footer"],
        "limit": 1
      }
    ]
  },
  "id": 9
}
```

### H. Read User Groups for Role-Based Navigation (`res.users` & `res.groups`)
Retrieve user's security groups to filter navbar tabs and sidebar modules:

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute_kw",
    "args": [
      "odoo_db_name",
      2,
      "user_password",
      "res.users",
      "read",
      [[2]],
      {
        "fields": ["name", "login", "groups_id"]
      }
    ]
  },
  "id": 10
}
```
