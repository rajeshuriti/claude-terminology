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
    setup: 'complex', readiness: 'emerging',
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
