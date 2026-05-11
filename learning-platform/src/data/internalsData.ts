// All content data for the Claude Internals section

export interface InternalsConcept {
  id: string;
  title: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  tagline: string;
  purpose: string;
  scope: string;
  whenUsed: string;
  priority: number;
  syntax?: string;
  goodExample?: string;
  badExample?: string;
  relatedIds: string[];
  mistakes: string[];
  tips: string[];
}

export interface ExecutionStep {
  id: number;
  title: string;
  description: string;
  detail: string;
  icon: string;
  color: string;
  timing: string;
  layer: string;
}

export interface PromptLayer {
  id: string;
  name: string;
  priority: number;
  description: string;
  color: string;
  example: string;
  canOverride: string[];
  overriddenBy: string[];
}

export interface CommonMistake {
  id: string;
  category: string;
  mistake: string;
  why: string;
  fix: string;
  severity: 'critical' | 'high' | 'medium';
}

export interface ToolStep {
  id: number;
  label: string;
  description: string;
  color: string;
  icon: string;
}

export interface McpComponent {
  id: string;
  name: string;
  role: string;
  color: string;
  icon: string;
  connects: string[];
}

// ─── Execution Steps ──────────────────────────────────────────────────────────

export const executionSteps: ExecutionStep[] = [
  {
    id: 1, title: 'User Message Received',
    description: 'Input arrives via API or Claude Code CLI',
    detail: 'The user\'s message is received and parsed. Token count is measured. Message is added to conversation history.',
    icon: '📨', color: '#0ea5e9', timing: '~0ms', layer: 'Transport',
  },
  {
    id: 2, title: 'System Prompt Injected',
    description: 'Operator-level instructions prepended to context',
    detail: 'System prompt is the highest-priority instruction layer. Set by the operator (developer), not the user. Defines Claude\'s role, constraints, and output format.',
    icon: '🔒', color: '#8b5cf6', timing: '~1ms', layer: 'System',
  },
  {
    id: 3, title: 'CLAUDE.md Loaded',
    description: 'Project memory files injected into context',
    detail: 'Claude Code reads CLAUDE.md from the project root and parent directories. Contents are injected as persistent memory. Multiple CLAUDE.md files stack — child overrides parent.',
    icon: '📄', color: '#10b981', timing: '~2ms', layer: 'Memory',
  },
  {
    id: 4, title: 'Tool Definitions Parsed',
    description: 'Available tools registered with schemas',
    detail: 'All tool definitions (JSON Schema format) are loaded from MCP servers and local configs. The model receives tool schemas but does NOT yet execute any tools.',
    icon: '🔧', color: '#f59e0b', timing: '~3ms', layer: 'Tools',
  },
  {
    id: 5, title: 'MCP Servers Initialized',
    description: 'External tool providers connected',
    detail: 'MCP servers are connected via stdio or SSE transport. Tool capabilities from each server are merged into the tool registry. Server health is verified.',
    icon: '🌐', color: '#6366f1', timing: '~10ms', layer: 'MCP',
  },
  {
    id: 6, title: 'Context Window Assembled',
    description: 'All context layers merged into single prompt',
    detail: 'System prompt + CLAUDE.md + conversation history + retrieved context + tool definitions are merged. Token budget is allocated across all layers. Overflow triggers compression or pruning.',
    icon: '🧩', color: '#ec4899', timing: '~5ms', layer: 'Context',
  },
  {
    id: 7, title: 'Model Reasoning',
    description: 'Claude processes the assembled context',
    detail: 'The model runs inference on the full assembled context. With extended thinking enabled, Claude generates an internal scratchpad before the final response. Sampling parameters (temperature, top_p) applied.',
    icon: '🧠', color: '#0ea5e9', timing: '500ms–30s', layer: 'Model',
  },
  {
    id: 8, title: 'Tool Calls Executed',
    description: 'Model invokes tools as needed (may repeat)',
    detail: 'If the model decides to use a tool, it outputs a structured tool_use block. The system executes the tool, returns tool_result, and feeds it back to the model. This loop repeats until the model produces a final answer.',
    icon: '⚙️', color: '#f97316', timing: '100ms–60s', layer: 'Execution',
  },
  {
    id: 9, title: 'Response Validated',
    description: 'Output checked against safety and format rules',
    detail: 'Constitutional AI principles applied. Content policy checks run. If structured output mode is active, schema validation occurs. Failed validation triggers regeneration.',
    icon: '✅', color: '#10b981', timing: '~50ms', layer: 'Safety',
  },
  {
    id: 10, title: 'Response Delivered',
    description: 'Final output streamed or returned to client',
    detail: 'With streaming: tokens delivered incrementally via SSE. Without streaming: complete response returned as JSON. Usage metrics (input/output tokens) included in response metadata.',
    icon: '📤', color: '#64748b', timing: '~0ms', layer: 'Transport',
  },
];

// ─── Prompt Layers ────────────────────────────────────────────────────────────

export const promptLayers: PromptLayer[] = [
  {
    id: 'system', name: 'System Prompt', priority: 1,
    description: 'Highest priority. Set by the operator/developer. Defines Claude\'s persona, constraints, and behavior.',
    color: '#8b5cf6',
    example: 'You are a helpful coding assistant for Acme Corp. Only discuss topics related to software development.',
    canOverride: ['developer', 'claudemd', 'memory', 'user', 'tool', 'runtime'],
    overriddenBy: [],
  },
  {
    id: 'developer', name: 'Developer Prompt', priority: 2,
    description: 'API-level additional instructions. Supplements the system prompt.',
    color: '#6366f1',
    example: 'Always format code in Python 3.10+. Return responses as JSON when requested.',
    canOverride: ['claudemd', 'memory', 'user', 'tool', 'runtime'],
    overriddenBy: ['system'],
  },
  {
    id: 'claudemd', name: 'CLAUDE.md / Memory Files', priority: 3,
    description: 'Project-specific persistent context. Injected by Claude Code from the filesystem.',
    color: '#10b981',
    example: '# My Project\n- Use TypeScript strict mode\n- All tests must use Vitest\n- No console.log in production code',
    canOverride: ['memory', 'user', 'tool', 'runtime'],
    overriddenBy: ['system', 'developer'],
  },
  {
    id: 'memory', name: 'Retrieved Memory', priority: 4,
    description: 'Long-term memories retrieved from storage (Mem0, vector DB, etc.)',
    color: '#0ea5e9',
    example: 'User prefers concise answers. Previously discussed: React Query v5 migration.',
    canOverride: ['user', 'tool', 'runtime'],
    overriddenBy: ['system', 'developer', 'claudemd'],
  },
  {
    id: 'user', name: 'User Message', priority: 5,
    description: 'The current user input. Cannot override system or developer constraints.',
    color: '#f59e0b',
    example: 'How do I implement optimistic updates with React Query?',
    canOverride: ['tool', 'runtime'],
    overriddenBy: ['system', 'developer', 'claudemd', 'memory'],
  },
  {
    id: 'tool', name: 'Tool Outputs', priority: 6,
    description: 'Results returned from tool executions. Grounded facts that inform the response.',
    color: '#f97316',
    example: '{"search_results": [{"title": "React Query v5 Docs", "content": "..."}]}',
    canOverride: ['runtime'],
    overriddenBy: ['system', 'developer', 'claudemd', 'memory', 'user'],
  },
  {
    id: 'runtime', name: 'Runtime Context', priority: 7,
    description: 'Injected metadata: timestamps, user ID, session info. Lowest priority.',
    color: '#64748b',
    example: 'Current time: 2024-01-15. Session ID: abc123. User role: admin.',
    canOverride: [],
    overriddenBy: ['system', 'developer', 'claudemd', 'memory', 'user', 'tool'],
  },
];

// ─── Internal files ───────────────────────────────────────────────────────────

export const internalFiles: InternalsConcept[] = [
  {
    id: 'claude-md',
    title: 'CLAUDE.md',
    icon: '📝',
    badge: 'Memory File',
    badgeColor: '#10b981',
    tagline: 'Persistent project context that Claude remembers across sessions',
    purpose: 'Provides Claude Code with project-specific instructions, coding standards, team preferences, and context that persists across conversations.',
    scope: 'Project-level (and parent directories). Claude reads CLAUDE.md from the current directory and all parent directories, merging them.',
    whenUsed: 'Loaded at the start of every Claude Code session. Injected into the system context before user input.',
    priority: 3,
    syntax: `# Project Name

## Overview
Brief description of what this project does.

## Tech Stack
- TypeScript 5.0+
- React 18
- Vitest for testing

## Key Commands
\`\`\`bash
npm run dev     # Start dev server
npm run test    # Run tests
npm run build   # Production build
\`\`\`

## Coding Standards
- Always use TypeScript strict mode
- Prefer composition over inheritance
- Write tests for all new features

## Important Context
- We use monorepo structure
- API is at /api/v2/
- Never commit .env files`,
    goodExample: `# Auth Service

## Purpose
Handles JWT authentication for all microservices.

## Key Files
- src/auth/middleware.ts — JWT validation
- src/auth/tokens.ts — Token generation

## Standards
- Always validate expiry before checking signature
- Use RS256, never HS256 in production
- Token TTL: access=15m, refresh=7d`,
    badExample: `# Project

Please help me with my project. I'm building a web app.
Remember that I like clean code. Thanks!`,
    relatedIds: ['claude-json', 'system-prompt', 'memory'],
    mistakes: [
      'Writing vague descriptions — "I\'m building a web app" is useless',
      'Forgetting to specify the tech stack and version numbers',
      'Not including key commands (build, test, lint)',
      'Making CLAUDE.md too long — include only what Claude needs, not docs',
      'Duplicating information already in README.md',
    ],
    tips: [
      'Use headers to organize: Overview, Tech Stack, Commands, Standards, Context',
      'Include version numbers for all major dependencies',
      'Put the most critical information first — context window priority',
      'Update CLAUDE.md as the project evolves — treat it as living documentation',
      'Include team conventions that aren\'t obvious from the code',
    ],
  },
  {
    id: 'claude-json',
    title: 'claude.json / .claude/settings.json',
    icon: '⚙️',
    badge: 'Config File',
    badgeColor: '#f59e0b',
    tagline: 'Machine-readable configuration controlling Claude\'s behavior and permissions',
    purpose: 'Configures Claude Code behavior: allowed tools, permission rules, MCP server connections, hooks, and environment variables.',
    scope: 'Project-level. Lives at `.claude/settings.json`. Also has global config at `~/.claude/settings.json`.',
    whenUsed: 'Loaded at Claude Code startup. Merged with global settings (project overrides global).',
    priority: 2,
    syntax: `{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(git commit *)",
      "Read(**/*.ts)",
      "Write(src/**)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Write(**/.env)"
    ]
  },
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "\${GITHUB_TOKEN}"
      }
    }
  },
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{"type": "command", "command": "npm run lint"}]
    }]
  },
  "env": {
    "NODE_ENV": "development"
  }
}`,
    goodExample: `{
  "permissions": {
    "allow": ["Bash(npm run test)", "Read(**/*.ts)"],
    "deny": ["Bash(rm -rf *)", "Write(**/.env)"]
  }
}`,
    badExample: `{
  "permissions": {
    "allow": ["Bash(*)", "Write(*)", "Read(*)"]
  }
}`,
    relatedIds: ['claude-md', 'mcp', 'hooks', 'permissions'],
    mistakes: [
      'Using `Bash(*)` — allows ALL bash commands, including dangerous ones',
      'Not denying writes to .env files explicitly',
      'Forgetting to set environment variables needed by MCP servers',
      'Mixing project and global settings — understand the merge order',
    ],
    tips: [
      'Start with minimal permissions and add as needed',
      'Use glob patterns: `Bash(npm run *)` is safer than `Bash(*)`',
      'Test your permission rules before production deployment',
      'Keep sensitive values in environment variables, not in settings.json',
    ],
  },
  {
    id: 'system-prompt',
    title: 'System Prompt',
    icon: '🔒',
    badge: 'Highest Priority',
    badgeColor: '#8b5cf6',
    tagline: 'The operator\'s instruction layer — highest priority in the context hierarchy',
    purpose: 'Defines Claude\'s role, persona, constraints, output format, and behavior for a specific application or use case.',
    scope: 'Per-request. Set via the `system` parameter in the API. Cannot be overridden by users.',
    whenUsed: 'Injected at the very beginning of every request context, before any user messages.',
    priority: 1,
    syntax: `// API request
{
  "model": "claude-opus-4-5",
  "system": "You are a helpful assistant for Acme Corp's internal tools. Rules:\\n1. Only discuss topics related to our internal systems\\n2. Never share confidential pricing\\n3. Always respond in English\\n4. Format all code blocks with proper syntax highlighting",
  "messages": [{
    "role": "user",
    "content": "How do I reset a password?"
  }]
}`,
    goodExample: `You are a senior TypeScript engineer assistant. Your role is to:
1. Review code for type safety and best practices
2. Suggest improvements with clear explanations
3. Never introduce breaking changes without explicit approval
4. Format all code examples in TypeScript with strict mode`,
    badExample: `You are a helpful assistant. Be nice and helpful.`,
    relatedIds: ['claude-md', 'prompt-layers', 'api-config'],
    mistakes: [
      'Making system prompts too vague — "be helpful" provides no real constraint',
      'Trying to prevent jailbreaks purely with system prompt — use layered safety',
      'Putting dynamic content in system prompts (use user messages instead)',
      'Ignoring that system prompts consume significant token budget',
    ],
    tips: [
      'Be specific: define the role, constraints, output format, and persona separately',
      'Test system prompts adversarially — try to break them yourself',
      'Keep system prompts as short as possible while being complete',
      'Use numbered rules for constraints — easier for the model to follow',
    ],
  },
];

// ─── Tool Calling Steps ───────────────────────────────────────────────────────

export const toolSteps: ToolStep[] = [
  { id: 1, label: 'Tool Schemas Loaded', description: 'JSON Schema definitions registered', color: '#6366f1', icon: '📋' },
  { id: 2, label: 'Model Decides', description: 'Claude evaluates if a tool call is needed', color: '#8b5cf6', icon: '🧠' },
  { id: 3, label: 'tool_use Block Generated', description: 'Structured call with name + arguments', color: '#0ea5e9', icon: '📤' },
  { id: 4, label: 'Arguments Validated', description: 'Schema validation against input_schema', color: '#f59e0b', icon: '✅' },
  { id: 5, label: 'Tool Executed', description: 'External function called with validated args', color: '#10b981', icon: '⚙️' },
  { id: 6, label: 'tool_result Returned', description: 'Output fed back into model context', color: '#f97316', icon: '📥' },
  { id: 7, label: 'Model Continues', description: 'Reasoning continues with new information', color: '#ec4899', icon: '🔄' },
];

// ─── MCP Components ───────────────────────────────────────────────────────────

export const mcpComponents: McpComponent[] = [
  { id: 'claude', name: 'Claude (Host)', role: 'MCP client that initiates connections', color: '#0ea5e9', icon: '🤖', connects: ['client'] },
  { id: 'client', name: 'MCP Client', role: 'Protocol implementation layer inside Claude', color: '#8b5cf6', icon: '📡', connects: ['server'] },
  { id: 'server', name: 'MCP Server', role: 'External process exposing tools and resources', color: '#10b981', icon: '🖥️', connects: ['tools', 'resources'] },
  { id: 'tools', name: 'Tools', role: 'Callable functions (bash, search, write, etc.)', color: '#f59e0b', icon: '🔧', connects: [] },
  { id: 'resources', name: 'Resources', role: 'Readable assets (files, URIs, database rows)', color: '#f97316', icon: '📦', connects: [] },
];

// ─── Common Mistakes ──────────────────────────────────────────────────────────

export const commonMistakes: CommonMistake[] = [
  {
    id: 'm1', category: 'Permissions',
    mistake: 'Allow all Bash commands: `"allow": ["Bash(*)"]`',
    why: 'Gives Claude unrestricted shell access including destructive commands like rm -rf, dd, shutdown',
    fix: 'Use specific patterns: `Bash(npm run *)`, `Bash(git status)`, deny dangerous commands explicitly',
    severity: 'critical',
  },
  {
    id: 'm2', category: 'CLAUDE.md',
    mistake: 'Writing vague instructions like "write clean code"',
    why: '"Clean code" means different things to different people and provides no actionable guidance',
    fix: 'Be specific: "Use TypeScript strict mode, prefer pure functions, max 50 lines per function, write unit tests for all exports"',
    severity: 'high',
  },
  {
    id: 'm3', category: 'System Prompt',
    mistake: 'Putting user-specific data in the system prompt',
    why: 'System prompts are cached and shared. User-specific data belongs in user messages, not the system layer',
    fix: 'Keep system prompts static and generic. Pass user-specific context in the user message or via tools',
    severity: 'high',
  },
  {
    id: 'm4', category: 'Tool Schemas',
    mistake: 'Writing vague tool descriptions: `"description": "does stuff"`',
    why: 'The model uses the description to decide when and how to call a tool. Vague descriptions cause wrong tool selection',
    fix: 'Write precise descriptions: what the tool does, when to use it, what it returns, and any important constraints',
    severity: 'critical',
  },
  {
    id: 'm5', category: 'Context Management',
    mistake: 'Assuming large context window = perfect recall',
    why: 'Models suffer from "lost in the middle" — items in the center of a long context are recalled less reliably',
    fix: 'Put critical information at the start or end of context. Use RAG to surface relevant chunks when needed',
    severity: 'high',
  },
  {
    id: 'm6', category: 'MCP Security',
    mistake: 'Connecting MCP servers with no authentication',
    why: 'Unauthenticated MCP servers can be accessed by any process. Malicious tools can exfiltrate data or execute code',
    fix: 'Always use authentication tokens, validate server certificates, run MCP servers in sandboxed environments',
    severity: 'critical',
  },
  {
    id: 'm7', category: 'Prompt Layers',
    mistake: 'Conflicting instructions across layers',
    why: 'When system prompt says "always respond in English" and CLAUDE.md says "respond in the user\'s language", behavior is unpredictable',
    fix: 'Audit all instruction layers for conflicts. System prompt wins — use it for non-negotiable constraints',
    severity: 'medium',
  },
  {
    id: 'm8', category: 'Retries',
    mistake: 'Blind retry loops without termination conditions',
    why: 'An agent retrying forever on a broken tool burns tokens, costs money, and never makes progress',
    fix: 'Always set max_retries (3–5), add exponential backoff, detect non-transient errors and fail fast',
    severity: 'high',
  },
];

// ─── Best Practices ───────────────────────────────────────────────────────────

export interface BestPractice {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  icon: string;
}

export const bestPractices: BestPractice[] = [
  { id: 'bp1', category: 'CLAUDE.md', title: 'Structure with clear headers', description: 'Use H2 headers for Overview, Tech Stack, Commands, Standards, Context. Claude processes structured text better.', impact: 'high', effort: 'low', icon: '📝' },
  { id: 'bp2', category: 'CLAUDE.md', title: 'Include exact commands', description: 'List the exact commands for build, test, lint, dev. Claude uses these when asked to run tasks.', impact: 'high', effort: 'low', icon: '⌨️' },
  { id: 'bp3', category: 'Permissions', title: 'Principle of least privilege', description: 'Start with minimal permissions. Add specific patterns only when needed. Deny dangerous patterns explicitly.', impact: 'high', effort: 'low', icon: '🔐' },
  { id: 'bp4', category: 'System Prompt', title: 'Separate concerns into numbered rules', description: 'Number each constraint. "1. Only discuss X. 2. Never do Y." is clearer than a paragraph of instructions.', impact: 'high', effort: 'low', icon: '📋' },
  { id: 'bp5', category: 'Tool Schemas', title: 'Write tool descriptions as instructions', description: 'Write: "Use this tool to search the web for real-time information. Returns top 5 results with URLs and snippets." Not: "Search tool."', impact: 'high', effort: 'medium', icon: '🔧' },
  { id: 'bp6', category: 'MCP', title: 'Validate MCP server responses', description: 'Always validate tool outputs before using them. MCP servers can return unexpected formats or errors.', impact: 'high', effort: 'medium', icon: '✅' },
  { id: 'bp7', category: 'Context', title: 'Put critical info at context boundaries', description: 'Critical facts belong at the start or end of context windows. Middle placement causes "lost in the middle" recall degradation.', impact: 'medium', effort: 'low', icon: '📍' },
  { id: 'bp8', category: 'Hooks', title: 'Use PostToolUse hooks for validation', description: 'Run linting, tests, or security checks after tool use to catch issues before Claude continues.', impact: 'medium', effort: 'medium', icon: '🪝' },
  { id: 'bp9', category: 'Evals', title: 'Test config changes with eval suites', description: 'Any change to CLAUDE.md, system prompts, or tool schemas should be tested against your eval suite before deployment.', impact: 'high', effort: 'high', icon: '🧪' },
  { id: 'bp10', category: 'Security', title: 'Sandbox all code execution', description: 'Run code-executing agents in Docker containers with no network access, read-only filesystem outside designated paths.', impact: 'high', effort: 'high', icon: '🛡️' },
];

// ─── Navigation sections ──────────────────────────────────────────────────────

export interface InternalsSection {
  id: string;
  title: string;
  icon: string;
  badge?: string;
  description: string;
}

export const internalsSections: InternalsSection[] = [
  { id: 'overview', title: 'Architecture Overview', icon: '🗺️', description: 'Visual system architecture with clickable nodes' },
  { id: 'execution-flow', title: 'Execution Flow', icon: '⚡', badge: 'Animated', description: 'Step-by-step animated execution timeline' },
  { id: 'claude-md', title: 'CLAUDE.md Explorer', icon: '📝', description: 'Syntax, scope, examples, and anti-patterns' },
  { id: 'claude-json', title: 'Settings & Config', icon: '⚙️', description: 'claude.json / .claude/settings.json deep dive' },
  { id: 'system-prompt', title: 'System Prompts', icon: '🔒', description: 'Operator instructions and the authority hierarchy' },
  { id: 'prompt-layers', title: 'Prompt Layers', icon: '🥞', badge: 'Visual', description: 'Priority stack — which layer wins conflicts' },
  { id: 'tool-calling', title: 'Tool Calling', icon: '🔧', badge: 'Animated', description: 'From tool schema to execution and result merging' },
  { id: 'memory-context', title: 'Memory & Context', icon: '🧠', description: 'Token budgets, compression, and recall strategies' },
  { id: 'mcp', title: 'MCP Integration', icon: '🌐', description: 'Protocol architecture, servers, transports, security' },
  { id: 'hooks', title: 'Hooks & Automation', icon: '🪝', description: 'PreToolUse, PostToolUse, Stop event hooks' },
  { id: 'permissions', title: 'Permissions', icon: '🔐', description: 'Allow/deny rules, glob patterns, trust levels' },
  { id: 'mistakes', title: 'Common Mistakes', icon: '⚠️', badge: 'Important', description: 'The top mistakes teams make — and the fixes' },
  { id: 'best-practices', title: 'Best Practices', icon: '✨', description: 'Proven patterns from production Claude systems' },
  { id: 'comparisons', title: 'Comparisons', icon: '↔️', description: 'CLAUDE.md vs claude.json, System vs User, MCP vs Tools' },
];
