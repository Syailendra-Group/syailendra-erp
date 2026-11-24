---
trigger: model_decision
description: SCM traceability domain rules for suppliers, harvest, distillation, receipts, QC, lots, labels, and public trace.
---

# SCM Domain Rules

Requirements live in `docs/agent/features/SCM.md`. Treat these as invariants:

1. Every harvest, distillation, receipt, QC, production, packing, and shipment event
   links to its upstream and downstream events.
2. Lots in pending or rejected QC state cannot be reserved or consumed for production.
3. All received oil starts in quarantine (`WH/Input/Quarantine`) until authorized
   release routes it to approved stock.
4. Store declared quantity and actual scale weight separately; variance beyond the
   approved tolerance requires a reason and an authorized disposition.
5. Genealogy is many-to-many: each output lot records every input lot and the consumed
   quantity.
6. Never merge or blend lots in a way that loses the source-lot list.
7. Supplier/farm/distillery master data changes are auditable; deactivate rather than
   delete when history exists.
8. Public trace exposes only the approved projection: no supplier or employee personal
   data, no buyer pricing, no private documents, no internal findings.
9. QR labels carry the public trace URL and the approved GS1 identifier; label IDs and
   URLs are unique, revocable, and auditable. Do not generate production GTINs before
   the company prefix is confirmed by the owner.
10. A partner may only access their own farms, submissions, shipments, and media.
11. Legal identity, permits, and quality documents are required before a supplier is
    approved for procurement or portal access.
12. Do not invent thresholds, test specifications, or certification claims; keep them in
    configuration or mark them as open questions.
