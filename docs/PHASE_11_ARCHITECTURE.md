# Phase 11 — Full Report Experience Architecture

## Summary

Phase 11 replaces the popup dashboard with a **minimal launcher** and moves the full audit experience into a **dedicated report tab** at:

`chrome-extension://<id>/src/report/index.html?tabId=<tabId>#/…`

The audit engine, collectors, enterprise audits, and AI systems are unchanged. Only the presentation layer was redesigned.

---

## Updated Folder Structure

```
src/
├── popup/                    # Minimal launcher only
│   ├── PopupLauncher.tsx     # Branding, URL, Analyze, progress, last scan, Settings
│   ├── App.tsx
│   └── store/auditStore.ts   # Re-exports @shared/audit
│
├── report/                   # Full-page SaaS-style report app
│   ├── index.html
│   ├── main.tsx
│   ├── App.tsx               # HashRouter + RouterProvider
│   ├── layout/
│   │   ├── ReportLayout.tsx  # Shell: header, sidebar, outlet, command palette
│   │   ├── ReportHeader.tsx  # Site info, score ring, exports
│   │   └── ReportSidebar.tsx # Sticky section navigation
│   ├── navigation/
│   │   ├── routes.ts         # Nav items + issue filters
│   │   └── reportRoutes.tsx  # Lazy route table
│   ├── pages/                # Code-split section pages
│   ├── components/
│   │   ├── IssueCard.tsx     # Full issue card + virtual list
│   │   ├── CommandPalette.tsx
│   │   ├── IssueFilters.tsx
│   │   └── ReportPageShell.tsx
│   ├── store/
│   │   ├── uiStore.ts        # Filters, pins, bookmarks, palette
│   │   └── historyStore.ts   # Scan history + compare
│   ├── utils/export.ts       # JSON, Markdown, PDF (print)
│   └── messaging/reportBus.ts
│
└── shared/audit/             # Shared audit state + channel
    ├── auditStore.ts
    ├── auditChannel.ts
    └── openReportTab.ts
```

---

## Navigation Architecture

| Layer | Technology | Notes |
|-------|------------|-------|
| Report routing | `react-router-dom` HashRouter | Works with extension `chrome-extension://` URLs |
| Tab context | `?tabId=` query param | Hydrates audit for the analyzed browser tab |
| Section nav | Sticky sidebar + Ctrl+K palette | 20 sections (Overview → AI Assistant) |
| Popup | No router | Single `PopupLauncher` view |

**Auto-open flow:** `auditOrchestrator.handleAuditCompleted` → `openReportTab(tabId)` → focuses existing report tab or creates a new one.

---

## UI Architecture

```
ReportLayout
├── ReportHeader        (glass panel, score ring, export actions)
├── ReportSidebar       (resizable, sticky nav)
├── <Outlet />          (lazy-loaded page)
└── CommandPalette      (Ctrl+K)
```

**Design tokens:** Existing Tailwind `auditor.*` palette, `glass-panel`, `ScoreRing`, framer-motion transitions.

**Issue cards** include: title, severity, impact, score gain, effort, affected resources, evidence, expand, Explain with AI, show/copy code, documentation links, pin/bookmark.

**Popup** contains only: branding, current URL, Analyze button, progress bar, last scan timestamp, Settings shortcut (opens report `#/settings`).

---

## State Management

| Store | Scope | Persistence |
|-------|-------|-------------|
| `useAuditStore` (`@shared/audit`) | Live audit state | Session via background `GET_LAST_AUDIT` |
| `useReportUiStore` | Filters, pins, bookmarks, palette | `chrome.storage.local` (partial) |
| `useScanHistoryStore` | Recent scans, compare selection | `chrome.storage.local` |

**Messaging:** `popup` and `report` endpoints each register `initializeAuditChannel` listeners via a `WeakSet` guard.

---

## Performance Strategy

| Area | Approach |
|------|----------|
| Popup | No dashboard/widgets; instant open |
| Report entry | Separate Vite HTML input (`rollupOptions.input.report`) |
| Routes | `React.lazy()` per section |
| Issue lists | `@tanstack/react-virtual` virtualization |
| Shared chunks | Popup and report share `globals`, `MessageBus`, analysis engines via dynamic imports |

---

## Build Verification

```bash
npm run build   # ✓ dist/src/report/index.html present
npm test        # ✓ enterprise audit tests
npm run lint    # ✓
```

Load unpacked extension from `dist/`. Analyze a page from the popup; the report tab opens automatically with the latest audit.

---

## Key Files Changed

- `vite.config.ts` — `@report` alias + `rollupOptions.input.report`
- `manifest.config.ts` — unchanged (report is extra HTML input)
- `src/shared/messaging/types.ts` — `report` endpoint
- `src/background/auditOrchestrator.ts` — auto-open report on completion
- `src/popup/App.tsx` — launcher only
