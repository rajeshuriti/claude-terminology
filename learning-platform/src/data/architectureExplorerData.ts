export type NodeLayer = 0 | 1 | 2 | 3 | 4;
export type NodeType = 'config' | 'claude-config' | 'app' | 'service' | 'agent' | 'mcp-node' | 'package' | 'infra' | 'ops' | 'docs-node';
export type RelType = 'calls' | 'uses' | 'configures' | 'monitors' | 'deploys' | 'extends';
export type ActorType = 'user' | 'claude' | 'system' | 'mcp' | 'service' | 'agent' | 'infra';
export type Complexity = 'starter' | 'growing' | 'scaling' | 'enterprise';

export interface ArchRelationship {
  targetId: string;
  type: RelType;
  label: string;
}

export interface ArchSubItem {
  name: string;
  emoji: string;
  description: string;
  example?: string;
}

export interface ArchNode {
  id: string;
  label: string;
  emoji: string;
  type: NodeType;
  layer: NodeLayer;
  color: string;
  tagline: string;
  whatItIs: string;
  whyItExists: string;
  analogy: string;
  analogyDetail: string;
  useCases: string[];
  subItems?: ArchSubItem[];
  relationships: ArchRelationship[];
  complexity: Complexity;
  security?: string;
}

export interface FlowStep {
  id: string;
  actor: string;
  actorType: ActorType;
  action: string;
  detail: string;
}

export interface FlowSimulation {
  id: string;
  title: string;
  emoji: string;
  description: string;
  complexity: Complexity;
  steps: FlowStep[];
}

export interface EvolutionStage {
  stage: number;
  title: string;
  subtitle: string;
  description: string;
  addedItems: string[];
  complexity: Complexity;
  teamSize: string;
  whenToAdopt: string;
  antiPattern: string;
}

export interface ArchPattern {
  id: string;
  type: 'anti-pattern' | 'good-pattern';
  title: string;
  description: string;
  example: string;
  consequence: string;
  fix?: string;
  category: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export const LAYER_META: Record<NodeLayer, { label: string; color: string; description: string }> = {
  0: { label: 'Global Config', color: '#8b5cf6', description: 'Root-level rules that govern the entire system and every Claude session' },
  1: { label: 'Claude Config', color: '#0ea5e9', description: 'Claude-native intelligence layer — rules, commands, skills, workflows' },
  2: { label: 'Application', color: '#10b981', description: 'User-facing apps and backend services that deliver business value' },
  3: { label: 'AI Core', color: '#f59e0b', description: 'Autonomous agents and MCP connectors — Claude gains hands and autonomy' },
  4: { label: 'Foundation', color: '#6366f1', description: 'Shared packages, infrastructure, testing, docs, and CI/CD automation' },
};

export const archNodes: ArchNode[] = [
  {
    id: 'claude-md',
    label: 'CLAUDE.md',
    emoji: '📋',
    type: 'config',
    layer: 0,
    color: '#8b5cf6',
    tagline: 'Global intelligence contract — the constitution of your AI engineering system',
    whatItIs: 'CLAUDE.md is the root-level instruction file that defines how Claude operates across the entire repository. Every Claude Code session auto-loads this file before executing any task — it is the first thing Claude reads, every single time.',
    whyItExists: 'Without CLAUDE.md, Claude operates with generic defaults and you re-explain your stack every session. With it, Claude instantly knows your architecture, conventions, constraints, and engineering standards — no onboarding needed.',
    analogy: 'The constitution of your AI engineering team',
    analogyDetail: 'A constitution sets the supreme laws that all participants must follow. CLAUDE.md sets the supreme rules that Claude must follow in every interaction: commands, styles, path aliases, deployment config, and pointers to deeper rule files. Everything else inherits from it.',
    useCases: [
      'Define build/test/lint commands once — Claude runs the right command automatically',
      'Document TypeScript constraints so Claude never introduces type errors',
      'Map path aliases (@/ → src/) so Claude never writes wrong imports',
      'Point to .claude/rules/ for detailed convention enforcement',
      'Document deployment quirks (e.g., vercel.json at repo root, not in app/)',
    ],
    subItems: [
      { name: 'Commands section', emoji: '⚡', description: 'All build, dev, lint, test commands. Claude reads before executing any task.', example: 'npm run dev, npx tsc --noEmit' },
      { name: 'Architecture section', emoji: '🏗️', description: 'Stack overview, key files, path aliases. Prevents Claude from re-discovering what already exists.', example: '@/ → src/, React Router v7 in App.tsx' },
      { name: 'Rules references', emoji: '📖', description: 'Pointers to .claude/rules/*.md for detailed constraint documentation. Keeps CLAUDE.md concise.' },
      { name: 'Deployment notes', emoji: '🚀', description: 'Non-obvious deployment facts. Where config lives, how builds work, environment differences.', example: 'vercel.json at repo root — not inside learning-platform/' },
    ],
    relationships: [
      { targetId: 'claude-dir', type: 'configures', label: 'references rules in' },
      { targetId: 'apps', type: 'configures', label: 'governs conventions for' },
      { targetId: 'services', type: 'configures', label: 'governs conventions for' },
    ],
    complexity: 'starter',
    security: 'Never put secrets, API keys, or internal endpoints here. CLAUDE.md is committed to version control and injected into Claude context — treat it as public documentation.',
  },
  {
    id: 'claude-dir',
    label: '.claude/',
    emoji: '🧠',
    type: 'claude-config',
    layer: 1,
    color: '#0ea5e9',
    tagline: 'The operating system kernel for your AI engineering team',
    whatItIs: '.claude/ is the Claude Code configuration directory. It shapes how Claude thinks and operates in this specific project: engineering rules, slash commands, specialized skills, workflow procedures, playbooks, templates, and background context.',
    whyItExists: 'Without .claude/, engineers re-explain context every session. With .claude/, Claude has persistent engineering memory — it knows the rules, has ready-made commands, and understands operational standards without prompting. It compounds in value as the project grows.',
    analogy: 'The OS kernel of your AI engineering team',
    analogyDetail: 'An OS kernel provides core capabilities (memory management, I/O, scheduling) that all applications rely on without thinking. .claude/ provides core AI capabilities all engineering operations rely on: rules (constraints), commands (operations), skills (capabilities), workflows (procedures). Every Claude interaction runs on top of it.',
    useCases: [
      'rules/ — enforce TypeScript strictness, dark mode patterns, component APIs',
      'commands/ — /add-page, /fix-ts, /add-enriched-content slash commands',
      'skills/ — inject domain expert knowledge (security auditor, RAG specialist)',
      'workflows/ — multi-step procedures for complex tasks like releases or migrations',
      'playbooks/ — incident response, rollback procedures, emergency operations',
    ],
    subItems: [
      { name: 'rules/', emoji: '📏', description: 'Engineering laws Claude must follow. Like coding standards, but enforced by AI through context injection.', example: 'dark-mode.md, typescript.md, components.md' },
      { name: 'commands/', emoji: '⚡', description: 'Slash commands that trigger predefined prompts. Like keyboard shortcuts for complex multi-step operations.', example: '/add-page, /fix-ts, /add-enriched-content' },
      { name: 'skills/', emoji: '🎯', description: 'Expert knowledge modules injected into Claude context for specific domains. Claude temporarily "becomes" the expert.', example: 'security-auditor.md, rag-specialist.md' },
      { name: 'workflows/', emoji: '🔄', description: 'Multi-step operational procedures for complex engineering tasks. Like runbooks but for AI collaboration.', example: 'deploy-workflow.md, migration-workflow.md' },
      { name: 'playbooks/', emoji: '📚', description: 'Emergency and incident response procedures. Activated when things go wrong.', example: 'incident-response.md, rollback.md, data-recovery.md' },
      { name: 'templates/', emoji: '📄', description: 'Boilerplate starters for new pages, components, or services following project conventions exactly.', example: 'page-template.md, service-template.md' },
      { name: 'examples/', emoji: '💡', description: 'Reference implementations showing correct patterns. Prevents Claude from inventing approaches that conflict with existing patterns.', example: 'correct-dark-mode.tsx, correct-error-handling.ts' },
      { name: 'context/', emoji: '📦', description: 'Background knowledge injected on demand into specific sessions. Domain expertise without polluting CLAUDE.md.', example: 'business-context.md, user-research.md, architecture-history.md' },
    ],
    relationships: [
      { targetId: 'claude-md', type: 'extends', label: 'extends config from' },
      { targetId: 'apps', type: 'configures', label: 'enforces patterns in' },
      { targetId: 'services', type: 'configures', label: 'enforces patterns in' },
      { targetId: 'agents', type: 'configures', label: 'defines behavior rules for' },
    ],
    complexity: 'starter',
    security: 'Rules and commands inject into Claude context — never put credentials, internal IPs, or sensitive architecture details that should not reach an AI model.',
  },
  {
    id: 'apps',
    label: 'apps/',
    emoji: '📱',
    type: 'app',
    layer: 2,
    color: '#10b981',
    tagline: 'User-facing applications — the storefront of your engineering system',
    whatItIs: 'apps/ contains all end-user-facing applications in the monorepo. Each subdirectory is a deployable application: a web dashboard, CLI tool, mobile app, customer portal, or admin interface.',
    whyItExists: 'Separating apps/ from services/ creates a clear boundary: apps own presentation and user interaction, services own business logic and data. Prevents UI concerns from bleeding into backend systems, and allows independent deployment and ownership.',
    analogy: 'The storefront of a shopping mall',
    analogyDetail: 'Mall storefronts are what customers see and interact with. They display products and take orders — but they do not run the supply chain, warehouse, or payment systems. apps/ handles what users see and touch; services/ handles the underlying systems. Same shopping experience, clean operational separation.',
    useCases: [
      'web/ — React dashboard for monitoring AI orchestration pipelines',
      'cli/ — Developer CLI tool for interacting with AI services locally',
      'dashboard/ — Admin panel for managing agents, reviewing audit logs',
      'mobile/ — Mobile app with Claude-powered intelligent features',
      'portal/ — Customer-facing chat interface backed by Claude agents',
    ],
    subItems: [
      { name: 'web/', emoji: '🌐', description: 'Main user interface. React/Next.js. Connects to services via gateway API.' },
      { name: 'cli/', emoji: '💻', description: 'Command-line tools for developers and operators who prefer terminal workflows.' },
      { name: 'dashboard/', emoji: '📊', description: 'Internal admin/monitoring interface. Shows agent status, AI metrics, audit logs.' },
    ],
    relationships: [
      { targetId: 'services', type: 'calls', label: 'calls APIs from' },
      { targetId: 'packages', type: 'uses', label: 'imports shared UI from' },
      { targetId: 'claude-dir', type: 'uses', label: 'follows coding rules from' },
    ],
    complexity: 'starter',
    security: 'Apps are the primary attack surface. Implement CSP headers, sanitize all inputs, never expose service credentials to the browser, and validate all API responses.',
  },
  {
    id: 'services',
    label: 'services/',
    emoji: '⚙️',
    type: 'service',
    layer: 2,
    color: '#3b82f6',
    tagline: 'Backend services — focused API units, each owning one domain',
    whatItIs: 'services/ contains all backend microservices. These are independently deployable units handling business logic, data management, AI orchestration, authentication, and external integrations. Each service owns one domain completely.',
    whyItExists: 'A monolithic backend grows too complex too fast when Claude is involved — AI orchestration, vector search, auth, and analytics have very different scaling and change patterns. Services split by domain allow independent scaling, deployment, and ownership without coordination overhead.',
    analogy: 'The departments of a large organization',
    analogyDetail: 'A company has HR, Finance, Engineering, and Sales — each with its own expertise and independent operations. services/ has auth (HR for identity), ai-orchestrator (Engineering for Claude), vector-service (data management), and analytics (Finance for metrics). Each runs independently, communicates via defined contracts.',
    useCases: [
      'ai-orchestrator routes user messages to Claude with proper context and tool definitions',
      'vector-service stores and searches embeddings for RAG-powered knowledge retrieval',
      'auth-service manages JWT tokens, OAuth2 flows, and permission scopes',
      'analytics-service tracks AI performance metrics and hallucination rates over time',
      'gateway-service handles rate limiting, routing, and auth verification for all traffic',
    ],
    subItems: [
      { name: 'auth-service/', emoji: '🔐', description: 'Identity, JWT generation, OAuth2. The trust anchor — all other services verify tokens it issues.', example: 'POST /auth/token, POST /auth/refresh, GET /auth/me' },
      { name: 'ai-orchestrator/', emoji: '🎭', description: 'Routes requests to Claude, manages conversation state, handles tool use lifecycle and MCP connections.', example: 'POST /ai/chat, GET /ai/conversations/:id' },
      { name: 'vector-service/', emoji: '🔢', description: 'Embedding storage and similarity search. Powers RAG — finding relevant context before sending to Claude.', example: 'POST /vectors/upsert, POST /vectors/search?limit=5' },
      { name: 'analytics-service/', emoji: '📈', description: 'AI evaluation metrics, user behavior tracking, hallucination rate monitoring.', example: 'POST /events/track, GET /metrics/accuracy?period=7d' },
      { name: 'gateway-service/', emoji: '🚪', description: 'Single entry point for all external traffic. Rate limits, validates auth, routes to correct service.', example: 'All external traffic → gateway → correct service' },
    ],
    relationships: [
      { targetId: 'apps', type: 'calls', label: 'serves APIs to' },
      { targetId: 'agents', type: 'calls', label: 'triggers and coordinates' },
      { targetId: 'mcp', type: 'uses', label: 'uses external tools via' },
      { targetId: 'packages', type: 'uses', label: 'imports shared types from' },
      { targetId: 'infra', type: 'deploys', label: 'deployed and scaled by' },
    ],
    complexity: 'growing',
    security: 'Validate auth at each service independently. Never trust internal service calls without mTLS or service mesh security. Per-service rate limits prevent cascade failures.',
  },
  {
    id: 'agents',
    label: 'agents/',
    emoji: '🤖',
    type: 'agent',
    layer: 3,
    color: '#f59e0b',
    tagline: 'Autonomous AI workers — Claude-powered specialists for complex multi-step tasks',
    whatItIs: 'agents/ contains autonomous Claude-powered workers that execute multi-step tasks without constant human supervision. Each agent has a specialty: planning, executing code, retrieving information, monitoring systems, or orchestrating other agents.',
    whyItExists: 'Single Claude API calls cannot handle complex tasks requiring tool use, state management across many steps, error recovery, and sequential decision-making. Agents give Claude a persistent operational loop: perceive → plan → act → observe → repeat — until the task is complete.',
    analogy: 'A team of specialized digital workers in an AI company',
    analogyDetail: 'A software team has a project manager (planner), developers (executors), researchers (retrieval), QA engineers (monitors), and a tech lead (orchestrator). agents/ mirrors this structure with autonomous AI workers. They coordinate through message passing and shared state, just like a human team — but they never sleep.',
    useCases: [
      'Planner agent decomposes "Build an auth system" into a DAG of 12 subtasks',
      'Coding agent reads spec, writes code, runs tests, fixes errors — iterates until passing',
      'Research agent searches docs and codebases before executor writes anything new',
      'Monitoring agent watches AI response quality and triggers alerts on degradation',
      'Orchestrator agent coordinates the full pipeline from goal to deployed feature',
    ],
    subItems: [
      { name: 'planner-agent/', emoji: '📋', description: 'Receives high-level goals, decomposes into task DAG, assigns to specialist agents.', example: '"Build login system" → [design schema, write service, write tests, update docs, deploy]' },
      { name: 'executor-agent/', emoji: '⚡', description: 'Receives concrete tasks, executes them: writes code, runs commands, edits files, calls APIs.', example: 'Writes createUser(), hashPassword(), generateJWT() — runs tests after each' },
      { name: 'retrieval-agent/', emoji: '🔍', description: 'Searches codebases, documentation, vector stores. Answers "what already exists?" before anything is built.', example: 'Finds existing auth patterns before executor reinvents them' },
      { name: 'monitoring-agent/', emoji: '📊', description: 'Continuously watches system metrics, AI response quality, and agent outputs. Triggers alerts on anomalies.', example: 'Hallucination rate spike → alert team. Error rate spike → auto-rollback trigger.' },
      { name: 'orchestrator-agent/', emoji: '🎯', description: 'The conductor. Manages work queue, coordinates agent handoffs, ensures task completion end-to-end.', example: 'Ensures planner → retrieval → executor → monitoring pipeline runs to completion' },
    ],
    relationships: [
      { targetId: 'mcp', type: 'uses', label: 'uses external tools via' },
      { targetId: 'services', type: 'calls', label: 'calls ai-orchestrator in' },
      { targetId: 'packages', type: 'uses', label: 'uses ai-sdk from' },
      { targetId: 'infra', type: 'deploys', label: 'deployed and scheduled by' },
    ],
    complexity: 'scaling',
    security: 'Agents have significant system access. Apply least-privilege tool permissions per agent, audit every action, sandbox execution, and require human approval for destructive operations.',
  },
  {
    id: 'mcp',
    label: 'mcp/',
    emoji: '🔌',
    type: 'mcp-node',
    layer: 3,
    color: '#ec4899',
    tagline: 'Model Context Protocol — Claude\'s external nervous system',
    whatItIs: 'mcp/ contains all MCP server implementations and connector configurations. MCP is the protocol that lets Claude interact with external tools, databases, APIs, and services in a safe, structured, auditable way. It is how Claude gains hands.',
    whyItExists: 'Claude\'s reasoning is only as useful as its ability to interact with real systems. Without MCP, Claude works only with information in its context window. With MCP, Claude can read databases, call APIs, search the web, execute code, and interact with any external system that exposes an MCP server.',
    analogy: 'The USB port system of an AI computer',
    analogyDetail: 'USB standardizes how peripherals (keyboards, drives, cameras) connect to any computer regardless of manufacturer. MCP standardizes how tools (databases, APIs, services) connect to Claude regardless of provider. Any tool that speaks MCP is instantly available to any Claude-powered system — plug-and-play AI capabilities.',
    useCases: [
      'Database connector lets Claude read production data to answer questions with real facts',
      'GitHub connector lets Claude create branches, read PRs, and commit code changes',
      'Search connector gives Claude real-time information beyond its training cutoff',
      'Monitoring connector lets Claude read metrics and create alerts autonomously',
      'Internal API connector exposes company knowledge base to Claude agents',
    ],
    subItems: [
      { name: 'servers/', emoji: '🖥️', description: 'MCP server implementations for each tool. Each server exposes typed tools with JSON schema validation.', example: 'postgres-server.ts, github-server.ts, search-server.ts' },
      { name: 'transport/', emoji: '📡', description: 'stdio (local subprocess) and HTTP/SSE (remote). Defines the communication channel between Claude and the tool.', example: 'Local: subprocess stdin/stdout. Remote: HTTPS + SSE event stream' },
      { name: 'auth/', emoji: '🔑', description: 'Credentials and permission scopes for each MCP server. Stored in secrets manager, never in code.', example: 'GitHub OAuth token, Postgres connection DSN, internal service API key' },
      { name: 'tools/', emoji: '🛠️', description: 'Tool definitions with JSON schema. Describes exactly what each tool does, its parameters, and return types.', example: '{ name: "query_db", description: "Run a SELECT query", inputSchema: { sql: string } }' },
    ],
    relationships: [
      { targetId: 'agents', type: 'calls', label: 'provides tool access to' },
      { targetId: 'services', type: 'calls', label: 'exposes tools through' },
    ],
    complexity: 'scaling',
    security: 'MCP servers run with real credentials. Validate all tool inputs against schema, restrict write operations to scoped permissions, never expose unrestricted SQL execution, and log every tool call to the audit trail.',
  },
  {
    id: 'packages',
    label: 'packages/',
    emoji: '📦',
    type: 'package',
    layer: 4,
    color: '#6366f1',
    tagline: 'Shared libraries — build once, use across every app and service',
    whatItIs: 'packages/ contains shared code libraries that multiple apps and services depend on. Each is an independently versioned module: UI components, AI SDK wrapper, shared TypeScript types, telemetry utilities. One source of truth for shared abstractions.',
    whyItExists: 'Without shared packages, every app duplicates the same UI components, type definitions, and Claude API client. packages/ solves DRY at the monorepo level — when you update the AI SDK wrapper, every service gets the fix simultaneously without copy-paste drift.',
    analogy: 'The standard library of your organization',
    analogyDetail: 'Python\'s standard library (os, json, http) provides tools every Python program uses without thinking. packages/ provides organizational equivalents: shared UI components, typed AI clients, standardized logging, and common utilities. Engineers build on it without reinventing it.',
    useCases: [
      'ui-system: Button, Card, Modal shared by all frontend apps — change once, update everywhere',
      'ai-sdk: Typed Claude wrapper with retry logic, streaming, token counting, observability',
      'shared-types: TypeScript interfaces shared between frontend and backend — no type drift',
      'telemetry-sdk: Standardized OpenTelemetry tracing used by every service identically',
      'validation: Shared Zod schemas ensure API contracts are validated consistently',
    ],
    subItems: [
      { name: 'ui-system/', emoji: '🎨', description: 'Design system — components used by all apps. Visual consistency without duplication.', example: '<Button variant="primary">, <Card dm={dm}>, <DataTable>' },
      { name: 'ai-sdk/', emoji: '🤖', description: 'Typed Claude API wrapper with retry, streaming, token counting, and observability hooks built in.', example: 'await ai.complete({ model: "claude-opus-4-7", messages, tools })' },
      { name: 'shared-types/', emoji: '📝', description: 'TypeScript interfaces and Zod schemas shared between services and apps. Single source of truth for data shapes.', example: 'User, ConversationMessage, ToolUseBlock, AIResponse, AgentTask' },
      { name: 'telemetry-sdk/', emoji: '📊', description: 'Standardized logging, distributed tracing, and metrics. Every service instruments the same way.', example: 'logger.info(), span.setAttribute(), metrics.histogram()' },
    ],
    relationships: [
      { targetId: 'apps', type: 'uses', label: 'imported by' },
      { targetId: 'services', type: 'uses', label: 'imported by' },
      { targetId: 'agents', type: 'uses', label: 'imported by' },
    ],
    complexity: 'growing',
  },
  {
    id: 'infra',
    label: 'infra/',
    emoji: '🏗️',
    type: 'infra',
    layer: 4,
    color: '#64748b',
    tagline: 'Infrastructure as code — Kubernetes, Terraform, observability, CI/CD',
    whatItIs: 'infra/ contains all infrastructure defined as code: Kubernetes manifests for container orchestration, Terraform modules for cloud resource provisioning, observability stack configuration, and CI/CD pipeline definitions. The entire system is reproducible from this directory.',
    whyItExists: 'Without infrastructure as code, deployment is manual, error-prone, and undocumented. infra/ makes the full system reproducible: any engineer can spin up a complete environment from scratch. Changes go through code review. Drift between environments becomes impossible.',
    analogy: 'The architectural blueprints and building management systems of a skyscraper',
    analogyDetail: 'A skyscraper\'s blueprints define exactly how it\'s constructed — structure, electrical, plumbing, HVAC. infra/ is those blueprints for your software system: how each service is containerized, how they connect, how they scale, how they\'re monitored, and how they\'re deployed. Without blueprints, every building is built differently.',
    useCases: [
      'Kubernetes HPA scales the AI orchestrator from 2 to 20 pods under load automatically',
      'Terraform provisions a new RDS instance, Redis cluster, and S3 bucket in minutes',
      'Prometheus alerts fire when Claude hallucination rate exceeds 2% threshold',
      'Grafana dashboards show AI-specific metrics: token usage, latency P99, accuracy trends',
      'Helm charts deploy the same services to dev/staging/prod with different configs',
    ],
    subItems: [
      { name: 'kubernetes/', emoji: '☸️', description: 'Deployments, services, ingress, and HPA configs for all services and agents.', example: 'ai-orchestrator with 3→20 pod HPA, vector-service with GPU node affinity' },
      { name: 'terraform/', emoji: '🌍', description: 'Cloud resource definitions: databases, queues, object storage, secrets management.', example: 'RDS Postgres, ElastiCache Redis, S3 buckets, Secrets Manager entries' },
      { name: 'observability/', emoji: '🔭', description: 'Prometheus alert rules, Grafana dashboards, distributed tracing. Critical for debugging AI systems.', example: 'Dashboard: AI accuracy, hallucination rate, tool use latency P99' },
      { name: 'ci-cd/', emoji: '🔄', description: 'Automated build, test, and deploy pipelines. Different flows for apps, services, and agent config changes.' },
    ],
    relationships: [
      { targetId: 'services', type: 'deploys', label: 'deploys and scales' },
      { targetId: 'agents', type: 'deploys', label: 'deploys and schedules' },
      { targetId: 'github', type: 'uses', label: 'triggered by CI in' },
    ],
    complexity: 'scaling',
    security: 'Infra configs contain sensitive details. Use sealed secrets. Never commit plaintext credentials. Implement least-privilege IAM. Scan Terraform plans for security regressions in CI.',
  },
  {
    id: 'tests',
    label: 'tests/',
    emoji: '🧪',
    type: 'ops',
    layer: 4,
    color: '#ef4444',
    tagline: 'Quality assurance — unit, integration, AI evals, and security testing',
    whatItIs: 'tests/ contains the full testing suite. Unlike traditional software, Claude-native systems require AI-specific testing: evaluating response quality over time, testing for hallucinations, verifying tool use correctness, and measuring prompt regression across code changes.',
    whyItExists: 'AI systems fail silently in ways traditional software does not. A code change can degrade Claude\'s response quality by 30% without a single TypeScript error or unit test failure. tests/ai-evals/ catches these regressions before production users experience them.',
    analogy: 'A pharmaceutical QA lab plus a clinical trials division',
    analogyDetail: 'Pharma QA labs test chemistry correctness (unit tests). Clinical trials test real-world effectiveness (AI evals). Unit tests alone miss the most important failures in AI systems — whether Claude actually reasons correctly, uses tools properly, and doesn\'t hallucinate under all conditions.',
    useCases: [
      'Unit tests catch business logic bugs in service code — run in 30 seconds on every PR',
      'Integration tests verify API contracts between services actually hold under real data',
      'AI evals measure Claude response accuracy across 200+ golden examples — run on prompt changes',
      'Hallucination detection flags when Claude invents facts that aren\'t in its context',
      'Security tests verify MCP tool inputs are properly validated against injection attacks',
    ],
    subItems: [
      { name: 'unit/', emoji: '🔬', description: 'Fast, isolated tests for individual functions. Run on every commit, must complete in under 60s.' },
      { name: 'integration/', emoji: '🔗', description: 'Tests that verify services work together correctly. Test real API contracts, not mocks.' },
      { name: 'ai-evals/', emoji: '🎯', description: 'The most important tests for AI systems. Measure Claude response quality, accuracy, and tool use correctness.', example: 'Does Claude use the right tool? Does it hallucinate facts? Does it follow instructions consistently?' },
      { name: 'security/', emoji: '🛡️', description: 'Prompt injection tests, permission boundary tests, MCP tool input validation tests.' },
    ],
    relationships: [
      { targetId: 'services', type: 'monitors', label: 'validates correctness of' },
      { targetId: 'agents', type: 'monitors', label: 'evaluates AI quality of' },
      { targetId: 'github', type: 'uses', label: 'automatically run by' },
    ],
    complexity: 'growing',
  },
  {
    id: 'github',
    label: '.github/',
    emoji: '🔄',
    type: 'ops',
    layer: 4,
    color: '#475569',
    tagline: 'Automation layer — CI/CD, PR templates, branch protection, and Actions',
    whatItIs: '.github/ contains all GitHub automation: GitHub Actions workflow definitions for CI/CD, pull request and issue templates, CODEOWNERS for auto-review assignment, branch protection rules, and scheduled AI evaluation pipelines.',
    whyItExists: 'Good engineering teams do not manually run tests, builds, and deployments — they automate them. .github/ ensures every pull request automatically passes quality gates before merging. It also encodes team norms: what goes in a PR description, who reviews what, and what triggers a deployment.',
    analogy: 'The automated quality gate of a manufacturing assembly line',
    analogyDetail: 'A modern factory does not have workers manually inspect every product — automated systems do it at every stage. .github/ is that automation: when code arrives (PR), quality checks run automatically (tests, types, lint, AI evals), and nothing reaches production without passing every gate.',
    useCases: [
      'Every PR runs TypeScript check, unit tests, lint — blocks merge if any fail',
      'AI eval pipeline triggers automatically when prompt files or agent configs change',
      'CODEOWNERS ensures AI engineers review agent changes, security team reviews MCP changes',
      'Dependabot opens weekly PRs for dependency updates, reducing security debt',
      'Scheduled nightly AI evaluation runs track quality trends over time',
    ],
    subItems: [
      { name: 'workflows/', emoji: '⚡', description: 'GitHub Actions YAML. CI on PR, CD on merge to main, scheduled AI evals nightly.', example: 'ci.yml, deploy-staging.yml, ai-evals-nightly.yml' },
      { name: 'pull_request_template.md', emoji: '📝', description: 'Standard PR template. Prompts authors for change description, test plan, and AI-specific review notes.' },
      { name: 'CODEOWNERS', emoji: '👥', description: 'Maps directories to responsible teams. Auto-adds the right reviewers for every PR.' },
    ],
    relationships: [
      { targetId: 'infra', type: 'deploys', label: 'triggers deployment via' },
      { targetId: 'tests', type: 'calls', label: 'runs full test suite from' },
    ],
    complexity: 'starter',
  },
  {
    id: 'docs',
    label: 'docs/',
    emoji: '📚',
    type: 'docs-node',
    layer: 4,
    color: '#84cc16',
    tagline: 'Institutional memory — architecture decisions, runbooks, and post-mortems',
    whatItIs: 'docs/ contains human-written documentation: architecture decision records (ADRs), operational runbooks, API references, onboarding guides, and post-mortems. Unlike .claude/ which teaches Claude, docs/ teaches human engineers what exists and why.',
    whyItExists: 'Code explains what the system does. docs/ explains why it was built this way. Architecture decisions made under deadline pressure get forgotten in 6 months. ADRs preserve the reasoning — "We chose MCP for tool use because X, we considered Y but rejected it because Z" — so future engineers don\'t repeat solved problems.',
    analogy: 'The institutional memory and operations manual of the team',
    analogyDetail: 'When a senior engineer leaves a company, what goes with them? The decisions, the context, the "why we did it that way" knowledge. docs/ prevents that loss. It captures architectural decisions, operational procedures, and lessons learned from incidents — searchable, evolvable, and still valuable years later.',
    useCases: [
      'ADR-007: Why MCP was chosen over direct DB access in agents (auditability, permission scoping)',
      'Runbook: How to rotate compromised MCP credentials without downtime',
      'Post-mortem: March incident when agent executed unintended DB writes — what failed, fix applied',
      'Onboarding guide: How a new engineer goes from zero to productive in 2 days',
      'AI evaluation methodology: How to write good evals, what good scores mean',
    ],
    relationships: [
      { targetId: 'claude-dir', type: 'extends', label: 'supplements AI context in' },
    ],
    complexity: 'growing',
  },
  {
    id: 'scripts',
    label: 'scripts/',
    emoji: '📜',
    type: 'ops',
    layer: 4,
    color: '#f97316',
    tagline: 'Operational utilities — one-time migrations, seed data, and maintenance tools',
    whatItIs: 'scripts/ contains operational utility scripts: database migrations, seed data generators, one-time data transforms, deployment helpers, and maintenance tools. These are NOT production code — they are tools engineers run manually or in scheduled jobs.',
    whyItExists: 'Not everything fits in tests/ or infra/. Some operations are one-time (data migration), some are semi-regular (seed data refresh), some are emergency tools (clear stuck agent queue). scripts/ collects these utilities so they are version-controlled, documented, and reproducible.',
    analogy: 'The toolbox in a maintenance workshop',
    analogyDetail: 'A workshop has its main machinery (services, agents) and separate specialized tools (scripts) for maintenance tasks. You don\'t run the wrench continuously — you pick it up when you need it. scripts/ works the same way: version-controlled tools you reach for when a specific operational need arises.',
    useCases: [
      'migrate-vectors.ts: One-time migration of embeddings to new vector schema',
      'seed-dev-data.ts: Populates development database with realistic test data',
      'backfill-evals.ts: Generates AI evaluation golden dataset from recent conversations',
      'clear-agent-queue.ts: Emergency tool to clear stuck agent tasks without redeployment',
      'rotate-mcp-credentials.sh: Step-by-step credential rotation with verification',
    ],
    relationships: [
      { targetId: 'infra', type: 'uses', label: 'operates on infrastructure in' },
      { targetId: 'services', type: 'calls', label: 'modifies data in' },
    ],
    complexity: 'growing',
  },
];

export const flowSimulations: FlowSimulation[] = [
  {
    id: 'request-lifecycle',
    title: 'Claude Request Lifecycle',
    emoji: '🔄',
    description: 'How a user message flows through a full Claude-native system — from browser to streamed response',
    complexity: 'starter',
    steps: [
      { id: '1', actor: 'User', actorType: 'user', action: 'Types a message in the app', detail: 'Browser → Gateway Service. HTTP POST /ai/chat with Bearer JWT token. Request includes conversation ID and user message.' },
      { id: '2', actor: 'Gateway Service', actorType: 'service', action: 'Authenticates and rate-limits request', detail: 'Verifies JWT signature, checks rate limit bucket, extracts user permission scopes. Routes to AI Orchestrator.' },
      { id: '3', actor: 'AI Orchestrator', actorType: 'service', action: 'Builds Claude\'s context', detail: 'Loads CLAUDE.md + active rules as system prompt. Retrieves conversation history from storage. Assembles tool definitions from MCP registry filtered by user permissions.' },
      { id: '4', actor: 'Claude', actorType: 'claude', action: 'Processes request with full context', detail: 'Receives: system prompt (rules + CLAUDE.md) + conversation history + available tool schemas + user message. Decides whether to respond directly or use a tool.' },
      { id: '5', actor: 'Claude', actorType: 'claude', action: 'Returns tool_use or text response', detail: 'If tool needed: emits { type: "tool_use", name: "query_database", input: {...} }. If no tool needed: streams text directly. stop_reason: "tool_use" or "end_turn".' },
      { id: '6', actor: 'MCP Server', actorType: 'mcp', action: 'Executes tool safely', detail: 'Orchestrator routes tool call to correct MCP server. Server validates inputs, executes operation, returns { type: "tool_result", content: [...] }. Result fed back to Claude.' },
      { id: '7', actor: 'Claude', actorType: 'claude', action: 'Generates final response', detail: 'Uses tool result to produce grounded, accurate answer. No more tool calls needed. stop_reason: "end_turn". Token streaming begins.' },
      { id: '8', actor: 'AI Orchestrator', actorType: 'service', action: 'Persists, logs, and streams', detail: 'Saves complete conversation to storage. Emits telemetry event (tokens, latency, tools used). Streams response tokens through Gateway back to browser.' },
    ],
  },
  {
    id: 'mcp-tool-flow',
    title: 'MCP Tool Discovery & Execution',
    emoji: '🔌',
    description: 'How Claude discovers available tools at startup and safely executes them during a request',
    complexity: 'growing',
    steps: [
      { id: '1', actor: 'AI Orchestrator', actorType: 'service', action: 'Connects to all MCP servers on startup', detail: 'Establishes persistent connections to each registered MCP server via stdio (local) or HTTP/SSE (remote). Maintains live connection pool.' },
      { id: '2', actor: 'MCP Servers', actorType: 'mcp', action: 'Respond to tools/list request', detail: 'Each server returns its tool catalog: names, descriptions, and full JSON Schema for parameters. Orchestrator aggregates into unified registry.' },
      { id: '3', actor: 'AI Orchestrator', actorType: 'service', action: 'Builds permission-filtered tool registry', detail: 'Applies user permission scope filter. User with read-only scope sees only read tools. Admin user sees all tools. Tool list is per-user, per-request.' },
      { id: '4', actor: 'Claude', actorType: 'claude', action: 'Receives tool schemas in system prompt', detail: 'Claude sees available tools described in context. Uses descriptions to reason about which tools apply to the user\'s request.' },
      { id: '5', actor: 'Claude', actorType: 'claude', action: 'Emits tool_use block', detail: '{ "type": "tool_use", "id": "toolu_01XYZ", "name": "search_database", "input": { "query": "recent errors", "limit": 10 } }' },
      { id: '6', actor: 'AI Orchestrator', actorType: 'service', action: 'Validates and routes tool call', detail: 'Checks tool exists in registry. Validates input against JSON Schema. Checks user has required permission scope. Routes to correct MCP server.' },
      { id: '7', actor: 'MCP Server', actorType: 'mcp', action: 'Executes and returns result', detail: 'Runs the actual operation (DB query, API call, file read). Returns { "type": "tool_result", "tool_use_id": "toolu_01XYZ", "content": [...] }' },
      { id: '8', actor: 'Claude', actorType: 'claude', action: 'Processes result, may call more tools', detail: 'Reads tool_result. Decides if more tools are needed or if final response can be generated. Loop repeats until stop_reason: "end_turn".' },
    ],
  },
  {
    id: 'agent-orchestration',
    title: 'Multi-Agent Orchestration',
    emoji: '🤖',
    description: 'How a planner agent decomposes a complex goal and coordinates specialist agents to complete it',
    complexity: 'scaling',
    steps: [
      { id: '1', actor: 'User', actorType: 'user', action: 'Submits a complex goal', detail: '"Build and deploy a user authentication system with OAuth2, email verification, and rate limiting."' },
      { id: '2', actor: 'Planner Agent', actorType: 'agent', action: 'Decomposes goal into task DAG', detail: 'Breaks goal into ordered subtasks: [research existing patterns] → [design schema] → [write auth service] → [write tests] → [update docs] → [deploy to staging]. Assigns to specialist agents.' },
      { id: '3', actor: 'Retrieval Agent', actorType: 'agent', action: 'Searches for existing patterns first', detail: 'Queries codebase and vector store for existing auth patterns, similar implementations, and relevant internal docs. Returns findings to planner before any code is written.' },
      { id: '4', actor: 'Executor Agent', actorType: 'agent', action: 'Writes auth service code', detail: 'Receives spec from planner + context from retrieval agent. Writes code using MCP tools (read/write files, run commands). Runs tests after each function.' },
      { id: '5', actor: 'Monitoring Agent', actorType: 'agent', action: 'Reviews output quality', detail: 'Reviews code for security issues, test coverage, adherence to team standards. Checks MCP tool call logs for any suspicious patterns. Flags issues back to planner.' },
      { id: '6', actor: 'Executor Agent', actorType: 'agent', action: 'Iterates on flagged issues', detail: 'Receives monitor feedback. Applies fixes, re-runs tests. Loop continues until monitoring agent gives approval. Planner tracks iteration count and escalates if stuck.' },
      { id: '7', actor: 'Orchestrator Agent', actorType: 'agent', action: 'Coordinates final deployment', detail: 'All subtasks approved. Triggers CI/CD pipeline via GitHub MCP. Monitors deployment health via observability MCP. Confirms staging deployment is healthy.' },
      { id: '8', actor: 'Planner Agent', actorType: 'agent', action: 'Confirms goal completion', detail: 'Verifies all DAG nodes are complete and approved. Generates completion summary for user: what was built, what was changed, how to verify it works.' },
    ],
  },
  {
    id: 'deployment-pipeline',
    title: 'CI/CD Deployment Pipeline',
    emoji: '🚀',
    description: 'How code travels from a developer\'s pull request to running safely in production',
    complexity: 'scaling',
    steps: [
      { id: '1', actor: 'Developer', actorType: 'user', action: 'Opens a pull request', detail: 'PR template enforces: description of what changed, why, test plan. CODEOWNERS auto-assigns reviewers based on changed directories.' },
      { id: '2', actor: 'CI Pipeline', actorType: 'infra', action: 'Runs parallel quality gates', detail: 'Simultaneously: TypeScript check, unit tests, integration tests, linting, dependency audit. All must pass. Fails fast on first error.' },
      { id: '3', actor: 'AI Eval Pipeline', actorType: 'infra', action: 'Runs AI regression tests if needed', detail: 'Triggered only when prompts, agent configs, or MCP schemas changed. Runs 200+ golden examples through Claude. Fails if accuracy drops >2% from baseline.' },
      { id: '4', actor: 'Reviewer', actorType: 'user', action: 'Reviews and approves', detail: 'Checks functional correctness, architectural consistency, security implications. AI system changes require sign-off from AI engineering team.' },
      { id: '5', actor: 'CD Pipeline', actorType: 'infra', action: 'Builds and publishes container', detail: 'Docker build with layer caching. Image tagged with git SHA. Pushed to container registry. Kubernetes manifests updated in infra/ repo via automated PR.' },
      { id: '6', actor: 'Kubernetes', actorType: 'infra', action: 'Rolling deployment — zero downtime', detail: 'Pulls new image. Rolling update: 1 new pod up, 1 old pod down. Readiness probes verified. Traffic shifts gradually over 5 minutes.' },
      { id: '7', actor: 'Monitoring Agent', actorType: 'agent', action: 'Watches post-deploy health for 15 min', detail: 'Monitors error rate, latency P99, AI accuracy metrics. If any metric degrades beyond threshold — automatic rollback to previous version triggered.' },
      { id: '8', actor: 'System', actorType: 'system', action: 'Deployment confirmed', detail: 'All traffic on new version. Deployment record created with SHA, author, timestamp. On-call engineer notified. Monitoring agent returns to steady-state watch mode.' },
    ],
  },
  {
    id: 'security-flow',
    title: 'Trust Boundaries & Security Flow',
    emoji: '🛡️',
    description: 'How trust, permissions, and security boundaries are enforced across the full system',
    complexity: 'enterprise',
    steps: [
      { id: '1', actor: 'External Request', actorType: 'user', action: 'Arrives at system boundary', detail: 'All external traffic enters through Gateway. TLS termination, DDoS protection, WAF rules applied before any code runs.' },
      { id: '2', actor: 'Gateway', actorType: 'service', action: 'Verifies identity and extracts scopes', detail: 'JWT validation: signature, expiry, issuer. Extracts: user_id, org_id, permission_scopes. Forwards as trusted headers to downstream services.' },
      { id: '3', actor: 'AI Orchestrator', actorType: 'service', action: 'Enforces context isolation', detail: 'Each request gets its own isolated Claude context. Zero conversation history leakage between users or organizations. Tenant ID embedded in every prompt.' },
      { id: '4', actor: 'Tool Registry', actorType: 'system', action: 'Filters tools by permission scope', detail: 'User with scope ["read:data"] sees only read tools. "write:data" scope unlocks write tools. Admin scope unlocks destructive tools with confirmation hooks.' },
      { id: '5', actor: 'MCP Server', actorType: 'mcp', action: 'Validates every tool input', detail: 'JSON Schema validation on all inputs. SQL injection guards. Path traversal prevention. Prompt injection detection. No raw user input reaches execution.' },
      { id: '6', actor: 'Audit System', actorType: 'system', action: 'Logs every AI action immutably', detail: 'Every Claude tool_use, every agent action written to append-only audit log. Required for SOC2, GDPR compliance. Retained for 90 days.' },
      { id: '7', actor: 'Monitoring Agent', actorType: 'agent', action: 'Detects anomalous patterns', detail: 'Watches for: unusual tool call frequency, privilege escalation attempts, data exfiltration patterns, off-hours access spikes. Alerts on-call if threshold exceeded.' },
      { id: '8', actor: 'Incident Response', actorType: 'system', action: 'Playbook-driven response', detail: 'Automated: revoke compromised token, isolate affected tenant, capture forensic snapshot. Human: follows incident-response playbook in .claude/playbooks/.' },
    ],
  },
];

export const evolutionStages: EvolutionStage[] = [
  {
    stage: 1,
    title: 'The Beginning',
    subtitle: 'Single-file or simple split',
    description: 'You start with a single file or a basic frontend/backend split. Everything works. Nothing is structured. You move fast and learn what actually matters to build.',
    addedItems: ['index.html / app.py / server.ts', 'Direct API calls', 'No folder structure — just files'],
    complexity: 'starter',
    teamSize: '1 developer',
    whenToAdopt: 'Day 1 of any project. Validate the idea before organizing it.',
    antiPattern: 'Staying here too long. Once 2+ people touch the code, or once you have real users, this becomes chaos faster than you expect.',
  },
  {
    stage: 2,
    title: 'The First Structure',
    subtitle: 'frontend/ + backend/ + CLAUDE.md',
    description: 'You separate UI from server. CLAUDE.md appears because you realized re-explaining your tech stack to Claude every session wastes meaningful time. Structure follows pain, not anticipation.',
    addedItems: ['frontend/', 'backend/', 'CLAUDE.md with commands and stack overview'],
    complexity: 'starter',
    teamSize: '1–2 developers',
    whenToAdopt: 'When you find yourself typing the same Claude context more than twice. When a second developer joins.',
    antiPattern: 'Writing a 400-line CLAUDE.md before you have a working product. Document what exists and causes pain, not what you plan to build.',
  },
  {
    stage: 3,
    title: 'Claude-Native Patterns',
    subtitle: '.claude/ rules, commands, shared components',
    description: 'The .claude/ directory appears as you extract repeating patterns into rules. Slash commands replace repetitive prompts. Shared UI components emerge from copy-paste fatigue.',
    addedItems: ['.claude/rules/ (dark-mode.md, typescript.md)', '.claude/commands/ (/add-page, /fix-ts)', 'src/components/ui/ (Button, Card, shared primitives)', 'src/lib/ (utility functions)'],
    complexity: 'growing',
    teamSize: '2–4 developers',
    whenToAdopt: 'When you notice Claude needs the same instructions in multiple sessions. When you see the same JSX pattern copy-pasted 3+ times.',
    antiPattern: 'Over-ruling — 30 rule files for a 10-file project. Rules compound in value only when patterns genuinely recur. Premature rules waste time writing and confuse Claude.',
  },
  {
    stage: 4,
    title: 'Services Split',
    subtitle: 'Dedicated backend services by domain',
    description: 'Your backend grows complex enough that auth, AI orchestration, and data storage benefit from separation. Teams form around service ownership. Independent deployment becomes possible.',
    addedItems: ['services/auth-service/', 'services/ai-orchestrator/', 'packages/shared-types/', 'packages/ai-sdk/', 'tests/integration/'],
    complexity: 'growing',
    teamSize: '4–8 developers',
    whenToAdopt: 'When different backend parts change at different rates or are owned by different people. When the auth service team wants to deploy without coordinating with the AI team.',
    antiPattern: 'Microservices for a 2-person team. Service boundaries add coordination overhead — split when coupling cost exceeds split cost, not before.',
  },
  {
    stage: 5,
    title: 'MCP Integration',
    subtitle: 'Claude gains real-world hands',
    description: 'Claude needs to interact with real data — not just generate text. MCP servers connect Claude to databases, APIs, and external services. The AI orchestrator manages tool lifecycle and permission filtering.',
    addedItems: ['mcp/servers/ (postgres, github, search)', 'mcp/transport/ (stdio, HTTP)', 'mcp/auth/ (credential management)', 'services/ai-orchestrator/ (expanded with tool registry)'],
    complexity: 'scaling',
    teamSize: '4–10 developers',
    whenToAdopt: 'When Claude needs to read real production data or take real system actions — not just produce text responses.',
    antiPattern: 'MCP without permission scoping. Giving Claude unrestricted write access to production systems is a critical security incident waiting to happen on day one.',
  },
  {
    stage: 6,
    title: 'Agent Architecture',
    subtitle: 'Autonomous multi-agent systems',
    description: 'Single Claude calls cannot handle complex multi-step tasks needing error recovery and state between steps. Specialized agents emerge with distinct roles. An orchestrator coordinates them toward shared goals.',
    addedItems: ['agents/planner-agent/', 'agents/executor-agent/', 'agents/retrieval-agent/', 'agents/monitoring-agent/', 'tests/ai-evals/ (comprehensive evaluation suite)'],
    complexity: 'scaling',
    teamSize: '8–20 developers',
    whenToAdopt: 'When a task requires 10+ sequential decisions with error recovery, state management between steps, and specialist knowledge that no single context window can hold.',
    antiPattern: 'Agents for simple tasks. A retrieval agent for a FAQ chatbot is overengineering. Agents exist to solve coordination complexity — if you don\'t have that complexity, you don\'t need agents.',
  },
  {
    stage: 7,
    title: 'Enterprise Operations',
    subtitle: 'Governance, observability, security, compliance',
    description: 'The system is critical infrastructure. Observability, governance, and operational systems emerge. AI-specific monitoring tracks quality trends. Compliance documentation becomes essential. On-call rotation covers AI incidents.',
    addedItems: ['infra/observability/ (AI metrics dashboards, hallucination alerts)', 'infra/kubernetes/ (full production deployment)', '.github/workflows/ (complete CI/CD + AI evals in pipeline)', 'docs/adrs/ (architecture decision records)', 'docs/runbooks/ (operational procedures)', 'tests/security/ (injection, permission boundary tests)', '.claude/playbooks/ (incident response, rollback procedures)'],
    complexity: 'enterprise',
    teamSize: '20+ developers across multiple teams',
    whenToAdopt: 'When a system failure affects real users, requires on-call response, demands compliance documentation, or involves multi-team coordination to resolve.',
    antiPattern: 'Enterprise governance for a startup with 10 users. SOC2 infrastructure for a 3-person team wastes engineering time that could validate whether the product is worth building at all.',
  },
];

export const archPatterns: ArchPattern[] = [
  {
    id: 'secrets-in-claude-md',
    type: 'anti-pattern',
    title: 'Secrets in CLAUDE.md',
    description: 'Putting API keys, database passwords, or internal endpoints directly in CLAUDE.md.',
    example: '# CLAUDE.md\n## Database\nDB_PASSWORD=prod-super-secret-123\nINTERNAL_API=https://internal.corp.com/api',
    consequence: 'CLAUDE.md is committed to version control and injected into Claude context in every session. Secrets become permanently exposed in git history and visible to anyone with repository access — including future contractors.',
    fix: 'Reference env var names in CLAUDE.md without values. Actual secrets live in .env files (gitignored) or a secrets manager. Use process.env.DB_PASSWORD, not the password itself.',
    category: 'Security',
    severity: 'critical',
  },
  {
    id: 'mcp-no-validation',
    type: 'anti-pattern',
    title: 'MCP Write Tools Without Input Validation',
    description: 'Exposing database mutation, file write, or API call tools via MCP without validating Claude\'s inputs before execution.',
    example: '// mcp/servers/database.ts\nserver.tool("execute_sql", async ({ sql }) => {\n  // No validation — runs any SQL Claude generates\n  return await db.query(sql);\n});',
    consequence: 'Claude can generate malformed SQL, accidentally destructive queries (DROP TABLE), or be tricked via prompt injection into running dangerous operations. One bad agent session can corrupt production data.',
    fix: 'Validate tool inputs against strict JSON Schema. Restrict SQL to SELECT-only for read tools. Require explicit human approval for DELETE/DROP operations. Log every tool call.',
    category: 'Security',
    severity: 'critical',
  },
  {
    id: 'agents-without-evals',
    type: 'anti-pattern',
    title: 'Shipping Agents Without AI Evaluation Suite',
    description: 'Deploying autonomous agents to production without an eval suite that catches response quality regressions across code changes.',
    example: '// Agents work great in development\n// No eval suite exists\n// Prompt wording change ships in PR\n// Agent silently becomes 35% less accurate\n// Users complain weeks later',
    consequence: 'TypeScript checks and unit tests do not catch when Claude\'s reasoning quality degrades. A context window change, prompt edit, or new tool definition can silently break agent behavior. No evals = no safety net.',
    fix: 'Write AI evals before shipping agents. Track accuracy, hallucination rate, and task completion. Run evals in CI when any agent config, prompt, or MCP schema changes.',
    category: 'AI Quality',
    severity: 'high',
  },
  {
    id: 'claude-md-contract',
    type: 'good-pattern',
    title: 'CLAUDE.md as the Architecture Contract',
    description: 'Using CLAUDE.md to capture all architectural decisions, path aliases, build commands, and conventions so Claude operates consistently without re-explanation.',
    example: '# CLAUDE.md\n## Commands\nnpx tsc --noEmit # verify after every change\n\n## Path alias\n@/ resolves to src/\n\n## Dark mode\nAll components accept `dm: boolean`\nNever read store in sub-components\n\n## TypeScript\nverbatimModuleSyntax — use import type\nnoUnusedLocals — delete, do not rename to _x',
    consequence: 'Claude maintains perfect architectural consistency across 100+ sessions without re-explanation. New engineers onboard in hours instead of days because the rules are codified and enforceable.',
    category: 'Architecture',
  },
  {
    id: 'permission-scoped-tools',
    type: 'good-pattern',
    title: 'Permission-Scoped MCP Tool Filtering',
    description: 'Filtering the set of MCP tools visible to Claude based on the current user\'s permission scopes, enforced before the tool list reaches Claude\'s context.',
    example: '// services/ai-orchestrator/buildTools.ts\nconst tools = allRegisteredTools.filter(tool =>\n  userPermissionScopes.includes(tool.requiredScope)\n);\n// Claude only sees tools user can actually use\nawait anthropic.messages.create({ tools, ...rest });',
    consequence: 'Users cannot accidentally or intentionally use Claude to perform operations beyond their authorization. Security is enforced at the AI layer, not just UI. A read-only user cannot trigger database writes even through clever prompting.',
    category: 'Security',
  },
  {
    id: 'adr-driven-architecture',
    type: 'good-pattern',
    title: 'ADR-Driven Architecture Evolution',
    description: 'Writing Architecture Decision Records before introducing each new complexity layer (services split, MCP, agents) so future engineers understand why complexity was added.',
    example: '# docs/adrs/007-mcp-for-tool-use.md\n## Context: Agents need real data access\n## Decision: MCP servers over direct DB access\n## Rationale: Auditable, permission-scoped, revocable\n## Rejected alternative: Direct DB connection (no audit trail)\n## Consequences: MCP server operational overhead accepted',
    consequence: 'Future engineers understand WHY each layer exists, not just that it does. Prevents overengineering when simpler solutions exist. Prevents removing necessary complexity by accident. Makes the architecture self-documenting.',
    category: 'Architecture',
  },
];
