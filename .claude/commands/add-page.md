Scaffold a new page in this learning platform. The user will provide the page name and path. Follow ALL of these conventions exactly:

## Page file (`src/pages/<Name>Page.tsx`)

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';

// Sub-components go here, above the main component.
// Each sub-component accepts `dm: boolean` as a prop for dark mode.

export function <Name>Page() {
  const { darkMode } = useAppStore();
  const dm = darkMode;

  return (
    <div className={`flex flex-col h-full ${dm ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Page Header */}
      <div className={`px-6 py-5 border-b shrink-0 ${dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <h1 className={`text-xl font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>Page Title</h1>
        <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Subtitle</p>
      </div>

      {/* Tab Bar (if tabbed) */}
      {/* ... */}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div key="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {/* tab content */}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
```

## Wire up the route (`src/App.tsx`)

1. Import: `import { <Name>Page } from '@/pages/<Name>Page';`
2. Add: `<Route path="/<path>" element={<\<Name>Page />} />`

## Wire up the sidebar (`src/components/layout/Sidebar.tsx`)

Add to the `navItems` array:
```ts
{ path: '/<path>', icon: null, label: '<Label>', emoji: '<emoji>', isNew: true }
```

And add a gradient branch for the new path inside the `className` callback (copy the pattern from `/connectors` or `/study`).

## Rules

- ALL color values that depend on a variable must use `style={{ color: value }}` not `className={`text-${value}`}` (Tailwind purges dynamic classes).
- Use `import type` for any type-only import (`verbatimModuleSyntax` is enabled).
- No unused imports or variables (`noUnusedLocals` is enabled).
- After creating the file, run `npx tsc --noEmit` from `learning-platform/` and fix any errors before reporting done.
