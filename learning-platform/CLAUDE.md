# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `learning-platform/`:

```bash
npm run dev       # start Vite dev server (HMR)
npm run build     # tsc -b && vite build (full type-check + bundle)
npm run lint      # eslint on all source files
npm run preview   # serve the production build locally
npx tsc --noEmit  # fast type-check without building (use to verify changes)
```

There are no tests. Use `npx tsc --noEmit` after every change to confirm zero TypeScript errors before reporting a task as done.

## Architecture

### Stack
- **React 19 + Vite 8** — SPA, no SSR
- **TypeScript** — strict mode: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin (no `tailwind.config.js`)
- **Framer Motion** — used throughout for `motion` components and `AnimatePresence`
- **Zustand** with `persist` middleware — single store at `src/store/appStore.ts`
- **React Router v7** — all routes in `src/App.tsx`

### Path alias
`@/` resolves to `src/`. Use it for all imports within `src/`.

### Key TypeScript constraint
`verbatimModuleSyntax` is enabled. Type-only imports **must** use `import type`:
```ts
import type { Concept } from '@/types';           // ✅
import { type Concept } from '@/types';           // ✅
import { Concept } from '@/types';               // ❌ — compile error
```

### Styling constraint
Tailwind's CSS purging removes dynamically constructed class names. Use **inline styles** for any color that depends on a variable:
```tsx
// ❌ purged at build time
<div className={`bg-${color}-500`} />

// ✅ survives build
<div style={{ background: color }} />
```

### Global state (`src/store/appStore.ts`)
Single Zustand store with localStorage persistence (`claude-learning-platform` key). Persisted fields: `darkMode`, `learningMode`, `completedConcepts`, `bookmarkedConcepts`, `recentlyViewed`, `quizScores`, `totalQuizAttempts`, `totalCorrect`.

All page components read dark mode as `const { darkMode } = useAppStore()` and pass `dm={darkMode}` to child components via props (not React context).

### Routing (`src/App.tsx`)
All routes share the `<Layout>` shell (fixed sidebar + header, scrollable main). To add a route:
1. Create `src/pages/MyPage.tsx` exporting a named component
2. Import it in `App.tsx` and add `<Route path="/path" element={<MyPage />} />`
3. Add a nav item to the `navItems` array in `src/components/layout/Sidebar.tsx`

Each sidebar nav item is `{ path, icon, label, emoji?, isNew? }`. Items with `isNew: true` show a "NEW" badge. Active-state gradient colors are mapped by `path` inside the `className` callback — add a new `path === '/your-path'` branch there to give the item a distinct gradient.

### Data layer (`src/data/`)
Pure TypeScript data files — no API calls, everything is static:

| File | Contents |
|------|----------|
| `concepts.ts` | ~85 `Concept` objects (the glossary) |
| `enrichedConceptContent.ts` | Deep educational content per concept; `generateFallbackContent()` used when a concept lacks an `enrichedContent` entry |
| `categories.ts` | 13 `Category` objects; `categoryMap` is the `Record<id, Category>` |
| `comparisons.ts` | Pre-built side-by-side comparison tables |
| `connectorsData.ts` | 15 enterprise connectors, 5 workflow simulations, MCP content, security content |
| `examGuideData.ts` | Official exam guide content (5 domains, 27 subdomains) |
| `quizData.ts` | Quiz questions per concept |
| `roadmaps.ts` | Study roadmap definitions |
| `internalsData.ts` | Claude Internals page data |
| `slashCommandsData.ts` | Slash Commands Studio data |
| `certificationQuizData.ts` | Certification practice exam questions |

`conceptMap` (from `concepts.ts`) and `categoryMap` (from `categories.ts`) are both exported `Record<string, T>` for O(1) lookup by ID.

### `EnrichedContent` interface (`enrichedConceptContent.ts`)
The central rich-content type. Notable optional fields that extend the base:
- `simulatorType` — renders an inline interactive simulator on the concept detail page (`'temperature' | 'top-p' | 'context-window' | 'chunking' | 'rag-pipeline'`)
- `primaryAnalogy` / `enterpriseAnalogy` — `RichAnalogy` objects used in the Real World tab and Compare page
- `modesTable` — `ModeEntry[]` rendered as a 3-column table on the Real World tab

### Page architecture
Pages are large single-file components. Each page:
- Reads `darkMode` from `useAppStore()` and threads `dm` as a prop to all sub-components
- Uses `AnimatePresence` + `motion.div` for tab transitions
- Has internal sub-components defined in the same file (not split into separate files)

The `ConceptDetailPage` has 5 built-in simulators (Temperature, TopP, ContextWindow, Chunking, RagPipeline) and 6 tabs (Understand, Real World, Pitfalls, Tradeoffs, Simulate, Cert Prep).

The `ComparePage` has a "Live Compare" tab that shows `AnalogyContrast` — if both selected concepts share the same `primaryAnalogy.domain`, it renders `SharedDomainContrast` (unified view); otherwise `SeparateDomainContrast` (split panels).

The `ConnectorsPage` has 5 tabs: Overview, Connector Library (searchable drawer), Workflow Simulations (animated step player), MCP Deep Dive (interactive architecture diagram), Security & Enterprise.

### Search
`src/hooks/useSearch.ts` wraps Fuse.js (fuzzy search) over all concepts. Threshold: 0.35. Weights: term (3×), category (2×), description (2×), tags (1.5×).

## Deployment

`vercel.json` lives at the **repo root** (one directory above `learning-platform/`). Vercel is configured to run `cd learning-platform && npm install` / `npm run build` and serve `learning-platform/dist`. When working locally the `npm run *` commands must still be run from inside `learning-platform/`.
