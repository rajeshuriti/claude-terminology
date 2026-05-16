Add a new concept entry to this learning platform. The user will provide the concept name and details.

## Step 1 — Add to `src/data/concepts.ts`

Append a new `Concept` object following this exact shape (all fields required):

```ts
{
  id: 'kebab-case-id',
  term: 'Display Name',
  category: 'Category Name',          // must match an existing category.name
  categoryId: 'category-id',          // must match an existing CategoryId in src/types/index.ts
  description: 'One sentence — what it is.',
  purpose: 'Short phrase — why it exists.',
  usage: 'Where/when it is used.',
  example: 'Concrete single-line example.',
  insight: 'The non-obvious truth. What a beginner gets wrong.',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  architectureRelevance: 1-5,         // how important for SA work
  certificationPriority: 1-5,         // how likely to appear on the cert exam
  relatedConcepts: ['id1', 'id2'],    // IDs of related concepts already in concepts.ts
  tags: ['tag1', 'tag2'],
  estimatedTime: 5,                   // minutes to study
}
```

Valid `categoryId` values (from `src/types/index.ts`):
`prompt-engineering`, `sampling-parameters`, `tool-use-mcp`, `agent-architecture`,
`rag-retrieval`, `context-memory`, `evaluation-reliability`, `extraction-data`,
`claude-code-commands`, `apis-runtime`, `safety-governance`, `browser-automation`,
`production-infrastructure`

## Step 2 — Optionally add to `src/data/enrichedConceptContent.ts`

Only add an `EnrichedContent` entry if the user provides enough detail, or if the concept is important enough to warrant deep content. If skipping, `generateFallbackContent()` will be used automatically.

Key fields in `EnrichedContent`:
- `simpleExplanation.hook` — one punchy sentence
- `simpleExplanation.analogy` — real-world analogy (school or enterprise model preferred)
- `simulatorType` — only set if there's a matching simulator: `'temperature' | 'top-p' | 'context-window' | 'chunking' | 'rag-pipeline'`
- `primaryAnalogy` / `enterpriseAnalogy` — `RichAnalogy` objects (optional, for Compare page support)

## Step 3 — Verify

Run `npx tsc --noEmit` from `learning-platform/` and confirm zero errors before reporting done.
