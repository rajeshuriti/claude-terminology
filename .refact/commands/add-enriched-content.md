Add a full `EnrichedContent` entry to `src/data/enrichedConceptContent.ts` for an existing concept.

Use this when a concept exists in `src/data/concepts.ts` but only has `generateFallbackContent()` — or when an existing entry needs richer content.

## Full EnrichedContent shape

Add the entry inside the `enrichedContent` object keyed by the concept's `id`:

```ts
'concept-id': {
  simpleExplanation: {
    hook: 'One punchy sentence that makes someone want to learn this.',
    analogy: 'Detailed everyday analogy (150–250 words). School or classroom model preferred for the primary analogy.',
    whyItExists: 'The historical or technical reason this concept was invented.',
    forBeginners: 'Plain-language explanation assuming no prior ML knowledge.',
  },
  technicalDive: {
    mechanics: 'How it actually works internally (2–4 sentences, precise).',
    productionPatterns: [
      'Pattern 1 — specific, opinionated production advice',
      'Pattern 2',
      // 4–6 items
    ],
    apiDetails: 'Claude API specifics: parameter name, valid range, defaults, gotchas.',
    orchestrationImplications: 'How this concept interacts with multi-step agent systems.',
  },
  realWorldScenarios: [
    {
      title: 'Scenario Title',
      context: 'Company/team context.',
      how: 'How they use this concept specifically.',
      outcome: 'Quantified or concrete result.',
      type: 'enterprise' | 'agent' | 'production' | 'failure',
    },
    // include at least one 'failure' type scenario
  ],
  commonMistakes: [
    {
      mistake: 'What people do wrong.',
      why: 'Why they do it (seems reasonable on surface).',
      impact: 'What breaks or degrades.',
      fix: 'Exact corrective action.',
      severity: 'beginner' | 'intermediate' | 'production',
    },
  ],
  tradeoffs: {
    advantages: ['Advantage 1', 'Advantage 2'],
    disadvantages: ['Disadvantage 1', 'Disadvantage 2'],
    whenNotToUse: ['Situation 1', 'Situation 2'],
    scalingNote: 'How this concept behaves differently at scale.',
  },
  failureModes: [
    {
      mode: 'Name of failure mode.',
      cause: 'Root cause.',
      detection: 'How to detect it in production.',
      resolution: 'How to fix or prevent it.',
    },
  ],
  certFocus: {
    whyItMatters: 'Why this concept appears on the SA Foundation cert exam.',
    examThinking: [
      'Key insight 1 the exam tests',
      'Key insight 2',
      // 3–5 items
    ],
    architectureReasoning: 'How a Solution Architect should reason about this when designing systems.',
  },
  prerequisites: ['concept-id-1', 'concept-id-2'],  // existing concept IDs
  nextConcepts: ['concept-id-3', 'concept-id-4'],
  advancedInsight: 'The non-obvious production insight that separates experts from beginners.',

  // Optional fields — only add if relevant:
  simulatorType: 'temperature' | 'top-p' | 'context-window' | 'chunking' | 'rag-pipeline',
  metrics: [
    { name: 'Metric Name', value: 'Typical value', context: 'What it means.' },
  ],
  primaryAnalogy: {
    domain: 'Domain name (e.g. "Classroom")',
    emoji: '🏫',
    setting: 'One sentence describing the setting.',
    characters: [
      { role: 'Role name', represents: 'What it maps to in the AI system' },
    ],
    scenarios: [
      { mode: 'Mode label (e.g. temp=0)', behavior: 'What happens in this scenario.', consequence: 'The result — good or bad.' },
    ],
    takeaway: 'The key lesson this analogy teaches.',
  },
  enterpriseAnalogy: {
    // same shape as primaryAnalogy, but set in a corporate/enterprise context
  },
  modesTable: [
    { value: 'Parameter value (e.g. 0.0)', meaning: 'What it means.', schoolBehavior: 'How it maps to the school analogy.' },
  ],
},
```

## Notes on analogies

- `primaryAnalogy.domain` and `enterpriseAnalogy.domain` must differ.
- When `primaryAnalogy.domain` matches another concept's domain (e.g. temperature and top-p both use `"Classroom"`), the Compare page will render a `SharedDomainContrast` view — this is intentional and educational.
- Consequence strings containing words like "wrong", "fail", "break", "error", "hallucin", "damage" are auto-colored red by `ScenarioCard`. Use this intentionally.

## After adding

Run `npx tsc --noEmit` from `learning-platform/` and confirm zero errors.
