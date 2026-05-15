// Curated from GitHub, modelcontextprotocol registry, and ecosystem reports.
// Star counts are approximate as of mid-2025.

export type EcoCategory = 'coding' | 'browser' | 'search' | 'data' | 'devops' | 'productivity' | 'workflow' | 'creative';
export type EcoTier = 'reference' | 'production' | 'stable' | 'emerging';
export type EcoTrend = 'hot' | 'rising' | 'stable' | 'declining';
export type EcoComplexity = 'beginner' | 'intermediate' | 'advanced' | 'enterprise';
export type EcoSetup = 'easy' | 'moderate' | 'complex';
export type EcoReadiness = 'experimental' | 'stable' | 'production-grade' | 'enterprise';

export interface EcoSecurityRisk {
  title: string;
  detail: string;
  severity: 'critical' | 'high' | 'medium';
}

export interface EcoServer {
  id: string;
  name: string;
  emoji: string;
  color: string;
  category: EcoCategory;
  tier: EcoTier;
  complexity: EcoComplexity;
  trend: EcoTrend;
  stars: number;
  isOfficial: boolean;
  tagline: string;
  analogy: string;
  whatItIs: string;
  whyItExists: string;
  realProblems: string[];
  claudeSteps: Array<{ actor: string; action: string }>;
  enterpriseUseCases: string[];
  architectureRole: string;
  securityRisks: EcoSecurityRisk[];
  commonMistakes: string[];
  setup: EcoSetup;
  readiness: EcoReadiness;
  worksWellWith: string[];
}

export interface EcoWorkflow {
  id: string;
  title: string;
  emoji: string;
  problem: string;
  steps: Array<{ tool: string; toolId: string; action: string; detail: string; actor: 'claude' | 'mcp' | 'user' | 'service' }>;
}

export interface EcoEvalCriteria {
  id: string;
  label: string;
  goodSignal: string;
  badSignal: string;
  weight: 'critical' | 'important' | 'nice';
}

// ── Category metadata ─────────────────────────────────────────────────────────

export const ECO_CATEGORY_META: Record<EcoCategory, { label: string; emoji: string; color: string; description: string }> = {
  coding:       { label: 'Coding & Engineering', emoji: '💻', color: '#6366f1', description: 'Repos, files, terminals, CI/CD' },
  browser:      { label: 'Browser Automation',   emoji: '🌐', color: '#0ea5e9', description: 'Navigate, click, scrape, test' },
  search:       { label: 'Search & Research',    emoji: '🔍', color: '#10b981', description: 'Web, semantic, academic search' },
  data:         { label: 'Data & Databases',     emoji: '🗄️', color: '#f59e0b', description: 'SQL, vector, key-value stores' },
  devops:       { label: 'DevOps & Cloud',       emoji: '☁️', color: '#ef4444', description: 'Infra, observability, deployment' },
  productivity: { label: 'Productivity',         emoji: '📋', color: '#8b5cf6', description: 'Slack, Notion, Linear, calendars' },
  workflow:     { label: 'Workflow & Automation',emoji: '⚡', color: '#ec4899', description: 'n8n, orchestration, pipelines' },
  creative:     { label: 'Creative & Media',     emoji: '🎬', color: '#14b8a6', description: 'Video, rendering, content AI' },
};

export const ECO_TIER_META: Record<EcoTier, { label: string; color: string; description: string }> = {
  reference:   { label: 'Reference',   color: '#8b5cf6', description: 'Official Anthropic MCP collection' },
  production:  { label: 'Production',  color: '#10b981', description: 'Battle-tested, enterprise-used' },
  stable:      { label: 'Stable',      color: '#0ea5e9', description: 'Reliable, maintained, community-verified' },
  emerging:    { label: 'Emerging',    color: '#f59e0b', description: 'Growing adoption, active development' },
};

// ── The 25 curated servers ────────────────────────────────────────────────────

export const ecoServers: EcoServer[] = [

  // ── Coding & Engineering ──────────────────────────────────────────────────

  {
    id: 'filesystem',
    name: 'Filesystem MCP', emoji: '📁', color: '#f59e0b',
    category: 'coding', tier: 'reference', complexity: 'beginner', trend: 'stable',
    stars: 28000, isOfficial: true,
    tagline: 'Read, write, and search local files and directories',
    analogy: 'Giving Claude a desk with your entire project folder open in front of it.',
    whatItIs: 'Official MCP server that exposes local filesystem operations — read, write, list, search — to Claude through typed, schema-validated tool calls.',
    whyItExists: 'Claude cannot access files by default. Every file-aware task required users to manually copy-paste code, configs, and docs into the chat window.',
    realProblems: [
      'Reviewing code across 50 files without pasting each one manually',
      'Generating documentation from source code Claude can actually read',
      'Updating config files consistently across a multi-service repo',
    ],
    claudeSteps: [
      { actor: 'User',   action: 'Ask Claude to audit the entire src/ directory' },
      { actor: 'Claude', action: 'Calls list_directory(path="/project/src")' },
      { actor: 'MCP',    action: 'Returns file tree with names, types, sizes' },
      { actor: 'Claude', action: 'Calls read_file() for each relevant file' },
      { actor: 'Claude', action: 'Synthesizes findings into a structured audit report' },
    ],
    enterpriseUseCases: [
      'Codebase onboarding: Claude reads the entire repo and answers architecture questions',
      'Automated documentation: generates docs from source, writes to /docs/ directory',
      'Configuration drift detection: compare configs across staging and production',
    ],
    architectureRole: 'Context layer — gives Claude access to project state without manual copy-paste',
    securityRisks: [
      { title: 'Path traversal outside allowed directories', severity: 'critical', detail: 'Without enforced allowlists, Claude can read ~/.ssh/id_rsa, .env files, or any file the process user can access.' },
      { title: 'Unrestricted writes to system paths', severity: 'critical', detail: 'Write access without scope constraints allows modification of crontabs, shell profiles, or application configs.' },
      { title: 'Sensitive file exposure', severity: 'high', detail: 'Claude may read and include credentials from .env, docker-compose.yml, or kubeconfig files in its response.' },
    ],
    commonMistakes: [
      'Granting access to the entire home directory instead of only the project folder',
      'Not separating read and write permissions — read-only satisfies 80% of use cases',
      'No file size limits — Claude reading a 100MB log file exhausts the context window',
    ],
    setup: 'easy', readiness: 'enterprise',
    worksWellWith: ['github', 'git', 'sequential-thinking'],
  },

  {
    id: 'github',
    name: 'GitHub MCP', emoji: '🐙', color: '#6366f1',
    category: 'coding', tier: 'reference', complexity: 'intermediate', trend: 'hot',
    stars: 28000, isOfficial: true,
    tagline: 'Repos, PRs, issues, code search — the complete GitHub surface',
    analogy: 'Turning Claude into a senior engineer with full repository access and commit rights.',
    whatItIs: 'Official MCP server exposing GitHub\'s core API: file contents, pull requests, issues, code search, commits, branches, and reviews.',
    whyItExists: 'Developers waste hours on mechanical GitHub tasks — reading diffs, drafting review comments, creating PRs. Claude can handle these if it has repository access.',
    realProblems: [
      '"Implement this feature" → Claude reads existing patterns, writes code, opens the PR without switching tools',
      'Automated PR review that understands project-specific conventions from CLAUDE.md',
      'Searching the entire codebase for usages before changing a shared API signature',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Fix the bug in issue #247"' },
      { actor: 'Claude', action: 'Calls get_issue to read the bug report and reproduce steps' },
      { actor: 'Claude', action: 'Calls search_code to find the relevant files' },
      { actor: 'Claude', action: 'Calls get_file_contents to read the current implementation' },
      { actor: 'Claude', action: 'Implements fix, calls create_pull_request with structured description' },
    ],
    enterpriseUseCases: [
      'Engineering copilot: Claude has full context of every team repo and handles review chores',
      'Security scanning: automatically creates issues for detected vulnerabilities across repos',
      'Release automation: generates changelogs from commit messages, creates releases',
    ],
    architectureRole: 'Code intelligence layer — gives Claude the full context of a software project including history and conventions',
    securityRisks: [
      { title: 'Write access enables repository destruction', severity: 'critical', detail: 'With admin permissions, a prompt injection via a crafted issue body could trigger branch deletion or force-pushes.' },
      { title: 'Token scope creep', severity: 'high', detail: 'A single "repo" scope grants access to all private repositories the token owner has access to, not just the target repo.' },
      { title: 'Sensitive commit exposure', severity: 'medium', detail: 'Reading commit history may expose accidentally committed secrets from months prior.' },
    ],
    commonMistakes: [
      'Using a personal token with full repo scope instead of a fine-grained token scoped to specific repos',
      'No branch protection — Claude can push directly to main without a review gate',
      'Not rate-limiting Claude\'s code search calls — exhausts GitHub API quota quickly',
    ],
    setup: 'easy', readiness: 'enterprise',
    worksWellWith: ['filesystem', 'linear', 'slack', 'sequential-thinking'],
  },

  {
    id: 'postgres',
    name: 'PostgreSQL MCP', emoji: '🐘', color: '#0ea5e9',
    category: 'data', tier: 'reference', complexity: 'intermediate', trend: 'stable',
    stars: 28000, isOfficial: true,
    tagline: 'Real-time database access — answer data questions with actual facts',
    analogy: 'Giving Claude structured organizational memory — real numbers instead of estimates.',
    whatItIs: 'Official MCP server that connects Claude to PostgreSQL databases via read-only SQL queries, schema discovery, and query explanation.',
    whyItExists: 'Business teams wasted engineering time translating data questions into SQL queries. Claude can now query directly, eliminating the translation layer.',
    realProblems: [
      '"How many enterprise customers haven\'t logged in for 30 days?" → actual answer from live data',
      'Schema exploration without a DBA: Claude discovers table relationships on demand',
      'Executive reporting with real numbers instead of copy-pasted spreadsheet estimates',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Which product features have the highest 90-day retention?"' },
      { actor: 'Claude', action: 'Calls describe_schema() to discover relevant tables' },
      { actor: 'Claude', action: 'Calls query() with a JOIN across users, events, features tables' },
      { actor: 'MCP',    action: 'Returns aggregated retention data by feature' },
      { actor: 'Claude', action: 'Synthesizes data into ranked analysis with business context' },
    ],
    enterpriseUseCases: [
      'Self-serve analytics: non-technical stakeholders ask questions in plain English',
      'Incident debugging: "which queries were running when the DB spiked?" answered instantly',
      'Compliance reporting: extract audit-relevant data without granting dashboard access',
    ],
    architectureRole: 'Data intelligence layer — converts structured data into conversational answers without code',
    securityRisks: [
      { title: 'No write access isolation', severity: 'critical', detail: 'If the DB user has INSERT/UPDATE permissions, a prompt injection could modify production data through Claude.' },
      { title: 'PII exposure in query results', severity: 'high', detail: 'Queries returning full customer records expose PII that ends up in Claude\'s context and potentially in logs.' },
      { title: 'Query complexity resource exhaustion', severity: 'medium', detail: 'Claude may generate expensive queries (unindexed joins on large tables) that degrade database performance.' },
    ],
    commonMistakes: [
      'Using the application DB user (with write access) instead of a dedicated read-only analytics user',
      'Not masking PII columns — Claude reads and echoes back customer names, emails, SSNs',
      'No query timeout — Claude\'s sequential analytical queries can hold connection pool slots',
    ],
    setup: 'moderate', readiness: 'enterprise',
    worksWellWith: ['slack', 'filesystem', 'aws-kb'],
  },

  {
    id: 'git',
    name: 'Git MCP', emoji: '🌿', color: '#f43f5e',
    category: 'coding', tier: 'reference', complexity: 'beginner', trend: 'stable',
    stars: 28000, isOfficial: true,
    tagline: 'Local git history — understand why code exists, not just what it does',
    analogy: 'Giving Claude the ability to read the entire archaeological record of a codebase.',
    whatItIs: 'Official MCP server exposing local git operations: log, diff, blame, status, branch listing — all as structured tool calls.',
    whyItExists: 'Code review without history context is blind guessing. Claude needs git blame and log data to understand intent, not just current state.',
    realProblems: [
      '"Why was this function changed 3 months ago?" — answered with actual commit context',
      'Pre-commit review: diff the staged changes against project conventions before committing',
      '"Who knows the auth module best?" — git blame aggregated by author',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Explain why this file has been modified 40 times in 6 months"' },
      { actor: 'Claude', action: 'Calls log(path="src/auth.ts", max_count=50)' },
      { actor: 'MCP',    action: 'Returns commit messages, authors, timestamps' },
      { actor: 'Claude', action: 'Calls diff(from="HEAD~1", to="HEAD") for recent changes' },
      { actor: 'Claude', action: 'Synthesizes commit history into a narrative of the file\'s evolution' },
    ],
    enterpriseUseCases: [
      'Onboarding automation: new engineers ask "walk me through the evolution of the payment service"',
      'Regression archaeology: "what changed between the last good release and this broken one?"',
      'Code ownership reporting: aggregate git blame across the team',
    ],
    architectureRole: 'Historical context layer — makes Claude aware of WHY code is the way it is',
    securityRisks: [
      { title: 'Accidental secret exposure in git history', severity: 'high', detail: 'Git log may surface commits that once contained API keys or credentials, even if the files were later updated.' },
      { title: 'Branch information disclosure', severity: 'medium', detail: 'Branch names like "hotfix-cve-2025-1234" reveal security context before patches are public.' },
    ],
    commonMistakes: [
      'Not scoping to read-only — there\'s no legitimate reason Claude needs git commit or push access via this tool',
      'Requesting full repo history on large repos — git log on a 10-year codebase is overwhelming',
    ],
    setup: 'easy', readiness: 'enterprise',
    worksWellWith: ['github', 'filesystem', 'linear'],
  },

  // ── Browser Automation ────────────────────────────────────────────────────

  {
    id: 'playwright-mcp',
    name: 'Playwright MCP', emoji: '🎭', color: '#2ead33',
    category: 'browser', tier: 'production', complexity: 'intermediate', trend: 'hot',
    stars: 15000, isOfficial: false,
    tagline: 'Full browser control — navigate, interact, test, and extract from any website',
    analogy: 'Giving Claude eyes, a mouse, and a keyboard to operate any website on earth.',
    whatItIs: 'Microsoft-maintained MCP server built on the Playwright browser automation library, enabling Claude to navigate URLs, click elements, fill forms, take screenshots, and extract structured data from any web page.',
    whyItExists: 'LLMs hallucinate website state without real browser access. Playwright MCP gives Claude ground truth about what a page actually contains right now.',
    realProblems: [
      'End-to-end testing in plain English: "verify the checkout flow works on mobile" → actual browser test',
      'Competitor price monitoring without a custom scraper for each site',
      'Testing that a UI regression was actually fixed without manual QA steps',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Test our onboarding flow and report any broken steps"' },
      { actor: 'Claude', action: 'Calls navigate(url) to open the signup page' },
      { actor: 'Claude', action: 'Calls fill() and click() to complete each step' },
      { actor: 'MCP',    action: 'Returns screenshots + DOM state at each step' },
      { actor: 'Claude', action: 'Reports which steps succeeded and which encountered errors' },
    ],
    enterpriseUseCases: [
      'QA automation: natural-language test specs that Claude runs on every deploy',
      'Competitive intelligence: structured extraction of competitor feature pages and pricing',
      'Accessibility audits: Claude navigates the app and reports WCAG violations',
    ],
    architectureRole: 'Browser control layer — the bridge between AI reasoning and any web-based system',
    securityRisks: [
      { title: 'Prompt injection via scraped page content', severity: 'critical', detail: 'A malicious page containing "Ignore previous instructions" in invisible text can redirect Claude\'s behavior mid-workflow.' },
      { title: 'Credential phishing via navigation', severity: 'critical', detail: 'Without domain allowlists, Claude can be directed to navigate to login pages and fill in credentials it has in context.' },
      { title: 'ToS violations at scale', severity: 'high', detail: 'Automated browser sessions can violate website terms of service, leading to IP bans or legal exposure.' },
    ],
    commonMistakes: [
      'No domain allowlist — Claude can navigate anywhere, including attacker-controlled URLs',
      'Allowing login to sensitive accounts without per-action human approval',
      'Not sandboxing in an isolated browser profile — cookies from previous sessions persist',
    ],
    setup: 'moderate', readiness: 'production-grade',
    worksWellWith: ['filesystem', 'brave-search', 'slack'],
  },

  {
    id: 'hyperbrowser',
    name: 'Hyperbrowser MCP', emoji: '🚀', color: '#a855f7',
    category: 'browser', tier: 'emerging', complexity: 'advanced', trend: 'rising',
    stars: 4000, isOfficial: false,
    tagline: 'Managed cloud browsers at scale — browser automation without infrastructure',
    analogy: 'Giving AI a fleet of programmable cloud browsers it can spin up instantly without managing any infrastructure.',
    whatItIs: 'Cloud-hosted browser automation platform with an MCP interface. Handles browser provisioning, proxy rotation, CAPTCHA solving, and session management so agents don\'t need to run their own browser infrastructure.',
    whyItExists: 'Scaling browser automation for AI agents is operationally difficult — you need to manage pools of browser instances, handle IP rotation, deal with bot detection. Hyperbrowser abstracts all of that.',
    realProblems: [
      'Running hundreds of concurrent browser sessions for data extraction without managing a browser farm',
      'Bypassing bot detection mechanisms that block simple Playwright sessions',
      'Browser automation as a service for multi-tenant AI products',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Monitor 500 product pages for price changes"' },
      { actor: 'Claude', action: 'Calls hyperbrowser/create_session with target URLs' },
      { actor: 'MCP',    action: 'Provisions cloud browsers, returns session IDs' },
      { actor: 'Claude', action: 'Extracts structured price data from each session in parallel' },
      { actor: 'Claude', action: 'Returns comparison against baseline prices' },
    ],
    enterpriseUseCases: [
      'Large-scale web intelligence: competitive monitoring across thousands of pages simultaneously',
      'AI product feature: browser automation as a managed service inside your SaaS product',
      'Research automation: academic and market research requiring parallel data collection',
    ],
    architectureRole: 'Infrastructure layer — browser-as-a-service that removes operational complexity from AI browser workflows',
    securityRisks: [
      { title: 'External data handling by third-party infrastructure', severity: 'high', detail: 'Browser sessions and extracted data pass through Hyperbrowser\'s infrastructure. Sensitive scraping targets may expose PII or proprietary data to a third party.' },
      { title: 'Uncontrolled scraping at scale', severity: 'high', detail: 'Easy scaling means easy large-scale ToS violation. Claude can inadvertently run thousands of sessions against a single target.' },
    ],
    commonMistakes: [
      'Not reviewing what data is being sent to a third-party browser service before deploying',
      'No rate limiting on session creation — cost can spiral with agent loops',
    ],
    setup: 'moderate', readiness: 'stable',
    worksWellWith: ['playwright-mcp', 'firecrawl', 'chroma'],
  },

  // ── Search & Research ─────────────────────────────────────────────────────

  {
    id: 'firecrawl',
    name: 'Firecrawl MCP', emoji: '🔥', color: '#ef4444',
    category: 'search', tier: 'production', complexity: 'intermediate', trend: 'hot',
    stars: 25000, isOfficial: false,
    tagline: 'Structured web extraction optimized for LLMs — clean Markdown from any URL',
    analogy: 'Giving Claude a real-time internet research team that returns information in formats it can actually reason with.',
    whatItIs: 'Web crawling and extraction platform with an MCP interface. Converts any website into clean, structured Markdown optimized for LLM consumption — handles dynamic JS rendering, pagination, and anti-scraping measures.',
    whyItExists: 'Raw HTML is nearly useless for AI reasoning. Firecrawl strips navigation, ads, and boilerplate, returning only the meaningful content in a format that uses context window tokens efficiently.',
    realProblems: [
      'LLMs trying to reason over raw HTML waste 90% of context tokens on boilerplate',
      'JavaScript-rendered pages return empty content to simple HTTP scrapers',
      'Recursive site crawling to extract structured product catalogs or documentation',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Summarize the security advisories on this vendor\'s blog"' },
      { actor: 'Claude', action: 'Calls firecrawl/scrape(url, formats=["markdown"])' },
      { actor: 'MCP',    action: 'Returns clean Markdown stripped of navigation and ads' },
      { actor: 'Claude', action: 'Extracts and summarizes only the security-relevant content' },
      { actor: 'Claude', action: 'Returns structured advisory summary with dates and CVE numbers' },
    ],
    enterpriseUseCases: [
      'Competitive intelligence pipelines: crawl and index competitor sites weekly',
      'Documentation ingestion: convert external docs into a RAG knowledge base',
      'Regulatory monitoring: track changes to government and compliance websites',
    ],
    architectureRole: 'Data ingestion layer — the bridge between the open web and AI-ready structured content',
    securityRisks: [
      { title: 'Prompt injection via crawled content', severity: 'critical', detail: 'Malicious pages can embed "AI instructions" in invisible HTML elements. Firecrawl\'s Markdown conversion may preserve these attack strings.' },
      { title: 'Confidential URL crawling', severity: 'high', detail: 'Claude may crawl authenticated or internal URLs if not carefully scoped, exposing private content to the extraction pipeline.' },
    ],
    commonMistakes: [
      'Not wrapping crawled content in explicit delimiters before passing to Claude',
      'Crawling authenticated pages without understanding what data leaves your security boundary',
      'No domain allowlist — letting Claude determine what URLs to crawl based on page links',
    ],
    setup: 'easy', readiness: 'production-grade',
    worksWellWith: ['chroma', 'brave-search', 'postgres', 'memory'],
  },

  {
    id: 'brave-search',
    name: 'Brave Search MCP', emoji: '🔍', color: '#fb7185',
    category: 'search', tier: 'reference', complexity: 'beginner', trend: 'stable',
    stars: 28000, isOfficial: true,
    tagline: 'Real-time web search — ground Claude in current facts, not training data',
    analogy: 'Giving Claude a live newspaper instead of relying on last year\'s archive.',
    whatItIs: 'Official MCP server using Brave\'s independent search index to retrieve current web results, news, and summaries — without the filter bubble of personalized search.',
    whyItExists: 'Claude\'s training data has a cutoff. Any question about recent events, current library versions, live prices, or breaking news requires real-time retrieval.',
    realProblems: [
      '"What\'s the latest stable version of React?" — actual current answer, not training data',
      '"Is the Stripe API having issues right now?" — live status check',
      'Security research: current CVE details and patch availability',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"What are the most common MCP security vulnerabilities reported this month?"' },
      { actor: 'Claude', action: 'Calls brave_search(query, count=5)' },
      { actor: 'MCP',    action: 'Returns current search results with titles, snippets, URLs' },
      { actor: 'Claude', action: 'Synthesizes findings into a structured current-events summary' },
    ],
    enterpriseUseCases: [
      'Threat intelligence: real-time monitoring of vulnerability disclosures for used dependencies',
      'Market intelligence: daily summaries of industry news for executive briefings',
      'Compliance monitoring: track regulatory announcements in specific industries',
    ],
    architectureRole: 'Grounding layer — prevents hallucination on time-sensitive factual questions',
    securityRisks: [
      { title: 'Search result prompt injection', severity: 'high', detail: 'Search results can contain SEO-optimized content designed to manipulate LLMs. AI-generated spam sites increasingly target this vector.' },
      { title: 'Rate limit exhaustion in agent loops', severity: 'medium', detail: 'Claude in an agentic loop can exhaust API quotas rapidly if search is called without per-session limits.' },
    ],
    commonMistakes: [
      'Not rate-limiting search calls per session — agent loops can make hundreds of queries',
      'Treating search result content as trusted input without sanitization',
    ],
    setup: 'easy', readiness: 'enterprise',
    worksWellWith: ['firecrawl', 'memory', 'filesystem'],
  },

  {
    id: 'tavily',
    name: 'Tavily MCP', emoji: '🎯', color: '#0ea5e9',
    category: 'search', tier: 'stable', complexity: 'beginner', trend: 'rising',
    stars: 5000, isOfficial: false,
    tagline: 'AI-optimized search API — results formatted for direct LLM consumption',
    analogy: 'A search engine built from the ground up for AI, not humans — no ads, no pagination, just signal.',
    whatItIs: 'Search API purpose-built for AI applications. Returns structured, pre-processed results with relevance scores and source metadata optimized for LLM reasoning chains.',
    whyItExists: 'Standard search APIs return HTML-heavy results optimized for human browsers. Tavily returns clean, scored results that slot directly into AI context windows efficiently.',
    realProblems: [
      'Spending context tokens on irrelevant search results and boilerplate',
      'Need for search that returns deep content extraction, not just snippets',
      'Research workflows requiring reliable, deduplicated information from multiple sources',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Research the current state of MCP adoption in enterprise"' },
      { actor: 'Claude', action: 'Calls tavily/search with targeted queries' },
      { actor: 'MCP',    action: 'Returns scored, deduplicated results with full page content' },
      { actor: 'Claude', action: 'Synthesizes into a structured research briefing' },
    ],
    enterpriseUseCases: [
      'Research pipelines that produce structured intelligence reports from web sources',
      'Sales intelligence: automated prospect research before customer calls',
      'Due diligence automation: research company backgrounds with verified sources',
    ],
    architectureRole: 'Intelligence retrieval layer — optimized signal extraction from the web for AI reasoning',
    securityRisks: [
      { title: 'AI-targeted manipulation via search results', severity: 'high', detail: 'Some content creators specifically craft pages to hijack AI search workflows. Tavily\'s deep extraction can amplify this attack.' },
    ],
    commonMistakes: [
      'Using Tavily and Brave Search simultaneously without deduplication — wastes tokens on identical results',
      'Not specifying search_depth parameter — default shallow search misses specialized content',
    ],
    setup: 'easy', readiness: 'production-grade',
    worksWellWith: ['firecrawl', 'chroma', 'memory'],
  },

  // ── Data & Storage ────────────────────────────────────────────────────────

  {
    id: 'chroma',
    name: 'Chroma MCP', emoji: '🧬', color: '#10b981',
    category: 'data', tier: 'stable', complexity: 'intermediate', trend: 'rising',
    stars: 16000, isOfficial: false,
    tagline: 'Semantic vector search — find knowledge by meaning, not exact keywords',
    analogy: 'Giving Claude a long-term memory that retrieves information by concept similarity, not string matching.',
    whatItIs: 'MCP interface for Chroma, the open-source AI-native vector database. Stores and retrieves text chunks, documents, and memories using embedding-based semantic similarity search.',
    whyItExists: 'Claude\'s context window is finite. For large knowledge bases, you can\'t load everything. Vector search surfaces the semantically relevant chunks without overloading context.',
    realProblems: [
      'RAG pipelines: answer questions about a 10,000-page documentation corpus',
      'Session memory: retrieve past decisions and context from previous Claude conversations',
      'Code search: find semantically similar code patterns across a large codebase',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Find all prior decisions about our database schema"' },
      { actor: 'Claude', action: 'Calls chroma/query(text="database schema decisions", n_results=5)' },
      { actor: 'MCP',    action: 'Returns top 5 semantically similar document chunks with scores' },
      { actor: 'Claude', action: 'Synthesizes retrieved context into a coherent summary' },
    ],
    enterpriseUseCases: [
      'Internal knowledge base: index Confluence, Notion, and Slack into a searchable vector store',
      'Customer support AI: retrieve relevant support docs and past resolutions',
      'Regulatory compliance: search policy documents semantically for relevant clauses',
    ],
    architectureRole: 'Memory and retrieval layer — the long-term knowledge store that feeds relevant context into Claude',
    securityRisks: [
      { title: 'Poisoned vector store injection', severity: 'critical', detail: 'If users can write to the vector store, they can inject prompt injection attacks that will be retrieved in future queries.' },
      { title: 'PII in embeddings', severity: 'high', detail: 'Embedding and storing documents with PII creates a searchable personal data store — may violate GDPR right-to-erasure requirements.' },
    ],
    commonMistakes: [
      'Storing everything without chunking strategy — large document chunks reduce retrieval precision',
      'Not filtering by metadata (date, source, access_level) before returning results to Claude',
      'No write access controls — any agent can modify the shared knowledge store',
    ],
    setup: 'moderate', readiness: 'stable',
    worksWellWith: ['firecrawl', 'tavily', 'memory', 'postgres'],
  },

  {
    id: 'memory',
    name: 'Memory MCP', emoji: '🧠', color: '#ec4899',
    category: 'data', tier: 'reference', complexity: 'beginner', trend: 'rising',
    stars: 28000, isOfficial: true,
    tagline: 'Persistent key-value memory that survives across Claude sessions',
    analogy: 'A personal notebook Claude can write to and read from across every conversation — like giving AI a sticky note that lasts forever.',
    whatItIs: 'Official MCP server providing key-value memory storage. Claude reads and writes named facts, preferences, and context that persist beyond the current conversation.',
    whyItExists: 'Every Claude session starts cold. Without memory, engineers re-explain the entire codebase context on every conversation. Memory eliminates this overhead.',
    realProblems: [
      '"Pick up where we left off" — Claude reads prior session context without re-explanation',
      'Preference persistence: Claude remembers "this user prefers TypeScript, dislikes verbose comments"',
      'Long-running agent tasks that span multiple sessions maintain progress state',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Continue the refactoring we started yesterday"' },
      { actor: 'Claude', action: 'Calls memory/retrieve("refactoring-progress")' },
      { actor: 'MCP',    action: 'Returns stored context: files changed, pending tasks, open questions' },
      { actor: 'Claude', action: 'Continues work with full prior context without re-explanation' },
    ],
    enterpriseUseCases: [
      'Agent state management: autonomous agents store task progress to survive session interruptions',
      'User preference layer: per-user Claude behavior customization stored in memory',
      'Project context: teams store shared architectural decisions Claude references automatically',
    ],
    architectureRole: 'Persistence layer — bridges stateless Claude sessions into continuous workflows',
    securityRisks: [
      { title: 'Cross-session data leakage', severity: 'critical', detail: 'Without namespacing, one user\'s memory can be accessed by another — critical in multi-tenant deployments.' },
      { title: 'Credential storage in memory', severity: 'high', detail: 'Claude may decide to store API keys or passwords in memory for "convenience." Memory must be treated as potentially sensitive data.' },
    ],
    commonMistakes: [
      'Not namespacing memories by user and project — shared memory store leaks data across users',
      'No TTL policy — stale, incorrect memories from months ago still influence Claude\'s behavior',
      'Storing PII in memory without a retention and deletion policy',
    ],
    setup: 'easy', readiness: 'production-grade',
    worksWellWith: ['chroma', 'filesystem', 'sequential-thinking'],
  },

  {
    id: 'redis',
    name: 'Redis MCP', emoji: '⚡', color: '#ef4444',
    category: 'data', tier: 'stable', complexity: 'intermediate', trend: 'stable',
    stars: 3000, isOfficial: false,
    tagline: 'In-memory key-value store — real-time state, caching, and pub/sub for AI agents',
    analogy: 'A blazing-fast shared whiteboard that multiple Claude agents can read and write simultaneously.',
    whatItIs: 'MCP server connecting Claude to Redis for low-latency key-value reads, writes, pub/sub messaging, and real-time data structures like sorted sets and streams.',
    whyItExists: 'Multi-agent systems need shared state that\'s faster than a database. Redis gives agents microsecond-latency coordination without file system bottlenecks.',
    realProblems: [
      'Multi-agent task queues: agents dequeue work items from Redis Streams',
      'Real-time dashboards: Claude reads live metrics stored in Redis by monitoring systems',
      'Session state for agent workflows that must survive individual step failures',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Process all the pending tasks in the agent queue"' },
      { actor: 'Claude', action: 'Calls redis/llen("task:queue") to check queue depth' },
      { actor: 'Claude', action: 'Calls redis/lpop("task:queue") to dequeue each task' },
      { actor: 'Claude', action: 'Processes each task, writes result to redis/set("task:result:{id}")' },
    ],
    enterpriseUseCases: [
      'Distributed agent coordination: multiple Claude instances share work state via Redis',
      'Real-time alerting: Claude monitors Redis pub/sub channels for system events',
      'Rate limiting state: per-user tool call budgets tracked in Redis counters',
    ],
    architectureRole: 'Shared state layer — high-speed coordination memory for multi-agent and real-time AI systems',
    securityRisks: [
      { title: 'Unauthenticated Redis access', severity: 'critical', detail: 'Redis has historically defaulted to no authentication. Exposed Redis instances are a common attack vector for data theft and remote code execution.' },
      { title: 'Cache poisoning', severity: 'high', detail: 'If Claude can write arbitrary keys, malicious content can poison caches that other services read from.' },
    ],
    commonMistakes: [
      'Connecting Claude to production Redis without read-only restrictions on sensitive keyspaces',
      'No key namespace isolation — Claude can read or overwrite keys from unrelated services',
    ],
    setup: 'moderate', readiness: 'stable',
    worksWellWith: ['postgres', 'memory', 'datadog'],
  },

  // ── DevOps & Cloud ────────────────────────────────────────────────────────

  {
    id: 'docker',
    name: 'Docker MCP', emoji: '🐋', color: '#0ea5e9',
    category: 'devops', tier: 'stable', complexity: 'advanced', trend: 'rising',
    stars: 6000, isOfficial: false,
    tagline: 'Container lifecycle management — build, run, inspect, debug containers via AI',
    analogy: 'Giving Claude full access to a container control panel to spin up, inspect, and tear down compute environments on demand.',
    whatItIs: 'MCP server exposing Docker daemon operations: container lifecycle, image management, log streaming, exec into containers, and Docker Compose orchestration.',
    whyItExists: 'Debugging containerized applications requires context spread across container logs, running processes, network config, and image layers. Claude can synthesize these into answers humans would take hours to find.',
    realProblems: [
      '"Why is this container restarting every 30 seconds?" — Claude inspects logs, env vars, and health checks simultaneously',
      'Environment setup automation: Claude builds the correct container environment for a given project',
      'Multi-container debugging: Claude traces issues across docker-compose service dependencies',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"The auth-service container keeps crashing. Find out why."' },
      { actor: 'Claude', action: 'Calls docker/logs(container="auth-service", tail=100)' },
      { actor: 'Claude', action: 'Calls docker/inspect(container="auth-service") for env and health config' },
      { actor: 'Claude', action: 'Calls docker/exec(command="ps aux") to see running processes' },
      { actor: 'Claude', action: 'Identifies misconfigured health check causing restart loop, proposes fix' },
    ],
    enterpriseUseCases: [
      'On-call automation: Claude automatically diagnoses container failures before paging on-call engineers',
      'CI/CD debugging: analyze why container builds fail in CI without manual log grepping',
      'Security scanning: Claude inspects running containers for anomalous processes or network connections',
    ],
    architectureRole: 'Infrastructure intelligence layer — makes AI aware of running compute state in real time',
    securityRisks: [
      { title: 'Docker socket access = root equivalent', severity: 'critical', detail: 'Mounting the Docker socket gives any process — including Claude — root-equivalent access to the host. This is one of the most dangerous permissions in a Linux system.' },
      { title: 'Container escape via Claude-crafted commands', severity: 'critical', detail: 'If Claude can exec into containers or mount host paths, a prompt injection attack could escape the container to the host filesystem.' },
    ],
    commonMistakes: [
      'Mounting /var/run/docker.sock without understanding this grants host root access',
      'Allowing Claude to run arbitrary docker exec commands without an allowlist of permitted commands',
      'No network isolation — Claude-controlled containers can access internal services directly',
    ],
    setup: 'complex', readiness: 'stable',
    worksWellWith: ['kubernetes', 'datadog', 'filesystem'],
  },

  {
    id: 'aws-kb',
    name: 'AWS Knowledge Base MCP', emoji: '☁️', color: '#ff9900',
    category: 'devops', tier: 'production', complexity: 'enterprise', trend: 'stable',
    stars: 6000, isOfficial: false,
    tagline: 'Enterprise-scale RAG using AWS Bedrock Knowledge Bases',
    analogy: 'A semantic search engine over your entire enterprise knowledge corpus, backed by AWS infrastructure.',
    whatItIs: 'MCP server connecting Claude to AWS Bedrock Knowledge Bases for enterprise-grade vector retrieval. Queries semantic knowledge stores built from internal documentation, policy, and operational runbooks.',
    whyItExists: 'Enterprise organizations have millions of documents in S3, Confluence, and SharePoint. AWS Knowledge Bases ingests and indexes them; this MCP makes them accessible to Claude in real time.',
    realProblems: [
      'On-call engineers need runbook content retrieved in seconds during incidents, not minutes of searching',
      'Compliance teams need to query policy documents in plain English without knowing document locations',
      'Customer support agents need instant access to product documentation and past case resolutions',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"What\'s our incident response procedure for a payment service outage?"' },
      { actor: 'Claude', action: 'Calls aws_kb/retrieve("payment service incident response")' },
      { actor: 'MCP',    action: 'Returns ranked document chunks from internal runbooks with source citations' },
      { actor: 'Claude', action: 'Synthesizes retrieved runbook steps into a clear action plan' },
    ],
    enterpriseUseCases: [
      'Incident command: AI retrieves relevant runbooks, past incident reports, and architecture docs simultaneously',
      'Regulated industries: compliance teams query policy documents with natural language',
      'Sales enablement: retrieve relevant case studies and competitive positioning from the knowledge base',
    ],
    architectureRole: 'Enterprise knowledge layer — the AI-accessible interface to your organization\'s institutional memory',
    securityRisks: [
      { title: 'Cross-role data access through AI abstraction', severity: 'critical', detail: 'If all roles query the same knowledge base, HR documents, M&A plans, and technical specs may be accessible to users who shouldn\'t see them.' },
      { title: 'Confidential document leakage via natural language', severity: 'high', detail: 'A knowledge base query like "executive compensation" may surface confidential HR documents through Claude\'s natural language interface.' },
    ],
    commonMistakes: [
      'Ingesting all internal documents without access-level metadata filtering',
      'Not restricting knowledge base access to role-appropriate content before queries reach Claude',
    ],
    setup: 'complex', readiness: 'enterprise',
    worksWellWith: ['postgres', 'slack', 'memory'],
  },

  {
    id: 'datadog',
    name: 'Datadog MCP', emoji: '📊', color: '#632ca6',
    category: 'devops', tier: 'stable', complexity: 'enterprise', trend: 'rising',
    stars: 2500, isOfficial: false,
    tagline: 'Observability intelligence — query metrics, traces, and logs through Claude',
    analogy: 'Giving Claude live visibility into every system metric, trace, and log in your infrastructure — like a senior SRE with perfect recall.',
    whatItIs: 'MCP server connecting Claude to Datadog\'s observability APIs. Claude queries metrics, searches logs, reads traces, and inspects dashboards to reason about system health.',
    whyItExists: 'Observability data is useless without interpretation. Claude can cross-correlate metrics, traces, and logs — something that takes engineers hours — in seconds.',
    realProblems: [
      '"Why did p99 latency spike at 2:47 AM?" — Claude correlates metrics, deploys, and logs automatically',
      'Proactive anomaly investigation before user-reported impact',
      'Incident triage: surface the 3 most relevant signals from thousands of active alerts',
    ],
    claudeSteps: [
      { actor: 'Service', action: 'Alert fires: error rate spike on checkout-service' },
      { actor: 'Claude',  action: 'Calls datadog/query_metrics("error_rate", service="checkout", window="1h")' },
      { actor: 'Claude',  action: 'Calls datadog/search_logs(query="ERROR", service="checkout", last="15m")' },
      { actor: 'Claude',  action: 'Correlates spike with recent deployment from CI metadata' },
      { actor: 'Claude',  action: 'Returns structured incident summary with root cause hypothesis' },
    ],
    enterpriseUseCases: [
      'AIOps: automated incident correlation and root cause analysis without manual investigation',
      'Capacity planning: Claude analyzes usage trends and projects infrastructure needs',
      'SLO management: natural language queries against SLO burn rates and error budget',
    ],
    architectureRole: 'Observability layer — the real-time system health data source for AI-driven operations',
    securityRisks: [
      { title: 'Sensitive log content exposure', severity: 'high', detail: 'Application logs frequently contain user IDs, session tokens, and partial PII. Claude queries may return this content without sanitization.' },
      { title: 'Overly broad metric access', severity: 'medium', detail: 'Business-sensitive metrics (revenue, conversion rates) accessible via Datadog may be surfaced inappropriately through Claude queries.' },
    ],
    commonMistakes: [
      'Granting Claude write access to Datadog (downtimes, monitors) — read-only covers most use cases',
      'Not filtering log queries to exclude fields containing PII before returning to Claude',
    ],
    setup: 'moderate', readiness: 'stable',
    worksWellWith: ['slack', 'aws-kb', 'redis'],
  },

  // ── Productivity ──────────────────────────────────────────────────────────

  {
    id: 'slack',
    name: 'Slack MCP', emoji: '💬', color: '#4a154b',
    category: 'productivity', tier: 'reference', complexity: 'intermediate', trend: 'stable',
    stars: 28000, isOfficial: true,
    tagline: 'Team communication layer — search history, summarize channels, post with approval',
    analogy: 'Giving Claude a seat at your team\'s communication desk — able to read context from past conversations and post with human approval.',
    whatItIs: 'Official MCP server for Slack. Claude searches message history, retrieves channel content, gets thread context, and posts messages with appropriate human approval gates.',
    whyItExists: 'Critical decisions and context are buried in Slack threads. Engineers waste hours excavating history. Claude can surface relevant decisions instantly while preserving team communication workflows.',
    realProblems: [
      '"What did we decide about the auth architecture last month?" — answered from thread history, not memory',
      'Daily standup summaries: aggregate yesterday\'s engineering activity from #deployments and #incidents',
      'Incident communication: draft a stakeholder update for human review before posting',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Summarize the last incident in #production-alerts and draft a post-mortem"' },
      { actor: 'Claude', action: 'Calls slack/search_messages(query="incident", channel="#production-alerts")' },
      { actor: 'MCP',    action: 'Returns incident timeline from message history' },
      { actor: 'Claude', action: 'Drafts post-mortem structure, presents to user for approval' },
      { actor: 'User',   action: 'Approves → Claude posts to #post-mortems' },
    ],
    enterpriseUseCases: [
      'Incident response: Claude surfaces relevant past incidents before the on-call engineer reads any logs',
      'Team knowledge mining: "who owns the payment service?" answered from Slack context',
      'Automated daily digests: Claude summarizes key decisions from every team channel overnight',
    ],
    architectureRole: 'Team intelligence layer — makes organizational knowledge in Slack conversations queryable by AI',
    securityRisks: [
      { title: 'Sensitive conversation exposure', severity: 'high', detail: 'HR discussions, M&A-sensitive communications, and performance reviews in private channels must be excluded from Claude\'s accessible scope.' },
      { title: 'Auto-posting without approval', severity: 'high', detail: 'Claude posting autonomously to external-facing channels or customer-shared channels without human review can cause reputational damage.' },
    ],
    commonMistakes: [
      'Granting access to all channels instead of an explicit allowlist of appropriate channels',
      'Removing the human approval gate on post actions — always draft-then-approve',
      'Not auditing what channels the bot user can see — Slack bots can read channels they\'re added to silently',
    ],
    setup: 'easy', readiness: 'enterprise',
    worksWellWith: ['datadog', 'github', 'postgres', 'linear'],
  },

  {
    id: 'linear',
    name: 'Linear MCP', emoji: '📐', color: '#5e6ad2',
    category: 'productivity', tier: 'stable', complexity: 'intermediate', trend: 'rising',
    stars: 3000, isOfficial: false,
    tagline: 'Engineering project management — issues, roadmaps, cycles via Claude',
    analogy: 'Giving Claude full visibility into your engineering team\'s work queue and the ability to manage it with natural language.',
    whatItIs: 'MCP server for Linear, the modern engineering project management tool. Claude reads, creates, and updates issues, cycles, and projects through Linear\'s GraphQL API.',
    whyItExists: 'Engineering velocity tracking requires constant context switching between code and project management. Claude can manage issue lifecycle while engineers stay in their editor.',
    realProblems: [
      'Sprint planning: Claude reads all open issues and suggests prioritization based on labels and dependencies',
      'Automated bug triage: create issues from CI failures with full context already in the description',
      '"Update the issue status and add findings from the debugging session I just had"',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Create a Linear issue for the memory leak we just found"' },
      { actor: 'Claude', action: 'Reads conversation context to extract bug details' },
      { actor: 'Claude', action: 'Calls linear/create_issue with title, description, team, priority' },
      { actor: 'MCP',    action: 'Returns created issue URL with ID' },
      { actor: 'Claude', action: 'Confirms creation and links to the issue in response' },
    ],
    enterpriseUseCases: [
      'CI/CD integration: failed tests automatically create Linear issues with full stack traces',
      'Customer feedback triage: support tickets automatically converted to product issues',
      'Sprint retrospective automation: Claude analyzes completed cycle for velocity and blocker patterns',
    ],
    architectureRole: 'Work orchestration layer — connects AI reasoning to engineering project state',
    securityRisks: [
      { title: 'Cross-team issue access', severity: 'medium', detail: 'Linear API tokens often have access to all teams. Claude queries may surface issues from teams with different visibility requirements.' },
    ],
    commonMistakes: [
      'Not restricting to specific team IDs — Claude can see roadmaps and issues from all teams in the workspace',
      'Allowing bulk issue creation without rate limiting — loops can create hundreds of duplicate issues',
    ],
    setup: 'easy', readiness: 'stable',
    worksWellWith: ['github', 'slack', 'git'],
  },

  // ── Workflow & Orchestration ──────────────────────────────────────────────

  {
    id: 'sequential-thinking',
    name: 'Sequential Thinking MCP', emoji: '🔗', color: '#14b8a6',
    category: 'workflow', tier: 'reference', complexity: 'intermediate', trend: 'rising',
    stars: 28000, isOfficial: true,
    tagline: 'Structured multi-step reasoning — think visibly before acting',
    analogy: 'A structured whiteboard that forces Claude to reason step-by-step before touching anything, making its thinking transparent and auditable.',
    whatItIs: 'Official MCP server implementing a reasoning scaffold. Claude calls the think() tool to work through complex problems in explicit, visible steps before committing to an action.',
    whyItExists: 'Claude sometimes takes action before fully thinking through complex problems. Sequential thinking externalizes the reasoning process, making each step auditable and allowing course correction before costly mistakes.',
    realProblems: [
      'Architecture decisions that require weighing multiple tradeoffs systematically',
      'Debugging sessions where the hypothesis needs to be explicit before modifying code',
      'Security analysis where implicit reasoning is insufficient — every assumption must be stated',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Should we use event sourcing or CQRS for this feature?"' },
      { actor: 'Claude', action: 'Calls think("List the requirements and constraints first")' },
      { actor: 'Claude', action: 'Calls think("Analyze event sourcing pros/cons against requirements")' },
      { actor: 'Claude', action: 'Calls think("Analyze CQRS pros/cons against requirements")' },
      { actor: 'Claude', action: 'Returns recommendation backed by explicit, reviewable reasoning chain' },
    ],
    enterpriseUseCases: [
      'Compliance decisions: each reasoning step is auditable for regulatory review',
      'Security architecture: force Claude to explicitly state all assumptions before recommending controls',
      'Incident post-mortems: structured root cause analysis with explicit reasoning at each step',
    ],
    architectureRole: 'Reasoning layer — makes Claude\'s thought process transparent, structured, and auditable',
    securityRisks: [
      { title: 'Reasoning trace data sensitivity', severity: 'medium', detail: 'Reasoning steps may contain sensitive information (security vulnerabilities identified, business logic exposed) — treat traces as confidential.' },
    ],
    commonMistakes: [
      'Using it for simple tasks — the overhead of explicit reasoning is waste when Claude can answer directly',
      'Not logging reasoning traces — the audit value is lost if traces are ephemeral',
    ],
    setup: 'easy', readiness: 'production-grade',
    worksWellWith: ['github', 'filesystem', 'memory'],
  },

  {
    id: 'n8n',
    name: 'n8n MCP', emoji: '🔄', color: '#ea580c',
    category: 'workflow', tier: 'production', complexity: 'advanced', trend: 'hot',
    stars: 52000, isOfficial: false,
    tagline: 'Trigger and manage no-code workflows — connect AI to 400+ integrations',
    analogy: 'Giving Claude remote control of a no-code automation platform that connects to everything from CRMs to smart home devices.',
    whatItIs: 'MCP integration for n8n, the open-source workflow automation platform. Claude can trigger workflows, pass data between automation steps, and query workflow execution history.',
    whyItExists: 'n8n connects 400+ services with no-code logic. With MCP, Claude can orchestrate these existing automations through natural language instead of requiring engineers to build new integrations from scratch.',
    realProblems: [
      '"Send a summary of this analysis to our Salesforce contact record and CC the account manager in Slack" — one instruction triggers a multi-step automation',
      'Triggering existing business workflows from Claude conversations without building new code',
      'Complex multi-system automations where each step may involve a different SaaS tool',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Process these 50 leads through our qualification workflow"' },
      { actor: 'Claude', action: 'Calls n8n/trigger_workflow(id="lead-qualification", data=leads)' },
      { actor: 'MCP',    action: 'Triggers n8n workflow, returns execution ID' },
      { actor: 'Claude', action: 'Polls n8n/execution_status(id=execId) until complete' },
      { actor: 'Claude', action: 'Returns qualification results from workflow output' },
    ],
    enterpriseUseCases: [
      'Sales automation: Claude triggers CRM, email, and calendar workflows from a single natural language instruction',
      'Ops automation: incident response workflows that span monitoring, ticketing, communication, and remediation tools',
      'Data pipeline triggering: Claude manages ETL workflows based on analytical outcomes',
    ],
    architectureRole: 'Automation orchestration layer — connects Claude\'s reasoning to multi-step business process automation',
    securityRisks: [
      { title: 'Workflow privilege escalation', severity: 'critical', detail: 'n8n workflows can have elevated permissions (admin credentials, full database access). Triggering them through Claude via prompt injection executes with those elevated credentials.' },
      { title: 'Unaudited external data flow', severity: 'high', detail: 'n8n workflows triggered by Claude may send data to external systems without the triggering user understanding what data is being shared.' },
    ],
    commonMistakes: [
      'Exposing all n8n workflows to Claude — limit to explicitly approved workflow IDs',
      'Not requiring human confirmation before triggering workflows with write or send operations',
    ],
    setup: 'complex', readiness: 'production-grade',
    worksWellWith: ['slack', 'postgres', 'redis'],
  },

  // ── Creative ──────────────────────────────────────────────────────────────

  {
    id: 'remotion',
    name: 'Remotion MCP', emoji: '🎬', color: '#14b8a6',
    category: 'creative', tier: 'emerging', complexity: 'advanced', trend: 'rising',
    stars: 22000, isOfficial: false,
    tagline: 'Programmatic video rendering — AI writes React, Remotion renders cinematic video',
    analogy: 'Giving AI cinematic video rendering abilities — Claude writes the React code, Remotion executes the render pipeline.',
    whatItIs: 'MCP interface for Remotion, the framework for building videos programmatically in React. Claude generates React video components; Remotion renders them to MP4/WebM with animation, transitions, and audio.',
    whyItExists: 'Video content at scale requires either expensive designers or brittle templating systems. Remotion + Claude enables AI-driven video generation with the full expressiveness of React code.',
    realProblems: [
      'Generating personalized video reports from data without a video team',
      'Automated explainer videos for SaaS features that update alongside product changes',
      'Data visualization videos: animate charts and metrics for executive presentations',
    ],
    claudeSteps: [
      { actor: 'User',   action: '"Create a 60-second product demo video for our new API feature"' },
      { actor: 'Claude', action: 'Writes Remotion React component with animations and slide sequences' },
      { actor: 'Claude', action: 'Calls remotion/render(component, duration=60, fps=30)' },
      { actor: 'MCP',    action: 'Renders video and returns output file path' },
      { actor: 'Claude', action: 'Reports render completion and file location' },
    ],
    enterpriseUseCases: [
      'Automated quarterly business review videos generated from analytics data',
      'Personalized customer success videos at scale (one per customer account)',
      'Engineering release notes with animated code change visualizations',
    ],
    architectureRole: 'Media generation layer — converts AI-written code into production-quality rendered video',
    securityRisks: [
      { title: 'Code execution via React component rendering', severity: 'high', detail: 'Remotion renders React code in a headless Chromium process. Claude-generated components execute arbitrary JavaScript in the render environment.' },
    ],
    commonMistakes: [
      'No asset allowlisting — Claude may reference external images/fonts that load from untrusted URLs during render',
      'Rendering in the same process as the application — use an isolated render worker',
    ],
    setup: 'complex', readiness: 'experimental',
    worksWellWith: ['filesystem', 'postgres', 'brave-search'],
  },

];

// ── Workflow Simulations ──────────────────────────────────────────────────────

export const ecoWorkflows: EcoWorkflow[] = [
  {
    id: 'autonomous-coding',
    title: 'Autonomous Code Implementation',
    emoji: '💻',
    problem: 'Implement a feature end-to-end without switching tools or copying code context manually.',
    steps: [
      { tool: 'User',          toolId: '',               actor: 'user',    action: 'Feature request',            detail: '"Add rate limiting to all API endpoints. Token bucket, 100 req/min per user."' },
      { tool: 'GitHub MCP',    toolId: 'github',         actor: 'claude',  action: 'Search existing patterns',   detail: 'Claude calls search_code("rate-limit") to find existing middleware patterns before writing new code.' },
      { tool: 'Filesystem MCP',toolId: 'filesystem',     actor: 'claude',  action: 'Read implementation context',detail: 'Reads the found middleware file and surrounding test patterns to match code conventions exactly.' },
      { tool: 'Sequential',    toolId: 'sequential-thinking', actor: 'claude', action: 'Plan implementation',    detail: 'Calls think() to reason through token bucket algorithm, edge cases, and test coverage before writing.' },
      { tool: 'Filesystem MCP',toolId: 'filesystem',     actor: 'mcp',     action: 'Write implementation',       detail: 'Writes rate-limiter.ts and rate-limiter.test.ts following exact patterns from existing middleware.' },
      { tool: 'GitHub MCP',    toolId: 'github',         actor: 'mcp',     action: 'Open pull request',          detail: 'Creates feature branch, commits both files, opens PR with structured description and test results.' },
    ],
  },
  {
    id: 'research-pipeline',
    title: 'AI Research Pipeline',
    emoji: '🔬',
    problem: 'Research a complex technical topic across live sources and produce a structured report grounded in current information.',
    steps: [
      { tool: 'User',          toolId: '',               actor: 'user',    action: 'Research request',           detail: '"Summarize the current state of MCP adoption and the top 5 most-used servers by enterprise teams."' },
      { tool: 'Brave Search',  toolId: 'brave-search',   actor: 'claude',  action: 'Initial discovery search',   detail: 'Searches "MCP server enterprise adoption 2025" and "most popular MCP servers GitHub stars" for current data.' },
      { tool: 'Firecrawl',     toolId: 'firecrawl',      actor: 'claude',  action: 'Deep content extraction',    detail: 'Crawls top 3 search results for structured content, retrieving full articles in LLM-optimized Markdown.' },
      { tool: 'Tavily',        toolId: 'tavily',         actor: 'claude',  action: 'Cross-validation search',    detail: 'Runs parallel queries to validate findings from a different index, catches conflicting or updated information.' },
      { tool: 'Memory MCP',    toolId: 'memory',         actor: 'claude',  action: 'Store key findings',         detail: 'Writes summary facts to memory so future sessions can build on this research without re-crawling.' },
      { tool: 'Filesystem MCP',toolId: 'filesystem',     actor: 'mcp',     action: 'Save structured report',     detail: 'Writes the final report to /reports/mcp-adoption-2025.md with citations and source URLs.' },
    ],
  },
  {
    id: 'browser-workflow',
    title: 'Browser Automation & Extraction',
    emoji: '🌐',
    problem: 'Extract structured data from a complex JavaScript-rendered application without a custom scraper.',
    steps: [
      { tool: 'User',            toolId: '',               actor: 'user',    action: 'Extraction request',         detail: '"Extract pricing data for all 50 competitor products from their pricing page."' },
      { tool: 'Playwright MCP',  toolId: 'playwright-mcp', actor: 'claude',  action: 'Navigate to target',         detail: 'Calls navigate(url) and waits for JavaScript rendering to complete before extraction.' },
      { tool: 'Playwright MCP',  toolId: 'playwright-mcp', actor: 'mcp',     action: 'Interact with page',         detail: 'Clicks through plan tiers, fills filter forms, handles pagination to reach all 50 products.' },
      { tool: 'Playwright MCP',  toolId: 'playwright-mcp', actor: 'claude',  action: 'Extract structured data',    detail: 'Calls evaluate() with a structured extraction schema to get product names, prices, and features as JSON.' },
      { tool: 'Chroma MCP',      toolId: 'chroma',         actor: 'claude',  action: 'Store in vector index',      detail: 'Indexes extracted products in Chroma for semantic search ("find all products with SSO feature").' },
      { tool: 'Filesystem MCP',  toolId: 'filesystem',     actor: 'mcp',     action: 'Export data',                detail: 'Writes structured JSON and human-readable Markdown versions of the competitive pricing analysis.' },
    ],
  },
  {
    id: 'incident-response',
    title: 'Automated Incident Response',
    emoji: '🚨',
    problem: 'Triage a production incident in seconds instead of minutes by automatically correlating alerts, logs, and recent deploys.',
    steps: [
      { tool: 'Monitoring',   toolId: '',           actor: 'service', action: 'Alert fires',                detail: 'PagerDuty: auth-service error rate 23% (normal 0.1%). Claude incident agent activates.' },
      { tool: 'Datadog MCP',  toolId: 'datadog',    actor: 'claude',  action: 'Query error context',        detail: 'Retrieves last 30 minutes of auth-service logs filtered to ERROR level, gets error frequency by type.' },
      { tool: 'Git MCP',      toolId: 'git',        actor: 'claude',  action: 'Check recent deployments',   detail: 'Runs git log since incident start time — finds JWT middleware update deployed 22 minutes before alert.' },
      { tool: 'AWS KB MCP',   toolId: 'aws-kb',     actor: 'claude',  action: 'Retrieve runbook',           detail: 'Queries knowledge base for "auth service rollback procedure" — retrieves step-by-step rollback guide.' },
      { tool: 'Slack MCP',    toolId: 'slack',      actor: 'claude',  action: 'Draft incident communication', detail: 'Prepares structured incident post: impact, root cause hypothesis, rollback steps. Shows to SRE for approval.' },
      { tool: 'Slack MCP',    toolId: 'slack',      actor: 'mcp',     action: 'Post to incident channel',   detail: 'Posts approved summary to #incidents. All stakeholders informed in <60 seconds from alert fire.' },
    ],
  },
  {
    id: 'enterprise-analytics',
    title: 'Enterprise Analytics Pipeline',
    emoji: '📊',
    problem: 'Answer a complex business question using real data from multiple systems, producing an executive-ready report.',
    steps: [
      { tool: 'User',          toolId: '',           actor: 'user',    action: 'Business question',           detail: '"Which customer segments are at highest churn risk this quarter based on product engagement patterns?"' },
      { tool: 'PostgreSQL MCP',toolId: 'postgres',   actor: 'claude',  action: 'Explore schema',              detail: 'Calls describe_schema() to discover tables: users, sessions, events, subscriptions, customer_segments.' },
      { tool: 'PostgreSQL MCP',toolId: 'postgres',   actor: 'claude',  action: 'Query engagement data',       detail: 'Joins users+sessions+events to compute engagement scores per segment in the last 90 days.' },
      { tool: 'PostgreSQL MCP',toolId: 'postgres',   actor: 'mcp',     action: 'Retrieve cancellation signals', detail: 'Queries subscription cancellation events correlated with engagement drop — identifies leading indicators.' },
      { tool: 'Chroma MCP',    toolId: 'chroma',     actor: 'claude',  action: 'Retrieve past analyses',      detail: 'Queries vector store for past churn analyses to understand if this pattern was seen before.' },
      { tool: 'Slack MCP',     toolId: 'slack',      actor: 'mcp',     action: 'Deliver report',              detail: 'Posts churn risk analysis to #product-analytics with actionable recommendations and SQL queries used.' },
    ],
  },
];

// ── Evaluation Criteria ───────────────────────────────────────────────────────

export const evalCriteria: EcoEvalCriteria[] = [
  {
    id: 'maintenance',
    label: 'Active Maintenance',
    goodSignal: 'Commits in the last 30 days, open PRs being reviewed, release changelog updated',
    badSignal: 'Last commit > 6 months ago, open issues piling up with no responses, unmaintained README',
    weight: 'critical',
  },
  {
    id: 'permissions',
    label: 'Minimal Permission Scope',
    goodSignal: 'Tools request only what they need — read-only by default, scoped to specific resources',
    badSignal: 'Requests full filesystem access, admin API tokens, or root-equivalent permissions as defaults',
    weight: 'critical',
  },
  {
    id: 'input-validation',
    label: 'Input Validation',
    goodSignal: 'Uses Zod or JSON Schema for all tool inputs, rejects invalid data before execution',
    badSignal: 'Passes Claude inputs directly to shell commands, SQL queries, or file paths without validation',
    weight: 'critical',
  },
  {
    id: 'official-org',
    label: 'Official or Known Organization',
    goodSignal: 'Published by Anthropic, Microsoft, major cloud provider, or well-known open-source organization',
    badSignal: 'Anonymous maintainer, no organization affiliation, no security contact, no code of conduct',
    weight: 'important',
  },
  {
    id: 'documentation',
    label: 'Documentation Quality',
    goodSignal: 'Clear README with security guidance, setup instructions, and tool descriptions that help Claude use them correctly',
    badSignal: 'No README, or README is a generic template — no guidance on permissions, limits, or security',
    weight: 'important',
  },
  {
    id: 'community',
    label: 'Community Adoption',
    goodSignal: '>500 GitHub stars, active Discord/community, referenced in multiple ecosystem lists',
    badSignal: '<50 stars, no community discussion, not referenced anywhere outside its own repo',
    weight: 'nice',
  },
  {
    id: 'error-handling',
    label: 'Structured Error Handling',
    goodSignal: 'Returns structured error objects with actionable messages that Claude can reason about',
    badSignal: 'Throws raw exceptions, returns null, or silently ignores errors — Claude gets no signal about failures',
    weight: 'important',
  },
  {
    id: 'observability',
    label: 'Observability',
    goodSignal: 'Emits structured logs per tool call with timing, status, and input metadata',
    badSignal: 'No logging at all — impossible to audit what operations were executed and when',
    weight: 'important',
  },
];

// ── MCP Installation Data ─────────────────────────────────────────────────────

export interface McpEnvVar {
  name: string;
  required: boolean;
  description: string;
  example: string;
  howToGet: string;
  security: 'secret' | 'config';
}

export interface McpTroubleshootItem {
  symptom: string;
  cause: string;
  fix: string;
}

export interface McpInstallInfo {
  npxCommand: string;
  claudeDesktopConfig: string;
  claudeCodeCmd: string;
  envVars: McpEnvVar[];
  verifyPrompt: string;
  troubleshooting: McpTroubleshootItem[];
  deploymentNote: string;
}

export const mcpInstallData: Record<string, McpInstallInfo> = {

  filesystem: {
    npxCommand: 'npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/dir',
    claudeDesktopConfig: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/you/projects"
      ]
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem ~/projects',
    envVars: [],
    verifyPrompt: 'List all files in my project directory and summarize the structure.',
    troubleshooting: [
      { symptom: 'Permission denied on read', cause: 'Path not inside allowed directories', fix: 'Change the path argument in args to match the directory you want to expose. Restart Claude Desktop after editing.' },
      { symptom: 'MCP not listed after claude mcp list', cause: 'Incorrect command path or JSON syntax error in config', fix: 'Test standalone: npx -y @modelcontextprotocol/server-filesystem ~/projects — if it hangs waiting for input, the install is working.' },
      { symptom: 'Claude reads sensitive files (.env, .ssh)', cause: 'Allowed directory is too broad (home dir ~)', fix: 'Scope allowed path to just the project folder, e.g. ~/projects/my-app — never allow the entire home directory.' },
    ],
    deploymentNote: 'Runs as a local stdio process. Only exposes directories you explicitly list in args. Never pass ~ or / as the allowed path.',
  },

  github: {
    npxCommand: 'npx -y @modelcontextprotocol/server-github',
    claudeDesktopConfig: `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_PAT_HERE"
      }
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_PAT_HERE -- npx -y @modelcontextprotocol/server-github',
    envVars: [
      {
        name: 'GITHUB_PERSONAL_ACCESS_TOKEN',
        required: true,
        description: 'GitHub personal access token. Use a fine-grained token scoped to specific repos.',
        example: 'github_pat_REPLACE_WITH_YOUR_TOKEN',
        howToGet: 'GitHub.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token. Select only the repos you need.',
        security: 'secret',
      },
    ],
    verifyPrompt: 'List the open issues in the repository anthropics/anthropic-sdk-python',
    troubleshooting: [
      { symptom: '401 Unauthorized', cause: 'Invalid or expired token', fix: 'Regenerate token at github.com/settings/tokens and update the env var in your config file. Restart Claude Desktop.' },
      { symptom: '403 on private repos', cause: 'Fine-grained token scope excludes the repo', fix: 'Edit the token on GitHub and add the specific private repo to its repository access list.' },
      { symptom: 'Rate limit hit quickly', cause: 'Code search calls consume high GitHub API quota', fix: 'Add --max-search-results 10 to args to limit search result volume per call.' },
    ],
    deploymentNote: 'Use fine-grained tokens scoped to specific repos only. Never use a classic token with full repo scope — it grants read/write access to all your private repos.',
  },

  postgres: {
    npxCommand: 'npx -y @modelcontextprotocol/server-postgres "postgresql://user:pass@localhost/mydb"',
    claudeDesktopConfig: `{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://readonly_user:password@localhost:5432/mydb"
      ]
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres "postgresql://readonly:pass@localhost/mydb"',
    envVars: [
      {
        name: 'Connection string (in args)',
        required: true,
        description: 'PostgreSQL connection URL — embed directly in args, not as an env var.',
        example: 'postgresql://readonly_user:password@localhost:5432/analytics_db',
        howToGet: 'Create a read-only DB user: CREATE USER claude_readonly WITH PASSWORD \'...\'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO claude_readonly;',
        security: 'secret',
      },
    ],
    verifyPrompt: 'What tables exist in the database? Describe the schema of the users table.',
    troubleshooting: [
      { symptom: 'Connection refused (port 5432)', cause: 'PostgreSQL not running or wrong host', fix: 'Test connectivity: psql "postgresql://user:pass@localhost/mydb" — if it fails, check pg_ctl status or Docker is running.' },
      { symptom: 'Authentication failed', cause: 'Wrong username, password, or database name in URL', fix: 'URL format is: postgresql://username:password@host:port/database — verify each component matches your DB setup.' },
      { symptom: 'SSL required', cause: 'Production DB requires SSL', fix: 'Append ?sslmode=require to connection string: postgresql://user:pass@host/db?sslmode=require' },
    ],
    deploymentNote: 'Always use a dedicated read-only database user. Never use superuser or app user credentials — a single injected query could modify production data.',
  },

  git: {
    npxCommand: 'npx -y @modelcontextprotocol/server-git',
    claudeDesktopConfig: `{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git"]
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add git -- npx -y @modelcontextprotocol/server-git',
    envVars: [],
    verifyPrompt: 'Show me the last 10 commits in this repository with their messages and authors.',
    troubleshooting: [
      { symptom: 'Not a git repository error', cause: 'Claude Desktop launched from outside a git repo', fix: 'The server operates on the working directory. Launch Claude from inside your project directory, or specify --repository /path/to/repo in args.' },
      { symptom: 'Git command not found', cause: 'Git not installed or not in PATH', fix: 'Install git: brew install git (macOS) or apt install git (Linux). Verify: git --version.' },
    ],
    deploymentNote: 'Read-only access to local git history. No write operations (commit, push, branch). Works on whichever repo directory Claude was launched from.',
  },

  'playwright-mcp': {
    npxCommand: 'npx @playwright/mcp@latest',
    claudeDesktopConfig: `{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add playwright -- npx @playwright/mcp@latest',
    envVars: [],
    verifyPrompt: 'Navigate to https://example.com, take a screenshot, and describe what you see.',
    troubleshooting: [
      { symptom: 'Browser not launching / executable not found', cause: 'Playwright browsers not installed', fix: 'Run: npx playwright install chromium — this downloads the browser binaries (~150MB). Run once per machine.' },
      { symptom: 'Navigation timeout', cause: 'Slow page load or network issues', fix: 'The default timeout is 30s. For slow sites, add {"timeout": 60000} to the page navigation call.' },
      { symptom: 'Page content returns empty', cause: 'JavaScript-rendered app needs time to hydrate', fix: 'Add waitUntil: "networkidle" option in navigation to wait for JS rendering to complete.' },
    ],
    deploymentNote: 'Requires Playwright browsers installed locally (npx playwright install). Runs a real Chromium browser — keep browser profile isolated to prevent session bleed-over.',
  },

  hyperbrowser: {
    npxCommand: 'npx @hyperbrowserai/mcp',
    claudeDesktopConfig: `{
  "mcpServers": {
    "hyperbrowser": {
      "command": "npx",
      "args": ["@hyperbrowserai/mcp"],
      "env": {
        "HYPERBROWSER_API_KEY": "hb_yourApiKeyHere"
      }
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add hyperbrowser -e HYPERBROWSER_API_KEY=hb_xxx -- npx @hyperbrowserai/mcp',
    envVars: [
      {
        name: 'HYPERBROWSER_API_KEY',
        required: true,
        description: 'API key for Hyperbrowser cloud browser sessions.',
        example: 'hb_xxxxxxxxxxxxxxxxxxxx',
        howToGet: 'Sign up at app.hyperbrowser.ai → Dashboard → API Keys → Create new key.',
        security: 'secret',
      },
    ],
    verifyPrompt: 'Start a browser session and navigate to https://example.com — tell me the page title and first paragraph.',
    troubleshooting: [
      { symptom: '401 Unauthorized', cause: 'Invalid API key', fix: 'Verify your key at app.hyperbrowser.ai. Keys are prefixed with hb_.' },
      { symptom: 'Session quota exceeded', cause: 'Monthly session limit reached on free tier', fix: 'Upgrade plan at hyperbrowser.ai or reduce concurrent session count.' },
    ],
    deploymentNote: 'Cloud-hosted browsers — no local browser install needed. Billed per session. Add rate limiting in agent loops to prevent runaway session costs.',
  },

  firecrawl: {
    npxCommand: 'npx firecrawl-mcp',
    claudeDesktopConfig: `{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "fc-yourApiKeyHere"
      }
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add firecrawl -e FIRECRAWL_API_KEY=fc-xxx -- npx firecrawl-mcp',
    envVars: [
      {
        name: 'FIRECRAWL_API_KEY',
        required: true,
        description: 'Firecrawl API key. Free tier: 500 credits/month.',
        example: 'fc-xxxxxxxxxxxxxxxxxxxxxxxx',
        howToGet: 'Sign up at firecrawl.dev → dashboard → API Keys → copy your key.',
        security: 'secret',
      },
    ],
    verifyPrompt: 'Scrape https://docs.anthropic.com/en/docs/intro-to-claude and give me a structured summary of the key sections.',
    troubleshooting: [
      { symptom: 'Empty content returned', cause: 'JavaScript-rendered page not fully loaded', fix: 'Add "formats": ["markdown"] to the scrape options — this triggers Firecrawl\'s JS rendering pipeline.' },
      { symptom: '402 Payment Required', cause: 'Free tier credits exhausted', fix: 'Check credit balance at firecrawl.dev/dashboard. Use scrape (1 credit) instead of crawl (1 credit/page) to conserve.' },
      { symptom: 'Prompt injection in results', cause: 'Scraped page contains adversarial instructions', fix: 'Always wrap firecrawl results in XML tags: <scraped_content>...</scraped_content> before passing to Claude.' },
    ],
    deploymentNote: 'Cloud extraction service. Credits consumed per page. Watch costs on deep crawl operations — limit crawl depth and page count explicitly.',
  },

  'brave-search': {
    npxCommand: 'npx -y @modelcontextprotocol/server-brave-search',
    claudeDesktopConfig: `{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "BSA_yourApiKeyHere"
      }
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add brave-search -e BRAVE_API_KEY=BSA_xxx -- npx -y @modelcontextprotocol/server-brave-search',
    envVars: [
      {
        name: 'BRAVE_API_KEY',
        required: true,
        description: 'Brave Search API key. Free tier: 2,000 queries/month.',
        example: 'BSAxxxxxxxxxxxxxxxxxxxxxxxxxx',
        howToGet: 'Go to brave.com/search/api → Get Started → create account → API Keys → generate key. Keys start with BSA.',
        security: 'secret',
      },
    ],
    verifyPrompt: 'Search for "Model Context Protocol latest updates 2025" and summarize the top 3 results.',
    troubleshooting: [
      { symptom: 'Invalid API key / 401', cause: 'Key format wrong or not activated', fix: 'Keys start with "BSA" — verify at api.search.brave.com. New keys may take a few minutes to activate.' },
      { symptom: 'Quota exceeded / 429', cause: 'Monthly free tier limit reached', fix: 'Free tier: 2,000 queries/month. Upgrade plan or wait for monthly reset.' },
    ],
    deploymentNote: 'Cloud search API. Unfiltered, non-personalized results. Free tier sufficient for development; upgrade for production agent use.',
  },

  tavily: {
    npxCommand: 'npx tavily-mcp',
    claudeDesktopConfig: `{
  "mcpServers": {
    "tavily": {
      "command": "npx",
      "args": ["tavily-mcp"],
      "env": {
        "TAVILY_API_KEY": "tvly-yourApiKeyHere"
      }
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add tavily -e TAVILY_API_KEY=tvly-xxx -- npx tavily-mcp',
    envVars: [
      {
        name: 'TAVILY_API_KEY',
        required: true,
        description: 'Tavily API key. Free tier: 1,000 credits/month.',
        example: 'tvly-xxxxxxxxxxxxxxxxxxxxxxxx',
        howToGet: 'Sign up at tavily.com → dashboard → API Keys → generate key. Keys start with tvly-.',
        security: 'secret',
      },
    ],
    verifyPrompt: 'Search for peer-reviewed papers on LLM hallucination mitigation published in 2024.',
    troubleshooting: [
      { symptom: '401 / Invalid API key', cause: 'Key not set or wrong format', fix: 'Keys start with tvly-. Verify at app.tavily.com/home.' },
      { symptom: 'Credits depleted', cause: 'Free tier limit hit', fix: 'Use search_depth: "basic" (1 credit) instead of "advanced" (2 credits) to conserve.' },
    ],
    deploymentNote: 'AI-optimized search — results pre-cleaned for LLM ingestion. Free tier (1,000 credits/month) covers development. Results cite sources automatically.',
  },

  chroma: {
    npxCommand: 'npx chroma-mcp --host localhost --port 8000',
    claudeDesktopConfig: `{
  "mcpServers": {
    "chroma": {
      "command": "npx",
      "args": ["chroma-mcp", "--host", "localhost", "--port", "8000"]
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add chroma -- npx chroma-mcp --host localhost --port 8000',
    envVars: [
      {
        name: 'ChromaDB server (separate process)',
        required: true,
        description: 'ChromaDB must be running before connecting. Start with Docker or pip.',
        example: 'docker run -p 8000:8000 chromadb/chroma',
        howToGet: 'Option 1 — Docker: docker run -p 8000:8000 chromadb/chroma | Option 2 — pip: pip install chromadb && chroma run --path ./chroma-data',
        security: 'config',
      },
    ],
    verifyPrompt: 'List the available vector collections and tell me how many documents are in each.',
    troubleshooting: [
      { symptom: 'Connection refused on port 8000', cause: 'ChromaDB not running', fix: 'Start ChromaDB first: docker run -p 8000:8000 chromadb/chroma — wait for "Application startup complete" before using.' },
      { symptom: 'Collection not found', cause: 'Empty database or wrong collection name', fix: 'Collections must be created before querying. Use: client.create_collection("my-docs") in Python first.' },
    ],
    deploymentNote: 'ChromaDB runs as a separate service (Docker or pip). The MCP server connects to it via HTTP. For production, use persistent storage: docker run -v ./data:/chroma/chroma -p 8000:8000 chromadb/chroma.',
  },

  memory: {
    npxCommand: 'npx -y @modelcontextprotocol/server-memory',
    claudeDesktopConfig: `{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add memory -- npx -y @modelcontextprotocol/server-memory',
    envVars: [],
    verifyPrompt: 'Remember that my preferred programming language is TypeScript and I work at Acme Corp. Now tell me what you know about me.',
    troubleshooting: [
      { symptom: 'Memory lost between Claude Desktop sessions', cause: 'Default is in-process memory (not persisted)', fix: 'Add --path ~/.claude/memory to persist to disk: "args": ["-y", "@modelcontextprotocol/server-memory", "--path", "~/.claude/memory"]' },
    ],
    deploymentNote: 'Zero external dependencies. Memory persists within a session. Add --path flag for cross-session persistence to a JSON file on disk.',
  },

  redis: {
    npxCommand: 'npx @modelcontextprotocol/server-redis --redis-url redis://localhost:6379',
    claudeDesktopConfig: `{
  "mcpServers": {
    "redis": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-redis",
        "--redis-url",
        "redis://localhost:6379"
      ]
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add redis -- npx @modelcontextprotocol/server-redis --redis-url redis://localhost:6379',
    envVars: [
      {
        name: 'Redis server (separate process)',
        required: true,
        description: 'Redis must be running before connecting.',
        example: 'redis://localhost:6379',
        howToGet: 'Option 1 — Docker: docker run -p 6379:6379 redis | Option 2 — macOS: brew install redis && brew services start redis | Option 3 — Managed: upstash.com (free tier)',
        security: 'config',
      },
    ],
    verifyPrompt: 'Set a key "test:mcp" with value "working" and an expiry of 60 seconds, then retrieve it.',
    troubleshooting: [
      { symptom: 'Connection refused on 6379', cause: 'Redis not running', fix: 'Start Redis: docker run -p 6379:6379 redis (simplest) or brew services start redis (macOS).' },
      { symptom: 'NOAUTH Authentication required', cause: 'Redis requires password but none provided', fix: 'Add password to URL: redis://:password@localhost:6379' },
    ],
    deploymentNote: 'Requires Redis running separately. For zero-config cloud Redis, use Upstash (upstash.com) — free tier: 10,000 commands/day.',
  },

  docker: {
    npxCommand: 'npx @modelcontextprotocol/server-docker',
    claudeDesktopConfig: `{
  "mcpServers": {
    "docker": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-docker"]
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add docker -- npx @modelcontextprotocol/server-docker',
    envVars: [],
    verifyPrompt: 'List all running Docker containers and tell me their names, images, and uptime.',
    troubleshooting: [
      { symptom: 'Cannot connect to Docker daemon', cause: 'Docker Desktop not running', fix: 'Start Docker Desktop (macOS/Windows) or: sudo systemctl start docker (Linux).' },
      { symptom: 'Permission denied on /var/run/docker.sock', cause: 'Current user not in docker group', fix: 'Run: sudo usermod -aG docker $USER then log out and back in. Or run with sudo (not recommended).' },
    ],
    deploymentNote: 'Grants full Docker daemon access — treat with the same care as root access. Use read-only Docker API endpoints where possible. Never run in production without explicit allow-lists.',
  },

  'aws-kb': {
    npxCommand: 'npx -y @modelcontextprotocol/server-aws-kb-retrieval',
    claudeDesktopConfig: `{
  "mcpServers": {
    "aws-kb": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-aws-kb-retrieval"],
      "env": {
        "AWS_ACCESS_KEY_ID": "AKIAIOSFODNN7EXAMPLE",
        "AWS_SECRET_ACCESS_KEY": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
        "AWS_REGION": "us-east-1",
        "BEDROCK_KB_ID": "KBXXXXXXXXXXXXXXX"
      }
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add aws-kb -e AWS_ACCESS_KEY_ID=AKIA... -e AWS_SECRET_ACCESS_KEY=... -e AWS_REGION=us-east-1 -e BEDROCK_KB_ID=KB... -- npx -y @modelcontextprotocol/server-aws-kb-retrieval',
    envVars: [
      { name: 'AWS_ACCESS_KEY_ID', required: true, description: 'IAM access key with Bedrock read permissions.', example: 'AKIAIOSFODNN7EXAMPLE', howToGet: 'AWS Console → IAM → Users → your user → Security credentials → Create access key. Attach AmazonBedrockReadOnlyAccess policy.', security: 'secret' },
      { name: 'AWS_SECRET_ACCESS_KEY', required: true, description: 'IAM secret key (generated with access key).', example: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', howToGet: 'Generated alongside Access Key ID — save it immediately as AWS only shows it once.', security: 'secret' },
      { name: 'AWS_REGION', required: true, description: 'AWS region where your Bedrock Knowledge Base is deployed.', example: 'us-east-1', howToGet: 'Check your Bedrock Knowledge Base region in the AWS Console URL or resource details.', security: 'config' },
      { name: 'BEDROCK_KB_ID', required: true, description: 'Amazon Bedrock Knowledge Base ID.', example: 'KBXXXXXXXXXXXXXXXX', howToGet: 'AWS Console → Amazon Bedrock → Knowledge bases → select your KB → copy the Knowledge base ID from the overview page.', security: 'config' },
    ],
    verifyPrompt: 'Search the knowledge base for documents about our product authentication flow.',
    troubleshooting: [
      { symptom: 'AccessDeniedException', cause: 'IAM user lacks Bedrock permissions', fix: 'Attach AmazonBedrockReadOnlyAccess managed policy to the IAM user in the AWS Console.' },
      { symptom: 'ResourceNotFoundException', cause: 'Wrong BEDROCK_KB_ID or wrong region', fix: 'Verify the KB ID and region match exactly — they are case-sensitive. KB IDs look like KBXXXXXXXXXX.' },
    ],
    deploymentNote: 'Requires an existing Bedrock Knowledge Base. For production, use IAM roles instead of access keys. Never commit AWS credentials to git.',
  },

  datadog: {
    npxCommand: 'npx @datadog/datadog-mcp-server',
    claudeDesktopConfig: `{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": ["@datadog/datadog-mcp-server"],
      "env": {
        "DATADOG_API_KEY": "your_api_key_here",
        "DATADOG_APP_KEY": "your_app_key_here"
      }
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add datadog -e DATADOG_API_KEY=xxx -e DATADOG_APP_KEY=xxx -- npx @datadog/datadog-mcp-server',
    envVars: [
      { name: 'DATADOG_API_KEY', required: true, description: 'Datadog API key — scoped to read metrics, logs, and dashboards.', example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', howToGet: 'Datadog → Organization Settings → API Keys → New Key. Use read-only scope.', security: 'secret' },
      { name: 'DATADOG_APP_KEY', required: true, description: 'Datadog application key for query access.', example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', howToGet: 'Datadog → Organization Settings → Application Keys → New Key.', security: 'secret' },
      { name: 'DATADOG_SITE', required: false, description: 'Datadog regional site (default: datadoghq.com).', example: 'datadoghq.eu', howToGet: 'EU customers use datadoghq.eu. AP customers use ap1.datadoghq.com. Check your Datadog URL.', security: 'config' },
    ],
    verifyPrompt: 'Show me the error rate and p99 latency for all services in the last 30 minutes.',
    troubleshooting: [
      { symptom: '403 Forbidden', cause: 'API or App key lacks required scopes', fix: 'Ensure both keys have metrics:read, logs:read, and dashboards:read permissions.' },
      { symptom: 'Wrong region data', cause: 'DATADOG_SITE not set for non-US instances', fix: 'Add DATADOG_SITE=datadoghq.eu (EU) or ap1.datadoghq.com (AP) to your env config.' },
    ],
    deploymentNote: 'Use read-only API keys. Never grant write access (monitors, incidents) to Claude integrations — misconfigured alerts can flood on-call channels.',
  },

  slack: {
    npxCommand: 'npx -y @modelcontextprotocol/server-slack',
    claudeDesktopConfig: `{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "YOUR_SLACK_BOT_TOKEN_HERE",
        "SLACK_TEAM_ID": "T0XXXXXXXXX"
      }
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add slack -e SLACK_BOT_TOKEN=YOUR_BOT_TOKEN -e SLACK_TEAM_ID=T0XXXXXXX -- npx -y @modelcontextprotocol/server-slack',
    envVars: [
      { name: 'SLACK_BOT_TOKEN', required: true, description: 'Slack Bot User OAuth token with channels:read and channels:history scopes. Real tokens start with xoxb-.', example: 'YOUR_SLACK_BOT_TOKEN_HERE', howToGet: 'api.slack.com/apps → Create New App → OAuth & Permissions → Bot Token Scopes: add channels:read, channels:history, users:read → Install to Workspace → copy Bot User OAuth Token.', security: 'secret' },
      { name: 'SLACK_TEAM_ID', required: true, description: 'Your Slack workspace ID.', example: 'T0XXXXXXX', howToGet: 'In Slack: right-click workspace name → Copy workspace ID. Or check your workspace URL: company.slack.com — the ID is shown in Admin → Workspace Settings.', security: 'config' },
    ],
    verifyPrompt: 'List the 5 most recently active public channels and show the last message from each.',
    troubleshooting: [
      { symptom: 'invalid_auth / token_revoked', cause: 'Bot token invalid or app uninstalled', fix: 'Reinstall the Slack app to your workspace at api.slack.com/apps and regenerate the token.' },
      { symptom: 'missing_scope', cause: 'Bot lacks required Slack OAuth scopes', fix: 'In api.slack.com/apps → OAuth & Permissions → add: channels:read, channels:history, users:read, then reinstall the app.' },
      { symptom: 'channel_not_found for private channels', cause: 'Bot not added to the private channel', fix: 'Invite your bot to the channel: /invite @YourBotName — bots cannot see channels they haven\'t been added to.' },
    ],
    deploymentNote: 'Use a dedicated bot account — never a personal user token. Add the bot only to channels it needs. Never grant admin or write-to-all-channels scopes.',
  },

  linear: {
    npxCommand: 'npx @linear/mcp-server',
    claudeDesktopConfig: `{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["@linear/mcp-server"],
      "env": {
        "LINEAR_API_KEY": "lin_api_yourKeyHere"
      }
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add linear -e LINEAR_API_KEY=lin_api_xxx -- npx @linear/mcp-server',
    envVars: [
      { name: 'LINEAR_API_KEY', required: true, description: 'Linear personal API key. Grants access to all teams your account can see.', example: 'lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', howToGet: 'Linear → Settings → Account → API → Personal API keys → Create new key.', security: 'secret' },
    ],
    verifyPrompt: 'List my assigned issues that are currently In Progress, sorted by priority.',
    troubleshooting: [
      { symptom: 'Unauthorized (401)', cause: 'API key revoked or invalid', fix: 'Generate a new key at linear.app/settings/api. Keys are prefixed lin_api_.' },
      { symptom: 'Team not found', cause: 'Key holder doesn\'t have access to that team', fix: 'Verify the team identifier matches a team visible in your Linear workspace.' },
    ],
    deploymentNote: 'Personal API keys inherit your account\'s full Linear permissions. For CI/CD, create a bot-user account with minimal team access.',
  },

  'sequential-thinking': {
    npxCommand: 'npx -y @modelcontextprotocol/server-sequential-thinking',
    claudeDesktopConfig: `{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking',
    envVars: [],
    verifyPrompt: 'Use sequential thinking to analyze the tradeoffs of switching our REST API to GraphQL. Consider latency, developer experience, and client-side caching.',
    troubleshooting: [
      { symptom: 'Tool not appearing in Claude', cause: 'Config file not saved or Claude Desktop not restarted', fix: 'Save config, fully quit Claude Desktop (not just close window), relaunch. Check: claude mcp list.' },
    ],
    deploymentNote: 'Zero external dependencies. Adds a think() tool that prompts Claude to reason step-by-step before answering. Works entirely locally — no API keys, no external calls.',
  },

  n8n: {
    npxCommand: 'npx @n8n/mcp-server',
    claudeDesktopConfig: `{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["@n8n/mcp-server"],
      "env": {
        "N8N_BASE_URL": "http://localhost:5678",
        "N8N_API_KEY": "your_n8n_api_key_here"
      }
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add n8n -e N8N_BASE_URL=http://localhost:5678 -e N8N_API_KEY=xxx -- npx @n8n/mcp-server',
    envVars: [
      { name: 'N8N_BASE_URL', required: true, description: 'URL of your n8n instance — local or cloud.', example: 'http://localhost:5678', howToGet: 'Local: http://localhost:5678 (default). n8n.cloud: https://yourworkspace.app.n8n.cloud', security: 'config' },
      { name: 'N8N_API_KEY', required: true, description: 'n8n API key to authenticate workflow access.', example: 'n8n_api_xxxxxxxxxxxx', howToGet: 'n8n UI → Settings (top-right) → n8n API → API keys → Add API key.', security: 'secret' },
    ],
    verifyPrompt: 'List all n8n workflows and tell me which ones are currently active.',
    troubleshooting: [
      { symptom: 'Connection refused on localhost:5678', cause: 'n8n not running', fix: 'Start n8n: npx n8n (dev) or docker run -p 5678:5678 n8nio/n8n (Docker).' },
      { symptom: '401 Unauthorized', cause: 'Invalid API key', fix: 'Regenerate at n8n Settings → API keys. Keys are prefixed n8n_api_.' },
    ],
    deploymentNote: 'n8n must be running separately. Use n8n.cloud (managed) or self-host with Docker for production. The MCP server triggers and manages workflows via the n8n REST API.',
  },

  remotion: {
    npxCommand: 'npx @remotion/mcp',
    claudeDesktopConfig: `{
  "mcpServers": {
    "remotion": {
      "command": "npx",
      "args": ["@remotion/mcp"]
    }
  }
}`,
    claudeCodeCmd: 'claude mcp add remotion -- npx @remotion/mcp',
    envVars: [],
    verifyPrompt: 'Create a simple 5-second Remotion composition that shows "Hello World" with a fade-in animation.',
    troubleshooting: [
      { symptom: 'Cannot find module @remotion/core', cause: 'Not running inside a Remotion project', fix: 'Bootstrap a project first: npm create video@latest — then run Claude from inside that directory.' },
      { symptom: 'Render failed: Chrome executable not found', cause: 'Remotion\'s Chromium not installed', fix: 'Run: npx remotion install-chromium inside your Remotion project directory.' },
      { symptom: 'Out of memory during render', cause: 'Long video or many concurrent frames', fix: 'Set concurrency: 1 in your render config. Reduce fps from 60 to 30 for development renders.' },
    ],
    deploymentNote: 'Works inside an existing Remotion project directory. Claude writes React code that Remotion renders to MP4/WebM. Requires Node.js 18+ and Chromium (installed via npx remotion install-chromium).',
  },

};
