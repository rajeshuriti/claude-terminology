Run `npx tsc --noEmit` from `learning-platform/`, then fix every reported error.

## Fix order

1. Run the type-check and collect all errors.
2. Fix the errors most likely to cause cascades first (interface/type changes before usages, imports before components that use them).
3. Re-run `npx tsc --noEmit` after fixing to confirm zero errors remain.
4. Report what was fixed and confirm clean.

## Common errors in this project and their correct fixes

| Error | Correct fix |
|-------|-------------|
| `'X' is declared but its value is never read` | Delete the unused variable or import — do NOT prefix with `_` |
| `'X' is declared but never used` (import) | Remove the import line entirely |
| Type-only import without `import type` | Change to `import type { X }` — required by `verbatimModuleSyntax` |
| `Property 'X' does not exist on type 'Y'` | Check `src/types/index.ts` and the relevant data interface for the correct field name |
| Dynamic class string like `` `bg-${color}-500` `` | Replace with `style={{ background: color }}` — Tailwind purges dynamic class names |
| `Object is possibly 'undefined'` on a map/record lookup | Use optional chaining (`?.`) or a null-coalescing fallback |

## Do NOT do

- Do NOT rename unused variables to `_foo` to silence errors — delete them.
- Do NOT use `// @ts-ignore` or `// @ts-expect-error` to suppress errors.
- Do NOT add fields to interfaces just to satisfy a usage — verify the usage is correct first.
