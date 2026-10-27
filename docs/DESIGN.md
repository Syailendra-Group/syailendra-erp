# DESIGN.md — Design System & UI/UX Guidelines

> **Project:** ERP Syailendra Group  
> **Design Framework:** shadcn/ui (`radix-vega` preset `bIkeymG`)  
> **CSS Engine:** Tailwind CSS v4 (CSS-first variables)  
> **Icons:** Lucide Icons (`lucide-react`)  
> **Source Standard:** `satnaing/shadcn-admin` Architecture + `ui-ux-pro-max` Guidelines

---

## 🎨 1. Visual Language & Color Tokens

The visual design system uses an **enterprise dark-theme first** aesthetic with high-contrast accessibility compliance (WCAG AA 4.5:1 ratio):

### 1.1. Color Palette (Semantic Tokens)

- **Background Root:** Deep Obsidian / Slate (`bg-slate-950` / `bg-neutral-950`)
- **Card & Surface:** Dark Elevated Slate (`bg-slate-900` / `border-slate-800`)
- **Brand Primary:** Emerald Agribusiness (`text-emerald-400`, `bg-emerald-500/10`, `border-emerald-500/20`) representing freshness, certified harvest, and completed operations.
- **Brand Secondary / Analytics:** Deep Indigo (`text-indigo-400`, `bg-indigo-500/10`) for analytical charts and enterprise branding.
- **Warning / Waiting:** Amber Gold (`text-amber-400`, `bg-amber-500/10`) for pending approvals and waiting stock availability.
- **Danger / Overdue:** Rose Crimson (`text-rose-400`, `bg-rose-500/10`) for late dispatches, QC defects, and cancelled transfers.

### 1.2. Typography & Fonts

- **Primary Font Family:** Geist Sans / Inter (`font-sans`)
- **Code / Monospace:** Geist Mono (`font-mono`) for Lot IDs, barcode sequences, and PO tracking codes.
- **Scale:**
  - Header H1: `24px` (`text-2xl`), bold, tracking tight.
  - Subheaders H2/H3: `18px` / `16px`, semi-bold.
  - Body Text: `14px` (`text-sm`), regular, line-height 1.5.
  - Table & Data Badges: `12px` (`text-xs`), medium / semi-bold.

---

## 📐 2. Layout Wireframe & Navigation Patterns (shadcn-admin Style)

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOPBAR / NAVBAR (Sticky Glassmorphism Header)                          │
│ [Logo] Syailendra Group  │  [📦 Inventory] [🎯 CRM] [⏰ HR] [⚙️ Admin] │ [Octa ▼]│
└────────────────────────────────────────────────────────────────────────┘
┌──────────────┬─────────────────────────────────────────────────────────┐
│ SIDEBAR      │ MAIN CONTENT VIEWPORT (`main.tsx`)                      │
│ (Adaptive)   │                                                         │
│              │ Breadcrumb: Home > Inventory > Stock Ledger             │
│ • Overview   │                                                         │
│ • Stock View │ [ KPI Cards: On-Hand | Ready | Waiting | Late ]        │
│ • Receipts   │                                                         │
│ • Delivery   │ ┌─────────────────────────────────────────────────────┐ │
│ • Trace Lot  │ │ Interactive Data Table (@tanstack/react-table)      │ │
│              │ │ Search: [ Kopi Arabika... ]  Filter: [ WH/Stock ▼ ]  │ │
│ ──────────── │ │ Code  │ Product Name       │ Lot       │ Qty   │ St │ │
│ [Collapse <] │ └─────────────────────────────────────────────────────┘ │
└──────────────┴─────────────────────────────────────────────────────────┘
```

### 2.1. Topbar Multi-Tab Navbar

- Horizontally centered or left-aligned alongside company identity.
- Displays high-level application modules based on authenticated user roles:
  - `[ 📦 Inventory & Logistics ]`
  - `[ 🎯 B2B Sales & CRM ]`
  - `[ ⏰ Attendance & Daily Report ]`
  - `[ ⚙️ Enterprise Settings ]`
- The active tab state updates the URL search param or Zustand store (`activeAppTab`).

### 2.2. Dynamic Adaptive Sidebar

- Automatically swaps navigation groups based on the active Topbar tab:
  - **When Inventory is Active:** Renders _Stock Ledger_, _Receipts (PO)_, _Delivery Orders (SO)_, _Internal Transfers_, _Lot Lineage_.
  - **When CRM is Active:** Renders _Kanban Pipeline_, _Active Leads_, _Customer Accounts_, _Sales Forecast_.
  - **When Attendance is Active:** Renders _Clock-In/Out_, _My Monthly Timesheet_, _Daily Work Report_, _Team Approvals_.
  - **When Settings is Active:** Renders _Company Profile_, _Employee Accounts_, _Role Matrix_.
- Supports collapsible mode (`collapsed = icon-only`).

---

## ♿ 3. Accessibility & Interactive State Standards

1. **Touch Targets:**
   - All interactive controls (buttons, selects, tab triggers) must maintain a minimum touch bounding box of `44px x 44px` on mobile/touch viewports.
2. **Pointer Cursors:**
   - Active cursor pointer is enforced on all button triggers (`--pointer` flag enabled in preset `bIkeymG`).
3. **Form Feedback:**
   - Inline field error messages positioned immediately below the respective input.
   - Global network actions (validating shipments, clocking in) trigger sonner toasts with explicit feedback and error explanations.
