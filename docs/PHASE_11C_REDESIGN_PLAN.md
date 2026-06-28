# Phase 11C — UI/UX Redesign Plan

**Scope:** Presentation layer only. No changes to audit engines, AI, analysis, scoring, storage, or messaging.

## Design North Star

A premium developer tool that feels closer to **Lighthouse + Linear + Vercel** than a widget dashboard: calm dark surfaces, one clear hero metric, progressive disclosure for technical depth, and motion with intent ([Its Hover](https://www.itshover.com/) icons).

---

## User Flow (New)

```
Extension icon click
    → Minimal popup (420px)
    → Hero + URL chip + "Analyze Website" CTA
    → Animated scan state (progress + collector label + phase steps)
    → Background saves snapshot + opens report tab
    → Popup auto-closes (~800ms after completion)
    → Report tab = primary application surface
```

---

## Information Architecture

### Report shell (hybrid navigation)

| Zone | Width | Role |
|------|-------|------|
| **Icon rail** | 52px | Primary destinations: Overview, Audits, Assets, Tools, AI, Settings |
| **Nav panel** | 0–260px | Collapsible section list for active group; resizable |
| **Main** | flex | Page content, max-width 72rem |

### Overview hierarchy (top → bottom)

1. **Hero** — Overall health score, grade, URL, capture time (single score, no ring grid)
2. **Critical problems** — Top Critical/High issues (horizontal cards)
3. **Quick wins** — Top fix opportunities (existing fix planner data)
4. **Category scores** — Horizontal bar chart (not duplicate rings)
5. **Issue summary** — Severity metrics row
6. **Audit coverage** — Enterprise coverage (accordion, collapsed by default)
7. **Technical evidence** — Web Vitals + validation (compact)
8. **Developer / passed / unsupported** — Accordion sections

---

## Design System v2 (tokens)

### Color

- **Canvas** `#070708` — app background
- **Elevated** `#0c0c0f` — panels
- **Surface** `#121216` — cards
- **Accent** `#7c3aed` → `#8b5cf6` gradient (primary actions)
- **Semantic** success / warning / danger unchanged, used sparingly

### Typography

| Token | Size | Use |
|-------|------|-----|
| `display` | 2.5rem / bold | Hero score |
| `title` | 1.25rem / semibold | Page titles |
| `body` | 0.875rem | Default |
| `caption` | 0.625rem | Meta, labels |

### Spacing scale

4, 8, 12, 16, 20, 24, 32, 40, 48, 64 (px)

### Radius

- `sm` 6px — chips, inputs
- `md` 10px — buttons
- `lg` 14px — cards
- `xl` 20px — hero panels

### Motion

- Page enter: 200ms fade + 6px Y
- Card stagger: 40ms delay
- Respect `prefers-reduced-motion`
- Icon hover: Its Hover micro-animations on nav + CTA only

---

## Component Strategy

| Component | Change |
|-----------|--------|
| `Button` | Gradient primary, active scale feedback |
| `Card` | `elevated` variant, subtle border glow on focus |
| `Section` | Optional `actions` slot, divider style |
| `States` | Illustrated empty/error with icons |
| `ProgressBar` | Scan variant with shimmer |
| `PopupLauncher` | Full redesign + auto-close |
| `ReportHeader` | Compact command bar |
| `ReportNavRail` | New — icon navigation |
| `ReportSidebar` | Grouped, collapsible, Its Hover icons |
| `Overview*` | New presentation wrappers in `report/components/overview/` |

---

## Icons (Its Hover)

MIT-licensed animated icons from [github.com/itshover/itshover](https://github.com/itshover/itshover), adapted to use `framer-motion` (already in project).

| Icon | Use |
|------|-----|
| `scan-heart-icon` | Analyze / scanning |
| `rocket-icon` | Launch CTA |
| `home-icon` | Overview |
| `chart-line-icon` | Performance |
| `accessibility-icon` | Accessibility |
| `shield-check` | Security |
| `sparkles-icon` | AI |
| `gear-icon` | Settings |
| `layout-dashboard-icon` | Dashboard group |
| `triangle-alert-icon` | Critical issues |
| `checked-icon` | Passed checks |
| `history-circle-icon` | History |

---

## Accessibility

- WCAG AA contrast on all text
- Focus rings on all interactive elements
- `aria-label` on icon-only nav
- Keyboard: rail → panel → main tab order
- Reduced motion disables icon animations and page transitions

---

## Performance

- Lazy routes unchanged
- `@tanstack/react-virtual` for issue lists unchanged
- Icon components tree-shaken per import
- No new heavy chart libraries — CSS bars for category scores

---

## Out of Scope (preserved as-is)

- Audit / enterprise / AI / analysis / scoring engines
- Fix planner logic
- Snapshot storage & message bus
- All API integrations
