---
name: n8n-workflow-automation
description: Use when managing n8n workflows via REST API or MCP.
---

# n8n Workflow Automation

Manage n8n workflows using either the REST API (`hermes-n8n-rest` plugin tools) or the MCP server (`n8n-official` tools).

## Selecting the Tool Path

- **REST API (`n8n_rest_*`)**: Best for direct, lightweight CRUD operations on standard workflow JSON definitions, environments without MCP gateway access, or when explicit REST API testing is requested.
- **MCP (`mcp__n8n_official__*`)**: Best for SDK-based workflow synthesis, AI assistant integrations, or environments where the n8n official MCP server is active.

---

## Architectural Principles: Native Integration Nodes First

- **Direct / Native Destination Principle**: Always use dedicated native integration nodes (`n8n-nodes-base.googleSheets`, `n8n-nodes-base.telegram`, `n8n-nodes-base.gmail`, etc.) rather than generic `n8n-nodes-base.httpRequest` calling external REST APIs when a first-class node exists.
  - Native nodes encapsulate OAuth/token refresh, rate-limit retries, and schema validation.
  - Avoid hardcoding API tokens, bot tokens, or credentials inside raw URL endpoints or header strings.
  - Reserve generic `httpRequest` strictly for custom webhooks, internal microservices, or services lacking native n8n node support.
- **Atomic Multi-Field Updates**: Consolidate sequential updates to the same record (e.g. updating both `status` and `timestamp` on a row) into a single atomic update operation instead of chaining multiple update nodes. This saves API quotas, eliminates partial update states, and reduces latency.
- **Audit-First on Existing Workflows**: When requested to modify, refactor, or audit an existing live workflow, always conduct a comprehensive read-only inspection first. Detail the before/after node mappings, identify credentials, and secure explicit user confirmation before applying mutations.

---

## REST API Tool Reference (`hermes-n8n-rest`)

| Tool | Purpose |
|---|---|
| `n8n_rest_list_workflows` | List workflows with pagination (`limit`, `cursor`). |
| `n8n_rest_get_workflow` | Fetch full workflow structure by `workflow_id`. |
| `n8n_rest_create_workflow` | Create a new workflow from a workflow JSON object. |
| `n8n_rest_update_workflow` | Update an existing workflow definition by `workflow_id`. |
| `n8n_rest_set_workflow_active` | Toggle workflow activation state (`active: true/false`). |

---

## REST API Procedures

### 1. Pre-creation Duplicate Check & Workflow Creation
1. **Always search before create**: Call `n8n_rest_list_workflows` (e.g. `limit: 50`) and verify whether a workflow with the desired name already exists.
2. If it already exists, **do not create a duplicate**; return the existing workflow ID.
3. If new, build the workflow JSON payload:
   ```json
   {
     "name": "Workflow Name",
     "nodes": [
       {
         "id": "trigger-1",
         "name": "When clicking 'Execute workflow'",
         "type": "n8n-nodes-base.manualTrigger",
         "typeVersion": 1,
         "position": [0, 0],
         "parameters": {}
       },
       {
         "id": "code-1",
         "name": "Code in JavaScript",
         "type": "n8n-nodes-base.code",
         "typeVersion": 2,
         "position": [400, 0],
         "parameters": {
           "jsCode": "return [{ json: { status: \"ok\" } }];"
         }
       }
     ],
     "connections": {
       "When clicking 'Execute workflow'": {
         "main": [[{ "node": "Code in JavaScript", "type": "main", "index": 0 }]]
       }
     },
     "settings": {
       "executionOrder": "v1"
     }
   }
   ```
4. Call `n8n_rest_create_workflow` with the payload.
5. Workflows are created inactive by default (`active: false`).

### 2. Updating an Existing Workflow (Preservation Rule)
Unlike MCP's granular operational diffs, `n8n_rest_update_workflow` overwrites workflow fields:
1. **Always read first**: Call `n8n_rest_get_workflow` with the target `workflow_id`.
2. Extract existing `nodes`, `connections`, `settings`, etc.
3. **Predefined Credential Preservation Gate**: When fetching workflow JSON via GET, nodes using `authentication: "predefinedCredentialType"` (e.g. `n8n-nodes-base.httpRequest` calling Google Sheets or external APIs) frequently return with `credentials: null`. If you PUT this payload back, n8n accepts it without validation errors, but runtime executions will fail with `HTTP 500: NodeApiError: Credentials not found`. Before updating, always query `GET /api/v1/credentials` and explicitly map the credential object (e.g. `{"googleSheetsOAuth2Api": {"id": "<id>", "name": "<name>"}}`) into the node's `credentials` field.
4. Modify **only** the requested fields (e.g. `name`, `disabled: true`). Keep the rest identical.
5. Call `n8n_rest_update_workflow` passing the preserved nodes and connections alongside updated fields.

### 3. Post-Mutation Verification
Immediately after create or update:
1. Call `n8n_rest_get_workflow` with the target `workflow_id`.
2. Verify:
   - Target name matches exactly.
   - Node count and node types match expected.
   - Connection mappings remain intact.
   - Script/code contents inside parameters match.
   - Activation state is unchanged (`active: false` unless explicitly requested).

---

## Programmatic Credential Creation via REST API

Credentials can be provisioned via `POST /api/v1/credentials` with exact payload types:

- **Telegram Bot (`telegramApi`)**:
  ```json
  {
    "name": "Credential Name",
    "type": "telegramApi",
    "data": { "accessToken": "BOT_TOKEN" }
  }
  ```
- **Google OAuth2 Services (`gmailOAuth2`, `googleSheetsOAuth2Api`)**:
  ```json
  {
    "name": "Credential Name",
    "type": "gmailOAuth2",
    "data": {
      "clientId": "CLIENT_ID",
      "clientSecret": "CLIENT_SECRET",
      "oauthTokenData": {
        "access_token": "ACCESS_TOKEN",
        "refresh_token": "REFRESH_TOKEN",
        "token_type": "Bearer"
      }
    }
  }
  ```

---

## Production Reliability & Error Handling Standards

### Centralized Error Handler Binding
- Route unhandled workflow crashes to a global error workflow by configuring `settings.errorWorkflow = "<error_workflow_id>"`.
- The error handler workflow must use `n8n-nodes-base.errorTrigger` (typeVersion 1) as its root node and must be set to **active** (`active: true`).
- The payload provided to the error trigger contains:
  - `$json.execution`: contains `id`, `url`, `error` (`message`, `stack`, `node`), `lastNodeExecuted`.
  - `$json.workflow`: contains `id` and `name`.

### Standardized Resilient HTTP Request Node
To prevent hard crashes from network jitter, 502/504 gateway timeouts, or temporary upstream rate spikes:
- Node type: `n8n-nodes-base.httpRequest` (typeVersion 4.2+)
- Required resilience parameters:
  ```json
  {
    "retryOnFail": true,
    "maxTries": 3,
    "waitBetweenTries": 2000,
    "options": {
      "timeout": 30000
    },
    "continueOnFail": false
  }
  ```
- Setting `continueOnFail: false` guarantees that if all 3 retries fail, execution halts cleanly and triggers `settings.errorWorkflow`.

### Non-Blocking Auxiliary Logging & Third-Party OAuth Expiration (`continueOnFail: true`)
- **OAuth Token Expiration Reality:** External third-party credentials (such as Google Sheets OAuth in Testing mode) undergo token revocation or expiration (e.g. 7-day refresh token lifespans).
- **The Pipeline Freeze Trap:** If an orchestration pipeline calls an external tracking/logging node (e.g. recording row status as `PUBLISHING` in Google Sheets or appending an audit row) sequentially before or in parallel with core execution nodes (Telegram notification, publishing dispatcher, webhook responder), a 401 Unauthorized or expired token on the tracking node will abort the entire execution if `continueOnFail` is false.
- **The Resilience Standard:**
  - On auxiliary status updates, spreadsheet loggers, or non-critical audit HTTP nodes, **ALWAYS** configure `"continueOnFail": true`.
  - This guarantees that even if a logging API experiences temporary credential expiration or rate limits, the core user-facing pipeline (dispatching jobs, sending completion receipts, and responding to webhooks) proceeds without freezing.

---

## Sub-Workflow Orchestration & Activation Standards

### 1. Sub-Workflow Activation Prerequisite Gate
- **The Published Dependency Rule**: When a parent workflow that is `active: true` contains `n8n-nodes-base.executeWorkflow` nodes, or when activating a parent workflow, n8n validates the state of all referenced child workflows.
- If any referenced child sub-workflow is `active: false`, n8n rejects `PUT /api/v1/workflows/{id}` or activation with `HTTP 400: Cannot publish workflow: Node references workflow <ID> which is not published. Please publish all referenced sub-workflows first.`
- **Mandatory Procedure**: Always activate all child sub-workflows (`POST /api/v1/workflows/{child_id}/activate`) **BEFORE** deploying or activating the parent workflow.

### 2. `executeWorkflowTrigger` TypeVersion Compatibility
- **TypeVersion 1 vs 1.1**: In `n8n-nodes-base.executeWorkflowTrigger` (typeVersion 1.1), n8n requires explicit `workflowInputs` schema definition (`Missing or invalid required parameters: workflowInputs`), rejecting activation if empty.
- **Resilient Standard**: Use `typeVersion: 1` with `parameters: {}`. It activates immediately without schema friction and passes all incoming `$input.first().json` data seamlessly into the sub-workflow pipeline.

### 3. Active Workflow Native Credential Enforcement Gate
- When updating an active workflow (`PUT /api/v1/workflows/{id}`) that contains a native integration node requiring credentials (e.g. `n8n-nodes-base.youTube` needing `youTubeOAuth2Api`), n8n rejects saving if the credential is not yet provisioned: `HTTP 400: Cannot publish workflow: 1 node have configuration issues: Node "...": Missing required credential: ...`.
- **Mitigation Pattern**: If credentials for a native node are pending setup, encapsulate the node inside a dedicated Sub-Workflow (`Execute Workflow` node on the main canvas). This maintains a clean single-node representation on the main canvas and prevents credential blockers from freezing deployment of the overall pipeline.

### 4. Multi-Platform Sequential Chaining vs Monolithic Node
- When distributing content across multiple social platforms (YouTube, IG, TikTok, FB, X), avoid bundling everything into one monolithic Code/HTTP node.
- Chain separate platform nodes sequentially on the main canvas (`[PUBLISH] Platform A` -> `[PUBLISH] Platform B` -> `...`) with `continueOnFail: true` leading into a final `[FILTER] / [AGGREGATE]` node.
- **Why**: Sequential chaining prevents race conditions and parallel merge collisions at the collector, while `continueOnFail: true` ensures an outage or rate-limit on one platform (e.g. Meta Graph API) never aborts publishing on remaining channels.

---

## MCP Server Transport & Protocol Requirements

### Streamable HTTP Header Constraint
- When interacting directly with the `n8n-official` MCP endpoint (`https://<domain>/mcp-server/http`), clients **must** pass:
  `Accept: application/json, text/event-stream`
- Passing `Accept: application/json` or `Accept: text/event-stream` alone will fail with `HTTP 406 Not Acceptable: Client must accept both application/json and text/event-stream`.
- Supported MCP protocol version is `2024-11-05` over Bearer OAuth token.

---

## Integration Patterns & Node-Specific Pitfalls

### Telegram Dispatch Node (`n8n-nodes-base.telegram`)
- **Forum Topics / Threads**: To send to a Telegram forum topic, set `chatId` to the supergroup ID (e.g. `"-1004349640522"`) and pass `parameters.additionalFields.message_thread_id` as the numeric topic ID.
- **Native Inline Keyboard (`replyMarkup: "inlineKeyboard"`)**:
  Instead of raw HTTP POST with JSON body strings, use n8n's native schema to securely attach inline buttons while keeping bot tokens inside n8n's credential store:
  ```json
  {
    "replyMarkup": "inlineKeyboard",
    "inlineKeyboard": {
      "rows": [
        {
          "row": {
            "buttons": [
              {
                "text": "✅ Setujui & Terbitkan",
                "additionalFields": { "url": "={{ $json.approveUrl }}" }
              },
              {
                "text": "✏️ Minta Revisi",
                "additionalFields": { "url": "={{ $json.reviseUrl }}" }
              }
            ]
          }
        }
      ]
    }
  }
  ```
- **Standard Telegram Report v2.7.0 Compliance**:
  When assembling Telegram reports or notifications in n8n Code nodes:
  - Header & Subtitle: Heading 1 immediately followed by italic subtitle on the next line without blank space (`# 🚀 [OCTA-HUB] JUDUL\n*Subjudul | Spesialis: ...*`).
  - Metadata Spacing: One blank line (`\n\n`) before metadata bullet items.
  - Horizontal vs List Separator: Use vertical pipe `|` for horizontal inline separation (dates, subtitles, metrics). The bullet `•` is strictly reserved for list items at the start of a new line (*start of line*). Never place `•` inline.
  - Action Buttons Mandatori for URLs: Format all links as prominent pointer buttons `👉 [**<Emoji> <Label Aksi> ↗️**](url)` (or native inline keyboard button `reply_markup`).
- **Cloud Workflow vs Local Script Synchronization**:
  Helper scripts on disk (e.g. `update_n8n_rich.py` or local markdown templates) do NOT automatically reflect in live production n8n workflows. Always deploy updated node parameters directly via `PUT /api/v1/workflows/{id}` and keep local script files synchronized.
- **HTML Collapsible / Accordion Pitfall**: The Telegram Bot API HTML parser rejects `<details><summary>` with `Bad Request: can't parse entities: Unsupported start tag "details"`. In n8n HTML messages, **always use `<blockquote expandable>`** for collapsible preview blocks. (Note: when sending via Hermes `sendRichMessage` adapter over Markdown, `<details><summary>` is automatically converted to native expandable components).
- **HTML Email Parsing into Clean Markdown**: When extracting emails from Gmail nodes (`simple: false`), `data.text` or `snippet` often strips CTA buttons and dumps raw unreadable click-tracking URLs (`https://link.../emailclick?q=...`) or `[https://...png]` tracking pixels. In the preprocessing Code node:
  - Convert CTA buttons into visual button links: `👉 [ 🔘 Button Text ](url)`.
  - Convert regular hyperlinks into Markdown: `[Link Text](url)`.
  - Strip tracking pixels (`<img>` tags without alt or with tracking domains).
  - Convert image-wrapped links without alt (`<a><img .../></a>`) into clean visual links: `👉 [ 🖼️ Buka Banner Promo / Lampiran Visual ](url)` rather than dropping them or dumping raw URLs.
  - Maintain heading hierarchy (`###`), bold (`**`), and bullet lists (`•`).
- **Primary CTA Elevation to Inline Keyboard**: When parsing emails or notifications containing actionable buttons (e.g. *Confirm Access*, *Claim Benefit*, *Verify Account*, *Register*), extract the primary CTA (`text`, `url`) in the preprocessing node and surface it as Row 1 in `reply_markup.inline_keyboard`:
  ```json
  [
    [ { "text": "🔘 " + primaryCta.text, "url": primaryCta.url } ],
    [ { "text": "✉️ Buka Email di Gmail", "url": webmailUrl } ]
  ]
  ```
  This brings the native mobile Gmail experience directly to Telegram, allowing users to execute primary actions with one tap without app-switching.
- **HTTP Request Telegram JSON Body Requirement**: When dispatching Telegram payloads via `n8n-nodes-base.httpRequest` using `specifyBody: 'json'` and `jsonBody: '={{ $json.telegramPayloadString }}'`, n8n expects a valid stringified JSON (`JSON.stringify(payload)`), not a raw JavaScript object. Failing to stringify causes `NodeOperationError: The value in the "JSON Body" field is not valid JSON`.
- **Sensitive Code / OTP Masking**: Wrap verification codes and OTP tokens in `<tg-spoiler>CODE</tg-spoiler>` (HTML) or `||CODE||` (Markdown) so users can tap to reveal without exposing secrets in chat.
- **Dynamic Content Sanitization**: Always escape HTML special characters (`&` -> `&amp;`, `<` -> `&lt;`, `>` -> `&gt;`) on unverified fields (`subject`, `from`, `snippet`) before inserting into HTML templates to prevent parser crashes.

### Code Node Network & AI Sandbox Pitfall
- In n8n's Code node sandbox, networking and async primitives like `fetch` and `AbortController` are disabled or undefined (`fetch is not defined`, `AbortController is not defined`).
- **Never call external AI gateways or APIs directly inside a Code node**: Split into a 3-node sequence:
  1. `Code Node`: Prepare sanitized prompt text and structured request body.
  2. `HTTP Request Node` (`n8n-nodes-base.httpRequest`): Call the AI gateway (e.g. 9Router) with explicit timeout (`timeout: 45000`), retry logic, and `onError: "continueRegularOutput"`.
  3. `Code Node`: Clean reasoning tokens (strip `<thinking>...</thinking>` tags) and assemble downstream notification payloads.

### Multi-branch Connection Schema Pitfall
- In n8n workflow definitions, when a single-output node branches to multiple downstream nodes simultaneously (e.g. sending in parallel to Telegram and Google Sheets), **all target nodes must reside in the same inner array of output index 0**:
  ```json
  "connections": {
    "Source Node": {
      "main": [
        [
          { "node": "Telegram Dispatcher", "type": "main", "index": 0 },
          { "node": "Google Sheets Logger", "type": "main", "index": 0 }
        ]
      ]
    }
  }
  ```
- Placing the second target in `main[1]` silently fails because standard single-output nodes do not have an output port at index 1, preventing the second branch from ever executing.

### Edit Fields (Set) Node (`n8n-nodes-base.set`)
- **Field Stripping Pitfall (`includeOtherFields: true`)**: In `n8n-nodes-base.set` (v3.4+), assigning a field (e.g. tagging `account = 'Work'`) strips and drops ALL other incoming fields by default (`includeOtherFields: false`). If an upstream trigger (such as `gmailTrigger` or a webhook) emits item data (`Subject`, `From`, `snippet`, `id`), routing through a Set node without `"includeOtherFields": true` and `"include": "all"` results in downstream nodes losing all trigger properties and receiving only the assigned key.
- **Enrichment Rule**: When adding or tagging fields on incoming data while preserving the payload, always configure:
  ```json
  "parameters": {
    "assignments": { ... },
    "includeOtherFields": true,
    "include": "all"
  }
  ```

### Google Sheets Node (`n8n-nodes-base.googleSheets`)
- **Append Rows**: Use `operation: "append"` with `columns.mappingMode: "autoMapInputData"`.
- **Prevent Column Sprawl (`handlingExtraData: 'ignoreIt'`)**: In `autoMapInputData` mode, n8n defaults to `handlingExtraData: 'insertInNewColumn'`. If incoming `$json` contains formatting fields, calculated strings, or payload objects not present in the spreadsheet header (e.g. `telegramMessage`), n8n mutates the sheet and appends new columns. Always explicitly configure `"options": { "handlingExtraData": "ignoreIt" }` so extraneous fields are ignored and only existing headers receive data.
- **Update Rows with Key Matching (`operation: "update"`)**:
  Avoid hardcoding cell coordinates (such as `'Sheet'!N{{row}}:P{{row}}`) which fail silently when rows are inserted or sorted. Instead, set `columns.mappingMode: "defineBelow"`, `matchingColumns: ["uniqueKeyId"]`, and supply `value: { "uniqueKeyId": "={{ $json.id }}", "status": "PUBLISHED", "updatedAt": "={{ new Date().toISOString() }}" }`. This guarantees idempotent and index-independent record updates.
- **Read Rows Matching Mode (`options.returnAllMatches`)**:
  When reading rows with `operation: "read"` and filtering with `filtersUI` (e.g. `status == 'READY_FOR_REVIEW'`), n8n defaults to `returnFirstMatch`. To process all matching queued records in an ingestion run, explicitly configure `"options": { "returnAllMatches": "returnAllMatches" }`.
- **Top-Level Key Mapping Constraint (`autoMapInputData`)**: In `autoMapInputData` mode, n8n resolves target column headers exclusively against top-level keys in `$json`. If fields are nested inside a sub-object (e.g. `$json.sheetsPayload.ColumnName`), n8n cannot find them and appends empty/blank fields when `options.handlingExtraData: "ignoreIt"` is set. The upstream node must flatten and spread the sheet payload directly into the root of `$json` (`{ ...sheetsPayload }`).
- **Resource Locator Objects (`__rl: true`)**: For `documentId` and `sheetName`, use n8n's Resource Locator schema:
  `documentId: { "__rl": true, "value": "SPREADSHEET_ID", "mode": "id" }`
  `sheetName: { "__rl": true, "value": "SHEET_NAME", "mode": "name" }`

### Polling Trigger Registration & Activation Cycle
- When creating or updating a workflow containing polling triggers (such as `n8n-nodes-base.gmailTrigger`) via REST API while active, the workflow might report `active: true` but have `triggerCount: 0`, leaving the polling intervals unregistered on n8n's internal cron scheduler.
- **Verification & Toggle**: Always check `triggerCount` in the workflow activation response. If `triggerCount` is 0, execute an explicit toggle cycle: `POST /api/v1/workflows/{id}/deactivate` followed by `POST /api/v1/workflows/{id}/activate`. Confirm that the activation returns `triggerCount > 0`.

---

## Core Operational Pitfalls

- **Full-object replacement on REST update**: Failing to fetch and supply existing nodes/connections when renaming or changing metadata wipes the workflow logic. Always do read-modify-write.
- **Bash variable expansion on Code nodes**: When deploying workflows via shell commands or CLI scripts, unescaped `$json` inside JavaScript Code strings is evaluated as an empty bash variable. Always write code payloads via Python script files or properly escape as `\$json`.
- **Node name matching in connections**: The keys in `connections` and the `node` targets in connection arrays must match node `name` properties verbatim.
- **Never expose secrets or API keys**: Do not output authentication headers, Bearer tokens, or n8n API keys in chat or logs.
- **Keep inactive unless directed**: Do not call `n8n_rest_set_workflow_active` or pass `active: true` during testing unless activation is an explicit requirement.
