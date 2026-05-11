export type CommandCategory =
  | 'session'
  | 'context-memory'
  | 'planning'
  | 'agents'
  | 'mcp-tooling'
  | 'debugging'
  | 'git-review'
  | 'automation'
  | 'ui-config'
  | 'security';

export type RiskLevel = 'safe' | 'caution' | 'dangerous';
export type CommandDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CommandType = 'built-in' | 'skill' | 'mcp' | 'custom';

export interface CommandParam {
  name: string;
  required: boolean;
  description: string;
  example: string;
}

export interface SessionStateChange {
  field: string;
  before: string | number;
  after: string | number;
  delta?: number;
}

export interface SlashCommand {
  id: string;
  name: string;
  syntax: string;
  category: CommandCategory;
  type: CommandType;
  difficulty: CommandDifficulty;
  riskLevel: RiskLevel;
  tagline: string;
  purpose: string;
  executionTiming: string;
  scope: 'session' | 'project' | 'global';
  sessionImpact: string;
  sideEffects: string[];
  params?: CommandParam[];
  compatibleWith: string[];
  unsafePatterns: string[];
  example: string;
  tokenImpact: number;
  stateChanges: SessionStateChange[];
  workflowUsage: string[];
  internalNote: string;
  realWorldScenario: string;
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  difficulty: CommandDifficulty;
  commands: Array<{ id: string; note: string }>;
  useCase: string;
  color: string;
  icon: string;
  estimatedTime: string;
}

export interface CommandChain {
  id: string;
  from: string;
  to: string;
  label: string;
  strength: 'strong' | 'common' | 'optional';
}

// ─── Commands ─────────────────────────────────────────────────────────────────

export const slashCommands: SlashCommand[] = [
  // ── Session Management ──────────────────────────────────────────────────────
  {
    id: 'clear',
    name: '/clear',
    syntax: '/clear',
    category: 'session',
    type: 'built-in',
    difficulty: 'beginner',
    riskLevel: 'caution',
    tagline: 'Wipe the slate — start a fresh conversation with zero context',
    purpose: 'Resets the entire conversation history and context, starting a new session from scratch.',
    executionTiming: 'Immediate. Takes effect before the next message.',
    scope: 'session',
    sessionImpact: 'Destroys all in-context conversation history. CLAUDE.md and settings.json survive.',
    sideEffects: ['All in-memory context lost', 'Token counter resets to 0', 'Active tool state cleared', 'Recoverable via /resume'],
    compatibleWith: ['resume'],
    unsafePatterns: ['/clear mid-task without checkpointing — you lose everything'],
    example: '/clear',
    tokenImpact: -100,
    stateChanges: [
      { field: 'Token Count', before: 45000, after: 0, delta: -45000 },
      { field: 'Message History', before: '23 messages', after: '0 messages' },
      { field: 'Session State', before: 'Active', after: 'Fresh' },
    ],
    workflowUsage: ['Start of a new task after completing previous', 'When context has become corrupted', 'Before starting a sensitive task with clean slate'],
    internalNote: 'Prior session is archived and accessible via /resume. The CLAUDE.md file and .claude/settings.json are NOT cleared.',
    realWorldScenario: 'After a 2-hour debugging session, start fresh for a new feature: /clear',
  },
  {
    id: 'resume',
    name: '/resume',
    syntax: '/resume [session-name]',
    category: 'session',
    type: 'built-in',
    difficulty: 'beginner',
    riskLevel: 'safe',
    tagline: 'Pick up exactly where you left off — restores a previous session',
    purpose: 'Reopens a previous conversation session, restoring its context and history.',
    executionTiming: 'Loads session asynchronously. May take 1–3s for large sessions.',
    scope: 'project',
    sessionImpact: 'Replaces current context with the resumed session\'s context.',
    sideEffects: ['Current context replaced', 'Token count reflects resumed session', 'Tool states from session restored'],
    params: [{ name: 'session-name', required: false, description: 'Name of session to resume. Omit to see a list.', example: '/resume auth-refactor' }],
    compatibleWith: ['compact', 'clear'],
    unsafePatterns: ['Resuming a very old session when codebase has changed significantly'],
    example: '/resume auth-refactor',
    tokenImpact: 50,
    stateChanges: [
      { field: 'Session', before: 'Fresh/Empty', after: 'Restored' },
      { field: 'Message History', before: '0 messages', after: '18 messages' },
      { field: 'Token Count', before: 0, after: 38000 },
    ],
    workflowUsage: ['Continue interrupted long-running task', 'Resume debugging from where you left off', 'Return to a project after context switch'],
    internalNote: 'Claude Code stores session archives locally. Use without args to see a picker of recent sessions.',
    realWorldScenario: 'Come back after lunch and continue: /resume payment-integration',
  },
  {
    id: 'status',
    name: '/status',
    syntax: '/status',
    category: 'session',
    type: 'built-in',
    difficulty: 'beginner',
    riskLevel: 'safe',
    tagline: 'X-ray your current session — tokens, model, agents, MCP all at a glance',
    purpose: 'Displays a full snapshot of the current Claude Code session state.',
    executionTiming: 'Instant. Read-only operation.',
    scope: 'session',
    sessionImpact: 'None. Pure read operation.',
    sideEffects: [],
    compatibleWith: ['compact', 'model', 'mcp'],
    unsafePatterns: [],
    example: '/status',
    tokenImpact: 0,
    stateChanges: [],
    workflowUsage: ['Check token usage before deciding to /compact', 'Verify which model is active', 'Confirm MCP servers are connected'],
    internalNote: 'Shows: current model, token usage, MCP server status, active permissions, session duration.',
    realWorldScenario: 'Before starting a long task: /status → check tokens → decide if /compact needed first',
  },

  // ── Context & Memory ────────────────────────────────────────────────────────
  {
    id: 'compact',
    name: '/compact',
    syntax: '/compact [focus]',
    category: 'context-memory',
    type: 'built-in',
    difficulty: 'beginner',
    riskLevel: 'caution',
    tagline: 'Compress the conversation into a focused summary without losing the thread',
    purpose: 'Summarizes the conversation history into a compact form to free up context window space.',
    executionTiming: '3–8s. Model generates a summary of the entire conversation.',
    scope: 'session',
    sessionImpact: 'Conversation history replaced by a model-generated summary. Original detail is lost.',
    sideEffects: ['Detail lost in compression', 'Summary may miss edge cases', 'Token count drops significantly', 'Reasoning speed improves after compaction'],
    params: [{ name: 'focus', required: false, description: 'What to emphasize in the summary', example: '/compact focus on auth changes' }],
    compatibleWith: ['resume', 'clear', 'status'],
    unsafePatterns: [
      'Compacting mid-task without noting current position — you may lose your place',
      'Compacting when critical details (error messages, exact file paths) are in recent context',
    ],
    example: '/compact focus on the payment integration changes',
    tokenImpact: -80,
    stateChanges: [
      { field: 'Token Count', before: 180000, after: 12000, delta: -168000 },
      { field: 'Message History', before: '67 messages', after: '1 summary' },
      { field: 'Detail Level', before: 'Full', after: 'Summarized' },
      { field: 'Reasoning Speed', before: 'Slower', after: 'Faster' },
    ],
    workflowUsage: ['When context window is 70%+ full', 'Before starting a new phase of work', 'After completing a debugging session, before refactoring'],
    internalNote: 'The model decides what to summarize. Provide focus instructions to bias what gets preserved.',
    realWorldScenario: 'After 2h of debugging, before starting implementation: /compact focus on the root cause we found',
  },
  {
    id: 'memory',
    name: '/memory',
    syntax: '/memory',
    category: 'context-memory',
    type: 'built-in',
    difficulty: 'beginner',
    riskLevel: 'safe',
    tagline: 'Edit CLAUDE.md — your project\'s permanent instruction file',
    purpose: 'Opens the CLAUDE.md memory file for editing. Changes persist across all future sessions.',
    executionTiming: 'Opens editor immediately. Changes take effect in next message.',
    scope: 'project',
    sessionImpact: 'Modifies persistent memory that is loaded in every future session.',
    sideEffects: ['CLAUDE.md file updated on disk', 'All future sessions inherit changes', 'Immediate effect after edit'],
    compatibleWith: ['compact', 'init'],
    unsafePatterns: ['Adding contradictory instructions to CLAUDE.md (conflicts with system prompt)', 'Making CLAUDE.md too long — it consumes token budget every session'],
    example: '/memory',
    tokenImpact: 0,
    stateChanges: [
      { field: 'CLAUDE.md', before: 'Unmodified', after: 'Updated' },
      { field: 'Future Sessions', before: 'Old instructions', after: 'New instructions' },
    ],
    workflowUsage: ['Add new coding standards discovered during a session', 'Update team conventions', 'Add new commands or tech stack context'],
    internalNote: 'CLAUDE.md is read from current dir + all parents. Changes to parent CLAUDE.md affect all child projects.',
    realWorldScenario: 'You discover a pattern bug — add it to memory: /memory → add "Always validate JWT expiry before signature"',
  },
  {
    id: 'init',
    name: '/init',
    syntax: '/init',
    category: 'context-memory',
    type: 'built-in',
    difficulty: 'beginner',
    riskLevel: 'safe',
    tagline: 'Bootstrap CLAUDE.md — Claude reads your project and writes its own instructions',
    purpose: 'Analyzes the current project and generates an initial CLAUDE.md with relevant context.',
    executionTiming: '10–30s. Claude reads project structure, package.json, README, and generates CLAUDE.md.',
    scope: 'project',
    sessionImpact: 'Creates CLAUDE.md if it doesn\'t exist. Appends to existing.',
    sideEffects: ['Creates CLAUDE.md file', 'Project files read (non-destructive)', 'Generated content may need human review'],
    compatibleWith: ['memory'],
    unsafePatterns: ['Running /init on a project you don\'t want Claude to analyze deeply'],
    example: '/init',
    tokenImpact: 20,
    stateChanges: [
      { field: 'CLAUDE.md', before: 'Missing', after: 'Created' },
      { field: 'Project Memory', before: 'None', after: 'Bootstrapped' },
    ],
    workflowUsage: ['First time using Claude Code on a project', 'Setting up a new team member\'s Claude environment', 'Quickly grounding Claude in an unfamiliar codebase'],
    internalNote: 'Generated CLAUDE.md is a starting point — always review and customize it.',
    realWorldScenario: 'Joining a new repo: clone it, cd in, run /init',
  },

  // ── Planning & Reasoning ────────────────────────────────────────────────────
  {
    id: 'plan',
    name: '/plan',
    syntax: '/plan [task]',
    category: 'planning',
    type: 'skill',
    difficulty: 'intermediate',
    riskLevel: 'safe',
    tagline: 'Think before you code — enter structured planning mode',
    purpose: 'Puts Claude into a structured planning mode where it designs an approach before writing any code.',
    executionTiming: 'Immediate mode switch. Planning output before any implementation.',
    scope: 'session',
    sessionImpact: 'All subsequent messages treated as planning context until plan is approved.',
    sideEffects: ['No file changes until plan approved', 'Higher-quality implementation follows', 'Slower start, fewer mistakes'],
    params: [{ name: 'task', required: false, description: 'The task to plan for', example: '/plan refactor auth module' }],
    compatibleWith: ['review', 'agents', 'compact'],
    unsafePatterns: ['Skipping /plan for complex architectural changes', 'Approving a plan before carefully reviewing it'],
    example: '/plan refactor the authentication module to use JWT',
    tokenImpact: 15,
    stateChanges: [
      { field: 'Mode', before: 'Execution', after: 'Planning' },
      { field: 'File Writes', before: 'Allowed', after: 'Blocked (until approved)' },
      { field: 'Reasoning Depth', before: 'Normal', after: 'Deep' },
    ],
    workflowUsage: ['Before any significant refactor', 'Before architectural changes', 'When requirements are ambiguous'],
    internalNote: 'Planning mode prevents premature code generation. Claude designs, you approve, then it executes.',
    realWorldScenario: '/plan migrate the database from MySQL to PostgreSQL',
  },
  {
    id: 'model',
    name: '/model',
    syntax: '/model [model-id]',
    category: 'planning',
    type: 'built-in',
    difficulty: 'intermediate',
    riskLevel: 'safe',
    tagline: 'Switch AI models mid-session — match the model to the task',
    purpose: 'Changes the active Claude model. Use Opus for hard reasoning, Haiku for speed.',
    executionTiming: 'Immediate. Next message uses the new model.',
    scope: 'session',
    sessionImpact: 'Changes model for all subsequent messages in the session.',
    sideEffects: ['Cost changes (Opus costs more)', 'Speed changes (Haiku is fastest)', 'Capability changes'],
    params: [{ name: 'model-id', required: false, description: 'Model to switch to. Omit to see available models.', example: '/model claude-opus-4-5' }],
    compatibleWith: ['status', 'plan'],
    unsafePatterns: ['Switching to a weaker model for critical reasoning tasks to save cost'],
    example: '/model claude-haiku-4-5',
    tokenImpact: 0,
    stateChanges: [
      { field: 'Active Model', before: 'claude-sonnet-4-6', after: 'claude-opus-4-5' },
      { field: 'Cost/1k tokens', before: '$0.003', after: '$0.015' },
      { field: 'Reasoning Quality', before: 'High', after: 'Highest' },
    ],
    workflowUsage: ['Switch to Opus for hard architecture decisions', 'Switch to Haiku for quick file edits', 'Switch to Sonnet as default for balanced work'],
    internalNote: 'Model selection persists for the session. /status shows current model.',
    realWorldScenario: 'About to design a distributed system: /model claude-opus-4-5',
  },

  // ── Agents & Parallelization ────────────────────────────────────────────────
  {
    id: 'agents',
    name: '/agents',
    syntax: '/agents',
    category: 'agents',
    type: 'built-in',
    difficulty: 'advanced',
    riskLevel: 'caution',
    tagline: 'Spawn parallel worker agents for independent subtasks',
    purpose: 'Enables multi-agent mode where Claude spawns specialized worker agents for parallel task execution.',
    executionTiming: '2–5s setup. Agents run concurrently after setup.',
    scope: 'session',
    sessionImpact: 'Spawns multiple parallel agent processes. Each agent has its own context.',
    sideEffects: ['Higher API cost (multiple model calls in parallel)', 'Coordination complexity', 'Agents cannot communicate directly', 'Results merged by orchestrator'],
    compatibleWith: ['plan', 'batch', 'tasks', 'background'],
    unsafePatterns: [
      'Using agents for tasks with shared state (file conflicts)',
      'Spawning agents without a plan — chaos results',
      'Not reviewing agent outputs before merging',
    ],
    example: '/agents\n> Spawn 3 agents: research, implement, test',
    tokenImpact: 300,
    stateChanges: [
      { field: 'Active Agents', before: 1, after: 4, delta: 3 },
      { field: 'Parallel Tasks', before: 0, after: 3 },
      { field: 'Cost Rate', before: '$0.003/k', after: '$0.012/k' },
      { field: 'Speed', before: '1x', after: '3x parallel' },
    ],
    workflowUsage: [
      'Large codebase refactors (one agent per module)',
      'Parallel research + implementation',
      'Independent feature branches in parallel',
    ],
    internalNote: 'Each agent is a full Claude instance. The orchestrating Claude coordinates and merges. Context fork happens at spawn.',
    realWorldScenario: '/plan first, then /agents to parallelize: write tests, implement feature, update docs simultaneously',
  },
  {
    id: 'tasks',
    name: '/tasks',
    syntax: '/tasks',
    category: 'agents',
    type: 'built-in',
    difficulty: 'intermediate',
    riskLevel: 'safe',
    tagline: 'View and manage all running background tasks',
    purpose: 'Shows a dashboard of all running tasks, their status, and output.',
    executionTiming: 'Instant. Read-only view.',
    scope: 'session',
    sessionImpact: 'None. View-only.',
    sideEffects: [],
    compatibleWith: ['background', 'agents', 'loop'],
    unsafePatterns: [],
    example: '/tasks',
    tokenImpact: 0,
    stateChanges: [],
    workflowUsage: ['Check if background tasks completed', 'Monitor multiple parallel agents', 'Verify scheduled tasks are running'],
    internalNote: 'Shows task ID, status (running/completed/failed), duration, and last output line.',
    realWorldScenario: 'After launching /background tasks: /tasks to check progress',
  },
  {
    id: 'background',
    name: '/background',
    syntax: '/background [task]',
    category: 'agents',
    type: 'skill',
    difficulty: 'advanced',
    riskLevel: 'caution',
    tagline: 'Fire and forget — run tasks in the background while you work',
    purpose: 'Executes a task asynchronously in the background, freeing the main session for other work.',
    executionTiming: 'Task starts immediately in background. Main session available instantly.',
    scope: 'session',
    sessionImpact: 'Spawns background process. Results delivered as notification.',
    sideEffects: ['Background process consumes tokens', 'File system writes may conflict', 'Results need verification when ready'],
    params: [{ name: 'task', required: true, description: 'The task to run in background', example: '/background run test suite and report failures' }],
    compatibleWith: ['tasks', 'agents'],
    unsafePatterns: ['Running destructive operations in background without monitoring', 'Backgrounding tasks that need user confirmation'],
    example: '/background run the full test suite and summarize failures',
    tokenImpact: 200,
    stateChanges: [
      { field: 'Background Tasks', before: 0, after: 1, delta: 1 },
      { field: 'Main Session', before: 'Blocked', after: 'Free' },
    ],
    workflowUsage: ['Run tests while writing more code', 'Long analysis tasks while continuing work', 'Scheduled processing during off-hours'],
    internalNote: 'Background tasks have their own token budget. Outputs are buffered and presented when requested via /tasks.',
    realWorldScenario: 'While implementing feature: /background run integration tests against staging',
  },

  // ── MCP & Tooling ───────────────────────────────────────────────────────────
  {
    id: 'mcp',
    name: '/mcp',
    syntax: '/mcp [add|remove|list] [server-name]',
    category: 'mcp-tooling',
    type: 'built-in',
    difficulty: 'intermediate',
    riskLevel: 'caution',
    tagline: 'Manage your external tool connections — the nerve system of Claude Code',
    purpose: 'Manages MCP (Model Context Protocol) server connections. Lists, adds, and removes tool providers.',
    executionTiming: 'Connection changes take effect immediately.',
    scope: 'project',
    sessionImpact: 'Adds or removes tool capabilities available to Claude.',
    sideEffects: ['New tools become available to model', 'MCP server process started/stopped', 'Settings.json updated for add/remove'],
    params: [
      { name: 'action', required: false, description: 'list, add, or remove', example: '/mcp list' },
      { name: 'server-name', required: false, description: 'Server to add or remove', example: '/mcp add github' },
    ],
    compatibleWith: ['permissions', 'status'],
    unsafePatterns: ['Adding untrusted MCP servers without reviewing their tool set', 'Connecting MCP to production databases without read-only restriction'],
    example: '/mcp',
    tokenImpact: 5,
    stateChanges: [
      { field: 'Connected Servers', before: 2, after: 3, delta: 1 },
      { field: 'Available Tools', before: 12, after: 18, delta: 6 },
    ],
    workflowUsage: ['Check which MCP servers are connected at session start', 'Add GitHub MCP for PR workflow', 'Add database MCP for data analysis tasks'],
    internalNote: 'MCP servers defined in .claude/settings.json mcpServers section. /mcp is the GUI for that config.',
    realWorldScenario: '/mcp add github → now Claude can create issues, search code, manage PRs',
  },
  {
    id: 'permissions',
    name: '/permissions',
    syntax: '/permissions',
    category: 'mcp-tooling',
    type: 'built-in',
    difficulty: 'intermediate',
    riskLevel: 'safe',
    tagline: 'View and tune what Claude is allowed to do — your safety control panel',
    purpose: 'Displays and manages the current permission configuration — what tools and operations are allowed.',
    executionTiming: 'Instant. Shows current permissions; edits take effect immediately.',
    scope: 'project',
    sessionImpact: 'Changes allowed/denied operation patterns.',
    sideEffects: ['Permission changes affect all subsequent tool calls', 'Settings.json updated on edit'],
    compatibleWith: ['mcp', 'status'],
    unsafePatterns: ['Setting Bash(*) allow — grants unrestricted shell access'],
    example: '/permissions',
    tokenImpact: 0,
    stateChanges: [],
    workflowUsage: ['Before running automation that needs broader permissions', 'After security review — tighten permissions', 'Debugging permission-denied errors'],
    internalNote: 'Shows current allow/deny rules. Edit to add specific patterns. Always use principle of least privilege.',
    realWorldScenario: '/permissions → add "Bash(npm run test)" → now Claude can run tests without prompting',
  },

  // ── Debugging & Review ──────────────────────────────────────────────────────
  {
    id: 'review',
    name: '/review',
    syntax: '/review [PR-number]',
    category: 'git-review',
    type: 'skill',
    difficulty: 'intermediate',
    riskLevel: 'safe',
    tagline: 'AI code review — finds bugs, security issues, and style violations',
    purpose: 'Performs a structured code review of recent changes or a specific PR.',
    executionTiming: '10–60s depending on diff size.',
    scope: 'session',
    sessionImpact: 'Reads git diff/PR. No file modifications.',
    sideEffects: ['Review output added to context', 'GitHub API call if PR number provided'],
    params: [{ name: 'PR-number', required: false, description: 'GitHub PR number to review. Omit for local changes.', example: '/review 42' }],
    compatibleWith: ['plan', 'security-review', 'diff'],
    unsafePatterns: ['Treating /review as a final gate without human review', 'Using /review to rubber-stamp PRs'],
    example: '/review 42',
    tokenImpact: 25,
    stateChanges: [],
    workflowUsage: ['Pre-merge code review', 'Self-review before requesting human review', 'Catch issues before CI fails'],
    internalNote: 'For PRs, requires GitHub MCP or GITHUB_TOKEN env var. For local changes, uses git diff HEAD.',
    realWorldScenario: 'Before requesting human review: /review → fix issues Claude finds → then request human review',
  },
  {
    id: 'security-review',
    name: '/security-review',
    syntax: '/security-review',
    category: 'debugging',
    type: 'skill',
    difficulty: 'advanced',
    riskLevel: 'safe',
    tagline: 'Deep security audit — finds vulnerabilities before attackers do',
    purpose: 'Performs a security-focused review of the current branch changes.',
    executionTiming: '20–90s for comprehensive security analysis.',
    scope: 'session',
    sessionImpact: 'Security audit output added to context.',
    sideEffects: ['May identify issues requiring human expert validation', 'Security findings added to context for follow-up'],
    compatibleWith: ['review', 'plan'],
    unsafePatterns: ['Treating /security-review as a substitute for professional security audit'],
    example: '/security-review',
    tokenImpact: 40,
    stateChanges: [],
    workflowUsage: ['Before merging auth-related changes', 'After adding new API endpoints', 'Before production deployments'],
    internalNote: 'Checks for OWASP Top 10, injection risks, authentication flaws, insecure dependencies.',
    realWorldScenario: 'After implementing payment flow: /security-review → address any critical findings first',
  },
  {
    id: 'doctor',
    name: '/doctor',
    syntax: '/doctor',
    category: 'debugging',
    type: 'built-in',
    difficulty: 'beginner',
    riskLevel: 'safe',
    tagline: 'Health check your Claude Code installation — diagnose setup issues',
    purpose: 'Runs a diagnostic check on the Claude Code installation and configuration.',
    executionTiming: '5–15s. Checks dependencies, config, and connectivity.',
    scope: 'global',
    sessionImpact: 'None. Read-only diagnostic.',
    sideEffects: [],
    compatibleWith: ['status', 'mcp'],
    unsafePatterns: [],
    example: '/doctor',
    tokenImpact: 0,
    stateChanges: [],
    workflowUsage: ['When Claude Code behaves unexpectedly', 'After updating Claude Code', 'Onboarding new team members'],
    internalNote: 'Checks: API key validity, Node.js version, MCP server health, permissions config, CLAUDE.md syntax.',
    realWorldScenario: 'MCP tools not working: /doctor → identifies misconfigured server path',
  },
  {
    id: 'diff',
    name: '/diff',
    syntax: '/diff',
    category: 'git-review',
    type: 'built-in',
    difficulty: 'beginner',
    riskLevel: 'safe',
    tagline: 'Show what changed — syntax-highlighted git diff in context',
    purpose: 'Shows a formatted git diff of the current uncommitted changes.',
    executionTiming: 'Instant.',
    scope: 'session',
    sessionImpact: 'Diff output added to context for Claude to analyze.',
    sideEffects: [],
    compatibleWith: ['review', 'plan', 'compact'],
    unsafePatterns: [],
    example: '/diff',
    tokenImpact: 10,
    stateChanges: [],
    workflowUsage: ['Before /review to ensure Claude has full diff', 'After agent work to see what changed', 'Pre-commit sanity check'],
    internalNote: 'Equivalent to running git diff and injecting output into context. Respects .gitignore.',
    realWorldScenario: 'After agents finish work: /diff → review changes → /review → commit',
  },

  // ── Automation ──────────────────────────────────────────────────────────────
  {
    id: 'loop',
    name: '/loop',
    syntax: '/loop [interval] [command]',
    category: 'automation',
    type: 'skill',
    difficulty: 'advanced',
    riskLevel: 'caution',
    tagline: 'Run a command on repeat — self-pacing automation loop',
    purpose: 'Runs a slash command or prompt on a recurring interval.',
    executionTiming: 'First run immediate. Subsequent runs at specified interval.',
    scope: 'session',
    sessionImpact: 'Creates a recurring task. Runs until manually stopped or max iterations hit.',
    sideEffects: ['Repeated API calls and token consumption', 'Must be explicitly stopped', 'Can accumulate significant cost'],
    params: [
      { name: 'interval', required: false, description: 'Time between runs (e.g., 5m, 1h). Omit for self-pacing.', example: '/loop 5m /review' },
      { name: 'command', required: true, description: 'Command or prompt to repeat', example: '/loop /tasks' },
    ],
    compatibleWith: ['background', 'tasks', 'schedule'],
    unsafePatterns: ['Looping without a stop condition — will run and bill forever', '/loop on expensive commands (agents, ultrareview)'],
    example: '/loop 30m check deployment status and alert if errors',
    tokenImpact: 150,
    stateChanges: [
      { field: 'Active Loops', before: 0, after: 1, delta: 1 },
      { field: 'Automation', before: 'Manual', after: 'Automated' },
    ],
    workflowUsage: ['Monitor deployment progress every 5min', 'Check for new PR comments hourly', 'Poll for test results'],
    internalNote: 'Use /loop for session-scoped recurring tasks. For persistent crons, use /schedule.',
    realWorldScenario: '/loop 10m check if the staging tests are passing and summarize status',
  },
  {
    id: 'schedule',
    name: '/schedule',
    syntax: '/schedule [cron] [task]',
    category: 'automation',
    type: 'skill',
    difficulty: 'advanced',
    riskLevel: 'caution',
    tagline: 'Cron jobs for Claude — schedule tasks beyond your session',
    purpose: 'Creates a persistent scheduled task that runs on a cron schedule, surviving session ends.',
    executionTiming: 'Setup immediate. First run at specified cron time.',
    scope: 'global',
    sessionImpact: 'Creates a remote scheduled agent. Runs even when Claude Code is not open.',
    sideEffects: ['Persistent billing for scheduled runs', 'Runs outside current session context', 'Results stored in remote logs'],
    params: [
      { name: 'cron', required: true, description: 'Cron expression or natural language', example: '/schedule "every day at 9am"' },
      { name: 'task', required: true, description: 'Task for the scheduled agent', example: '/schedule "9am daily" review PRs opened yesterday' },
    ],
    compatibleWith: ['loop', 'background'],
    unsafePatterns: ['Scheduling with broad permissions — defines surface area for automated damage', 'Not testing the task manually before scheduling'],
    example: '/schedule "every weekday at 9am" review all open PRs and post summaries',
    tokenImpact: 0,
    stateChanges: [
      { field: 'Scheduled Tasks', before: 0, after: 1 },
      { field: 'Scope', before: 'Session', after: 'Global/Persistent' },
    ],
    workflowUsage: ['Daily PR digest', 'Weekly security scan', 'Nightly test report'],
    internalNote: 'Scheduled agents run in the cloud. They cannot access your local filesystem unless you configure remote MCP.',
    realWorldScenario: '/schedule "every Friday at 5pm" summarize the week\'s commits and draft release notes',
  },

  // ── UI & Config ─────────────────────────────────────────────────────────────
  {
    id: 'config',
    name: '/config',
    syntax: '/config [key] [value]',
    category: 'ui-config',
    type: 'built-in',
    difficulty: 'beginner',
    riskLevel: 'safe',
    tagline: 'Tune Claude Code settings without editing JSON manually',
    purpose: 'View or modify Claude Code configuration settings.',
    executionTiming: 'Instant. Changes take effect immediately.',
    scope: 'global',
    sessionImpact: 'Updates ~/.claude/settings.json or project settings.',
    sideEffects: ['Settings file updated', 'Changes affect current and future sessions'],
    params: [
      { name: 'key', required: false, description: 'Setting to view or change', example: '/config model' },
      { name: 'value', required: false, description: 'New value', example: '/config model claude-opus-4-5' },
    ],
    compatibleWith: ['model', 'status', 'permissions'],
    unsafePatterns: ['Setting allowedTools to wildcard patterns via config'],
    example: '/config',
    tokenImpact: 0,
    stateChanges: [],
    workflowUsage: ['Change default model', 'Set API key', 'Configure auto-compact threshold'],
    internalNote: 'GUI for settings.json. Prefer /config over manual JSON editing for safety.',
    realWorldScenario: '/config → change auto-compact threshold to 80% → prevents mid-task interruptions',
  },
  {
    id: 'cost',
    name: '/cost',
    syntax: '/cost',
    category: 'ui-config',
    type: 'built-in',
    difficulty: 'beginner',
    riskLevel: 'safe',
    tagline: 'Real-time billing dashboard — know exactly what you\'re spending',
    purpose: 'Shows token usage and estimated cost for the current session.',
    executionTiming: 'Instant.',
    scope: 'session',
    sessionImpact: 'None. Read-only.',
    sideEffects: [],
    compatibleWith: ['status', 'compact'],
    unsafePatterns: [],
    example: '/cost',
    tokenImpact: 0,
    stateChanges: [],
    workflowUsage: ['After long sessions to track spend', 'Before running expensive /agents or /ultrareview', 'End-of-day billing review'],
    internalNote: 'Shows: input tokens, output tokens, cache hits, estimated USD cost. Accumulated since session start.',
    realWorldScenario: '/cost → see $1.23 spent → decide if /compact is worthwhile before continuing',
  },

  // ── Security ────────────────────────────────────────────────────────────────
  {
    id: 'ultrareview',
    name: '/ultrareview',
    syntax: '/ultrareview [PR-number]',
    category: 'git-review',
    type: 'skill',
    difficulty: 'advanced',
    riskLevel: 'caution',
    tagline: 'Multi-agent cloud review — the most thorough review possible',
    purpose: 'Launches a multi-agent cloud-based code review using multiple specialized AI reviewers.',
    executionTiming: '2–15 minutes. Runs in cloud, not locally.',
    scope: 'global',
    sessionImpact: 'Spawns multiple cloud agents. Results sent back asynchronously.',
    sideEffects: ['Higher cost than /review', 'Billed to Anthropic account', 'Results may include security findings'],
    params: [{ name: 'PR-number', required: false, description: 'PR to review. Omit for current branch.', example: '/ultrareview 88' }],
    compatibleWith: ['review', 'security-review'],
    unsafePatterns: ['Running /ultrareview on every minor PR — expensive', 'Not reviewing the /ultrareview output before merging'],
    example: '/ultrareview 88',
    tokenImpact: 500,
    stateChanges: [
      { field: 'Cloud Agents', before: 0, after: 5, delta: 5 },
      { field: 'Review Depth', before: 'Surface', after: 'Exhaustive' },
    ],
    workflowUsage: ['Major security-sensitive PRs', 'Architectural changes', 'Before major releases'],
    internalNote: 'Requires git repository. Uses the local branch (no GitHub needed) or a GitHub PR. Billed separately.',
    realWorldScenario: 'Before shipping payment processing feature: /ultrareview → fix all critical findings → merge',
  },
];

// ─── Command Chains ───────────────────────────────────────────────────────────

export const commandChains: CommandChain[] = [
  { id: 'c1', from: 'plan', to: 'agents', label: 'parallelize', strength: 'strong' },
  { id: 'c2', from: 'agents', to: 'review', label: 'quality gate', strength: 'strong' },
  { id: 'c3', from: 'plan', to: 'review', label: 'verify', strength: 'common' },
  { id: 'c4', from: 'compact', to: 'plan', label: 'free space first', strength: 'common' },
  { id: 'c5', from: 'review', to: 'security-review', label: 'deepen', strength: 'common' },
  { id: 'c6', from: 'agents', to: 'diff', label: 'inspect output', strength: 'strong' },
  { id: 'c7', from: 'diff', to: 'review', label: 'review changes', strength: 'strong' },
  { id: 'c8', from: 'plan', to: 'background', label: 'parallelize tasks', strength: 'optional' },
  { id: 'c9', from: 'background', to: 'tasks', label: 'monitor', strength: 'strong' },
  { id: 'c10', from: 'init', to: 'memory', label: 'refine', strength: 'common' },
  { id: 'c11', from: 'mcp', to: 'agents', label: 'extend tools', strength: 'optional' },
  { id: 'c12', from: 'review', to: 'ultrareview', label: 'escalate', strength: 'optional' },
];

// ─── Workflow Templates ───────────────────────────────────────────────────────

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'large-refactor',
    title: 'Large Refactor Workflow',
    description: 'Safely refactor a complex module with agent parallelization and staged review',
    difficulty: 'advanced',
    color: '#8b5cf6',
    icon: '🔨',
    estimatedTime: '2–4 hours',
    useCase: 'Restructuring a large module, migrating to a new pattern, or breaking down a monolith',
    commands: [
      { id: 'status', note: 'Check current state — tokens, model, MCP' },
      { id: 'compact', note: 'Free up context if >70% full' },
      { id: 'plan', note: 'Design the refactor strategy with Claude' },
      { id: 'agents', note: 'Parallelize: one agent per module/file group' },
      { id: 'diff', note: 'Inspect all agent changes before review' },
      { id: 'review', note: 'Automated review of all changes' },
      { id: 'security-review', note: 'Check for security regressions' },
    ],
  },
  {
    id: 'debugging-session',
    title: 'Deep Debugging Workflow',
    description: 'Systematically trace and fix a complex bug using Claude\'s diagnostic tools',
    difficulty: 'intermediate',
    color: '#ef4444',
    icon: '🐛',
    estimatedTime: '30min – 2 hours',
    useCase: 'Tracking down a subtle bug, performance issue, or mysterious failure',
    commands: [
      { id: 'status', note: 'Verify Claude has the right context' },
      { id: 'doctor', note: 'Rule out tooling issues first' },
      { id: 'diff', note: 'Check what changed recently' },
      { id: 'review', note: 'Let Claude find potential issues' },
      { id: 'compact', note: 'Compress after lengthy debug session' },
    ],
  },
  {
    id: 'new-feature',
    title: 'New Feature Workflow',
    description: 'Design, implement, and ship a new feature with proper planning and review',
    difficulty: 'intermediate',
    color: '#10b981',
    icon: '✨',
    estimatedTime: '1–3 hours',
    useCase: 'Implementing a new feature from requirements to production-ready code',
    commands: [
      { id: 'plan', note: 'Design the feature before coding' },
      { id: 'background', note: 'Run tests in background while implementing' },
      { id: 'tasks', note: 'Monitor background test results' },
      { id: 'diff', note: 'Review what was implemented' },
      { id: 'review', note: 'Code review before PR' },
      { id: 'security-review', note: 'Security check if feature touches auth/data' },
    ],
  },
  {
    id: 'multi-agent-research',
    title: 'Multi-Agent Research Workflow',
    description: 'Parallelize research and implementation across multiple specialized agents',
    difficulty: 'advanced',
    color: '#0ea5e9',
    icon: '🤖',
    estimatedTime: '1–2 hours',
    useCase: 'Complex tasks requiring research + implementation + testing in parallel',
    commands: [
      { id: 'plan', note: 'Break down the problem into independent workstreams' },
      { id: 'mcp', note: 'Add any needed external tools' },
      { id: 'agents', note: 'Spawn research, implement, test agents in parallel' },
      { id: 'tasks', note: 'Monitor all agent progress' },
      { id: 'diff', note: 'Inspect merged results' },
      { id: 'review', note: 'Final quality gate' },
    ],
  },
  {
    id: 'context-management',
    title: 'Long-Session Context Management',
    description: 'Manage context efficiently during marathon coding sessions',
    difficulty: 'beginner',
    color: '#f59e0b',
    icon: '🧠',
    estimatedTime: 'Ongoing',
    useCase: 'Any session that lasts more than 1 hour or produces 50+ messages',
    commands: [
      { id: 'status', note: 'Check token usage regularly' },
      { id: 'cost', note: 'Monitor spend as you work' },
      { id: 'compact', note: 'Compact when >70% full' },
      { id: 'memory', note: 'Persist important decisions to CLAUDE.md' },
      { id: 'resume', note: 'If session is getting unwieldy, start fresh and resume' },
    ],
  },
  {
    id: 'onboarding',
    title: 'Project Onboarding Workflow',
    description: 'Bootstrap Claude in a new project in under 5 minutes',
    difficulty: 'beginner',
    color: '#6366f1',
    icon: '🚀',
    estimatedTime: '5–10 minutes',
    useCase: 'Starting Claude on a new codebase or onboarding a new team member',
    commands: [
      { id: 'init', note: 'Let Claude read the project and write CLAUDE.md' },
      { id: 'memory', note: 'Review and customize the generated CLAUDE.md' },
      { id: 'mcp', note: 'Add project-relevant MCP servers (GitHub, DB, etc.)' },
      { id: 'permissions', note: 'Set permission rules for the project' },
      { id: 'doctor', note: 'Verify everything is configured correctly' },
    ],
  },
];

// ─── Section metadata ─────────────────────────────────────────────────────────

export interface StudioSection {
  id: string;
  title: string;
  icon: string;
  badge?: string;
  commandIds?: string[];
}

export const studioSections: StudioSection[] = [
  { id: 'overview', title: 'Command Overview', icon: '🗺️', badge: 'Start Here' },
  { id: 'playground', title: 'Interactive Playground', icon: '🎮', badge: 'Try It' },
  { id: 'chaining', title: 'Command Chaining', icon: '⛓️', badge: 'Visual' },
  { id: 'workflows', title: 'Workflow Templates', icon: '🔀' },
  { id: 'session', title: 'Session Management', icon: '🗂️', commandIds: ['clear', 'resume', 'status'] },
  { id: 'context', title: 'Context & Memory', icon: '🧠', commandIds: ['compact', 'memory', 'init'] },
  { id: 'planning', title: 'Planning & Reasoning', icon: '🧩', commandIds: ['plan', 'model'] },
  { id: 'agents', title: 'Agents & Parallelization', icon: '🤖', commandIds: ['agents', 'tasks', 'background'] },
  { id: 'mcp', title: 'MCP & Tooling', icon: '🌐', commandIds: ['mcp', 'permissions'] },
  { id: 'review', title: 'Review & Debugging', icon: '🔍', commandIds: ['review', 'security-review', 'doctor', 'diff'] },
  { id: 'automation', title: 'Workflow Automation', icon: '⚙️', commandIds: ['loop', 'schedule'] },
  { id: 'config', title: 'Config & Analytics', icon: '📊', commandIds: ['config', 'cost', 'ultrareview'] },
];

// ─── Category config ──────────────────────────────────────────────────────────

export const categoryConfig: Record<CommandCategory, { label: string; color: string; icon: string }> = {
  'session': { label: 'Session', color: '#0ea5e9', icon: '🗂️' },
  'context-memory': { label: 'Context & Memory', color: '#10b981', icon: '🧠' },
  'planning': { label: 'Planning', color: '#8b5cf6', icon: '🧩' },
  'agents': { label: 'Agents', color: '#f97316', icon: '🤖' },
  'mcp-tooling': { label: 'MCP & Tools', color: '#6366f1', icon: '🌐' },
  'debugging': { label: 'Debugging', color: '#ef4444', icon: '🔍' },
  'git-review': { label: 'Git & Review', color: '#64748b', icon: '🔀' },
  'automation': { label: 'Automation', color: '#f59e0b', icon: '⚙️' },
  'ui-config': { label: 'Config', color: '#94a3b8', icon: '🎛️' },
  'security': { label: 'Security', color: '#dc2626', icon: '🛡️' },
};
