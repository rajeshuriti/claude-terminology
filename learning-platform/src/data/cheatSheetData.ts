export type CheatMode = 'beginner' | 'developer' | 'engineer' | 'enterprise' | 'architect';

export type CheatSectionId =
  | 'claude-cli-basics' | 'code-commands' | 'context-memory'
  | 'file-operations' | 'mcp-tools' | 'project-operations'
  | 'terminal-shell' | 'env-variables' | 'automation-workflows'
  | 'debugging-diagnostics' | 'best-practices' | 'common-mistakes' | 'power-user-recipes';

export type CheatSectionGroup = 'foundation' | 'tools' | 'automation' | 'mastery';
export type SecurityLevel = 'safe' | 'caution' | 'danger';
export type TokenImpact = 'none' | 'low' | 'medium' | 'high' | 'variable';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface CheatModeContent {
  overview: string;
  keyPoints: string[];
  tip?: string;
}

export interface CheatCommand {
  id: string;
  cmd: string;
  syntax: string;
  description: string;
  analogy: string;
  whyItExists: string;
  example: string;
  tokenImpact: TokenImpact;
  securityLevel: SecurityLevel;
  tags: string[];
}

export interface CheatSection {
  id: CheatSectionId;
  group: CheatSectionGroup;
  emoji: string;
  title: string;
  tagline: string;
  interactiveType?: 'command-browser' | 'terminal' | 'workflow' | 'mistakes' | 'recipes' | 'mcp-flow';
  commands?: CheatCommand[];
  modeContent: Record<CheatMode, CheatModeContent>;
}

export interface WorkflowStep {
  actor: string;
  emoji: string;
  action: string;
  detail: string;
  tokenCost?: string;
}

export interface PowerRecipe {
  id: string;
  title: string;
  description: string;
  useCase: string;
  difficulty: Difficulty;
  tokenEstimate: string;
  steps: WorkflowStep[];
  caveats: string[];
}

export interface CommonMistake {
  id: string;
  title: string;
  bad: { code: string; explanation: string };
  good: { code: string; explanation: string };
  impact: 'cost' | 'security' | 'quality' | 'reliability';
  severity: 'critical' | 'high' | 'medium';
}

export const CHEAT_GROUPS: Record<CheatSectionGroup, { label: string; color: string }> = {
  foundation: { label: 'CLI Reference',     color: '#3b82f6' },
  tools:      { label: 'File & Tools',      color: '#8b5cf6' },
  automation: { label: 'Shell & Automation', color: '#10b981' },
  mastery:    { label: 'Mastery',           color: '#ec4899' },
};

export const CHEAT_MODES: Record<CheatMode, { label: string; desc: string; color: string; icon: string }> = {
  beginner:   { label: 'Beginner',   desc: 'What & why',          color: '#10b981', icon: '🌱' },
  developer:  { label: 'Developer',  desc: 'Code & patterns',     color: '#3b82f6', icon: '💻' },
  engineer:   { label: 'Engineer',   desc: 'Systems & scale',     color: '#8b5cf6', icon: '⚙️' },
  enterprise: { label: 'Enterprise', desc: 'Governance & ops',    color: '#f59e0b', icon: '🏢' },
  architect:  { label: 'Architect',  desc: 'Design principles',   color: '#ef4444', icon: '🏗️' },
};

export const CHEAT_GROUP_ORDER: CheatSectionGroup[] = ['foundation','tools','automation','mastery'];

export const SECURITY_META: Record<SecurityLevel, { color: string; label: string }> = {
  safe:    { color: '#10b981', label: 'SAFE' },
  caution: { color: '#f59e0b', label: 'CAUTION' },
  danger:  { color: '#ef4444', label: 'DANGER' },
};

export const TOKEN_META: Record<TokenImpact, { color: string }> = {
  none:     { color: '#64748b' },
  low:      { color: '#10b981' },
  medium:   { color: '#f59e0b' },
  high:     { color: '#ef4444' },
  variable: { color: '#8b5cf6' },
};

// ── Commands ──────────────────────────────────────────────────────────────────
export const CLI_COMMANDS: CheatCommand[] = [
  {
    id: 'claude-basic',
    cmd: 'claude',
    syntax: 'claude',
    description: 'Start Claude Code in interactive mode — persistent AI engineering session',
    analogy: 'Like opening a terminal that thinks with you',
    whyItExists: 'Persistent context, multi-step reasoning, tool access, and continuous workflow — the foundation of AI-native development',
    example: '$ claude\n> How do I optimize this query?',
    tokenImpact: 'variable',
    securityLevel: 'safe',
    tags: ['core', 'interactive', 'session'],
  },
  {
    id: 'claude-p',
    cmd: 'claude -p',
    syntax: 'claude -p "prompt"',
    description: 'One-shot prompt — send a single query and exit',
    analogy: 'Like curl for AI — make one request, get one response, return to shell',
    whyItExists: 'Script integration, CI/CD pipelines, and automated workflows where a persistent session is not needed',
    example: '$ claude -p "Explain the error: $(cat error.log | tail -20)"',
    tokenImpact: 'low',
    securityLevel: 'safe',
    tags: ['one-shot', 'scripting', 'ci-cd'],
  },
  {
    id: 'claude-model',
    cmd: 'claude --model',
    syntax: 'claude --model <model-id>',
    description: 'Start session with a specific Claude model',
    analogy: 'Like choosing which gear to use — Haiku for speed, Opus for power',
    whyItExists: 'Different tasks have different cost/capability tradeoffs — select the minimum model that meets quality requirements',
    example: '$ claude --model claude-haiku-4-5-20251001 -p "Classify this: urgent, normal, or low"',
    tokenImpact: 'variable',
    securityLevel: 'safe',
    tags: ['model', 'cost', 'optimization'],
  },
  {
    id: 'claude-verbose',
    cmd: 'claude --verbose',
    syntax: 'claude --verbose',
    description: 'Enable verbose output — shows reasoning, token usage, tool calls',
    analogy: 'Like turning on request logging in an API server',
    whyItExists: 'Debugging orchestration issues, understanding token consumption, tracing tool execution paths',
    example: '$ claude --verbose -p "Search for recent papers on transformers"',
    tokenImpact: 'none',
    securityLevel: 'safe',
    tags: ['debug', 'verbose', 'observability'],
  },
  {
    id: 'claude-output-json',
    cmd: 'claude --output-format',
    syntax: 'claude --output-format json -p "prompt"',
    description: 'Return structured JSON output instead of plain text',
    analogy: 'Like adding Accept: application/json to your API request',
    whyItExists: 'Programmatic consumption of AI output in scripts, parseable CI results, structured data extraction',
    example: '$ claude --output-format json -p "Extract: name, date, amount from this invoice: $(cat inv.txt)"',
    tokenImpact: 'low',
    securityLevel: 'safe',
    tags: ['json', 'structured', 'scripting'],
  },
  {
    id: 'claude-continue',
    cmd: 'claude --continue',
    syntax: 'claude --continue',
    description: 'Resume the most recent conversation session',
    analogy: 'Like re-opening a browser tab you closed — picks up where you left off',
    whyItExists: 'Preserves context across terminal restarts without manually re-loading conversation history',
    example: '$ claude --continue  # resumes your last debugging session',
    tokenImpact: 'medium',
    securityLevel: 'safe',
    tags: ['session', 'continuity', 'context'],
  },
];

export const SLASH_COMMANDS: CheatCommand[] = [
  {
    id: 'help',
    cmd: '/help',
    syntax: '/help',
    description: 'Show all available slash commands and their descriptions',
    analogy: 'The index of a manual — find what you need quickly',
    whyItExists: 'Discoverability of the full command set without leaving the session',
    example: '/help\n> Lists all /commands with descriptions',
    tokenImpact: 'none',
    securityLevel: 'safe',
    tags: ['help', 'reference'],
  },
  {
    id: 'clear',
    cmd: '/clear',
    syntax: '/clear',
    description: 'Clear conversation history — reset context window to zero',
    analogy: 'Erasing the whiteboard — start completely fresh',
    whyItExists: 'Remove accumulated context that is no longer relevant; free token budget; fix context corruption',
    example: '/clear\n> Context cleared. Token usage: 0/200,000',
    tokenImpact: 'none',
    securityLevel: 'safe',
    tags: ['context', 'reset', 'memory'],
  },
  {
    id: 'model',
    cmd: '/model',
    syntax: '/model [model-name]',
    description: 'View current model or switch to a different one mid-session',
    analogy: 'Swapping tools mid-project — switch from screwdriver to drill without stopping',
    whyItExists: 'Cost optimization: use Haiku for quick tasks, switch to Opus for complex reasoning within the same workflow',
    example: '/model claude-haiku-4-5-20251001\n> Switched to Claude Haiku 4.5',
    tokenImpact: 'none',
    securityLevel: 'safe',
    tags: ['model', 'cost', 'optimization'],
  },
  {
    id: 'context',
    cmd: '/context',
    syntax: '/context',
    description: 'Display current context window usage, token counts, and composition',
    analogy: 'Looking at how full your whiteboard is before adding more content',
    whyItExists: 'Proactive context management — know when you are approaching limits before behavior degrades',
    example: '/context\n> Used: 18,450 / 200,000 tokens (9.2%)\n> System: 450 | Conversation: 18,000',
    tokenImpact: 'none',
    securityLevel: 'safe',
    tags: ['context', 'tokens', 'diagnostics'],
  },
  {
    id: 'status',
    cmd: '/status',
    syntax: '/status',
    description: 'Show API connection, model, context, and tool availability',
    analogy: 'The health dashboard of your AI system',
    whyItExists: 'Quick system health check before starting a critical workflow',
    example: '/status\n> ✓ API Connected | Model: sonnet-4-6 | Context: 12% | Tools: 3',
    tokenImpact: 'none',
    securityLevel: 'safe',
    tags: ['diagnostics', 'health', 'status'],
  },
  {
    id: 'reset',
    cmd: '/reset',
    syntax: '/reset',
    description: 'Full session reset — clears context, memory, and tool state',
    analogy: 'Closing and reopening the application — complete fresh start',
    whyItExists: 'Recover from corrupted state, stuck agent loops, or context drift without restarting the terminal',
    example: '/reset\n> Session reset. All context and memory cleared.',
    tokenImpact: 'none',
    securityLevel: 'safe',
    tags: ['reset', 'session', 'recovery'],
  },
  {
    id: 'read',
    cmd: '/read',
    syntax: '/read <file>',
    description: 'Read a file into context — Claude can now see and reason about its contents',
    analogy: 'Handing Claude a document to read before asking questions about it',
    whyItExists: 'Load specific files for analysis without loading entire codebase — targeted context injection',
    example: '/read src/api/auth.ts\n> Added 450 tokens. Claude can now analyze auth.ts.',
    tokenImpact: 'medium',
    securityLevel: 'safe',
    tags: ['file', 'context', 'read'],
  },
  {
    id: 'run',
    cmd: '/run',
    syntax: '/run <command>',
    description: 'Execute a shell command — output returned to Claude for analysis',
    analogy: 'Giving Claude eyes on your terminal — it sees what the command produced',
    whyItExists: 'Close the feedback loop: Claude can execute tests, builds, or diagnostics and immediately reason about the output',
    example: '/run npm test\n> Tests: 3 failed. Claude: Let me analyze the failures...',
    tokenImpact: 'variable',
    securityLevel: 'danger',
    tags: ['shell', 'execute', 'dangerous'],
  },
  {
    id: 'add',
    cmd: '/add',
    syntax: '/add <path>',
    description: 'Add a file or directory to the project context for the session',
    analogy: 'Bookmarking documents you want Claude to always have access to',
    whyItExists: 'Persistent context injection — added files are available throughout the session without re-reading',
    example: '/add src/types/  # adds all type definitions to context',
    tokenImpact: 'medium',
    securityLevel: 'caution',
    tags: ['file', 'context', 'project'],
  },
  {
    id: 'init',
    cmd: '/init',
    syntax: '/init',
    description: 'Initialize Claude Code in the current project directory',
    analogy: 'Like git init — sets up the AI-native project configuration',
    whyItExists: 'Creates .claude/ directory with CLAUDE.md, project memory, and configuration for persistent AI-native development',
    example: '/init\n> Created .claude/ | Created CLAUDE.md | Ready for AI-native development',
    tokenImpact: 'low',
    securityLevel: 'safe',
    tags: ['project', 'init', 'setup'],
  },
];

export const ENV_VARS: CheatCommand[] = [
  {
    id: 'api-key',
    cmd: 'ANTHROPIC_API_KEY',
    syntax: 'export ANTHROPIC_API_KEY="sk-ant-..."',
    description: 'Authentication key for the Anthropic API — required for all Claude operations',
    analogy: 'Your passport for Claude API access — without it, nothing works',
    whyItExists: 'Authenticates every API call; enables per-key rate limits, spending caps, and audit trails',
    example: '# Never hardcode — use secret manager\nexport ANTHROPIC_API_KEY="$(aws secretsmanager get-secret-value ...)"',
    tokenImpact: 'none',
    securityLevel: 'danger',
    tags: ['security', 'auth', 'required'],
  },
  {
    id: 'claude-model-env',
    cmd: 'CLAUDE_MODEL',
    syntax: 'export CLAUDE_MODEL="claude-sonnet-4-6"',
    description: 'Sets the default model for all claude CLI invocations',
    analogy: 'Setting your default printer — every print job uses it unless specified otherwise',
    whyItExists: 'Consistent model selection across scripts and team members without per-command flags',
    example: 'export CLAUDE_MODEL="claude-haiku-4-5-20251001"  # cost-optimize CI/CD pipelines',
    tokenImpact: 'none',
    securityLevel: 'safe',
    tags: ['model', 'config', 'default'],
  },
  {
    id: 'claude-max-tokens',
    cmd: 'CLAUDE_MAX_TOKENS',
    syntax: 'export CLAUDE_MAX_TOKENS=4096',
    description: 'Cap output token count — prevents verbose responses from exceeding budget',
    analogy: 'Setting a word limit on an assignment — constrains output without affecting input',
    whyItExists: 'Cost control for automated pipelines; prevents runaway output from verbose models',
    example: 'export CLAUDE_MAX_TOKENS=500  # compact responses for extraction tasks',
    tokenImpact: 'none',
    securityLevel: 'safe',
    tags: ['tokens', 'cost', 'limits'],
  },
  {
    id: 'claude-verbose-env',
    cmd: 'CLAUDE_VERBOSE',
    syntax: 'export CLAUDE_VERBOSE=true',
    description: 'Enable verbose logging globally — shows token counts, tool calls, latency',
    analogy: 'Turning on debug mode for all Claude operations',
    whyItExists: 'Persistent debug mode without per-command flags — useful during development and incident response',
    example: 'export CLAUDE_VERBOSE=true  # show all token usage in CI logs',
    tokenImpact: 'none',
    securityLevel: 'safe',
    tags: ['debug', 'verbose', 'logging'],
  },
  {
    id: 'anthropic-base-url',
    cmd: 'ANTHROPIC_BASE_URL',
    syntax: 'export ANTHROPIC_BASE_URL="https://..."',
    description: 'Override the API base URL — for enterprise proxies, local testing, or custom endpoints',
    analogy: 'Routing your mail through a specific post office — all requests go via this endpoint',
    whyItExists: 'Enterprise API gateways, audit proxies, rate-limit management tiers, and local development',
    example: 'export ANTHROPIC_BASE_URL="https://ai-gateway.corp.internal"',
    tokenImpact: 'none',
    securityLevel: 'caution',
    tags: ['enterprise', 'proxy', 'gateway'],
  },
];

// ── Power Recipes ─────────────────────────────────────────────────────────────
export const powerRecipes: PowerRecipe[] = [
  {
    id: 'autonomous-coding',
    title: 'Autonomous Coding Workflow',
    description: 'Full AI-native development cycle from issue to PR',
    useCase: 'Shipping a feature while Claude handles implementation details',
    difficulty: 'advanced',
    tokenEstimate: '15,000–50,000 tokens per feature',
    steps: [
      { actor: 'Developer', emoji: '👤', action: 'Describe the feature', detail: 'claude -p "Implement JWT refresh token rotation per spec in AUTH-123"', tokenCost: '~200 tok' },
      { actor: 'Claude', emoji: '🤖', action: 'Reads context', detail: '/read src/auth/ — loads auth module into context (2,400 tokens)', tokenCost: '~2,400 tok' },
      { actor: 'Claude', emoji: '🤖', action: 'Plans implementation', detail: 'Proposes: update TokenService, add RefreshTokenRepository, add migration', tokenCost: '~800 tok' },
      { actor: 'Claude + FS MCP', emoji: '⚡', action: 'Writes code', detail: 'Creates/edits 4 files via filesystem MCP', tokenCost: '~8,000 tok' },
      { actor: 'Claude + Terminal', emoji: '💻', action: 'Runs tests', detail: '/run npm test -- --filter auth → analyzes failures → fixes', tokenCost: '~3,000 tok' },
      { actor: 'Claude + GitHub MCP', emoji: '🐙', action: 'Creates PR', detail: 'Generates PR description, commits, opens pull request', tokenCost: '~1,500 tok' },
    ],
    caveats: ['Review every file change before approving PR', 'Run security scan on generated auth code', 'Set max_tokens cap on test output injection'],
  },
  {
    id: 'research-pipeline',
    title: 'AI Research Pipeline',
    description: 'Search, summarize, and store research findings automatically',
    useCase: 'Competitive intelligence, literature review, market research',
    difficulty: 'intermediate',
    tokenEstimate: '5,000–20,000 tokens per research run',
    steps: [
      { actor: 'Developer', emoji: '👤', action: 'Define research query', detail: 'claude -p "Research: latest transformer efficiency papers (2024)"', tokenCost: '~50 tok' },
      { actor: 'Claude + Firecrawl', emoji: '🔍', action: 'Searches and scrapes', detail: 'Firecrawl MCP fetches arxiv, semantic scholar, papers with code', tokenCost: '~12,000 tok' },
      { actor: 'Claude', emoji: '🤖', action: 'Synthesizes findings', detail: 'Map-reduces: summarize each source → merge into coherent summary', tokenCost: '~3,000 tok' },
      { actor: 'Claude + Filesystem', emoji: '💾', action: 'Stores artifact', detail: 'Writes research/2024-05-transformers.md with citations', tokenCost: '~500 tok' },
    ],
    caveats: ['Verify all citations before using in published work', 'Set a token budget cap on Firecrawl results', 'Use Haiku for summarization, Opus for synthesis'],
  },
  {
    id: 'incident-analysis',
    title: 'Production Incident Analysis',
    description: 'AI-assisted root cause analysis from logs to action items',
    useCase: 'On-call incident response — cut MTTR with AI-assisted triage',
    difficulty: 'intermediate',
    tokenEstimate: '8,000–30,000 tokens per incident',
    steps: [
      { actor: 'On-call', emoji: '🚨', action: 'Trigger analysis', detail: 'claude -p "P1 incident: 500 errors spiking since 14:30 UTC. Analyze."', tokenCost: '~100 tok' },
      { actor: 'Claude + Logs MCP', emoji: '📋', action: 'Retrieves logs', detail: 'Fetches last 30min of error logs, metrics, traces (TRUNCATED to 5K tokens)', tokenCost: '~5,000 tok' },
      { actor: 'Claude', emoji: '🔍', action: 'Identifies pattern', detail: 'Correlates error spike with deployment 14:28 UTC — auth service regression', tokenCost: '~1,200 tok' },
      { actor: 'Claude', emoji: '📊', action: 'Generates report', detail: 'Timeline, root cause, affected users, recommended rollback steps', tokenCost: '~800 tok' },
      { actor: 'Claude + Slack MCP', emoji: '💬', action: 'Posts update', detail: 'Posts incident summary to #incidents with action items', tokenCost: '~200 tok' },
    ],
    caveats: ['Always truncate raw log injection to < 5K tokens', 'Human makes rollback decision — never automate', 'Review AI root cause before posting publicly'],
  },
  {
    id: 'enterprise-analytics',
    title: 'AI Analytics Dashboard',
    description: 'Natural language to SQL to visualization pipeline',
    useCase: 'Business intelligence without writing SQL manually',
    difficulty: 'advanced',
    tokenEstimate: '3,000–10,000 tokens per query',
    steps: [
      { actor: 'Analyst', emoji: '👤', action: 'Natural language query', detail: 'claude -p "Show me weekly revenue by product for Q1, highlight outliers"', tokenCost: '~50 tok' },
      { actor: 'Claude + Postgres MCP', emoji: '🗄️', action: 'Generates & runs SQL', detail: 'Writes parameterized query, executes against read-only analytics DB', tokenCost: '~800 tok' },
      { actor: 'Claude', emoji: '📊', action: 'Analyzes results', detail: 'Identifies outliers: Product-C down 23% in Week 8 (launch issue?)', tokenCost: '~400 tok' },
      { actor: 'Claude + Filesystem', emoji: '💾', action: 'Saves report', detail: 'Writes analytics/q1-revenue-analysis.md with findings and SQL', tokenCost: '~300 tok' },
    ],
    caveats: ['Use read-only DB credentials for analytics queries', 'Validate all generated SQL before production use', 'Beware of hallucinated column names — test against schema'],
  },
  {
    id: 'security-review',
    title: 'Automated Security Review',
    description: 'AI-assisted security scanning before code merge',
    useCase: 'Shift security left — catch vulnerabilities before human review',
    difficulty: 'intermediate',
    tokenEstimate: '10,000–25,000 tokens per PR',
    steps: [
      { actor: 'CI/CD', emoji: '⚙️', action: 'Trigger on PR', detail: 'claude -p "Security review: $(git diff main...HEAD)" --output-format json', tokenCost: '~500 tok' },
      { actor: 'Claude', emoji: '🔍', action: 'Reviews diff', detail: 'Checks: SQL injection, XSS, auth bypasses, secrets in code, dependency CVEs', tokenCost: '~8,000 tok' },
      { actor: 'Claude', emoji: '📋', action: 'Returns structured findings', detail: 'JSON: [{severity, file, line, description, remediation}]', tokenCost: '~1,200 tok' },
      { actor: 'CI/CD', emoji: '🚦', action: 'Gates merge', detail: 'Fails PR if any CRITICAL findings; posts findings as review comments', tokenCost: '~200 tok' },
    ],
    caveats: ['AI security review supplements — never replaces — human review', 'False positives are common — tune suppression rules', 'Never grant production deployment permission based solely on AI review'],
  },
];

// ── Common Mistakes ───────────────────────────────────────────────────────────
export const commonMistakes: CommonMistake[] = [
  {
    id: 'no-token-cap',
    title: 'No Output Token Cap in Scripts',
    bad: { code: 'claude -p "Analyze the entire codebase"', explanation: 'No max_tokens set — model generates as much output as it wants. A detailed codebase analysis can return 10,000+ tokens unexpectedly in a script.' },
    good: { code: 'claude --max-tokens 1000 -p "Summarize the key architecture decisions"', explanation: 'Explicit cap + specific task prevents runaway responses. Script gets a predictable, parseable output.' },
    impact: 'cost',
    severity: 'high',
  },
  {
    id: 'unbounded-read',
    title: 'Reading Entire Large Files into Context',
    bad: { code: '/read large_dataset.json\n# 50,000 line JSON → 180,000 tokens → context overflow', explanation: 'Loading a large file without checking its size consumes most of the context window, leaving no room for the task.' },
    good: { code: '# Check token count first\nclaude -p "Count tokens for: $(wc -c < large.json) bytes"\n# Use targeted extraction instead\nclaude -p "From large_dataset.json, extract records where status=error"', explanation: 'Never load entire large files. Extract only the relevant portion before injecting into context.' },
    impact: 'cost',
    severity: 'critical',
  },
  {
    id: 'plain-api-key',
    title: 'Hardcoding API Keys',
    bad: { code: 'export ANTHROPIC_API_KEY="sk-ant-abc123..."\n# or worse: inside a script committed to git', explanation: 'Hardcoded keys in scripts or environment files that get committed to version control expose your API credentials.' },
    good: { code: '# Use secret manager\nexport ANTHROPIC_API_KEY="$(vault read -field=key secret/anthropic)"\n# Or .env file with .gitignore\necho ".env" >> .gitignore', explanation: 'API keys must come from secret managers or .env files that are git-ignored. Rotate immediately if leaked.' },
    impact: 'security',
    severity: 'critical',
  },
  {
    id: 'unrestricted-run',
    title: 'Unrestricted /run Without Review',
    bad: { code: '# Asking Claude to clean up, then blindly approving:\n/run rm -rf $(find . -name "*.tmp")\n# Claude\'s pattern matching may be too broad', explanation: 'Executing AI-suggested shell commands without reviewing them first is dangerous. The pattern may match files you did not intend to delete.' },
    good: { code: '# Always dry-run first:\n/run find . -name "*.tmp" -print  # review list first\n# Then execute with explicit scope:\n/run find ./tmp -name "*.tmp" -delete', explanation: 'Always preview destructive operations before executing. Add explicit scope to prevent accidental broad deletion.' },
    impact: 'reliability',
    severity: 'critical',
  },
  {
    id: 'no-reset-between-tasks',
    title: 'Context Drift Between Unrelated Tasks',
    bad: { code: '# In one long session:\n> "Debug my auth module"\n> "Now help me design the payment API"\n# Earlier auth context pollutes payment design recommendations', explanation: 'Not clearing context between unrelated tasks causes the model to mix concerns — auth patterns bleeding into payment recommendations.' },
    good: { code: '# Clear between task switches:\n/clear\n> "Design the payment API"\n# Or start a fresh session:\n$ claude --model claude-sonnet-4-6', explanation: 'Clear context between unrelated tasks. Each task should start from a clean state unless the context is intentionally relevant.' },
    impact: 'quality',
    severity: 'medium',
  },
  {
    id: 'vague-file-ops',
    title: 'Vague File Operation Instructions',
    bad: { code: '> "Update my config file with the new database settings"', explanation: 'Which config file? Which settings? Which database? Claude may edit the wrong file or make assumptions about values.' },
    good: { code: '> "Update config/database.yml: change host to postgres-prod-01.corp.internal, port to 5433, and set pool_size to 20"', explanation: 'Specify exact files, fields, and values. Ambiguous file operation instructions are a leading cause of AI editing the wrong thing.' },
    impact: 'reliability',
    severity: 'high',
  },
  {
    id: 'no-project-init',
    title: 'Using Claude Without Project Initialization',
    bad: { code: '# Just starting claude in a project directory without /init\n$ claude\n> "Help me with the authentication module"\n# Claude has no project context, conventions, or architecture awareness', explanation: 'Without /init and CLAUDE.md, Claude knows nothing about your project conventions, architecture decisions, or constraints.' },
    good: { code: '# First time in a project:\n$ claude\n/init  # creates CLAUDE.md, .claude/ directory\n> "Document the key architectural decisions in CLAUDE.md"\n# Now Claude has project memory', explanation: 'Always run /init in new projects. Invest 15 minutes documenting your project in CLAUDE.md — it improves every subsequent interaction.' },
    impact: 'quality',
    severity: 'medium',
  },
  {
    id: 'retry-loops-in-scripts',
    title: 'Infinite Retry Loops in Automation Scripts',
    bad: { code: 'while true; do\n  result=$(claude -p "Fix this error: $error")\n  if [ $? -ne 0 ]; then\n    continue  # no backoff, no cap!\n  fi\ndone', explanation: 'Unlimited retry on API errors can generate hundreds of calls in seconds, exploding your API bill and triggering rate limits.' },
    good: { code: 'MAX_RETRIES=3\nfor i in $(seq 1 $MAX_RETRIES); do\n  result=$(claude -p "Fix: $error")\n  [ $? -eq 0 ] && break\n  sleep $((2**i))  # exponential backoff\ndone', explanation: 'Always cap retries (3–5 max) and add exponential backoff. Never use unbounded retry loops with API calls.' },
    impact: 'cost',
    severity: 'critical',
  },
];

// ── Terminal command registry (used by TerminalSimulator) ─────────────────────
export const TERMINAL_REGISTRY: Record<string, (args: string, tokensUsed: number) => { output: string; tokensAdded: number }> = {
  '': () => ({ output: '', tokensAdded: 0 }),
  'claude': (args) => {
    if (args.startsWith('-p ')) {
      const prompt = args.slice(3).replace(/^["']|["']$/g, '');
      const responses: Record<string, string> = {
        'token': 'Tokens are the smallest units Claude processes — roughly 4 characters per token in English. "Hello, world!" is 5 tokens.',
        'mcp': 'MCP (Model Context Protocol) connects Claude to external tools via a standardized interface. Tools run as local processes or remote services.',
        'context': 'Context window is the total tokens Claude can hold in memory — 200K for Claude 3.5+. Think of it as working memory.',
        'help': 'I\'m Claude Code — an AI engineering assistant. I can read/write files, run commands, and orchestrate multi-step workflows.',
      };
      const key = Object.keys(responses).find(k => prompt.toLowerCase().includes(k)) ?? '';
      const response = key ? responses[key] : `I can help with: "${prompt}". (Simulated response — real Claude would give a detailed answer here.)`;
      return { output: `Claude ›\n${response}`, tokensAdded: Math.ceil(prompt.length / 4) + Math.ceil(response.length / 4) };
    }
    if (args === '--version') return { output: 'Claude Code 1.0.0\nClaude Models: Haiku 4.5, Sonnet 4.6, Opus 4.7', tokensAdded: 0 };
    if (args === '--help') return { output: 'Usage: claude [options] [prompt]\n\nOptions:\n  -p "prompt"  One-shot prompt\n  --model      Specify model\n  --verbose    Show token usage\n  --continue   Resume last session\n  --help       Show this help\n\nSlash commands (in session):\n  /help /clear /model /context /status /reset /read /run /add /init', tokensAdded: 0 };
    return { output: 'Claude Code — Interactive AI Engineering Session\nType /help for commands, or just start chatting.\n> ', tokensAdded: 50 };
  },
  '/help': () => ({ output: 'Available commands:\n  /help          — This menu\n  /clear         — Clear context window\n  /model [name]  — View/switch model\n  /context       — Show token usage\n  /status        — System health\n  /reset         — Full session reset\n  /read <file>   — Load file to context\n  /run <cmd>     — Execute shell command\n  /add <path>    — Add to project context\n  /init          — Initialize project\n  /tree          — Show file structure', tokensAdded: 0 }),
  '/clear': () => ({ output: '✓ Context cleared. Token usage reset to 0/200,000.', tokensAdded: -9999 }),
  '/reset': () => ({ output: '✓ Session fully reset. Memory, context, and tool state cleared.', tokensAdded: -9999 }),
  '/model': (args) => {
    if (!args) return { output: 'Current model: claude-sonnet-4-6\nAvailable:\n  claude-haiku-4-5-20251001   $0.80/$4.00 per 1M tok\n  claude-sonnet-4-6           $3.00/$15.00 per 1M tok\n  claude-opus-4-7             $15.00/$75.00 per 1M tok\nUsage: /model <name>', tokensAdded: 0 };
    return { output: `✓ Switched to: ${args}`, tokensAdded: 0 };
  },
  '/status': (_, t) => ({ output: `Claude Code Status\n  API:     ✓ Connected\n  Model:   claude-sonnet-4-6\n  Context: ${t.toLocaleString()} / 200,000 tokens (${((t/200000)*100).toFixed(1)}%)\n  Tools:   filesystem, terminal, web-search\n  Session: active`, tokensAdded: 0 }),
  '/context': (_, t) => ({ output: `Context Window\n  Used:      ${t.toLocaleString()} tokens\n  Available: ${(200000-t).toLocaleString()} tokens\n  Capacity:  ${((t/200000)*100).toFixed(1)}%\n  ─────────────────────────\n  System prompt:    450 tok\n  Conversation:     ${Math.max(0, t-450).toLocaleString()} tok\n  Tool results:     0 tok`, tokensAdded: 0 }),
  '/tree': () => ({ output: 'Project structure:\n.\n├── src/\n│   ├── api/\n│   │   ├── auth.ts          (2,400 tok)\n│   │   └── users.ts         (1,800 tok)\n│   ├── services/\n│   │   └── database.ts      (3,200 tok)\n│   └── index.ts             (400 tok)\n├── tests/\n│   └── auth.test.ts         (1,600 tok)\n├── CLAUDE.md                (650 tok)\n└── package.json             (180 tok)', tokensAdded: 0 }),
  '/init': () => ({ output: '✓ Initializing Claude Code project...\n✓ Created .claude/ directory\n✓ Created CLAUDE.md template\n✓ Scanning project structure...\n✓ Ready. Run /tree to see your project.', tokensAdded: 150 }),
  '/run': (args) => {
    const fakeOutputs: Record<string, string> = {
      'ls': 'src/  tests/  docs/  package.json  README.md  CLAUDE.md',
      'ls -la': 'drwxr-xr-x  src\ndrwxr-xr-x  tests\n-rw-r--r--  package.json\n-rw-r--r--  CLAUDE.md',
      'pwd': '/Users/dev/project',
      'npm test': '✓ auth.test.ts (3 tests) — PASSED\n✗ api.test.ts (1 test) — FAILED: Expected 200, got 401\nClaude › The 401 suggests the JWT validation middleware is rejecting the test token. Check that test tokens use the correct signing key.',
      'npm run build': '✓ TypeScript compiled\n✓ Bundle: 245 KB\n✓ Build complete in 3.2s',
      'git status': 'On branch feature/jwt-refresh\nModified: src/api/auth.ts\nNew file: src/services/tokenRefresh.ts',
      'git log --oneline -5': 'a1b2c3d feat: add JWT refresh rotation\n4e5f6a7 fix: auth middleware race condition\n7b8c9d0 refactor: extract token validation',
    };
    const key = Object.keys(fakeOutputs).find(k => args.trim() === k);
    const out = key ? fakeOutputs[key] : `$ ${args}\n(Simulated: command executed. In real Claude Code, actual output would appear here.)`;
    return { output: `$ ${args}\n${out}`, tokensAdded: Math.ceil(out.length / 4) };
  },
  '/read': (args) => ({ output: `✓ Reading ${args || 'src/api/auth.ts'}...\n✓ Added ~2,400 tokens to context.\nClaude now has full visibility into ${args || 'auth.ts'} for analysis.`, tokensAdded: 2400 }),
  '/add': (args) => ({ output: `✓ Added ${args || 'src/'} to project context.\nAll files in this path are now accessible to Claude throughout the session.`, tokensAdded: 1200 }),
};

// ── Sections ──────────────────────────────────────────────────────────────────
export const cheatSections: CheatSection[] = [
  {
    id: 'claude-cli-basics',
    group: 'foundation',
    emoji: '⌨️',
    title: 'Claude CLI Basics',
    tagline: 'The claude command — your entry point to AI-native development',
    commands: CLI_COMMANDS,
    interactiveType: 'command-browser',
    modeContent: {
      beginner: {
        overview: 'The claude command is how you interact with Claude from your terminal. You can have a persistent conversation (interactive mode) or ask one question and return to your shell (one-shot mode).',
        keyPoints: [
          'Type just `claude` to start an ongoing AI engineering session — like opening a chat',
          'Add `-p "your question"` to ask one thing and immediately return to your normal terminal',
          'Everything you type in a session is remembered until you run /clear',
        ],
      },
      developer: {
        overview: 'Claude CLI wraps the Messages API with session state management, tool integration, and slash commands. The one-shot mode (`-p`) is your primary interface for scripting; interactive mode is for exploratory engineering workflows.',
        keyPoints: [
          'One-shot: `claude -p "..."` — composable with shell pipes, xargs, and CI/CD scripts',
          '`--output-format json` enables programmatic parsing of AI responses in automation',
          '`--continue` resumes the last session — useful after terminal restarts during long tasks',
        ],
        tip: 'Combine with shell substitution: `claude -p "Explain: $(cat error.log | tail -5)"` for instant error analysis',
      },
      engineer: {
        overview: 'Claude CLI manages session state locally and assembles context from: CLAUDE.md (project memory), .claude/ directory (configuration), conversation history, and injected files. Understanding this assembly determines what Claude "knows" at any point.',
        keyPoints: [
          'Session state includes: current model, context window state, tool configurations, and conversation history',
          'Environment variables override defaults: CLAUDE_MODEL, ANTHROPIC_API_KEY, CLAUDE_MAX_TOKENS',
          'Verbose mode (`--verbose`) exposes token usage, API latency, and tool execution traces for optimization',
        ],
      },
      enterprise: {
        overview: 'Enterprise CLI usage requires governance: API key management, per-team usage limits, audit logging of AI interactions, and output validation before any automated action.',
        keyPoints: [
          'Never hardcode ANTHROPIC_API_KEY — use vault/secrets manager with per-team rotation',
          'Audit all automated claude CLI invocations — log inputs, outputs, and model used',
          'Set CLAUDE_MAX_TOKENS in CI/CD environments to prevent unexpected cost spikes from verbose outputs',
        ],
      },
      architect: {
        overview: 'The Claude CLI implements the same context assembly pipeline as the API: system context (CLAUDE.md + .claude/) → session history → file injections → current prompt. Architecturally, it is a stateful wrapper over the stateless Messages API.',
        keyPoints: [
          'Session persistence is local file-based — understand backup/restore implications for long-running workflows',
          'The CLI is a thin client: all intelligence is in the model; CLI only handles context management and I/O',
          'Design principle: treat every CLI invocation as a potential context boundary — explicit context management is better than implicit accumulation',
        ],
      },
    },
  },
  {
    id: 'code-commands',
    group: 'foundation',
    emoji: '/',
    title: 'Claude Code Commands',
    tagline: 'Slash commands — the control panel for your AI session',
    commands: SLASH_COMMANDS,
    interactiveType: 'command-browser',
    modeContent: {
      beginner: {
        overview: 'Slash commands are typed inside a Claude session to control its behavior — think of them as keyboard shortcuts for common tasks. They start with "/" and do not consume your question budget.',
        keyPoints: [
          'Commands starting with / are instructions to Claude Code, not questions to Claude',
          '/help shows all available commands — start there if you are unsure',
          'Most / commands (like /context, /status) cost zero tokens',
        ],
      },
      developer: {
        overview: 'Slash commands provide session control: context management (/clear, /context), model switching (/model), file operations (/read, /add), and shell execution (/run). Mastering them is key to efficient multi-step workflows.',
        keyPoints: [
          '/context after every major file load — track token budget proactively not reactively',
          '/model lets you switch to Haiku for cheap sub-tasks and back to Opus for complex reasoning',
          '/run results are injected into context — always truncate large outputs before running diagnostics',
        ],
      },
      engineer: {
        overview: 'Slash commands map to Claude Code API actions: file reads inject tokens, shell runs return output to context, model switches affect downstream cost. Model every command in your workflow for its context and cost impact.',
        keyPoints: [
          '/read injects the entire file — use only targeted excerpts for large files',
          '/run output is injected raw — pipe through head/grep before running in sessions',
          'Command sequencing matters: /model before /read ensures cost-optimal file loading',
        ],
      },
      enterprise: {
        overview: 'Slash command governance requires: audit logging of every /run execution, file access controls for /read and /add, and model usage policies enforced via CLAUDE_MODEL.',
        keyPoints: [
          '/run is the highest-risk command — it executes arbitrary shell commands with Claude\'s permissions',
          'Restrict /run in production environments — use allowlists of permitted commands',
          'Log every /read and /add for audit trails in regulated environments',
        ],
      },
      architect: {
        overview: 'Slash commands represent a command-pattern architecture over the session state machine. Each command is a state transition: /clear → empty context, /model → model pointer update, /read → context append.',
        keyPoints: [
          'Commands are synchronous state mutations — design workflows to account for state after each command',
          '/reset is the only command that returns to a known initial state — use it as the safe fallback in automation',
          'Context composition order: system (CLAUDE.md) → /add files → /read files → conversation → current prompt',
        ],
      },
    },
  },
  {
    id: 'context-memory',
    group: 'foundation',
    emoji: '🧠',
    title: 'Context & Memory',
    tagline: 'Managing what Claude knows and when to forget it',
    modeContent: {
      beginner: {
        overview: 'Claude\'s memory in a session is temporary — when you /clear it, it is gone. For work that spans multiple sessions, use CLAUDE.md (project memory) or /save to store conversation state.',
        keyPoints: [
          'CLAUDE.md is your project\'s permanent memory — Claude reads it at the start of every session',
          '/clear removes all conversation history but not CLAUDE.md',
          'Use /context to check how much memory you have left before loading more files',
        ],
      },
      developer: {
        overview: 'Context hierarchy: CLAUDE.md (persistent project memory) → .claude/ configuration → /add\'ed files → conversation history → current prompt. Each layer has different persistence and token cost characteristics.',
        keyPoints: [
          'Update CLAUDE.md as your project evolves — it is the most cost-effective way to give Claude project knowledge',
          'Session state is stored in ~/.claude/sessions/ — /continue loads the most recent',
          'Scoped context: prefer /add src/api/ over /read individual files — session-wide availability at one-time token cost',
        ],
        tip: 'Pro tip: end every significant Claude session with "Update CLAUDE.md with what you learned today about this project"',
      },
      engineer: {
        overview: 'Memory management is the primary determinant of Claude Code workflow quality. Stale context from a previous task degrades current task performance; insufficient context causes hallucinated file paths and wrong API assumptions.',
        keyPoints: [
          'Context composition budget: CLAUDE.md (< 2K tok) + core files (< 20K tok) + conversation (< 50K tok) = leaves 128K for generation',
          'Freshness management: /clear between unrelated tasks prevents context pollution from previous work',
          'Cache warm-up: structure CLAUDE.md to match prompt caching requirements (> 1,024 tokens, stable content at top)',
        ],
      },
      enterprise: {
        overview: 'Enterprise context management must address: PII in conversation history, compliance requirements for conversation retention, and project memory governance across team members.',
        keyPoints: [
          'Define team CLAUDE.md templates that include compliance constraints and approved tool patterns',
          'Conversation history may contain sensitive data — understand local storage location and apply data governance',
          'Establish context hygiene standards: maximum session length, required /clear intervals, and CLAUDE.md review cadence',
        ],
      },
      architect: {
        overview: 'The context architecture is hierarchical: immutable (CLAUDE.md, .claude/), session-scoped (/add, /read), and ephemeral (conversation). Design projects with this hierarchy in mind — stable architectural knowledge in CLAUDE.md, session-specific context injected per task.',
        keyPoints: [
          'Memory is a first-class design concern: every architectural decision about project structure should include "how will Claude access this?"',
          'Context layering principle: put the most frequently needed, most stable information lowest in the stack (CLAUDE.md) for best cache utilization',
          'Semantic compression: CLAUDE.md should contain distilled architectural understanding, not raw documentation',
        ],
      },
    },
  },
  {
    id: 'file-operations',
    group: 'tools',
    emoji: '📁',
    title: 'File Operations',
    tagline: 'AI-assisted filesystem orchestration — with great power comes great responsibility',
    modeContent: {
      beginner: {
        overview: 'Claude can read, write, and edit files directly. Before it modifies anything, it shows you what it plans to do. Always review proposed changes — especially for files you have not seen recently.',
        keyPoints: [
          'Claude shows diffs before writing — always read them before confirming',
          'Never ask Claude to "delete any unnecessary files" — the scope is ambiguous and dangerous',
          'For important files, use version control (git) so you can undo AI changes',
        ],
      },
      developer: {
        overview: 'File operations go through the filesystem MCP server. Read operations inject file contents into context; write/edit operations propose diffs for your approval. The token cost of reading a file is proportional to its size.',
        keyPoints: [
          'Targeted reads: prefer "read lines 40–80 of auth.ts" over loading entire large files',
          'Diff review: Claude presents edits as diffs — verify scope and correctness before approving',
          'Never use patterns like "edit all files matching *.config" — specify exact files',
        ],
        tip: 'Use /tree first to orient Claude to your project structure before asking for file operations',
      },
      engineer: {
        overview: 'File operation security model: Claude can read/write within the project directory by default. Absolute paths outside the project, system files, and sensitive directories require explicit permission grants.',
        keyPoints: [
          'Scope constraints: configure .claude/config.json to restrict allowed paths',
          'Token economics: reading a 1,000-line file costs ~3,000 tokens — always justify large file reads',
          'Atomic operations: for critical changes, use Claude to generate a changeset and apply it in a transaction',
        ],
      },
      enterprise: {
        overview: 'Enterprise file operations require: access controls on which files AI can read, approval workflows for file writes in production configurations, and audit logs of every file modification made through Claude.',
        keyPoints: [
          'Never allow Claude to write to production configuration files without human approval',
          'Sensitive file patterns (.env, credentials.json, private keys) should be in the restricted path list',
          'Git commit every AI-made file change immediately — enables instant rollback and change attribution',
        ],
      },
      architect: {
        overview: 'File operations are the primary mechanism for AI systems to take actions with lasting external effects. The architecture should treat every file write as a potentially irreversible state change requiring explicit human confirmation.',
        keyPoints: [
          'Principle of least privilege: Claude should have read access widely, write access narrowly',
          'Reversibility design: all AI file operations should be reversible — git, backups, or staging environments',
          'Audit surface: file operations are the most auditable AI action type — leverage this for compliance',
        ],
      },
    },
  },
  {
    id: 'mcp-tools',
    group: 'tools',
    emoji: '🔌',
    title: 'MCP & Tool Commands',
    tagline: 'How Claude discovers and executes external tools via MCP',
    interactiveType: 'mcp-flow',
    modeContent: {
      beginner: {
        overview: 'MCP (Model Context Protocol) gives Claude access to external tools: file systems, databases, web browsers, APIs. Each tool is a capability — and each capability is also a potential risk.',
        keyPoints: [
          'Tools appear to Claude as functions it can call during a task',
          'Claude tells you when it is about to use a tool — you can approve or deny',
          'More tools available = more capable Claude, but also larger blast radius for mistakes',
        ],
      },
      developer: {
        overview: 'MCP tools are discovered at session start from .claude/config.json. Each tool server exposes a capability list via the MCP protocol. Claude calls tools by emitting tool_use blocks; you return tool_result blocks.',
        keyPoints: [
          'List available tools: /tool — shows name, description, and permission level',
          'Tool results inject into context — large API responses should be truncated before returning',
          'MCP server failures cause tool calls to error — implement fallback handling in agent workflows',
        ],
        tip: 'Use only the minimum required tools per task — disable unused MCP servers to reduce injection attack surface',
      },
      engineer: {
        overview: 'MCP tool lifecycle: discovery (server announces capabilities) → selection (Claude chooses a tool for a task) → execution (call sent to tool server) → injection (result returned to context). Each stage is a potential failure point.',
        keyPoints: [
          'Tool result size is unbounded by default — add max_response_size to your MCP server configuration',
          'Trust boundary: MCP server results are untrusted third-party input — sanitize before returning to Claude',
          'Health monitoring: MCP server availability should be in your agent system\'s health checks',
        ],
      },
      enterprise: {
        overview: 'Enterprise MCP governance: which tools can access which systems, who approves tool additions, how are tool actions logged, and what is the response plan for a compromised tool server.',
        keyPoints: [
          'Treat MCP server additions as infrastructure changes — require security review before adding new tools',
          'Tool audit log: every tool call with input, output, and caller identity for compliance',
          'Principle of least privilege: tool servers should run with minimum required system permissions',
        ],
      },
      architect: {
        overview: 'MCP is an interface contract between the model (reasoning layer) and external systems (action layer). The architectural decision is: what actions should the model be able to take, and what human oversight is required for each category of action.',
        keyPoints: [
          'Tool capability design: tool interfaces should be expressive enough for valid tasks but constrained enough to prevent unintended use',
          'Composition safety: individual tools may be safe, but composing them can create unsafe capabilities — analyze tool chains, not just individual tools',
          'The trust model: tool results are fundamentally untrusted — the architecture must never allow tool results to override operator instructions',
        ],
      },
    },
  },
  {
    id: 'project-operations',
    group: 'tools',
    emoji: '🏗️',
    title: 'Project Operations',
    tagline: '/init, /config, CLAUDE.md — setting up AI-native project memory',
    modeContent: {
      beginner: {
        overview: 'Running /init in your project creates the files that give Claude persistent memory about your project. CLAUDE.md is the most important — it tells Claude what your project does, how it is structured, and what conventions to follow.',
        keyPoints: [
          'Run /init once when you start using Claude Code in a project',
          'Edit CLAUDE.md to describe your project, tech stack, and coding conventions',
          'Claude reads CLAUDE.md at the start of every session — it is your AI briefing document',
        ],
      },
      developer: {
        overview: 'Project operations establish the persistent context layer: CLAUDE.md (project documentation for Claude), .claude/settings.json (tool and model configuration), and .claude/memory/ (session-persistent notes).',
        keyPoints: [
          'CLAUDE.md should include: build commands, architecture overview, key file locations, testing approach, and team conventions',
          '.claude/settings.json controls: allowed MCP tools, default model, token limits, and approval requirements for destructive operations',
          'Keep CLAUDE.md under 2,000 tokens — it is loaded on every call and should be dense with useful information',
        ],
        tip: 'Commit CLAUDE.md to git — it is shared project infrastructure, not personal configuration',
      },
      engineer: {
        overview: 'Project configuration determines the context budget available for each session. A well-structured .claude/ setup enables prompt caching (reducing cost for repeated system prompt injection) and ensures Claude always has the minimum necessary context.',
        keyPoints: [
          'Prompt caching: stable CLAUDE.md content amortizes token cost across all team member sessions',
          'Tool scope: configure allowed tools per project type — web apps need browser MCP, backend services need DB MCP',
          'Memory hierarchy: CLAUDE.md (permanent) > .claude/memory/ (session-persistent) > conversation (ephemeral)',
        ],
      },
      enterprise: {
        overview: 'Enterprise project operations require CLAUDE.md templates that include compliance requirements, approved patterns, and governance policies. This ensures every AI interaction in the project operates within defined constraints.',
        keyPoints: [
          'Standardize CLAUDE.md template across teams — include mandatory sections: security policies, data handling, approved dependencies',
          'Version-control .claude/settings.json as part of the repository — AI configuration is infrastructure',
          'Project onboarding: new team members should review CLAUDE.md before using Claude Code in the project',
        ],
      },
      architect: {
        overview: 'Project operations implement the "context as infrastructure" principle: project memory, configuration, and conventions are infrastructure concerns that should be designed, tested, and maintained like any other system component.',
        keyPoints: [
          'CLAUDE.md is the contract between the project team and the AI — treat it with the same rigor as an API contract',
          'Configuration as code: .claude/settings.json should be reviewable, testable (does Claude behave correctly with this config?), and versioned',
          'Project isolation: each project\'s .claude/ configuration creates an isolated AI context boundary — design for this explicitly',
        ],
      },
    },
  },
  {
    id: 'terminal-shell',
    group: 'automation',
    emoji: '💻',
    title: 'Terminal & Shell Workflows',
    tagline: 'AI-native DevOps — closing the loop between code and execution',
    modeContent: {
      beginner: {
        overview: '/run gives Claude the ability to execute shell commands and see their output. This closes the loop between "Claude writes code" and "Claude sees if it works." Use it carefully — shell commands have real effects.',
        keyPoints: [
          'Always review the command Claude is about to run before it executes',
          'Use /run for read-only commands (ls, git log, cat) before granting write access',
          'Test outputs returned by /run add to your token count — use head, tail, grep to limit output size',
        ],
      },
      developer: {
        overview: 'Shell integration enables autonomous test-fix cycles: Claude writes code, runs tests, sees failures, fixes issues — all in one workflow. The key constraint is token budget for test output.',
        keyPoints: [
          'Pipe long outputs: `/run npm test 2>&1 | tail -50` — prevents 10K-token test output injection',
          'Iterative debugging: allow Claude to run, observe, fix, repeat — but set a max-iterations budget',
          'Shell secrets: never run commands that echo API keys or passwords — these inject into context',
        ],
        tip: 'Create shell aliases for common Claude workflows: `alias ctest="claude -p \"Run tests and fix any failures\""` ',
      },
      engineer: {
        overview: 'Shell workflow engineering requires explicit output size management. Unbound /run output is the fastest way to fill your context window. Always pipe through size-limiting commands before returning to Claude.',
        keyPoints: [
          'Output budget: allocate max 5K tokens for any single /run result — pipe accordingly',
          'Structured output: prefer JSON/CSV tool output over human-readable output for programmatic analysis',
          'Exit codes matter: pass exit codes back to Claude for conditional workflow logic',
        ],
      },
      enterprise: {
        overview: 'Enterprise shell execution requires command allowlists, execution sandboxing, and audit trails. The combination of LLM reasoning and unrestricted shell access is the highest-risk configuration in enterprise AI.',
        keyPoints: [
          'Allowlist-only execution: define permitted commands per project; reject all others',
          'Audit every /run: log command, output, user, timestamp, and context snapshot',
          'Sandbox execution: run /run commands in a container with minimal system access',
        ],
        tip: 'Treat /run access with the same governance as sudo access — require explicit justification for each new allowlisted command',
      },
      architect: {
        overview: 'Shell integration creates a closed-loop system between AI reasoning and system state. This is the most powerful architectural pattern in Claude Code — and the most dangerous. The feedback loop is: observe state → reason → act → observe changed state → reason again.',
        keyPoints: [
          'Feedback loop design: every /run creates a new observation that potentially changes Claude\'s next action — model this as a state machine',
          'Bounded execution: the loop must have provable termination — either by step count, success condition, or timeout',
          'Side-effect isolation: design workflows so /run side effects are reversible (use containers, test environments) before promoting to production',
        ],
      },
    },
  },
  {
    id: 'env-variables',
    group: 'automation',
    emoji: '🔧',
    title: 'Environment Variables',
    tagline: 'Configuration, authentication, and operational control via environment',
    commands: ENV_VARS,
    interactiveType: 'command-browser',
    modeContent: {
      beginner: {
        overview: 'Environment variables configure how Claude CLI behaves without changing every command. The most important is ANTHROPIC_API_KEY — the password that authenticates your Claude access.',
        keyPoints: [
          'ANTHROPIC_API_KEY is your API credential — treat it like a password, never share or commit to code',
          'CLAUDE_MODEL sets which Claude version to use by default across all your commands',
          'Store environment variables in a .env file and add it to .gitignore to prevent accidental exposure',
        ],
      },
      developer: {
        overview: 'Environment variables are the primary configuration interface for scripted and automated Claude workflows. They set defaults that command-line flags can override, enabling environment-specific behavior (dev vs staging vs prod).',
        keyPoints: [
          'Per-environment config: different .env files for dev (Sonnet), staging (Sonnet), production (varies by cost policy)',
          'CLAUDE_MAX_TOKENS in CI/CD prevents unexpected output volumes from automated pipelines',
          'ANTHROPIC_BASE_URL enables routing through enterprise API gateways for auditing and rate management',
        ],
        tip: 'Use direnv to auto-load project-specific environment variables when entering a project directory',
      },
      engineer: {
        overview: 'Environment variable management at scale requires: secrets rotation, per-environment values, and audit trails for configuration changes. Treat AI configuration changes with the same rigor as infrastructure changes.',
        keyPoints: [
          'Secrets management: ANTHROPIC_API_KEY should come from vault/secrets manager, not .env files in shared environments',
          'Model pinning: pin CLAUDE_MODEL per environment to prevent unexpected behavior from model auto-updates',
          'Monitoring: alert when ANTHROPIC_API_KEY changes — unexpected rotations may indicate compromise',
        ],
      },
      enterprise: {
        overview: 'Enterprise environment variable governance: per-team API keys with spending limits, centralized secrets management, change auditing, and emergency key rotation procedures.',
        keyPoints: [
          'Per-team API keys: enables per-team cost attribution, rate limiting, and independent key rotation',
          'Key rotation policy: rotate ANTHROPIC_API_KEY quarterly or immediately on suspected compromise',
          'Configuration audit: track changes to CLAUDE_MODEL and ANTHROPIC_BASE_URL as they affect compliance scope',
        ],
      },
      architect: {
        overview: 'Environment variables implement the twelve-factor app\'s config principle applied to AI systems. Configuration that changes between deployments (API keys, model versions, token limits) belongs in the environment, not the code.',
        keyPoints: [
          'Config hierarchy: environment variables (highest priority) → config files → defaults (lowest priority)',
          'The immutable deployment principle: the same code artifact should run in dev, staging, and prod with only env vars changing',
          'Secrets are not config: ANTHROPIC_API_KEY is a secret (dynamic, high-security) vs CLAUDE_MODEL (config — static, low-security) — different management requirements',
        ],
      },
    },
  },
  {
    id: 'automation-workflows',
    group: 'automation',
    emoji: '⚙️',
    title: 'Automation Workflows',
    tagline: 'CI/CD integration, shell scripting, and scheduled AI pipelines',
    modeContent: {
      beginner: {
        overview: 'Automation means running Claude without you being present — in scheduled jobs, CI/CD pipelines, or triggered workflows. Claude answers questions, generates code, or analyzes data automatically.',
        keyPoints: [
          'Automated Claude workflows must have clear stopping conditions — they cannot ask you for clarification',
          'Always test automated workflows in a safe environment before running on real data',
          'Set spending limits on API keys used in automation — one runaway job should not drain your budget',
        ],
      },
      developer: {
        overview: 'Claude CLI integrates naturally into shell scripts and CI/CD pipelines via `claude -p "..."`. The key pattern: structured input (file contents, JSON) → Claude analysis → structured output (--output-format json) → downstream processing.',
        keyPoints: [
          'CI/CD example: `claude --output-format json -p "Security review: $(git diff HEAD~1)" | jq ".findings[] | select(.severity == \"critical\")"` ',
          'Error handling: check claude exit code (0 = success, non-zero = error) in scripts before processing output',
          'Timeout management: add `timeout 120 claude -p "..."` to prevent runaway calls in scripts',
        ],
        tip: 'Use structured output (`--output-format json`) for any automated pipeline — it prevents output format variance from breaking downstream parsing',
      },
      engineer: {
        overview: 'Production automation engineering: exponential backoff for retries, dead-letter queues for failures, structured logging, cost monitoring, and circuit breakers at the pipeline level.',
        keyPoints: [
          'Retry pattern: `for i in 1 2 3; do claude ... && break; sleep $((2**i)); done` — cap, backoff, exit on success',
          'Output validation: validate structured output schema before passing to downstream steps',
          'Cost alerting: wire claude token usage into your ops cost monitoring — unexpected spikes indicate bugs',
        ],
      },
      enterprise: {
        overview: 'Enterprise automation governance: change management for automated workflows, approval process for new automation that touches production systems, and SLA requirements for AI-driven automated processes.',
        keyPoints: [
          'Automated workflows touching production data require security review and change management approval',
          'Audit requirements: log every automated Claude invocation with inputs, outputs, and caller identity',
          'Incident classification: automated Claude failures are incidents — define severity levels and response procedures',
        ],
      },
      architect: {
        overview: 'Automation architecture for AI: separate the prompt composition layer (deterministic) from the inference layer (probabilistic) from the action layer (consequential). Each layer has different reliability requirements and testability characteristics.',
        keyPoints: [
          'Determinism principle: make everything around the AI call deterministic (inputs, parsing, actions); accept that the AI call itself is probabilistic',
          'Testability: automated AI workflows must be testable with mock AI responses — do not mix inference and business logic',
          'Idempotency: design automated workflows so that running them twice has the same effect as running once — this enables safe retry',
        ],
      },
    },
  },
  {
    id: 'debugging-diagnostics',
    group: 'mastery',
    emoji: '🔬',
    title: 'Debugging & Diagnostics',
    tagline: '/status, /context, --verbose — DevTools for your AI session',
    modeContent: {
      beginner: {
        overview: 'When Claude gives strange or wrong answers, debugging means checking: what context does it have? Is the context window full? Is the model configured correctly? These commands answer those questions.',
        keyPoints: [
          '/status shows everything at a glance: connection, model, context usage, available tools',
          '/context shows exactly how many tokens are used and available — check this when answers seem off',
          '--verbose mode shows every token used and every tool call — use it to understand unexpected behavior',
        ],
      },
      developer: {
        overview: 'Claude Code debugging toolkit: --verbose (token traces), /context (budget inspection), /status (health check), and /run diagnostics (shell-level inspection). Most behavioral issues trace to context problems — check there first.',
        keyPoints: [
          'Debugging checklist: 1) Check /context (is window full?), 2) Check /status (is model right?), 3) Use --verbose (what tokens are being sent?)',
          'Behavioral regression: if answers got worse, check if CLAUDE.md changed, /add files changed, or context is being polluted',
          'Token debugging: --verbose exposes the exact assembled context — compare expected vs actual token composition',
        ],
        tip: 'Add a `claude-debug` alias: `alias claude-debug="claude --verbose"` for quick diagnostic sessions',
      },
      engineer: {
        overview: 'AI debugging requires observability at multiple levels: token level (what is in context), behavioral level (what actions is the model taking), and outcome level (what is the quality of output). Each level has different diagnostic tools.',
        keyPoints: [
          'Token-level debug: --verbose shows assembled context before sending — verify expected content is present',
          'Behavioral debug: /run echo "Explain your reasoning for the last action" — introspection prompt',
          'Outcome debug: test known-good prompts after configuration changes — regression testing for AI behavior',
        ],
      },
      enterprise: {
        overview: 'Enterprise debugging requires structured logging that captures: session state, context composition, token usage, tool calls, and output quality metrics. Ad-hoc debugging is insufficient for production AI systems.',
        keyPoints: [
          'Structured debug logs enable pattern analysis across many sessions — identify systematic failure modes',
          'Quality monitoring: log output quality scores (user ratings, downstream failures) alongside debug info',
          'Debugging SLA: define maximum time to diagnose and resolve common failure patterns — use runbooks',
        ],
      },
      architect: {
        overview: 'AI system debugging is a distributed systems problem: failures emerge from the interaction between model behavior, context state, tool responses, and external systems. Effective debugging requires tracing the full execution path, not just point-in-time inspection.',
        keyPoints: [
          'Causal tracing: identify the causal chain from user input → context assembly → model decision → tool action → outcome',
          'Debugging as design: systems that are hard to debug were not designed for observability — add debug interfaces at design time',
          'Automated regression testing: capture and replay failing sessions to reproduce and verify fixes',
        ],
      },
    },
  },
  {
    id: 'best-practices',
    group: 'mastery',
    emoji: '✅',
    title: 'Best Practices',
    tagline: 'The patterns that separate professional Claude Code users from beginners',
    modeContent: {
      beginner: {
        overview: 'These practices make Claude dramatically more useful and prevent the most common mistakes. Start here if you are new to Claude Code.',
        keyPoints: [
          'Always run /init in new projects and maintain a detailed CLAUDE.md',
          'Review every file operation diff before approving — do not auto-approve writes',
          'Be specific in your requests — vague instructions produce vague or wrong results',
        ],
      },
      developer: {
        overview: 'Professional Claude Code workflows combine: precise task scoping, proactive context management, model routing optimization, and systematic review of AI output before acting on it.',
        keyPoints: [
          'Scope first, then delegate: define clear success criteria before asking Claude to start work',
          'Monitor /context proactively — act at 60% full, not at 95% when degradation has already started',
          'Test AI output: run tests, linting, and type checking on AI-generated code before committing',
        ],
        tip: 'Create a personal Claude Code playbook: a CLAUDE.md template and set of proven prompt patterns for your common workflows',
      },
      engineer: {
        overview: 'Engineering best practices for AI-native development: treat AI output as code requiring review, build validation layers between AI and production systems, and measure AI contribution to team velocity.',
        keyPoints: [
          'AI output is a PR, not a commit — treat it with the same review rigor as human code',
          'Validation gates: run automated tests, security scans, and type checks on all AI-generated artifacts',
          'Velocity measurement: track which Claude workflows genuinely accelerate delivery vs create new maintenance burden',
        ],
      },
      enterprise: {
        overview: 'Enterprise best practices: governance before deployment, monitoring as infrastructure, and continuous improvement based on operational data.',
        keyPoints: [
          'Governance first: define acceptable use, data handling policies, and approval processes before scaling AI use',
          'Monitor production AI like any service: uptime, quality, cost, and incident rates',
          'Learning organization: share Claude Code learnings across teams — what works in engineering likely works in other functions',
        ],
      },
      architect: {
        overview: 'Architectural best practices for AI-native systems: design for explicit context management, build observability in from the start, and treat AI as a probabilistic component requiring deterministic scaffolding.',
        keyPoints: [
          'Explicit over implicit: make context assembly, model selection, and output validation explicit in every system design',
          'Separation of concerns: deterministic orchestration logic should be isolated from probabilistic AI inference',
          'Evolvability: AI systems must be easy to update as models improve — avoid tight coupling to specific model behaviors',
        ],
      },
    },
  },
  {
    id: 'common-mistakes',
    group: 'mastery',
    emoji: '⚠️',
    title: 'Common Mistakes',
    tagline: 'The patterns that burn money, compromise security, and degrade quality',
    interactiveType: 'mistakes',
    modeContent: {
      beginner: {
        overview: 'These are the most common mistakes beginners make with Claude Code. Each one has cost someone time, money, or data. Learn them now to avoid experiencing them firsthand.',
        keyPoints: [
          'Not reviewing file diffs before approving writes leads to AI editing the wrong files',
          'Asking too-broad questions ("clean up my code") causes unpredictable large-scope changes',
          'Not using /init means Claude has no project context and makes wrong architectural assumptions',
        ],
      },
      developer: {
        overview: 'Common developer mistakes that are easy to avoid once you know about them. Each mistake has a specific, learnable fix.',
        keyPoints: [
          'Loading entire large files into context when only 20 lines are relevant — use targeted excerpts',
          'No retry budget in automation scripts — one API error causes infinite retry billing',
          'Mixing task contexts in long sessions — always /clear between unrelated tasks',
        ],
      },
      engineer: {
        overview: 'Engineering-level mistakes that create production incidents: missing security controls on /run, unbounded tool output injection, and prompt templates that work in dev but fail at scale.',
        keyPoints: [
          'Testing with small files, deploying with large files — token consumption scales with real-world data sizes',
          'No circuit breaker on automated Claude workflows — cost explosions happen silently',
          'System prompt secrets in logs — --verbose mode captures full context including potentially sensitive instructions',
        ],
      },
      enterprise: {
        overview: 'Enterprise mistakes that create compliance, cost, and reliability incidents. Each has been the root cause of real production problems in organizations that deployed AI without adequate governance.',
        keyPoints: [
          'API keys in CI/CD scripts committed to git — common source of key exposure in AI-using organizations',
          'No per-workflow token budget — automated workflows can consume monthly budget in hours',
          'AI workflows touching production without change management — classification as "just an AI feature" bypasses critical safety checks',
        ],
      },
      architect: {
        overview: 'Architectural mistakes that create systemic technical debt: designs that assume AI determinism, missing observability layers, and context management as an afterthought rather than a first-class design concern.',
        keyPoints: [
          'Treating AI as a black box — systems that cannot be debugged cannot be operated in production',
          'Optimizing for happy-path — AI systems need explicit design for failure recovery, not just success',
          'Coupling to model-specific behavior — behaviors may change with model updates, breaking systems without any code change',
        ],
      },
    },
  },
  {
    id: 'power-user-recipes',
    group: 'mastery',
    emoji: '🚀',
    title: 'Power User Recipes',
    tagline: 'End-to-end real-world Claude Code workflows for professional engineers',
    interactiveType: 'recipes',
    modeContent: {
      beginner: {
        overview: 'Recipes are complete workflows that combine multiple Claude Code features to accomplish complex real-world tasks. Start with the simpler ones (Research Pipeline, Incident Analysis) before attempting the advanced ones.',
        keyPoints: [
          'Each recipe shows the exact commands and steps — you can follow along in a real project',
          'Note the token estimates — they show you what each workflow actually costs',
          'Start with read-only recipes (research, analysis) before attempting code-writing recipes',
        ],
      },
      developer: {
        overview: 'These recipes encode professional Claude Code patterns that have been refined through real production use. Each one represents a workflow where AI genuinely accelerates engineering velocity.',
        keyPoints: [
          'Autonomous coding saves 60–80% of implementation time on well-defined tasks',
          'Security review in CI/CD catches vulnerabilities earlier with zero additional human time',
          'Incident analysis cuts MTTR significantly by instantly correlating logs with deployment history',
        ],
        tip: 'Save your best custom recipes to a personal RECIPES.md — build a library of proven workflows over time',
      },
      engineer: {
        overview: 'Engineering recipes are production-tested workflows with known token costs, quality metrics, and failure modes. Use them as starting templates and customize for your specific stack and requirements.',
        keyPoints: [
          'Token estimates are per-execution averages — actual costs vary with input size and complexity',
          'Each recipe includes caveats that reflect real failure modes discovered in production use',
          'Adapt the recipes to your stack: replace MCP references with your specific tool configurations',
        ],
      },
      enterprise: {
        overview: 'Enterprise recipes represent validated, governance-approved workflow patterns. Use them as the foundation for your organization\'s AI workflow library — standardized, tested, and continuously improved.',
        keyPoints: [
          'Each recipe should be reviewed and approved before enterprise-wide adoption',
          'Document customizations and lessons learned when adapting recipes to your environment',
          'Build a recipe library: encourage teams to contribute validated workflows for organizational benefit',
        ],
      },
      architect: {
        overview: 'Recipes illustrate the architectural patterns that emerge from real AI workflow engineering: pipeline topology, human-in-the-loop placement, token budget allocation, and tool selection strategy.',
        keyPoints: [
          'Each recipe embodies architectural decisions — study the patterns, not just the steps',
          'Recipe evolution: track how recipes change over time as model capabilities improve and operational insights accumulate',
          'Cross-recipe patterns: identify common architectural elements across recipes — extract these as reusable platform components',
        ],
      },
    },
  },
];
