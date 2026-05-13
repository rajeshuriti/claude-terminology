# TypeScript Constraints

This project enforces strict TypeScript. Understand these before editing any `.ts` or `.tsx` file.

## verbatimModuleSyntax

Type-only imports **must** use `import type`. The compiler rejects runtime imports of types.

```ts
import type { Concept } from '@/types';        // ✅
import { type Concept } from '@/types';        // ✅
import { Concept } from '@/types';             // ❌ TS1484 compile error
```

## noUnusedLocals + noUnusedParameters

Every declared variable, import, and parameter must be used. There are no exceptions.

```ts
import { useState, useEffect } from 'react';   // ❌ if only useState is used
import { useState } from 'react';              // ✅

function Foo({ dm, _unused }: Props) {}        // ❌ _unused prefix does NOT silence this
function Foo({ dm }: Props) {}                 // ✅ remove unused params from signature
```

**Do NOT prefix unused variables with `_` to silence the error. Delete them.**

## Error → correct fix lookup

| Error message | Correct fix |
|---------------|-------------|
| `'X' is declared but its value is never read` | Delete the import or variable |
| `'X' is declared but never used` | Delete it — do NOT rename to `_X` |
| `Module '"./foo"' has no exported member 'X'` | Check the actual export name in the source file |
| `Property 'X' does not exist on type 'Y'` | Verify the field in `src/types/index.ts` or the relevant data interface |
| `Type 'string' is not assignable to type '"a" \| "b"'` | Use a type assertion only if you own the data; otherwise fix the type definition |
| `Object is possibly 'undefined'` | Use optional chaining `?.` or a `?? fallback` |
| `Cannot use 'import type' with 'import()'` | Use `import type { X }` at the top level instead of inline `import()` |

## Verify after every edit

Run from `learning-platform/`:
```bash
npx tsc --noEmit
```
Zero output = zero errors. Report done only when this passes.
