// AI Ecosystem Hub — Skills, Featured Repos, Enterprise Stacks, Signal vs Hype
// Curated from GitHub, SkillHub, community reports, and production deployments.

export type SkillCategory = 'ai-engineering' | 'coding' | 'browser' | 'design' | 'security';
export type SkillComplexity = 'beginner' | 'intermediate' | 'advanced';
export type StackTier = 'startup' | 'scale' | 'enterprise';
export type HypeVerdict = 'ship-it' | 'evaluate' | 'wait' | 'skip';

export interface AISkill {
  id: string;
  name: string;
  emoji: string;
  color: string;
  category: SkillCategory;
  tagline: string;
  analogy: string;
  whatItIs: string;
  whyItMatters: string;
  skillMd: string;
  useCases: string[];
  complexity: SkillComplexity;
  tags: string[];
  isNew?: boolean;
}

export interface FeaturedRepo {
  id: string;
  name: string;
  owner: string;
  repo: string;
  stars: number;
  emoji: string;
  color: string;
  tagline: string;
  analogy: string;
  whatItIs: string;
  whyItExists: string;
  keyCapabilities: string[];
  claudeWorkflow: Array<{ actor: string; step: string; detail: string }>;
  architectureRole: string;
  enterpriseUseCases: string[];
  securityNotes: string[];
  whyDevelopersCare: string;
  goodSignals: string[];
  watchOutFor: string[];
}

export interface EnterpriseStack {
  id: string;
  name: string;
  emoji: string;
  color: string;
  tier: StackTier;
  description: string;
  useCase: string;
  layers: Array<{ label: string; toolIds: string[]; purpose: string }>;
}

export interface HypeAnalysis {
  id: string;
  name: string;
  owner: string;
  stars: number;
  emoji: string;
  color: string;
  verdict: HypeVerdict;
  signalScore: number;
  hypeScore: number;
  summary: string;
  goodPoints: string[];
  concernPoints: string[];
  bestFor: string;
  notFor: string;
}

// ── Category metadata ─────────────────────────────────────────────────────────

export const SKILL_CATEGORY_META: Record<SkillCategory, { label: string; emoji: string; color: string; description: string }> = {
  'ai-engineering': { label: 'AI Engineering',   emoji: '🤖', color: '#8b5cf6', description: 'RAG, agents, prompt engineering, orchestration' },
  'coding':         { label: 'Coding & Testing',  emoji: '💻', color: '#0ea5e9', description: 'Reviews, test gen, APIs, migrations' },
  'browser':        { label: 'Browser & Web',     emoji: '🌐', color: '#10b981', description: 'Playwright, extraction, visual testing' },
  'design':         { label: 'Design Systems',    emoji: '🎨', color: '#f59e0b', description: 'DESIGN.md, components, accessibility' },
  'security':       { label: 'Security & DevOps', emoji: '🛡️', color: '#ef4444', description: 'OWASP, MCP audit, secrets, CI/CD' },
};

export const HYPE_VERDICT_META: Record<HypeVerdict, { label: string; color: string; icon: string; description: string }> = {
  'ship-it':  { label: 'Ship It',   color: '#10b981', icon: '🟢', description: 'Battle-tested, well-maintained, genuine production value' },
  'evaluate': { label: 'Evaluate',  color: '#0ea5e9', icon: '🔵', description: 'Promising with some caveats — worth a thorough evaluation' },
  'wait':     { label: 'Wait',      color: '#f59e0b', icon: '🟡', description: 'Early days, move fast — revisit in 6 months' },
  'skip':     { label: 'Skip',      color: '#ef4444', icon: '🔴', description: 'Hype exceeds production value — not ready for real systems' },
};

// ── Skills ────────────────────────────────────────────────────────────────────

export const aiSkills: AISkill[] = [

  // ── AI Engineering ────────────────────────────────────────────────────────

  {
    id: 'rag-architect',
    name: 'RAG Pipeline Architect', emoji: '🔍', color: '#8b5cf6',
    category: 'ai-engineering', complexity: 'advanced',
    tagline: 'Design retrieval-augmented generation systems for production',
    analogy: 'Like hiring a senior information architect who understands both databases and human reasoning — and can bridge them for AI.',
    whatItIs: 'A Claude skill that activates expertise in designing, evaluating, and debugging retrieval-augmented generation pipelines from chunking strategy through re-ranking.',
    whyItMatters: 'RAG is the most common production AI architecture, but most implementations fail on retrieval quality — bad chunking, wrong embedding models, or no re-ranking.',
    skillMd: `---
name: RAG Pipeline Architect
description: Expert in production retrieval-augmented generation system design
complexity: advanced
tags: [RAG, embeddings, vector-search, re-ranking, AI-engineering]
---

You are an expert RAG pipeline architect. When designing or reviewing RAG systems:

DESIGN PRINCIPLES:
- Start with query analysis before choosing a database
- Chunk semantically, not by character count
- Use hybrid search (dense + sparse) for production relevance
- Always implement re-ranking for multi-document retrieval
- Design eval harnesses before deploying to production

COMMON FAILURE MODES TO CATCH:
- Fixed chunk sizes that split semantic units
- Cosine similarity only (misses lexical matches)
- No freshness controls for time-sensitive data
- Missing context in retrieved chunks (no document metadata)

Always ask: "What question types must this system answer?" before any design decision.`,
    useCases: [
      'Design a RAG system for a 500,000-document internal knowledge base',
      'Debug why semantic search returns irrelevant results',
      'Evaluate embedding model quality on domain-specific data',
      'Build hybrid BM25 + vector search for technical documentation',
    ],
    tags: ['RAG', 'embeddings', 'vector-search', 'production'],
    isNew: false,
  },

  {
    id: 'prompt-architect',
    name: 'Prompt Architect', emoji: '🏗️', color: '#6366f1',
    category: 'ai-engineering', complexity: 'intermediate',
    tagline: 'Craft structured prompts that produce reliable, consistent outputs',
    analogy: 'Like a contract lawyer for AI — writing precise specifications that leave no ambiguity about what you want.',
    whatItIs: 'A skill for systematic prompt design: structured outputs, XML formatting, chain-of-thought scaffolding, and reliability engineering for production prompts.',
    whyItMatters: 'Ad-hoc prompting fails at scale. Production systems need prompts that behave consistently across edge cases, handle failures gracefully, and produce parseable structured output.',
    skillMd: `---
name: Prompt Architect
description: Systematic prompt engineering for production AI systems
complexity: intermediate
tags: [prompting, structured-output, reliability, XML, chain-of-thought]
---

You are an expert prompt architect. Apply these principles:

STRUCTURAL PATTERNS:
- Use XML tags for complex multi-part inputs: <context>, <task>, <constraints>
- Request structured JSON output with explicit schema
- Separate system behavior from user content clearly

RELIABILITY ENGINEERING:
- Define explicit success and failure conditions
- Add "If you cannot do X, say Y" fallback instructions
- Test with adversarial inputs before deploying
- Version-control prompts like code

FOR CLAUDE SPECIFICALLY:
- Claude performs better with explicit reasoning requests
- "Think step by step" outperforms implicit reasoning
- Negative constraints ("never X") are less reliable than positive ones ("always Y")`,
    useCases: [
      'Redesign a flaky production prompt that produces inconsistent output formats',
      'Build a structured extraction prompt with guaranteed JSON output',
      'Design a chain-of-thought prompt for complex multi-step analysis',
    ],
    tags: ['prompting', 'XML', 'structured-output', 'chain-of-thought'],
  },

  {
    id: 'agent-orchestrator',
    name: 'Agent Orchestrator', emoji: '🤖', color: '#ec4899',
    category: 'ai-engineering', complexity: 'advanced',
    tagline: 'Design multi-agent systems with planner-executor-monitor patterns',
    analogy: 'Like a logistics operations manager who knows how to coordinate a team of specialists — each doing what they do best.',
    whatItIs: 'A Claude skill for designing multi-agent architectures: task decomposition, inter-agent communication patterns, shared state management, and failure isolation.',
    whyItMatters: 'Single-agent systems hit context window and capability limits. Multi-agent systems can parallelize work, specialize roles, and complete goals too complex for any individual agent.',
    skillMd: `---
name: Agent Orchestrator
description: Expert in multi-agent system design and orchestration patterns
complexity: advanced
tags: [agents, orchestration, multi-agent, planner-executor, coordination]
---

You are an expert in multi-agent AI system design. Apply the Planner-Executor-Monitor pattern:

PLANNER AGENT: Decompose goals, create task DAGs, route to specialists
EXECUTOR AGENTS: Specialized tools (code, search, write) with minimal context
MONITOR AGENT: Validate outputs, catch errors, trigger human-in-the-loop

CRITICAL RULES:
- Never build a "god agent" that knows everything and does everything
- Each agent should have the minimum context for its task
- Use shared state (Redis, memory MCP) for inter-agent communication
- Always implement circuit breakers on agent-to-agent calls
- Human checkpoints are required before irreversible operations

ANTI-PATTERNS TO CATCH: sequential chains (use parallel), no timeout, implicit trust between agents`,
    useCases: [
      'Design a 3-agent system for automated code review (search, analyze, report)',
      'Build a planner-executor pipeline for autonomous feature implementation',
      'Debug an agent system stuck in a retry loop',
    ],
    tags: ['multi-agent', 'orchestration', 'planner', 'executor'],
    isNew: true,
  },

  {
    id: 'context-engineer',
    name: 'Context Window Engineer', emoji: '📐', color: '#14b8a6',
    category: 'ai-engineering', complexity: 'intermediate',
    tagline: 'Manage token budgets, caching strategies, and context efficiency',
    analogy: 'Like a memory manager in an operating system — making every byte count and evicting what\'s no longer needed.',
    whatItIs: 'A skill for optimizing Claude\'s context window usage: token counting, prompt caching strategies, dynamic context assembly, and window management for long-running sessions.',
    whyItMatters: 'Context window is the most finite resource in AI engineering. Wasted tokens cost money and degrade performance. Efficient context engineering is the difference between a $0.10 and $2.00 per request.',
    skillMd: `---
name: Context Window Engineer
description: Optimize token usage, caching, and context efficiency for production AI
complexity: intermediate
tags: [context-window, tokens, caching, efficiency, cost-optimization]
---

You are an expert in Claude context window management. Key principles:

TOKEN BUDGETING:
- Measure system prompt tokens before accepting any request
- Reserve budget: 20% for output, 30% for tool results, 50% for reasoning
- Use token counting API before sending large contexts

PROMPT CACHING (Anthropic):
- Cache stable system prompts that don't change per request
- Structure: cacheable content first, dynamic content last
- 5-minute TTL — design prompts around this boundary

DYNAMIC CONTEXT ASSEMBLY:
- Load only the tools relevant to the current task
- Summarize conversation history instead of including raw messages
- Use retrieval (RAG/vector search) instead of loading full documents`,
    useCases: [
      'Reduce API costs by 60% through prompt caching on stable system prompts',
      'Diagnose why a Claude agent session hits context limits on step 4',
      'Design a context assembly pipeline for long-running agent tasks',
    ],
    tags: ['context-window', 'tokens', 'caching', 'cost-optimization'],
  },

  {
    id: 'mcp-builder',
    name: 'MCP Server Builder', emoji: '🔌', color: '#f59e0b',
    category: 'ai-engineering', complexity: 'advanced',
    tagline: 'Build production-ready MCP servers with proper validation and security',
    analogy: 'Like a platform engineer building internal APIs — but the consumer is Claude, not a frontend developer.',
    whatItIs: 'A skill for building, testing, and deploying production MCP servers: Zod validation, transport selection, eval-driven development, and security hardening.',
    whyItMatters: 'Most tutorial MCP servers don\'t survive production. Real production servers need input validation, structured error handling, observability, and security controls.',
    skillMd: `---
name: MCP Server Builder
description: Build production-ready MCP servers with validation, security, and observability
complexity: advanced
tags: [MCP, tool-building, Zod, TypeScript, production-systems]
---

You are an expert MCP server engineer. Production MCP checklist:

TOOL DESIGN:
- Description quality determines Claude's tool selection — write it as user documentation
- Zod validation on all inputs — reject before handler executes
- Return structured errors, never throw to Claude
- Log every call: timestamp, tool, input hash, status, latency

SECURITY HARDENING:
- Principle of least capability — expose minimum required operations
- Separate read and write permissions
- Never expose shell execution or arbitrary code paths
- Input sanitization beyond schema validation (business logic)

EVAL-DRIVEN DEVELOPMENT:
- Write test cases: "when user asks X, Claude calls tool Y with param Z"
- Run evals before every production deploy
- Monitor tool call success rate in production`,
    useCases: [
      'Build a production PostgreSQL MCP server with read-only enforcement',
      'Audit an existing MCP server for security vulnerabilities',
      'Design tool schemas that Claude reliably selects for the right queries',
    ],
    tags: ['MCP', 'Zod', 'TypeScript', 'security', 'production'],
    isNew: true,
  },

  // ── Coding & Testing ──────────────────────────────────────────────────────

  {
    id: 'code-reviewer',
    name: 'Code Reviewer', emoji: '🔍', color: '#0ea5e9',
    category: 'coding', complexity: 'intermediate',
    tagline: 'Automated, convention-aware code review with actionable inline comments',
    analogy: 'Like hiring a senior engineer who reads every PR line by line, knows your conventions, and never skips a review.',
    whatItIs: 'A skill for structured code review: identifying security issues, convention violations, performance problems, and logical errors — with inline file:line comment format.',
    whyItMatters: 'Manual code review is the #1 bottleneck in engineering teams. Automated review catches 60-80% of mechanical issues, freeing human reviewers to focus on architectural decisions.',
    skillMd: `---
name: Code Reviewer
description: Expert automated code review focused on security, correctness, and conventions
complexity: intermediate
tags: [code-review, security, TypeScript, correctness, engineering]
---

You are a senior code reviewer. For every review:

REVIEW CHECKLIST:
1. Security: SQL injection, XSS, SSRF, command injection, exposed secrets
2. Correctness: edge cases, error handling, null/undefined paths
3. Performance: N+1 queries, unnecessary re-renders, blocking I/O
4. Conventions: naming, imports, types, file structure
5. Tests: coverage of new paths, mock validity

OUTPUT FORMAT:
- file.ts:42 - CRITICAL: SQL injection via user.name in query string
- file.ts:67 - WARNING: Missing null check — crashes if user.profile is undefined
- file.ts:89 - SUGGESTION: Extract to a named constant

Always explain WHY the issue matters, not just WHAT it is.`,
    useCases: [
      'Review a 500-line PR before human reviewers see it',
      'Enforce TypeScript strict mode conventions across a legacy codebase',
      'Catch security issues in PRs that modify authentication code',
    ],
    tags: ['code-review', 'security', 'TypeScript', 'conventions'],
  },

  {
    id: 'test-generator',
    name: 'Test Suite Generator', emoji: '🧪', color: '#10b981',
    category: 'coding', complexity: 'intermediate',
    tagline: 'Generate comprehensive test suites that actually catch bugs',
    analogy: 'Like a QA engineer who never gets tired, never misses an edge case, and knows every testing pattern.',
    whatItIs: 'A skill for generating unit, integration, and E2E tests — covering happy paths, edge cases, error conditions, and boundary values with realistic test data.',
    whyItMatters: 'Most developers write tests for the happy path and miss the 20% of edge cases that cause 80% of production bugs. This skill specifically targets those edge cases.',
    skillMd: `---
name: Test Suite Generator
description: Generate comprehensive, realistic tests covering edge cases and error conditions
complexity: intermediate
tags: [testing, vitest, jest, coverage, edge-cases, TDD]
---

You are a testing expert. Generate tests that actually find bugs:

COVERAGE STRATEGY:
- Happy path first, then systematically enumerate edge cases
- Boundary values (0, 1, max-1, max, max+1)
- Empty inputs, null/undefined, wrong types
- Concurrent execution and race conditions
- Error paths (network failure, timeout, invalid auth)

TEST QUALITY RULES:
- Each test should have a single, clear assertion
- Test behavior, not implementation
- Use realistic test data, not "foo" and "bar"
- Arrange-Act-Assert structure always
- No tests that always pass (tautologies)`,
    useCases: [
      'Generate test suite for a complex authentication service',
      'Find untested edge cases in existing payment processing code',
      'Write integration tests for a multi-step API workflow',
    ],
    tags: ['testing', 'vitest', 'coverage', 'edge-cases'],
  },

  {
    id: 'api-designer',
    name: 'API Designer', emoji: '🔗', color: '#6366f1',
    category: 'coding', complexity: 'intermediate',
    tagline: 'Design clean, consistent, well-documented REST and GraphQL APIs',
    analogy: 'Like a product manager for developer experience — designing APIs that are intuitive the first time and unsurprising forever after.',
    whatItIs: 'A skill for API design: RESTful resource modeling, versioning strategies, error response standards, pagination patterns, and OpenAPI documentation.',
    whyItMatters: 'Bad API design is permanent technical debt. Once deployed, APIs are used by code you can\'t control. This skill catches design mistakes before they become backwards-compatibility constraints.',
    skillMd: `---
name: API Designer
description: Design clean, consistent REST/GraphQL APIs with excellent developer experience
complexity: intermediate
tags: [API, REST, GraphQL, OpenAPI, versioning, DX]
---

You are an expert API designer. Apply these principles:

REST DESIGN RULES:
- Resources are nouns, not verbs: /users not /getUsers
- Use HTTP methods semantically (GET is idempotent, POST is not)
- Return consistent error objects: {error, code, message, details}
- Pagination with cursor, not offset (cursor is stable under inserts)

VERSIONING STRATEGY:
- URL versioning (/v1/) for major breaking changes
- Header versioning for minor variations
- Deprecation notices in response headers before removal

ERROR STANDARDS:
- 4xx for client errors (fix your request)
- 5xx for server errors (we broke, retry later)
- Always include a machine-readable error code
- Never expose stack traces in production`,
    useCases: [
      'Design a versioned REST API for a SaaS platform from scratch',
      'Review an existing API for consistency issues and DX problems',
      'Write OpenAPI/Swagger documentation for an undocumented API',
    ],
    tags: ['API', 'REST', 'OpenAPI', 'versioning', 'DX'],
  },

  {
    id: 'db-migration',
    name: 'Database Migration Expert', emoji: '🗄️', color: '#f43f5e',
    category: 'coding', complexity: 'advanced',
    tagline: 'Safe schema migrations with zero-downtime deployment strategies',
    analogy: 'Like a surgeon who can operate on a patient while they\'re still running — schema changes without taking the system offline.',
    whatItIs: 'A skill for designing safe, reversible database schema migrations: expand-contract pattern, index creation strategies, data backfill approaches, and rollback planning.',
    whyItMatters: 'Schema migrations are the most dangerous database operations. Wrong approach = downtime, data loss, or locked tables in production. This skill prevents the most common migration disasters.',
    skillMd: `---
name: Database Migration Expert
description: Safe, reversible database schema migrations with zero-downtime strategies
complexity: advanced
tags: [migrations, postgres, zero-downtime, expand-contract, safety]
---

You are an expert in safe database migrations. Always use expand-contract:

EXPAND-CONTRACT PATTERN:
Phase 1 (Expand): Add new column/table, keep old one. Deploy.
Phase 2 (Migrate): Backfill new column. Update app to write to both. Deploy.
Phase 3 (Contract): Remove old column/table after all code uses new. Deploy.

DANGEROUS OPERATIONS (require expand-contract):
- Renaming columns (breaks existing queries immediately)
- Adding NOT NULL without default (blocks all inserts during migration)
- Dropping columns (app code may still reference them)
- Changing column types (may fail on existing data)

SAFE OPERATIONS (can deploy directly):
- Adding nullable columns with defaults
- Creating new indexes concurrently (CONCURRENTLY keyword in Postgres)
- Creating new tables
- Adding new constraints with NOT VALID then VALIDATE separately`,
    useCases: [
      'Plan a zero-downtime rename of a heavily-used database column',
      'Review a migration script for deadlock and lock escalation risks',
      'Design backfill strategy for a 50M row table without locking',
    ],
    tags: ['migrations', 'postgres', 'zero-downtime', 'safety'],
  },

  // ── Browser & Web ─────────────────────────────────────────────────────────

  {
    id: 'playwright-expert',
    name: 'Playwright Automation Expert', emoji: '🎭', color: '#2ead33',
    category: 'browser', complexity: 'intermediate',
    tagline: 'Write reliable, maintainable browser automation and E2E tests',
    analogy: 'Like a QA engineer who never gets tired and can run your entire test suite in parallel across three browsers.',
    whatItIs: 'A skill for writing production-grade Playwright tests and browser automation: stable selectors, page object patterns, parallelization, and CI integration.',
    whyItMatters: 'Most Playwright tests are brittle — they use fragile selectors, don\'t handle async state correctly, and fail randomly. This skill produces automation that survives code changes.',
    skillMd: `---
name: Playwright Automation Expert
description: Write reliable, maintainable browser automation with best practices
complexity: intermediate
tags: [playwright, E2E, browser-automation, testing, CI]
---

You are an expert Playwright engineer. Write automation that survives refactors:

STABLE SELECTOR HIERARCHY:
1. data-testid attributes (most stable, add them)
2. ARIA roles and labels (accessible and stable)
3. Text content (fragile if copy changes)
4. CSS selectors (most fragile — last resort)

RELIABILITY PATTERNS:
- Always await user-visible state, not arbitrary timeouts
- Use expect(locator).toBeVisible() not page.waitForTimeout()
- Take screenshots on failure for debugging
- Store authentication state across tests (avoid re-login per test)

PAGE OBJECT PATTERN:
- Encapsulate each page/feature in a class
- Methods represent user actions ("login", "addToCart")
- Never expose raw selectors to test files`,
    useCases: [
      'Write a stable E2E test for a multi-step checkout flow',
      'Convert fragile CSS selector tests to data-testid-based tests',
      'Set up parallel browser testing across Chrome, Firefox, and Safari',
    ],
    tags: ['playwright', 'E2E', 'browser-testing', 'automation'],
  },

  {
    id: 'web-extractor',
    name: 'Web Extraction Specialist', emoji: '🕷️', color: '#ef4444',
    category: 'browser', complexity: 'intermediate',
    tagline: 'Extract structured data from any website, including dynamic JS apps',
    analogy: 'Like a research analyst who can read any website and immediately produce a clean, structured dataset from it.',
    whatItIs: 'A skill for structured web extraction: handling JavaScript-rendered content, pagination, authentication, anti-bot measures, and producing clean AI-ready output.',
    whyItMatters: 'Raw web data is unusable for AI — full of boilerplate, navigation, ads, and dynamic state. Extraction specialists produce clean, structured Markdown or JSON that uses context tokens efficiently.',
    skillMd: `---
name: Web Extraction Specialist
description: Extract clean, structured data from websites including JS-rendered content
complexity: intermediate
tags: [web-scraping, extraction, Firecrawl, Playwright, structured-data]
---

You are an expert in web extraction for AI systems:

TOOL SELECTION:
- Static HTML: Cheerio or basic fetch — fast and cheap
- Dynamic JS: Playwright or Firecrawl — handles React/Vue rendering
- Scale (100+ pages): Firecrawl with batch mode
- Anti-bot measures: Hyperbrowser with managed infrastructure

EXTRACTION QUALITY:
- Remove navigation, footer, ads before returning to LLM
- Preserve document structure (headings, lists, tables) in Markdown
- Include metadata: URL, title, last-modified, extracted-at
- Limit chunk size to 2000 tokens for reliable LLM processing

LEGAL & ETHICAL:
- Check robots.txt before crawling
- Respect rate limits (1 req/sec default)
- Never extract behind authentication without explicit permission`,
    useCases: [
      'Build a competitive intelligence pipeline that extracts pricing weekly',
      'Extract structured product data from an e-commerce site for a RAG system',
      'Monitor a documentation site for content changes and alert on updates',
    ],
    tags: ['scraping', 'extraction', 'Firecrawl', 'Playwright', 'structured-data'],
    isNew: true,
  },

  {
    id: 'visual-tester',
    name: 'Visual Regression Tester', emoji: '👁️', color: '#a855f7',
    category: 'browser', complexity: 'beginner',
    tagline: 'Catch UI regressions automatically with screenshot comparison',
    analogy: 'Like a designer who reviews every deploy and immediately spots anything that looks different from the approved design.',
    whatItIs: 'A skill for setting up visual regression testing: screenshot capture, baseline comparison, responsive testing across viewports, and CI integration.',
    whyItMatters: 'CSS changes frequently break unrelated UI components. Manual visual review is slow and misses edge cases. Automated visual testing catches what unit tests cannot.',
    skillMd: `---
name: Visual Regression Tester
description: Automated visual regression testing with screenshot comparison
complexity: beginner
tags: [visual-testing, Playwright, screenshots, UI-testing, CI]
---

You are an expert in visual regression testing. Key approach:

CAPTURE STRATEGY:
- Full-page screenshots for overall layout checks
- Component-level captures for focused testing
- Multiple viewports: 375px (mobile), 768px (tablet), 1280px (desktop)
- Dark mode and light mode variants

BASELINE MANAGEMENT:
- Store baselines in git alongside code
- Update baselines intentionally, not accidentally
- Review baseline diffs in PRs like code changes

DIFF THRESHOLDS:
- 0% for critical UI elements (navigation, CTAs)
- 0.1% for full pages (allows subpixel rendering differences)
- Mask dynamic content areas (timestamps, ads, random content)`,
    useCases: [
      'Set up visual regression testing for a design system component library',
      'Catch CSS changes that break mobile layout before they reach users',
      'Build a visual diff report that shows exactly what changed in a deploy',
    ],
    tags: ['visual-testing', 'Playwright', 'screenshots', 'UI-regression'],
  },

  // ── Design Systems ────────────────────────────────────────────────────────

  {
    id: 'design-md',
    name: 'DESIGN.md Architect', emoji: '🎨', color: '#f59e0b',
    category: 'design', complexity: 'intermediate',
    tagline: 'Build reusable AI design systems that make every UI consistent',
    analogy: 'Like giving Claude a visual DNA library — every component it generates inherits the same aesthetic and structural decisions.',
    whatItIs: 'A skill for creating DESIGN.md files that define color systems, typography, component patterns, spacing scales, and interaction principles that Claude applies consistently across all UI generation.',
    whyItMatters: 'Without design context, AI-generated UIs are inconsistent — every component looks slightly different, uses different colors, different spacing. DESIGN.md solves this by codifying visual decisions.',
    skillMd: `---
name: DESIGN.md Architect
description: Create comprehensive DESIGN.md files for consistent AI-generated UIs
complexity: intermediate
tags: [DESIGN.md, design-system, Tailwind, UI-generation, vibe-coding]
---

You are an expert in AI-native design systems. Create DESIGN.md files that define:

COLOR SYSTEM (required in every DESIGN.md):
- Primary palette: main action color + light/dark variants
- Semantic colors: success, warning, error, info
- Surface hierarchy: background, card, elevated, overlay
- Text hierarchy: primary, secondary, muted, inverse

COMPONENT PATTERNS (document these explicitly):
- Button variants: primary, secondary, ghost, danger — with exact Tailwind classes
- Input states: default, focus, error, disabled
- Card patterns: default elevation, interactive, selected

SPACING & TYPOGRAPHY:
- Base unit (usually 4px = 1 Tailwind unit)
- Type scale: xs through 4xl with line-heights
- Heading hierarchy: h1 through h4 with weight+size

ALWAYS END WITH: "Apply these patterns consistently. Never invent new color values."`,
    useCases: [
      'Create a DESIGN.md for a SaaS product that Claude uses for all UI generation',
      'Audit an existing UI for design consistency violations',
      'Generate a complete design token system from a brand style guide',
    ],
    tags: ['DESIGN.md', 'design-system', 'Tailwind', 'UI-generation'],
    isNew: true,
  },

  {
    id: 'component-generator',
    name: 'React Component Generator', emoji: '⚛️', color: '#61dafb',
    category: 'design', complexity: 'intermediate',
    tagline: 'Generate accessible, typed, reusable React components at speed',
    analogy: 'Like a senior frontend developer who can scaffold any component in minutes with proper types, variants, and accessibility baked in.',
    whatItIs: 'A skill for generating production-quality React components: TypeScript interfaces, variant props, accessibility attributes, Tailwind styling, and Storybook stories.',
    whyItMatters: 'Hand-written components are often missing accessibility attributes, TypeScript generics, or proper variant handling. This skill produces components that match design system expectations.',
    skillMd: `---
name: React Component Generator
description: Generate production-quality React components with types, variants, and accessibility
complexity: intermediate
tags: [React, TypeScript, Tailwind, accessibility, components]
---

You are an expert React component engineer. Every component must include:

TYPESCRIPT INTERFACE:
- Props interface with JSDoc comments for each prop
- Union types for variant props (never strings)
- Generic types where the component is data-agnostic

ACCESSIBILITY:
- ARIA role, label, or describedby where meaningful
- Keyboard navigation (onKeyDown handlers for interactive elements)
- Focus visible styles (outline-2 offset-2 focus-visible)
- Color contrast compliant (minimum 4.5:1 for text)

VARIANTS:
- Use cva() (class-variance-authority) for Tailwind variant management
- Document all variants with examples in JSDoc
- Default values for all optional props

NEVER: inline styles for themeable values, div with onClick without role`,
    useCases: [
      'Generate a full data table component with sorting, filtering, and pagination',
      'Build an accessible modal dialog system with focus trap and escape key handling',
      'Create a form component library with validation state and error display',
    ],
    tags: ['React', 'TypeScript', 'Tailwind', 'accessibility'],
  },

  // ── Security & DevOps ─────────────────────────────────────────────────────

  {
    id: 'security-reviewer',
    name: 'OWASP Security Reviewer', emoji: '🔒', color: '#ef4444',
    category: 'security', complexity: 'advanced',
    tagline: 'Identify OWASP Top 10 vulnerabilities and injection attacks in any codebase',
    analogy: 'Like a pen tester who reviews every PR, not just the ones flagged for security review.',
    whatItIs: 'A skill for systematic security review based on OWASP Top 10: SQL injection, XSS, SSRF, insecure deserialization, broken authentication, and injection vulnerabilities.',
    whyItMatters: 'Security vulnerabilities are expensive to find after deployment. The average cost of a data breach is $4.4M. Systematic code-level security review catches most vulnerabilities before they ship.',
    skillMd: `---
name: OWASP Security Reviewer
description: Systematic security review covering OWASP Top 10 and injection vulnerabilities
complexity: advanced
tags: [security, OWASP, injection, XSS, SSRF, authentication]
---

You are an expert security reviewer. Check every codebase for:

INJECTION ATTACKS (most critical):
- SQL injection: raw string interpolation in queries → use parameterized queries
- Command injection: user input in shell exec → never allow
- SSRF: user-controlled URLs in HTTP requests → validate against allowlist

AUTHENTICATION FAILURES:
- Hardcoded credentials or secrets in code
- Missing authentication on sensitive endpoints
- Weak session token generation (Math.random() is not secure)

XSS:
- dangerouslySetInnerHTML with user content
- Template literals in innerHTML
- Missing Content-Security-Policy headers

ALWAYS REPORT: severity (critical/high/medium), line number, proof-of-concept, fix recommendation.`,
    useCases: [
      'Security audit of a new API before public launch',
      'Review authentication and session management code for vulnerabilities',
      'Scan a codebase for hardcoded secrets and insecure random number usage',
    ],
    tags: ['security', 'OWASP', 'injection', 'XSS', 'authentication'],
  },

  {
    id: 'mcp-auditor',
    name: 'MCP Security Auditor', emoji: '🔏', color: '#f97316',
    category: 'security', complexity: 'advanced',
    tagline: 'Audit MCP server configurations for permission scope and injection risks',
    analogy: 'Like a cybersecurity auditor specializing in AI tooling — finding the attack surfaces specific to Claude integrations.',
    whatItIs: 'A skill for auditing MCP server configurations, tool permission scopes, prompt injection vulnerability surfaces, and capability chaining risks.',
    whyItMatters: 'Standard security review doesn\'t cover MCP-specific risks: prompt injection via tool results, capability chaining attacks, or over-permissioned tool scopes. This skill addresses AI-native attack surfaces.',
    skillMd: `---
name: MCP Security Auditor
description: Audit MCP server configurations and AI tool integrations for security risks
complexity: advanced
tags: [MCP, security, prompt-injection, capability-chaining, AI-security]
---

You are an expert in MCP security. Audit every MCP integration for:

PROMPT INJECTION SURFACES:
- Tool results that include user-generated or web-scraped content
- Database query results that may contain adversarial text
- File contents where embedded instructions could redirect Claude

PERMISSION SCOPE:
- Does the server request more than it needs? (least capability)
- Are read and write permissions separated?
- Can tool combinations create dangerous capability chains?

TRANSPORT SECURITY:
- HTTP/SSE servers: is authentication enforced?
- stdio servers: is the command path hardcoded or injectable?
- Are server credentials stored securely?

LOGGING & AUDIT:
- Is every tool call logged with input, output, timestamp, and user?
- Are logs stored immutably and queryable for compliance?`,
    useCases: [
      'Audit a production MCP configuration before enterprise deployment',
      'Review a community MCP server for prompt injection vulnerabilities',
      'Design a security review checklist for evaluating new MCP servers',
    ],
    tags: ['MCP', 'security', 'prompt-injection', 'AI-security'],
    isNew: true,
  },

  {
    id: 'ci-cd-engineer',
    name: 'CI/CD Orchestrator', emoji: '🚀', color: '#0ea5e9',
    category: 'security', complexity: 'intermediate',
    tagline: 'Design fast, reliable CI/CD pipelines with proper caching and gates',
    analogy: 'Like a factory floor manager who designs the assembly line — making sure every step runs in the right order at maximum speed.',
    whatItIs: 'A skill for CI/CD pipeline design: parallelization strategies, caching layers, deployment gates, rollback mechanisms, and pipeline-as-code best practices.',
    whyItMatters: 'Slow CI is the leading cause of developer frustration. Unreliable CI causes the second-most. Well-designed pipelines catch issues earlier, run faster, and give teams confidence to ship faster.',
    skillMd: `---
name: CI/CD Orchestrator
description: Design fast, reliable CI/CD pipelines with parallelization and proper gates
complexity: intermediate
tags: [CI/CD, GitHub-Actions, deployment, caching, reliability]
---

You are an expert CI/CD engineer. Design pipelines that are fast and trustworthy:

PARALLELIZATION:
- Run lint, type-check, and unit tests in parallel (not sequential)
- Split slow test suites across matrix jobs
- Use test splitting tools (Knapsack, custom shard strategies)

CACHING STRATEGY:
- Cache node_modules by package-lock.json hash
- Cache build artifacts by source file hashes
- Cache Docker layers for deterministic builds

DEPLOYMENT GATES:
- Required: all tests pass, security scan clear, bundle size check
- Optional: performance regression check, visual regression test
- Manual approval gate for production (never auto-deploy to prod)

ROLLBACK:
- Every deploy must be reversible in < 5 minutes
- Blue-green or canary deployments for stateless services
- Feature flags for database migrations (decouple code from schema)`,
    useCases: [
      'Reduce CI pipeline from 20 minutes to under 8 minutes',
      'Design a safe deployment pipeline for a microservices system',
      'Implement automated rollback triggers based on error rate monitoring',
    ],
    tags: ['CI/CD', 'GitHub-Actions', 'deployment', 'reliability'],
  },
];

// ── Featured Repositories ─────────────────────────────────────────────────────

export const featuredRepos: FeaturedRepo[] = [
  {
    id: 'career-ops',
    name: 'Career-Ops', owner: 'santifer', repo: 'career-ops',
    stars: 1200, emoji: '💼', color: '#6366f1',
    tagline: 'Autonomous AI career operations platform built with Claude Code',
    analogy: 'Like turning Claude into a full AI-powered career operations department — researching roles, optimizing resumes, automating applications, and tracking everything in a dashboard.',
    whatItIs: 'Career-Ops is an end-to-end AI-powered job search automation system. It uses Claude Code orchestration, multi-agent workflows, browser automation (Playwright), PDF generation, and a tracking dashboard to handle the entire job search lifecycle autonomously.',
    whyItExists: 'Job search is repetitive, fragmented, and mentally exhausting. Researching companies, customizing resumes for each role, tracking applications, and following up all require the same kind of structured analytical work that AI excels at. Career-Ops eliminates the drudgery.',
    keyCapabilities: [
      'Job description analysis and ATS keyword optimization',
      'Automated resume customization per role using Claude',
      'Playwright browser automation for application form filling',
      'PDF generation for tailored cover letters and resumes',
      'Application status tracking dashboard',
      'Multi-agent orchestration: researcher, writer, submitter, tracker agents',
    ],
    claudeWorkflow: [
      { actor: 'User',    step: 'Provide job URL and master resume', detail: 'User provides the job posting URL and a master resume with full career history.' },
      { actor: 'Claude',  step: 'Analyze job description', detail: 'Claude extracts required skills, ATS keywords, company culture signals, and role-specific requirements.' },
      { actor: 'Claude',  step: 'Optimize resume for the role', detail: 'Claude rewrites relevant sections to match ATS keywords while preserving authenticity.' },
      { actor: 'Claude',  step: 'Generate tailored cover letter', detail: 'Claude writes a cover letter matching the role\'s specific requirements and company voice.' },
      { actor: 'Playwright', step: 'Automate application submission', detail: 'Browser automation fills application forms, uploads documents, and submits — with human approval before submission.' },
      { actor: 'Claude',  step: 'Update tracking dashboard', detail: 'Application status, tailored docs, and follow-up reminders logged to the tracking system.' },
    ],
    architectureRole: 'End-to-end Claude Code orchestration system — demonstrates multi-agent coordination for a real productivity use case',
    enterpriseUseCases: [
      'Recruiting operations: automate initial candidate application review and scoring',
      'Talent acquisition: automated sourcing and initial outreach workflows',
      'HR automation template: the multi-agent orchestration patterns are reusable for any multi-step HR workflow',
    ],
    securityNotes: [
      'Browser automation submits to external job sites — review what personal data is being sent',
      'Claude processes full resume and personal information — ensure proper data handling and no logging of PII',
      'Application auto-submission requires explicit human approval gate before any form submission',
    ],
    whyDevelopersCare: 'Career-Ops is one of the most complete examples of Claude Code orchestration in the wild — showing how to chain research, writing, automation, and tracking agents in a real production workflow. The multi-agent patterns (researcher → writer → submitter → tracker) are directly reusable in other domains.',
    goodSignals: ['End-to-end working implementation', 'Real-world problem with measurable ROI', 'Well-documented orchestration patterns', 'Active development and community'],
    watchOutFor: ['Browser automation ToS compliance varies by job platform', 'AI-generated applications must still represent the candidate accurately', 'ATS optimization should enhance, not fabricate qualifications'],
  },

  {
    id: 'awesome-design-md',
    name: 'awesome-design-md', owner: 'VoltAgent', repo: 'awesome-design-md',
    stars: 2800, emoji: '🎨', color: '#f59e0b',
    tagline: 'The DESIGN.md pattern — reusable visual DNA for AI-generated UIs',
    analogy: 'Like giving Claude a reusable visual design brain — every UI it generates is consistent because it reads the same design system specification before touching any code.',
    whatItIs: 'A curated collection of DESIGN.md files, templates, and best practices for the emerging AI-native design system pattern. DESIGN.md files define color systems, typography, component patterns, and design principles that AI coding agents read to generate consistent, on-brand UIs.',
    whyItExists: 'AI coding agents like Claude Code generate UI code without design context — producing visually inconsistent results every time. DESIGN.md solves this by creating a design system specification file that agents read automatically, applying consistent patterns across every generated component.',
    keyCapabilities: [
      'Curated DESIGN.md templates for common app types (SaaS, dashboard, mobile)',
      'Color token systems with semantic naming for AI consumption',
      'Component pattern library definitions that map to Tailwind classes',
      'AI instruction patterns that improve UI generation consistency',
      'Integration examples with Claude Code, Cursor, and Windsurf',
      'Before/after examples showing consistency improvements',
    ],
    claudeWorkflow: [
      { actor: 'User',   step: 'Add DESIGN.md to project root', detail: 'The DESIGN.md file defines the complete visual system: colors, typography, components, and interaction patterns.' },
      { actor: 'Claude', step: 'Read DESIGN.md at session start', detail: 'Claude Code reads DESIGN.md automatically (via CLAUDE.md reference or system prompt) before generating any UI code.' },
      { actor: 'Claude', step: 'Generate UI following design system', detail: 'Every component Claude generates uses the exact color tokens, spacing scale, and component patterns from DESIGN.md.' },
      { actor: 'Claude', step: 'Validate against design spec', detail: 'Claude can audit existing UI code for DESIGN.md compliance, flagging violations with specific fixes.' },
    ],
    architectureRole: 'Design context layer — makes AI-generated UIs consistent by codifying design decisions as machine-readable specifications',
    enterpriseUseCases: [
      'Enterprise design systems: codify brand guidelines into DESIGN.md for AI coding tools company-wide',
      'Design-to-code pipelines: designers define DESIGN.md, developers have AI implement consistently',
      'Multi-team consistency: shared DESIGN.md ensures all teams\' AI-generated components match the design system',
    ],
    securityNotes: [
      'DESIGN.md files are checked into git — treat them as documentation, not secrets',
      'AI-generated UIs must still be accessibility-reviewed — DESIGN.md ensures visual consistency, not WCAG compliance',
    ],
    whyDevelopersCare: 'DESIGN.md is becoming a standard pattern in AI-native development workflows. As AI coding tools become more common, projects that invest in DESIGN.md now get consistently better UI output from day one. It\'s one of the highest-leverage documents you can add to a repository.',
    goodSignals: ['Rapidly growing ecosystem adoption', 'Solves a universal pain point in AI-generated UIs', 'Community contributing DESIGN.md templates for specific frameworks', 'Simple concept with immediately measurable impact'],
    watchOutFor: ['DESIGN.md doesn\'t replace proper design review', 'Token consistency requires updating DESIGN.md when the real design system evolves', 'Works best with AI tools that read project context automatically (Claude Code, Cursor)'],
  },

  {
    id: 'firecrawl',
    name: 'Firecrawl', owner: 'firecrawl', repo: 'firecrawl',
    stars: 28000, emoji: '🔥', color: '#ef4444',
    tagline: 'Turn any website into AI-ready structured data — the research engine for LLMs',
    analogy: 'Like giving Claude a professional research team that extracts clean, structured information from any website instantly — no boilerplate, no navigation, just signal.',
    whatItIs: 'Firecrawl is an open-source web crawling and extraction platform purpose-built for AI applications. It renders JavaScript, handles authentication, manages pagination, and returns clean Markdown or structured JSON optimized for LLM consumption — not human browsers.',
    whyItExists: 'Raw HTML is practically useless for AI reasoning — 90% of tokens are wasted on navigation, ads, and boilerplate. Firecrawl extracts only the meaningful content and returns it in formats that use context window tokens efficiently.',
    keyCapabilities: [
      'JavaScript rendering — handles React, Vue, Angular apps that return empty HTML',
      'Recursive site crawling with configurable depth and domain scope',
      'Structured extraction with LLM-defined schemas (extract exactly what you need)',
      'Batch processing for high-volume research pipelines',
      'Clean Markdown output optimized for LLM context windows',
      'MCP server integration for direct Claude tool access',
    ],
    claudeWorkflow: [
      { actor: 'User',      step: 'Request research on a complex topic', detail: '"Summarize the security advisories published by our cloud provider in the last 90 days."' },
      { actor: 'Claude',    step: 'Identify relevant URLs to crawl', detail: 'Claude determines the target pages based on the research question.' },
      { actor: 'Firecrawl', step: 'Render and extract content', detail: 'Firecrawl renders the JS, removes boilerplate, and returns clean Markdown for each page.' },
      { actor: 'Claude',    step: 'Synthesize extracted content', detail: 'Claude processes the clean Markdown, extracting relevant facts and synthesizing findings.' },
      { actor: 'Chroma',    step: 'Index for future retrieval', detail: 'Extracted content is chunked and stored in a vector database for semantic search.' },
      { actor: 'Claude',    step: 'Deliver structured report', detail: 'Claude returns a structured analysis with citations linking to source URLs.' },
    ],
    architectureRole: 'Data ingestion layer — the bridge between the live web and AI-ready structured content for RAG and research pipelines',
    enterpriseUseCases: [
      'Competitive intelligence automation: crawl and index competitor sites on a schedule',
      'Regulatory compliance monitoring: track changes to government and standards body websites',
      'Documentation ingestion: convert external API docs and knowledge bases into RAG-ready format',
    ],
    securityNotes: [
      'Wrap all crawled content in explicit delimiters before passing to Claude — prevents prompt injection from malicious pages',
      'Domain allowlist is mandatory in production — never let Claude determine crawl targets from page links',
      'Crawling authenticated endpoints requires careful data governance review',
    ],
    whyDevelopersCare: 'Firecrawl is one of the few web extraction tools that was designed specifically for AI systems from the start — not retrofitted. The output format is optimized for LLM context windows, the API is clean, and it handles the hard parts (JS rendering, pagination, bot detection) that would take weeks to build yourself.',
    goodSignals: ['28k+ GitHub stars — genuinely widely used', 'Active commercial development with open-source core', 'MCP integration available', 'Handles the hard web extraction cases reliably'],
    watchOutFor: ['API rate limits on free tier — plan for production costs', 'Content from crawled pages requires sanitization before Claude ingestion', 'Dynamic sites may still miss content that requires complex interaction'],
  },

  {
    id: 'video-use',
    name: 'video-use', owner: 'browser-use', repo: 'video-use',
    stars: 5500, emoji: '🎥', color: '#a855f7',
    tagline: 'Visual browser automation — AI agents that watch, understand, and interact',
    analogy: 'Like giving AI actual eyes and browser memory — it can watch what happens on screen and interact based on what it sees, not just what the DOM says.',
    whatItIs: 'video-use (from the browser-use ecosystem) extends browser automation with video/visual reasoning capabilities. AI agents can observe browser state through screenshots and video frames, enabling automation of interfaces that can\'t be controlled through standard DOM selectors.',
    whyItExists: 'Standard browser automation (Playwright, Selenium) breaks when interfaces use canvas, WebGL, non-standard components, or PDFs. Video-based browser automation enables AI to interact with any visual interface by reasoning about what it sees, not what\'s in the DOM.',
    keyCapabilities: [
      'Screenshot-based UI reasoning for non-DOM interfaces',
      'Video frame analysis for understanding dynamic visual state',
      'Autonomous navigation based on visual cues, not just selectors',
      'Visual verification of UI state after actions',
      'Integration with Claude\'s vision capabilities for screenshot analysis',
      'Batch parallel browser sessions for scale',
    ],
    claudeWorkflow: [
      { actor: 'User',        step: 'Define visual automation task', detail: '"Navigate to the analytics dashboard, find the Q3 revenue chart, and extract the monthly breakdown."' },
      { actor: 'Claude',      step: 'Navigate to target', detail: 'Claude navigates to the URL and takes an initial screenshot of the current state.' },
      { actor: 'video-use',   step: 'Capture visual state', detail: 'Takes screenshot/video frame of the current browser viewport, passes to Claude vision.' },
      { actor: 'Claude',      step: 'Reason about visual content', detail: 'Claude analyzes the screenshot to understand UI layout, identify interactive elements, and plan the next action.' },
      { actor: 'video-use',   step: 'Execute visual interaction', detail: 'Clicks, scrolls, or types based on Claude\'s instruction targeting visual elements, not just CSS selectors.' },
      { actor: 'Claude',      step: 'Verify and extract data', detail: 'Captures final state screenshot, extracts the requested data from the visual representation.' },
    ],
    architectureRole: 'Visual perception layer — enables AI automation of any interface, not just those with accessible DOM structure',
    enterpriseUseCases: [
      'Legacy system automation: interact with old enterprise software that has no API',
      'Data extraction from canvas/WebGL dashboards that can\'t be DOM-scraped',
      'Automated UI testing of visually complex applications (maps, charts, PDFs)',
    ],
    securityNotes: [
      'Screenshot-based automation can inadvertently capture and process sensitive information visible on screen',
      'No domain allowlist on visual automation means Claude can be directed to any site through prompt injection',
      'Video frames stored during automation sessions may contain PII — review retention policies',
    ],
    whyDevelopersCare: 'As UIs become more complex (canvas, WebAssembly, native-like web apps), DOM-based automation increasingly fails. video-use represents the direction AI browser automation is heading — where the agent reasons about visual state rather than parsing HTML. The browser-use ecosystem (50k+ stars) is one of the most active browser AI communities.',
    goodSignals: ['browser-use ecosystem has 50k+ stars and active community', 'Solves a real gap in existing browser automation tools', 'Claude vision integration works well for UI reasoning', 'Growing enterprise interest in legacy system automation'],
    watchOutFor: ['Higher latency than DOM automation due to screenshot/LLM loop', 'Screenshot-based automation is less deterministic than selector-based', 'Early-stage project — API stability not yet guaranteed'],
  },
];

// ── Enterprise Stacks ─────────────────────────────────────────────────────────

export const enterpriseStacks: EnterpriseStack[] = [
  {
    id: 'ai-startup',
    name: 'AI Startup Engineering Stack',
    emoji: '🚀', color: '#6366f1', tier: 'startup',
    description: 'Everything a modern AI-first startup needs to ship products fast — without the enterprise overhead.',
    useCase: 'A 5-person engineering team building an AI-powered SaaS product that needs to move fast while maintaining quality.',
    layers: [
      { label: 'AI Core',        toolIds: ['sequential-thinking', 'memory'],       purpose: 'Structured reasoning and session persistence for user context' },
      { label: 'Code & Infra',   toolIds: ['filesystem', 'github', 'git'],          purpose: 'Full codebase access for autonomous feature development' },
      { label: 'Data',           toolIds: ['postgres', 'chroma'],                   purpose: 'Operational DB + vector search for AI features' },
      { label: 'Research',       toolIds: ['brave-search', 'firecrawl'],            purpose: 'Real-time web grounding and content extraction' },
      { label: 'Communication',  toolIds: ['slack', 'linear'],                      purpose: 'Project management and team notifications' },
    ],
  },
  {
    id: 'autonomous-coding',
    name: 'Autonomous Coding Platform',
    emoji: '💻', color: '#10b981', tier: 'scale',
    description: 'A Claude Code-powered engineering assistant that can implement features end-to-end with minimal human intervention.',
    useCase: 'Engineering teams that want to accelerate development velocity by automating mechanical engineering tasks while preserving human oversight for architecture decisions.',
    layers: [
      { label: 'Reasoning',      toolIds: ['sequential-thinking'],                  purpose: 'Explicit planning before any code changes' },
      { label: 'Code Context',   toolIds: ['filesystem', 'git', 'github'],          purpose: 'Read full codebase, history, and open PRs before writing' },
      { label: 'Validation',     toolIds: ['github'],                               purpose: 'Automated PR creation with structured review request' },
      { label: 'Project State',  toolIds: ['linear', 'slack'],                      purpose: 'Issue tracking and team notification on completion' },
      { label: 'Memory',         toolIds: ['memory'],                               purpose: 'Persist project conventions and past decisions across sessions' },
    ],
  },
  {
    id: 'ai-ops-center',
    name: 'AI Operations Center',
    emoji: '📊', color: '#ef4444', tier: 'enterprise',
    description: 'An AI-powered operations intelligence platform that correlates alerts, retrieves runbooks, and coordinates incident response.',
    useCase: 'SRE teams who want AI to handle tier-1 incident triage, reducing mean time to resolution and on-call cognitive load.',
    layers: [
      { label: 'Observability',  toolIds: ['datadog'],                              purpose: 'Real-time metrics, logs, and traces for incident context' },
      { label: 'Knowledge',      toolIds: ['aws-kb', 'memory'],                    purpose: 'Runbooks, past incidents, and architecture docs' },
      { label: 'Code Context',   toolIds: ['git', 'github'],                       purpose: 'Recent deploys and code changes correlated with incidents' },
      { label: 'Communication',  toolIds: ['slack'],                               purpose: 'Draft-then-approve incident communications and escalations' },
      { label: 'State',          toolIds: ['redis'],                               purpose: 'Real-time incident state shared across on-call agents' },
    ],
  },
  {
    id: 'research-intelligence',
    name: 'Research Intelligence Platform',
    emoji: '🔬', color: '#8b5cf6', tier: 'scale',
    description: 'An AI-powered research engine that gathers, indexes, and synthesizes information from multiple sources into structured intelligence reports.',
    useCase: 'Research, analyst, and competitive intelligence teams who need to process large volumes of web content into actionable structured reports.',
    layers: [
      { label: 'Collection',     toolIds: ['firecrawl', 'brave-search', 'tavily'],  purpose: 'Multi-source web extraction and structured search' },
      { label: 'Storage',        toolIds: ['chroma', 'postgres'],                   purpose: 'Vector index for semantic retrieval + structured data store' },
      { label: 'Persistence',    toolIds: ['memory'],                              purpose: 'Research context and prior findings across sessions' },
      { label: 'Output',         toolIds: ['filesystem', 'slack'],                 purpose: 'Report generation and stakeholder delivery' },
    ],
  },
  {
    id: 'browser-automation-factory',
    name: 'Browser Automation Factory',
    emoji: '🌐', color: '#0ea5e9', tier: 'scale',
    description: 'A managed browser automation infrastructure for AI agents running high-volume web workflows — scraping, testing, and extraction at scale.',
    useCase: 'Product teams that need to run large-scale web data collection, automated testing, or competitor monitoring without managing browser infrastructure.',
    layers: [
      { label: 'Browser Infrastructure', toolIds: ['hyperbrowser', 'playwright-mcp'], purpose: 'Managed cloud browsers + local Playwright for dev/test' },
      { label: 'Extraction',    toolIds: ['firecrawl'],                            purpose: 'Clean content extraction for extracted pages' },
      { label: 'Storage',       toolIds: ['chroma', 'postgres'],                  purpose: 'Indexed extracted data for querying and analysis' },
      { label: 'Orchestration', toolIds: ['redis'],                               purpose: 'Job queues and rate limiting across browser sessions' },
    ],
  },
];

// ── Signal vs Hype Analysis ───────────────────────────────────────────────────

export const hypeAnalyses: HypeAnalysis[] = [
  {
    id: 'firecrawl-hype',
    name: 'Firecrawl', owner: 'firecrawl',
    stars: 28000, emoji: '🔥', color: '#ef4444',
    verdict: 'ship-it',
    signalScore: 92, hypeScore: 65,
    summary: 'Genuinely solves a hard problem — JS rendering for AI extraction — better than any DIY solution. The 28k stars reflect real production adoption, not GitHub discovery gaming.',
    goodPoints: ['Solves a real engineering problem that\'s painful to build yourself', 'Active commercial development ensures maintenance', 'MCP integration available and working', 'Handles anti-bot measures reliably'],
    concernPoints: ['API costs add up at production scale', 'Crawled content requires sanitization for prompt injection prevention'],
    bestFor: 'Any project that needs to extract content from JS-rendered websites for AI processing',
    notFor: 'Simple static HTML extraction — overkill and cost-inefficient',
  },
  {
    id: 'career-ops-hype',
    name: 'Career-Ops', owner: 'santifer',
    stars: 1200, emoji: '💼', color: '#6366f1',
    verdict: 'evaluate',
    signalScore: 75, hypeScore: 45,
    summary: 'One of the most complete real-world Claude Code orchestration examples. The multi-agent patterns are genuinely reusable. Stars are modest but quality is high for what it demonstrates.',
    goodPoints: ['Complete working implementation of multi-agent orchestration', 'Solves a universal personal productivity problem', 'Well-structured codebase that teaches patterns', 'Browser automation integration is realistic'],
    concernPoints: ['ToS compliance with job boards varies — review before automating submissions', 'AI-optimized resumes must represent the candidate accurately', 'Relatively new project — may require maintenance as dependencies evolve'],
    bestFor: 'Learning multi-agent Claude Code orchestration patterns; personal productivity use',
    notFor: 'Enterprise HR automation without extensive legal review',
  },
  {
    id: 'design-md-hype',
    name: 'awesome-design-md', owner: 'VoltAgent',
    stars: 2800, emoji: '🎨', color: '#f59e0b',
    verdict: 'ship-it',
    signalScore: 85, hypeScore: 50,
    summary: 'High signal, relatively low hype. DESIGN.md is one of those ideas that seems obvious in retrospect. The ecosystem is growing because it solves a real, immediate pain point in AI-generated UIs.',
    goodPoints: ['Immediately measurable improvement in UI consistency', 'Works with all AI coding tools, not just Claude', 'Community actively contributing templates', 'Low implementation cost — just write a file'],
    concernPoints: ['Design systems still require human design expertise to create well', 'DESIGN.md must be maintained as the actual design system evolves'],
    bestFor: 'Any project using AI coding assistants to generate UI components',
    notFor: 'Projects with no design system or where visual consistency isn\'t a priority',
  },
  {
    id: 'video-use-hype',
    name: 'video-use', owner: 'browser-use',
    stars: 5500, emoji: '🎥', color: '#a855f7',
    verdict: 'evaluate',
    signalScore: 70, hypeScore: 80,
    summary: 'Real capability, real use cases, but genuinely early-stage. The browser-use ecosystem backing is strong. Worth evaluating now for use cases where DOM automation fails, but not for production-critical workflows yet.',
    goodPoints: ['Enables automation of interfaces inaccessible to DOM-based tools', 'Strong parent ecosystem (browser-use 50k+ stars)', 'Claude vision integration is a natural fit', 'Genuinely new capability with no good alternatives'],
    concernPoints: ['Higher latency than DOM-based automation', 'Less deterministic than selector-based tools', 'API stability not yet at 1.0'],
    bestFor: 'Legacy system automation, canvas/WebGL UIs, exploratory AI agent research',
    notFor: 'High-throughput production workflows where reliability and latency matter',
  },
  {
    id: 'n8n-hype',
    name: 'n8n', owner: 'n8n-io',
    stars: 52000, emoji: '🔄', color: '#ea580c',
    verdict: 'ship-it',
    signalScore: 88, hypeScore: 60,
    summary: '52k stars is earned. n8n is genuinely the best open-source workflow automation tool and its MCP integration makes it a powerful addition to AI agent stacks. The self-hosted model eliminates vendor lock-in.',
    goodPoints: ['52k stars from genuine production use', 'Self-hosted eliminates vendor lock-in and data concerns', '400+ integrations — connects to basically everything', 'Mature codebase with 6+ years of production use'],
    concernPoints: ['Workflow privilege escalation via MCP is a real risk — restrict accessible workflows carefully', 'Steep learning curve for complex orchestration flows'],
    bestFor: 'Teams that need to connect AI to many SaaS tools without building custom integrations',
    notFor: 'Simple single-integration use cases where a direct MCP server is simpler',
  },
];
