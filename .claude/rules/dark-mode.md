# Dark Mode Pattern

## The rule

Every page component reads `const { darkMode } = useAppStore()` and aliases it to `const dm = darkMode`. This `dm: boolean` is then passed as a prop to every sub-component. **Never** read the store directly inside a sub-component — always accept `dm` as a prop.

## The tw() utility

`src/lib/dm.ts` exports `tw(dark: boolean, ...keys)` which returns the correct Tailwind classes for the current mode. Use this instead of inline ternaries.

```tsx
// ❌ Old — inline ternary (still valid but verbose)
className={`rounded-xl border ${dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}

// ✅ New — tw() utility
import { tw } from '@/lib/dm';
className={`rounded-xl border ${tw(dm, 'card', 'border')}`}
```

## Available tw() tokens

| Token      | Light                          | Dark                           |
|------------|--------------------------------|--------------------------------|
| `page`     | `bg-slate-50`                  | `bg-slate-950`                 |
| `card`     | `bg-white`                     | `bg-slate-900`                 |
| `cardAlt`  | `bg-slate-50`                  | `bg-slate-800`                 |
| `section`  | `bg-slate-50`                  | `bg-slate-800`                 |
| `border`   | `border-slate-200`             | `border-slate-700`             |
| `borderSub`| `border-slate-100`             | `border-slate-800`             |
| `heading`  | `text-slate-900`               | `text-white`                   |
| `body`     | `text-slate-700`               | `text-slate-300`               |
| `muted`    | `text-slate-500`               | `text-slate-400`               |
| `label`    | `text-slate-400`               | `text-slate-500`               |
| `hover`    | `hover:bg-slate-50`            | `hover:bg-slate-800`           |
| `input`    | `bg-white border-slate-200 text-slate-900` | `bg-slate-800 border-slate-600 text-slate-300` |
| `code`     | `bg-slate-900 text-slate-600`  | `bg-slate-900 text-emerald-400`|

## Dynamic colors must use inline styles

Tailwind purges class names that are constructed at runtime. For any color that comes from a variable (hex string, prop, etc.), use `style={{ color: value }}` — never `className={\`text-${value}-500\`}`.

```tsx
// ❌ purged at build time
<div className={`bg-${cat.color}-500`} />

// ✅ survives build
<div style={{ background: cat.color + '22', color: cat.color }} />
```
