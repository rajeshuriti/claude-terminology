# Claude Learning Platform

An interactive learning platform for the **Anthropic Claude Solutions Architect Foundation** certification. Covers Claude concepts, MCP (Model Context Protocol), prompt engineering, agent orchestration, and hands-on labs — all in a single SPA.

---

## Live Platform

Deployed on Vercel. All routes are handled client-side by React Router.

---

## What's Inside

### Certification Prep
| Route | Description |
|---|---|
| `/` | Dashboard — progress stats and quick access |
| `/explorer` | Concept glossary — 85+ Claude concepts with deep-dive detail |
| `/graph` | Visual concept relationship graph |
| `/compare` | Side-by-side concept comparison |
| `/quiz` | Quiz & flashcards |
| `/roadmap` | Study roadmaps |
| `/study` | Exam study guide (5 domains, 27 subdomains) |
| `/certification` | Full practice exam |

### Engineering Tools
| Route | Description |
|---|---|
| `/cheat-sheets` | Quick CLI & slash command reference |
| `/command-center` | Advanced reasoning modes, prompt engineering, orchestration |
| `/commands` | Slash commands interactive studio |
| `/architecture` | Visual architecture explorer |

### Systems & Labs
| Route | Description |
|---|---|
| `/context-lab` | Interactive context window & token learning lab |
| `/mcp-mastery` | Deep MCP learning path |
| `/connectors` | Enterprise connectors, workflow simulations |
| `/mcp-ecosystem` | MCP marketplace with install guides for 20 servers |
| `/failure-lab` | AI failure simulation & chaos engineering lab |
| `/internals` | Claude internal execution model |

---

## Tech Stack

- **React 19 + Vite 8** — SPA, no SSR
- **TypeScript** — strict mode (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`)
- **Tailwind CSS v4** — via `@tailwindcss/vite` (no `tailwind.config.js`)
- **Framer Motion** — animations and tab transitions
- **Zustand** — global state with `localStorage` persistence
- **React Router v7** — client-side routing
- **Fuse.js** — fuzzy search across all concepts

---

## Getting Started

```bash
cd learning-platform
npm install
npm run dev        # start dev server at http://localhost:5173
```

### Other commands

```bash
npm run build      # type-check + production bundle → learning-platform/dist
npm run lint       # ESLint on all source files
npm run preview    # serve the production build locally
npx tsc --noEmit   # fast type-check without building
```

---

## Project Structure

```
learning-platform/
├── src/
│   ├── pages/          # one file per route, self-contained
│   ├── components/
│   │   ├── layout/     # Sidebar, Header, Layout shell
│   │   └── ui/         # SectionLabel, Badge, CollapsibleSection
│   ├── data/           # pure TypeScript data files (no API calls)
│   ├── store/          # Zustand store (appStore.ts)
│   ├── hooks/          # useSearch (Fuse.js)
│   └── lib/            # tw() dark-mode utility
├── CLAUDE.md           # AI project memory — architecture reference
└── .claude/rules/      # TypeScript, dark-mode, and component rules
```

### Key data files

| File | Contents |
|---|---|
| `concepts.ts` | 85+ `Concept` objects (the SA cert glossary) |
| `ecosystemDiscoveryData.ts` | 20 MCP servers with install guides |
| `aiEcosystemData.ts` | 17 AI skills with npx install info |
| `commandCenterData.ts` | 18 reasoning/orchestration sections |
| `cheatSheetData.ts` | 13 CLI reference sections |
| `connectorsData.ts` | Enterprise connectors, workflows, MCP content |
| `failureLabData.ts` | AI failure patterns, incidents, simulations |
| `contextLabData.ts` | Token/context interactive lab data |

---

## Deployment

Vercel config is at the **repo root** (`vercel.json`). The build runs `cd learning-platform && npm run build` and serves `learning-platform/dist`.

```json
{
  "buildCommand": "cd learning-platform && npm run build",
  "outputDirectory": "learning-platform/dist"
}
```

---

## Development Notes

- **Dark mode**: every page reads `const { darkMode } = useAppStore()`, aliases to `const dm = darkMode`, and passes it as a prop to sub-components. Use `tw(dm, 'token')` from `src/lib/dm.ts` for dark-mode-aware classes.
- **TypeScript**: use `import type` for all type-only imports. Delete (don't rename) unused variables — `_` prefix does not silence errors here.
- **No tests**: use `npx tsc --noEmit` after every change to confirm zero errors before committing.
- **Routing**: add new pages by creating `src/pages/MyPage.tsx`, importing in `App.tsx`, adding a `<Route>`, and adding a nav item to `Sidebar.tsx`.
