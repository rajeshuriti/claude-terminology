# Shared UI Components

`src/components/ui/` contains reusable primitives. **Always prefer these over inline repetition** when the pattern matches.

Import from the barrel:
```ts
import { SectionLabel, Badge, CollapsibleSection } from '@/components/ui';
```

---

## SectionLabel

Renders `text-xs font-bold uppercase tracking-wider` with dark-mode muted color.  
Replaces the 30+ inline copies of this heading style.

```tsx
<SectionLabel dm={dm}>Authentication</SectionLabel>

// Custom tag and spacing
<SectionLabel dm={dm} as="h2" className="mb-4">Overview</SectionLabel>
```

Props: `dm`, `children`, `className?`, `as?: 'h2' | 'h3' | 'h4' | 'div'`

---

## Badge

Small rounded pill. Replaces the 27+ inline copies of `text-xs px-2 py-0.5 rounded-full`.

```tsx
// Hex color — background tint + text color via inline style (safe from Tailwind purging)
<Badge color="#0ea5e9">enterprise</Badge>
<Badge color={cat.color}>{cat.label}</Badge>

// Dark-mode-aware neutral badge
<Badge dm={dm}>tag text</Badge>
```

Props: `children`, `color?: string` (hex), `dm?: boolean`, `className?`

---

## CollapsibleSection

Animated accordion with ChevronDown/Up toggle. Replaces the 41+ inline open/close + AnimatePresence patterns.

```tsx
<CollapsibleSection dm={dm} title="Authentication">
  <p className="p-4 text-sm">Content goes here</p>
</CollapsibleSection>

// Open by default + badge on the right
<CollapsibleSection
  dm={dm}
  title="Rate Limits"
  defaultOpen={true}
  headerRight={<Badge color="#ef4444">critical</Badge>}
>
  ...
</CollapsibleSection>
```

Props: `dm`, `title`, `children`, `defaultOpen?: boolean`, `className?`, `headerClassName?`, `headerRight?: ReactNode`

---

## When to add a new shared component

Add to `src/components/ui/` when the same JSX structure (with the same props API shape) appears **3 or more times** across different files. Do NOT extract one-off components.

After adding, export from `src/components/ui/index.ts` and run `npx tsc --noEmit`.
