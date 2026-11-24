# DCM — Distribution Channel Management

**Status:** Skeleton — structure and verified route inventory recorded; business
requirements not yet mapped with the owner. Do not treat the "Planned scope" section as
approved requirements.

**Primary entity:** SAMMEND (commercial)

## 1. Purpose

Manage downstream channels: distributors, resellers, marketplaces, and the omnichannel strategy for finished goods.

## 2. Route inventory (verified 2026-11-23)

| Route | Notes |
| :--- | :--- |
| `(dashboard)/dcm` | |

## 3. Current state

Landing route `/dcm` only; `src/features/dcm/` exists. Requirements not yet mapped.

## 4. Planned scope (to be validated)

- Channel master data with terms, territories, and pricing tiers.
- Channel-specific catalogue and stock availability.
- Order intake per channel and fulfilment linkage to WMS.
- Channel performance and dispute tracking.

## 5. Dependencies

- Product and pricing master data.
- WMS dispatch integration.
- Owner decision on channel list and commercial policy.

## 6. Open questions

- Which channels are active (direct B2B, distributor, marketplace, export agent)?
- Is territory/price protection required?
- Does the ERP integrate with any marketplace API in phase one?
