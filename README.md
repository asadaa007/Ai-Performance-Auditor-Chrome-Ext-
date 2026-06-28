# AI Performance Auditor

**Analyze. Understand. Optimize.**

A Chrome Extension (Manifest V3) that audits live web pages for performance, accessibility, SEO, security, and more — then presents results in a full-page report with AI-powered **Explain & Fix** guidance.

---

## What it does

| Capability | Description |
| ---------- | ----------- |
| **Live page audit** | Content scripts collect Web Vitals, resources, DOM, images, CSS/JS, fonts, accessibility signals, headers, storage, and more |
| **Rule-based analysis** | Detects performance issues with severity, impact, and affected resources |
| **Enterprise audit engine** | Lighthouse-compatible audit inventory with coverage, confidence, and category scoring |
| **Fix planner** | Prioritized fix groups and actions tailored to detected stack (React, WordPress, etc.) |
| **Immutable snapshots** | Each completed audit is frozen as a snapshot; reports never change when the live page changes |
| **AI Explain & Fix** | Streamed explanations with Markdown, code examples, and fix guidance |
| **Export** | JSON, Markdown, and print-to-PDF from the report header |

---

## User flow

1. Click the extension icon → **minimal popup launcher** opens.
2. Click **Analyze Website** → animated scan with collector progress.
3. When the audit completes, a **report tab** opens automatically and the popup closes.
4. The **report** is the main app: overview dashboard, category sections, AI assistant, settings, and history.

Report URL shape:

```text
chrome-extension://<extension-id>/src/report/index.html?auditId=<snapshot-id>#/
```

Hash routes (`#/performance`, `#/accessibility`, etc.) select report sections. The `auditId` query parameter loads the immutable snapshot.

---

## Report experience

### Navigation

- **Icon rail** — Overview, Audits, Assets, Tools (collapsible section panel)
- **Command palette** — `Ctrl+K` / `⌘+K` to jump to any section
- **Full-width layout** — content uses the available width beside navigation

### Overview dashboard

Structured for developers, not a wall of text:

- Health hero (score, grade, URL, coverage)
- Findings severity breakdown
- Category health map (click through to sections)
- Critical issues strip
- Quick wins with **Explain & Fix**
- Core Web Vitals (3 cards per row on desktop)
- Enterprise audit coverage
- Technical snapshot + detected stack
- Lighthouse validation table

### Report sections

Overview, Developer Mode, Performance, Accessibility, SEO, Best Practices, Security, Network, Resources, Images, Fonts, JavaScript, CSS, DOM, Storage, Third-party, Headers, History, Settings, AI Assistant.

---

## AI providers

Configure in **Report → Settings** or **Popup → Settings** (opens report settings).

| Provider | Notes |
| -------- | ----- |
| OpenAI | Default; fast for Explain & Fix |
| Anthropic | Claude models |
| Google Gemini | Gemini API |
| OpenRouter | Multi-model gateway |
| Ollama | Local models (`ollamaBaseUrl` in settings) |
| Cursor | [Cursor Cloud Agents API](https://cursor.com/docs/cloud-agent/api/endpoints); requires storage mode enabled on your Cursor account; slower than chat APIs |

API keys are stored in `chrome.storage.local`. **Test connection** validates the key; **Explain & Fix** runs the full provider flow (for Cursor, a cloud agent with streaming).

**Cursor notes:** Explain requires a Cursor account with **Privacy Mode + storage** enabled (Legacy/Ghost mode will fail). Test connection only calls `GET /v1/me`. Cloud agents are slower than chat APIs; pick a valid model in Settings if the default (`composer-2`) is rejected.

---

## Tech stack

- **React 19** + **TypeScript**
- **Vite 7** + [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin) (MV3 build)
- **Tailwind CSS** — `auditor.*` design tokens
- **Framer Motion** — page transitions and micro-interactions
- **[Its Hover](https://www.itshover.com/)** icons (MIT) — animated nav icons in `src/shared/icons/itshover/`
- **Zustand** — audit, report UI, and snapshot state
- **React Router** — hash routing in the report app
- **Vitest** — unit tests for scoring and enterprise audit engine
- **@tanstack/react-virtual** — virtualized issue lists

---

## Project structure

```text
ai-performance-auditor/
├── public/icons/           # Extension icons (source of truth)
├── scripts/
│   └── generate-icons.mjs  # Placeholder icons if PNGs missing; runs before build
├── docs/                   # Phase architecture & UX docs
└── src/
    ├── background/         # Service worker, audit orchestration, snapshots, AI router
    ├── content/            # Collectors injected into audited pages
    ├── popup/              # Minimal launcher (PopupLauncher.tsx)
    ├── report/             # Full-page report app (primary UI)
    │   ├── layout/         # Header, icon rail, sidebar
    │   ├── pages/          # Lazy-loaded section pages
    │   ├── components/     # Issue cards, overview dashboard, command palette
    │   └── navigation/     # Routes and nav groups
    ├── features/
    │   ├── analysis/       # Rule engine and issue detection
    │   ├── scoring/        # Category and overall scores
    │   ├── enterprise-audit/  # Lighthouse-style audit inventory
    │   ├── fix-planner/    # Prioritized fix actions
    │   ├── ai/             # Provider abstraction and settings
    │   └── ai-explain/     # Explain & Fix prompts and cache
    └── shared/             # Components, messaging, types, audit channel
```

---

## Prerequisites

- Node.js 20+
- npm 10+

---

## Setup

```bash
cd ai-performance-auditor
npm install
```

Icons: place PNGs in `public/icons/` (see [Extension icons](#extension-icons)). `npm run build` runs `npm run icons` first.

---

## Development

```bash
npm run dev
```

Load in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the `dist` folder (created on first build)

CRXJS provides HMR for the popup and report during development.

---

## Build

```bash
npm run build
```

Output: `dist/`. Reload the extension on `chrome://extensions` after each build.

---

## Extension icons

**Canonical location:**

```text
ai-performance-auditor/public/icons/
├── icon-16.png
├── icon-32.png
├── icon-48.png
└── icon-128.png
```

### Rules

1. Use exact filenames: `icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png`.
2. Edit **`public/icons/` only** — `dist/` is recreated on every build.
3. Do not rely on a root `icons/` folder; it is not used.
4. After replacing icons: `npm run build`, then **Reload** on `chrome://extensions`.

### Usage

| Where | Source |
| ----- | ------ |
| Chrome toolbar & extension list | `manifest.config.ts` → `public/icons/` |
| Popup & report header | `ExtensionLogo` component |
| Built output | `dist/public/icons/` (copied during build) |

If any required PNG is missing, `npm run icons` generates purple placeholders — replace them with your assets.

---

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Icons → TypeScript → production build |
| `npm run icons` | Generate or validate `public/icons/` |
| `npm run test` | Run Vitest unit tests |
| `npm run test:watch` | Vitest watch mode |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |

---

## Path aliases

| Alias | Path |
| ----- | ---- |
| `@/*` | `src/*` |
| `@shared/*` | `src/shared/*` |
| `@popup/*` | `src/popup/*` |
| `@report/*` | `src/report/*` |
| `@background/*` | `src/background/*` |
| `@content/*` | `src/content/*` |
| `@features/*` | `src/features/*` |

---

## Documentation

| Document | Topic |
| -------- | ----- |
| [docs/PHASE_11_ARCHITECTURE.md](docs/PHASE_11_ARCHITECTURE.md) | Popup launcher + report tab architecture |
| [docs/PHASE_11B_SNAPSHOT_LIFECYCLE.md](docs/PHASE_11B_SNAPSHOT_LIFECYCLE.md) | Immutable `auditId` snapshots |
| [docs/PHASE_11B_UX_AUDIT.md](docs/PHASE_11B_UX_AUDIT.md) | UX audit and design system notes |
| [docs/PHASE_11C_REDESIGN_PLAN.md](docs/PHASE_11C_REDESIGN_PLAN.md) | Phase 11C UI/UX redesign plan |
| [docs/PHASE_10B_IMPLEMENTATION_REPORT.md](docs/PHASE_10B_IMPLEMENTATION_REPORT.md) | Enterprise audit engine |

---

## License

Private — not for distribution.
