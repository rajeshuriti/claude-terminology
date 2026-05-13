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

// ── Deep educational content per node ────────────────────────────────────────

export interface SampleFile {
  name: string;
  description: string;
  content: string;
}

export interface DeepWorkflowStep {
  actor: string;
  action: string;
  detail?: string;
}

export interface DeepNodeContent {
  sampleFiles: SampleFile[];
  claudeUsage: string;
  workflow: DeepWorkflowStep[];
  keyInsight: string;
  goodPattern: { title: string; content: string; explanation: string };
  antiPattern: { title: string; content: string; consequence: string; fix: string };
}

export interface LearningStep {
  stepNum: number;
  nodeId: string;
  title: string;
  estimatedTime: string;
  lesson: string;
  keyTakeaway: string;
  question: string;
  answer: string;
}

const B = '\`\`\`'; // triple backtick helper — avoids escaping inside template literals

export const nodeDeepContent: Partial<Record<string, DeepNodeContent>> = {

  'claude-md': {
    sampleFiles: [
      {
        name: 'CLAUDE.md',
        description: 'Global intelligence contract — loaded by Claude at every session start',
        content: `# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Commands

${B}bash
npm run dev       # start Vite dev server (HMR)
npm run build     # tsc -b && vite build (full type-check + bundle)
npm run lint      # eslint on all source files
npx tsc --noEmit  # fast type-check without building — use after every edit
${B}

There are no tests. Run \`npx tsc --noEmit\` after every change.

## Architecture

### Stack
- React 19 + Vite 8 — SPA, no SSR
- TypeScript strict (verbatimModuleSyntax, noUnusedLocals, noUnusedParameters)
- Tailwind CSS v4 via @tailwindcss/vite (no tailwind.config.js)
- Framer Motion — motion.div + AnimatePresence throughout
- Zustand with persist — single store at src/store/appStore.ts
- React Router v7 — all routes in src/App.tsx

### Path alias
\`@/\` resolves to \`src/\`. Use for all imports within src/.

## Rules Reference
See .claude/rules/ for detailed constraints:
- typescript.md — verbatimModuleSyntax, noUnusedLocals rules
- dark-mode.md — dm prop pattern, tw() utility, inline styles
- components.md — SectionLabel, Badge, CollapsibleSection API

## Deployment
vercel.json lives at the REPO ROOT, not inside learning-platform/.
Vercel runs: \`cd learning-platform && npm install && npm run build\``,
      },
    ],
    claudeUsage: 'Claude Code auto-reads CLAUDE.md at the start of every session — before any task begins. It is injected as persistent background context. Every command Claude runs, every TypeScript pattern it follows, every architectural decision it makes is shaped by what is written here. Think of it as the session initialization script.',
    workflow: [
      { actor: 'Engineer', action: 'Opens Claude Code in the project directory' },
      { actor: 'Claude Code', action: 'Automatically reads CLAUDE.md on startup' },
      { actor: 'Claude', action: 'Absorbs: build commands, TypeScript constraints, path aliases, deployment notes' },
      { actor: 'Engineer', action: 'Asks: "fix the TypeScript error on line 42"' },
      { actor: 'Claude', action: 'Already knows: run npx tsc --noEmit, use import type, never rename to _x' },
      { actor: 'Result', action: 'Correct fix applied without explaining project context — every single time' },
    ],
    keyInsight: 'CLAUDE.md is not documentation. It is the session initialization contract. Time invested in making it accurate and specific is multiplied across every future Claude interaction in the project.',
    goodPattern: {
      title: 'Specific commands + architecture facts + rules references',
      content: `## Commands\nnpm run dev\nnpx tsc --noEmit  # run after every change\n\n## Path alias\n@/ → src/\n\n## TypeScript\nverbatimModuleSyntax: use import type for all types\nnoUnusedLocals: DELETE unused vars — never rename to _x\n\n## Deployment\nvercel.json at REPO ROOT, not inside learning-platform/`,
      explanation: 'Commands listed first — Claude runs these immediately. Architecture facts prevent re-discovery. Rules references keep CLAUDE.md concise while pointing to detailed constraint files.',
    },
    antiPattern: {
      title: 'Vague instructions with no commands',
      content: `# Project\nThis is a modern web app.\nWrite clean, well-tested, accessible code.\nFollow TypeScript and React best practices.`,
      consequence: 'Claude has no build commands to run, no TypeScript flags to follow, and no architecture context. Every session re-discovers the same basics by reading the codebase from scratch.',
      fix: 'Lead with exact runnable commands. Document specific compiler flags. Note any non-obvious deployment or architecture facts that can\'t be inferred from code alone.',
    },
  },

  'claude-dir': {
    sampleFiles: [
      {
        name: '.claude/settings.json',
        description: 'Claude Code permissions and PostToolUse hooks',
        content: `{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npx tsc --noEmit)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "cd learning-platform && npx tsc --noEmit 2>&1 | head -30"
          }
        ]
      }
    ]
  }
}`,
      },
    ],
    claudeUsage: 'Claude Code reads .claude/ at session start to understand project-specific configuration: which shell commands are permitted, which hooks run automatically after tool use, and where to find rules, commands, and skills. It transforms Claude from a generic AI into a project-aware engineering partner.',
    workflow: [
      { actor: 'Developer', action: 'Creates .claude/ and adds settings.json with permissions + hooks' },
      { actor: 'Claude Code', action: 'Discovers .claude/ on startup, loads settings.json' },
      { actor: 'Claude Code', action: 'Knows which Bash commands are allowed without prompting user' },
      { actor: 'Developer', action: 'Edits a TypeScript file via Claude' },
      { actor: 'PostToolUse hook', action: 'Automatically runs npx tsc --noEmit after every file edit' },
      { actor: 'Claude', action: 'Sees TypeScript errors immediately, fixes them before reporting done' },
    ],
    keyInsight: 'The .claude/ directory is the difference between a generic AI assistant and a project-aware AI partner. The PostToolUse hook alone — running tsc after every edit — catches 90% of type errors before they reach the developer.',
    goodPattern: {
      title: 'Granular permissions + automatic quality gate hook',
      content: `.claude/\n  settings.json      # permissions + PostToolUse tsc hook\n  rules/\n    typescript.md    # one concern per file\n    dark-mode.md\n  commands/\n    add-page.md      # specific reusable operations\n    fix-ts.md`,
      explanation: 'Granular permissions prevent accidental destructive commands. The tsc hook creates a continuous quality gate. One file per concern keeps rules maintainable.',
    },
    antiPattern: {
      title: 'Monolithic rules file with everything mixed',
      content: `.claude/\n  rules.md   # 500 lines: TS rules, UI rules, deploy notes,\n             # API standards, team preferences, git rules...`,
      consequence: 'Hard to update without breaking unrelated sections. Claude loads all 500 lines even for trivial tasks. Rules conflict. Nobody knows what is still valid.',
      fix: 'One file per concern. Each rule file under 60 lines. Reference from CLAUDE.md. Delete stale rules aggressively.',
    },
  },

  'claude-dir/rules/': {
    sampleFiles: [
      {
        name: 'rules/typescript.md',
        description: 'TypeScript compiler constraint enforcement — injected before any TypeScript task',
        content: `# TypeScript Constraints

This project enforces strict TypeScript. Understand these before editing any .ts or .tsx file.

## verbatimModuleSyntax

Type-only imports **must** use \`import type\`. The compiler rejects runtime imports of types.

${B}typescript
import type { Concept } from '@/types';     // ✅ correct
import { Concept } from '@/types';          // ❌ TS1484 error
${B}

## noUnusedLocals + noUnusedParameters

Every declared variable and import must be used. No exceptions.

${B}typescript
import { useState, useEffect } from 'react'; // ❌ if only useState is used
import { useState } from 'react';            // ✅

function Foo({ dm, _unused }: Props) {}     // ❌ _unused prefix does NOT work
function Foo({ dm }: Props) {}              // ✅ remove the param
${B}

**Do NOT prefix unused variables with \`_\` to silence errors. Delete them.**

## Error → fix lookup

| Error | Fix |
|-------|-----|
| 'X' is declared but its value is never read | Delete the import |
| 'X' is declared but never used | Delete it — never rename to _X |
| Object is possibly undefined | Use optional chaining or ?? fallback |

## Verify after every edit

${B}bash
npx tsc --noEmit   # zero output = zero errors
${B}`,
      },
      {
        name: 'rules/dark-mode.md',
        description: 'Dark mode pattern — dm prop threading and tw() utility usage',
        content: `# Dark Mode Pattern

## The rule

Every page reads \`const { darkMode } = useAppStore()\` and aliases to \`const dm = darkMode\`.
Pass \`dm: boolean\` as a prop to EVERY sub-component.
**Never** read the store directly inside a sub-component.

## The tw() utility

\`src/lib/dm.ts\` exports \`tw(dark: boolean, ...keys)\`:

${B}tsx
import { tw } from '@/lib/dm';

// ❌ Verbose inline ternary
className={\`rounded-xl \${dm ? 'bg-slate-900' : 'bg-white'}\`}

// ✅ tw() token
className={\`rounded-xl \${tw(dm, 'card')}\`}
${B}

## Dynamic colors MUST use inline styles

Tailwind purges class names constructed at runtime:

${B}tsx
// ❌ Purged at build time
<div className={\`bg-\${cat.color}-500\`} />

// ✅ Survives production build
<div style={{ background: cat.color + '20', color: cat.color }} />
${B}`,
      },
      {
        name: 'rules/api-standards.md',
        description: 'Consistent API response envelope and error code standards',
        content: `# API Standards

## Response envelope

All API responses use a typed envelope:

${B}typescript
// Success
{ data: T; error: null }

// Error
{ data: null; error: { code: string; message: string } }
${B}

## Error codes — use specific codes, never generic messages

| Code | Meaning |
|------|---------|
| AUTH_EXPIRED | Token expired — client should refresh |
| RATE_LIMITED | Too many requests — include Retry-After header |
| VALIDATION_FAILED | Input invalid — include field-level errors |
| NOT_FOUND | Resource does not exist |

## Never expose implementation internals

${B}typescript
// ❌ Leaks stack trace to clients
{ error: "TypeError: Cannot read property 'id' of undefined at auth.ts:42" }

// ✅ Controlled error surface
{ error: { code: "NOT_FOUND", message: "User not found" } }
${B}`,
      },
    ],
    claudeUsage: 'When Claude starts a task touching a specific domain (TypeScript, UI, APIs), it loads the relevant rule file from .claude/rules/ into its working context. These rules are constraints Claude must satisfy — they shape every line of code generated. The specificity of the rules directly determines the consistency of outputs.',
    workflow: [
      { actor: 'Engineer', action: '"Fix the TypeScript error in ConceptCard.tsx"' },
      { actor: 'Claude Code', action: 'Detects TypeScript task → loads rules/typescript.md' },
      { actor: 'Claude', action: 'Knows: verbatimModuleSyntax, noUnusedLocals, never _prefix' },
      { actor: 'Claude', action: 'Applies fix following the loaded constraint rules exactly' },
      { actor: 'Claude', action: 'Runs npx tsc --noEmit as specified in the rule file' },
      { actor: 'Engineer', action: 'Receives a correct fix — no TypeScript flags re-explained' },
    ],
    keyInsight: 'Rules convert "Claude usually does this right" into "Claude always does this right." The difference between 70% and 99% consistency is the specificity of rule files. Vague rules produce vague compliance.',
    goodPattern: {
      title: 'Specific rules with ✅/❌ examples and verification command',
      content: `## verbatimModuleSyntax\n✅ import type { Concept } from '@/types'\n❌ import { Concept } from '@/types'  // error: TS1484\n\n## After every edit\nRun: npx tsc --noEmit`,
      explanation: 'Shows correct AND wrong patterns with error codes. Includes the verification command. No ambiguity about what correct means in this context.',
    },
    antiPattern: {
      title: 'Vague rules Claude cannot act on',
      content: `# TypeScript Rules\nUse TypeScript correctly.\nAvoid type errors.\nWrite type-safe, maintainable code.`,
      consequence: 'Claude has no concrete constraint to satisfy. It will generate code that looks reasonable but may fail the compiler with verbatimModuleSyntax or noUnusedLocals errors.',
      fix: 'Every rule references a specific compiler option or framework requirement. Show before/after code. Specify the exact command to verify.',
    },
  },

  'claude-dir/commands/': {
    sampleFiles: [
      {
        name: 'commands/add-page.md',
        description: '/add-page — generates a complete page component following all project conventions',
        content: `Create a new page component at \`src/pages/$ARGUMENTS.tsx\`.

Requirements — complete ALL steps in order:

1. Export a **named** function component (not default export)
2. Read: \`const { darkMode } = useAppStore()\`
3. Alias: \`const dm = darkMode\`
4. Use \`tw(dm, ...)\` from \`@/lib/dm\` for ALL theme classes — never inline ternaries
5. Import \`SectionLabel\`, \`Badge\`, \`CollapsibleSection\` from \`@/components/ui\` as needed
6. Only \`import { useState }\` if the page actually uses local state
7. Use \`AnimatePresence\` + \`motion.div\` for any tab or content transitions

After creating the page component:
8. Add route to \`src/App.tsx\`: \`<Route path="/your-path" element={<$ARGUMENTS />} />\`
9. Add nav item to \`src/components/layout/Sidebar.tsx\` navItems array
   Shape: \`{ path: '/your-path', icon: null, label: 'Page Name', emoji: '🎯', isNew: true }\`
10. Run: \`npx tsc --noEmit\` — report done only when output is empty`,
      },
      {
        name: 'commands/fix-ts.md',
        description: '/fix-ts — diagnoses all TypeScript errors and fixes them in correct order',
        content: `Run \`npx tsc --noEmit\` and fix ALL errors shown in the output.

Fix errors in this priority order:
1. \`verbatimModuleSyntax\` violations — change to \`import type { X }\`
2. Unused variables/imports — DELETE them, never rename to \`_x\`
3. Type mismatches — fix the usage, not the type definition
4. Missing properties — check if the interface is correct before adding fields

DO NOT:
- Add \`@ts-ignore\` or \`@ts-expect-error\`
- Rename unused variables to \`_varName\`
- Add optional chaining (\`?.\`) where a value should always exist
- Widen types to silence errors (don't change \`string\` to \`any\`)

After each batch of fixes, run \`npx tsc --noEmit\` again.
Report done ONLY when the output is completely empty (zero lines).`,
      },
      {
        name: 'commands/create-service.md',
        description: '/create-service — scaffolds a new backend microservice',
        content: `Scaffold a new service at \`services/$ARGUMENTS-service/\`.

Service directory structure:
${B}
services/$ARGUMENTS-service/
  src/
    index.ts           # Express app, middleware registration, route mounting
    routes/            # Route handler files
    services/          # Business logic (no HTTP concerns)
    middleware/        # Auth validation, rate limiting, request logging
  Dockerfile
  package.json         # with shared-types and telemetry-sdk dependencies
  tsconfig.json
${B}

Requirements:
1. Use Express + TypeScript strict mode
2. Import shared types from \`packages/shared-types/\`
3. Import telemetry from \`packages/telemetry-sdk/\`
4. Add \`GET /health\` endpoint returning \`{ status: "ok", service: "$ARGUMENTS" }\`
5. Add auth middleware that validates Bearer JWT tokens
6. Add request logging with correlation IDs
7. Read PORT from \`process.env.PORT\` (default 3000)

After scaffolding:
- Register in \`docker-compose.yml\`
- Add Kubernetes deployment to \`infra/kubernetes/$ARGUMENTS-service.yaml\``,
      },
    ],
    claudeUsage: 'When a developer types /command-name in Claude Code, Claude reads .claude/commands/command-name.md and treats it as the current task prompt. The special $ARGUMENTS placeholder is replaced with any text typed after the command name. The command file becomes a reusable, parameterized AI operation.',
    workflow: [
      { actor: 'Developer', action: 'Types: /add-page UserDashboard' },
      { actor: 'Claude Code', action: 'Finds .claude/commands/add-page.md, replaces $ARGUMENTS with "UserDashboard"' },
      { actor: 'Claude', action: 'Reads all 10 requirements from the command template' },
      { actor: 'Claude', action: 'Creates src/pages/UserDashboard.tsx with all conventions applied' },
      { actor: 'Claude', action: 'Updates App.tsx route and Sidebar.tsx nav item' },
      { actor: 'Claude', action: 'Runs npx tsc --noEmit — reports done only when output is empty' },
    ],
    keyInsight: 'Every time you find yourself explaining the same context to Claude, that context belongs in a command. Commands are reusable prompt programs — your accumulated engineering knowledge made instantly executable.',
    goodPattern: {
      title: 'Numbered requirements with verification step',
      content: `Create page at src/pages/$ARGUMENTS.tsx\n\nRequirements:\n1. Export named function (not default)\n2. const { darkMode } = useAppStore()\n3. const dm = darkMode\n4. Use tw(dm, ...) for all theme classes\n...\n10. Run: npx tsc --noEmit — done only when empty`,
      explanation: 'Numbered steps mean Claude checks each one. Including the verification step as step 10 means output is always valid before Claude reports done.',
    },
    antiPattern: {
      title: 'Catch-all command that delegates to vague principles',
      content: `Follow all project conventions and create whatever the user asked for, applying best practices.`,
      consequence: 'Claude has no idea what "project conventions" are without loading CLAUDE.md and every rule. This command adds zero value over a plain question.',
      fix: 'Each command does one specific thing extremely well. 15 focused commands beat 3 vague ones every time.',
    },
  },

  'claude-dir/skills/': {
    sampleFiles: [
      {
        name: 'skills/security-auditor.md',
        description: 'Expert security review capability — gives Claude OWASP-level security analysis',
        content: `# Security Auditor Skill

You are now operating as a senior application security engineer with 10 years of experience.

## Your Expertise
- OWASP Top 10 vulnerability patterns
- Authentication and authorization flaws
- Injection vulnerabilities (SQL, NoSQL, command injection, prompt injection)
- Secrets and credential exposure in code and config
- JWT handling and token security anti-patterns
- MCP tool permission boundary violations

## Systematic Review Process

When reviewing code, check ALL of the following:

1. **Authentication** — Is every non-public route protected? Is middleware applied correctly?
2. **Authorization** — Does code verify the user has PERMISSION (not just authentication)?
3. **Input validation** — Is ALL external input validated before reaching business logic?
4. **Secrets** — Are credentials in env vars only? Never in code, CLAUDE.md, or committed config?
5. **MCP permissions** — Are write tools permission-scoped? Are all inputs validated against schema?
6. **Injection** — Could any user input reach a DB query, shell command, or AI prompt unsanitized?

## Required Output Format

For each finding:
- **Severity**: Critical | High | Medium | Low
- **Location**: file.ts:lineNumber
- **Vulnerability**: specific issue name
- **Impact**: what an attacker can achieve
- **Fix**: exact code change required`,
      },
      {
        name: 'skills/rag-specialist.md',
        description: 'RAG system expert — deep retrieval-augmented generation knowledge',
        content: `# RAG Specialist Skill

You are now operating as a senior AI engineer specializing in production RAG systems.

## Your Expertise
- Embedding model selection and dimensionality tradeoffs
- Chunking strategies: fixed-size, semantic, hierarchical, late-chunking
- Vector database design: HNSW vs IVF indexing, distance metrics
- Retrieval strategies: cosine similarity, MMR, hybrid BM25 + vector
- Reranking pipelines: cross-encoder models, LLM-as-reranker
- Evaluation metrics: recall@k, MRR, NDCG, faithfulness, answer relevance

## Implementation Standards

When building RAG systems, apply these defaults:
1. **Chunking** — 512 tokens with 10% overlap for general text; semantic for structured docs
2. **Embeddings** — Never mix models in the same index. Log which model was used with each chunk.
3. **Retrieval** — Return top-10 candidates, rerank to top-3 before sending to Claude
4. **Context** — Format chunks with source metadata. Let Claude cite sources.
5. **Evaluation** — Build a golden eval set (50+ question-answer pairs) before production

## Red Flags to Always Call Out
- Chunking at arbitrary character boundaries (breaks semantic coherence)
- No logging of what was retrieved (impossible to debug retrieval failures)
- Treating retrieval as a black box with no quality monitoring
- No fallback behavior when retrieval confidence is low`,
      },
    ],
    claudeUsage: 'A skill is loaded by including it in Claude\'s context at the start of a session or via a command. Once loaded, Claude operates with that expert\'s knowledge, methodology, and systematic approach for the remainder of the session. A skill "installs" a specialized mental model on demand.',
    workflow: [
      { actor: 'Developer', action: '"Load the security auditor skill and review src/routes/auth.ts"' },
      { actor: 'Claude Code', action: 'Reads skills/security-auditor.md into active context' },
      { actor: 'Claude', action: 'Now has systematic OWASP methodology, severity scale, output format' },
      { actor: 'Claude', action: 'Reviews auth.ts checking all 6 categories in systematic order' },
      { actor: 'Developer', action: 'Receives structured findings: "HIGH: Authorization bypass on line 87..."' },
    ],
    keyInsight: 'Skills separate domain expertise from task execution. You don\'t need to be a security expert to get expert-quality security reviews. The skill file IS the expertise; Claude is the execution engine.',
    goodPattern: {
      title: 'Expert persona with systematic checklist and output schema',
      content: `You are a senior security engineer.\n\n## Systematic Checklist\n1. Authentication — every route protected?\n2. Authorization — permission, not just auth?\n3. Input validation — all external input?\n4. Secrets — env vars only?\n\n## Required Output\nSeverity | Location | Issue | Impact | Fix`,
      explanation: 'Defines a process, not just knowledge. The systematic checklist prevents skipping categories. The output schema makes findings comparable across sessions.',
    },
    antiPattern: {
      title: 'Generic "you are an expert" prompt',
      content: `You are an expert who knows about application security.\nPlease review this code for any security issues you find.`,
      consequence: 'Claude gives general security observations without systematic coverage. Findings vary wildly between sessions. No severity scale, no location format, no actionable fixes.',
      fix: 'Define the expert\'s specific methodology, their systematic checklist, and the exact output format. Repeatability comes from process, not just knowledge.',
    },
  },

  'claude-dir/workflows/': {
    sampleFiles: [
      {
        name: 'workflows/feature-development.md',
        description: 'End-to-end feature development procedure with quality gates',
        content: `# Feature Development Workflow

Use this workflow for ALL new features.

## Phase 1: Discovery (before writing any code)
1. Search codebase for existing similar patterns
2. Identify all files that need to change
3. List any new dependencies required
4. Flag breaking changes to existing APIs

## Phase 2: Implementation Order

Implement in this sequence to prevent broken states:
1. **Types first** — update src/types/index.ts or relevant data interfaces
2. **Data layer** — update src/data/*.ts with new constants or structures
3. **Component layer** — create/update React components
4. **Page layer** — wire components into the page component
5. **Route + nav** — add to App.tsx and Sidebar.tsx last

## Phase 3: Quality Gates (run after EACH phase)
${B}bash
npx tsc --noEmit   # must be zero output before proceeding
npm run lint       # must be zero warnings
${B}

## Phase 4: End-to-End Verification
1. \`npm run dev\` — start dev server
2. Navigate to the feature in the browser
3. Test all user interactions
4. Verify dark mode and light mode
5. Check mobile layout

## Hard Rules
- Never skip Phase 2 implementation order
- Never proceed to next phase with TypeScript errors
- Never commit with failing type checks`,
      },
      {
        name: 'workflows/production-hotfix.md',
        description: 'Production hotfix procedure — minimum risk path to fix critical issues',
        content: `# Production Hotfix Workflow

Use ONLY for critical production issues.

## Step 1: Assess (2 min max)
- What is broken? (exact symptom)
- Who is affected? (all users / specific users)
- What is the business impact? (data loss / UX broken / complete outage)

## Step 2: Reproduce Locally (5 min max)
\`\`\`bash
git pull origin main
npm run dev
\`\`\`
Reproduce the exact issue. Document: what input → what failure.

## Step 3: Minimum Viable Fix
- Fix ONLY what is broken
- Do NOT refactor surrounding code in the same change
- Do NOT add unrelated improvements
- Run: npx tsc --noEmit && npm run lint

## Step 4: Emergency Deploy
1. Create PR titled "hotfix: [description]"
2. Tag on-call engineer for emergency review
3. After approval: merge → auto-deploy triggers
4. Monitor error rates and AI accuracy for 15 minutes

## Step 5: Post-Mortem (within 24 hours)
- Root cause analysis
- What test would have caught this?
- Add missing test/eval to tests/
- Document in docs/post-mortems/`,
      },
    ],
    claudeUsage: 'Workflows act as structured operating procedures that guide Claude through multi-step engineering tasks. Unlike commands (single-shot operations), workflows define phases, decision points, and quality gates between steps. They encode institutional process knowledge as executable AI procedures.',
    workflow: [
      { actor: 'Developer', action: '"Run the feature development workflow for the new Settings page"' },
      { actor: 'Claude', action: 'Loads workflows/feature-development.md as the operating procedure' },
      { actor: 'Claude', action: 'Phase 1: Searches codebase for existing settings patterns' },
      { actor: 'Claude', action: 'Phase 2: Creates types → data → component → page (in that order)' },
      { actor: 'Claude', action: 'Phase 3: Runs tsc after each phase, fixes errors before proceeding' },
      { actor: 'Claude', action: 'Phase 4: Reports ready for developer verification in browser' },
    ],
    keyInsight: 'Workflows encode institutional knowledge about HOW to do work correctly. A team\'s hard-won lessons about implementation order, testing gates, and deployment procedures become repeatable, AI-executable procedures.',
    goodPattern: {
      title: 'Phase-based workflow with explicit ordering and quality gates',
      content: `## Phase 2: Implementation Order\n1. Types first\n2. Data layer\n3. Component layer\n4. Page layer\n5. Route + nav — last\n\n## After each phase:\nnpx tsc --noEmit  # must be zero output`,
      explanation: 'Explicit phases prevent skipping steps. Types-first ordering prevents components from using undefined types. Quality gates catch errors before they cascade.',
    },
    antiPattern: {
      title: 'Unordered checklist without gates',
      content: `Feature Development:\n- Create the component\n- Write tests\n- Update the data\n- Fix any errors that come up`,
      consequence: 'Creating components before types causes type errors. Unordered tasks mean intermediate broken states. "Fix any errors that come up" means errors compound instead of being caught early.',
      fix: 'Every workflow specifies implementation ORDER explicitly. Include quality gates between phases. Types before components, data before services, services before routes.',
    },
  },

  'agents': {
    sampleFiles: [
      {
        name: 'agents/planner-agent/system-prompt.md',
        description: 'Planner agent — decomposes goals into executable task DAGs for specialist agents',
        content: `# Planner Agent System Prompt

You are a senior software engineering project planner.
Your role: receive high-level engineering goals and decompose them into precise, ordered task plans for specialist agents.

## Task Schema

When decomposing a goal, output a structured task plan:

${B}json
{
  "goal": "original user goal",
  "tasks": [
    {
      "id": "task-001",
      "type": "research | code | test | doc | deploy",
      "assignee": "retrieval-agent | executor-agent | monitoring-agent",
      "description": "precise, unambiguous task description",
      "dependencies": [],
      "estimatedTokens": 2000,
      "canParallelize": false
    }
  ]
}
${B}

## Planning Rules
1. ALWAYS start with retrieval tasks — never write code before searching for existing patterns
2. Never assign executor tasks before dependent retrieval tasks complete
3. Break tasks exceeding 5000 tokens into smaller units
4. Mark canParallelize true only when tasks share NO file dependencies
5. Always end the plan with a monitoring/review task`,
      },
      {
        name: 'agents/executor-agent/config.ts',
        description: 'Executor agent configuration — write access with safety limits',
        content: `import { createAgent } from '@company/ai-sdk';

export const executorAgent = createAgent({
  name: 'executor-agent',
  model: 'claude-opus-4-7',

  // Executor can read and write files, run commands, search code
  tools: ['read_file', 'write_file', 'run_command', 'search_codebase'],

  // These require human approval or are handled by orchestrator
  restrictedTools: [
    'delete_file',      // requires explicit human confirmation
    'git_push',         // handled by orchestrator after review
    'deploy_service',   // handled by orchestrator with monitoring
  ],

  limits: {
    maxIterations: 50,
    maxTokensPerSession: 200_000,
    requireHumanApproval: [
      'write_file in services/*/src/routes/**',  // API changes need review
      'write_file in infra/**',                   // infra changes always reviewed
    ],
  },

  onError: 'retry-with-context',
  onMaxIterations: 'report-to-orchestrator',
});`,
      },
    ],
    claudeUsage: 'Agents run as autonomous Claude instances in a persistent operational loop: receive task → use tools → observe results → decide next step → repeat. Each agent is optimized for its specialty and has only the tools it needs. The orchestrator coordinates handoffs between agents using the task plan from the planner.',
    workflow: [
      { actor: 'User', action: '"Build a complete user authentication system"' },
      { actor: 'AI Orchestrator', action: 'Routes goal to Planner Agent' },
      { actor: 'Planner Agent', action: 'Decomposes: [research → schema → auth service → tests → docs → deploy]' },
      { actor: 'Retrieval Agent', action: 'Searches codebase — finds existing JWT utilities and user model' },
      { actor: 'Executor Agent', action: 'Implements auth service using retrieved patterns — runs tests after each function' },
      { actor: 'Monitoring Agent', action: 'Reviews for security issues — flags JWT secret in environment check' },
      { actor: 'Executor Agent', action: 'Applies security fix, re-runs tests, all passing' },
      { actor: 'Planner Agent', action: 'Confirms all tasks complete — reports to user with summary' },
    ],
    keyInsight: 'Multi-agent systems work because specialization enables depth. A planner optimized for decomposition, an executor optimized for implementation, and a monitor optimized for quality — each does one thing better than a single generalist agent could.',
    goodPattern: {
      title: 'Specialist agent with scoped tools and safety limits',
      content: `const executorAgent = createAgent({\n  tools: ['read_file', 'write_file', 'run_command'],\n  restrictedTools: ['delete_file', 'git_push'],\n  limits: {\n    maxIterations: 50,\n    requireHumanApproval: ['write_file in infra/**']\n  }\n});`,
      explanation: 'Minimal tool set. Explicit restricted tools list. Iteration limit prevents infinite loops. Human approval for high-risk paths.',
    },
    antiPattern: {
      title: 'Omnipotent agent with unrestricted access',
      content: `const agent = createAgent({\n  tools: 'all',\n  limits: {},\n  systemPrompt: 'You are a helpful AI. Do what the user asks.'\n});`,
      consequence: 'An agent with all tools and no limits is one confused tool call away from a critical incident: dropped tables, force-pushed branches, deleted config files, deployed broken code.',
      fix: 'Principle of least privilege: start with read-only tools. Add write access explicitly per tool. Set max iterations. Require human approval for destructive or high-impact operations.',
    },
  },

  'mcp': {
    sampleFiles: [
      {
        name: 'mcp/servers.json',
        description: 'MCP server registry — connects Claude to external tools and APIs',
        content: `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "\${GITHUB_TOKEN}"
      }
    },
    "postgres-readonly": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres",
               "\${DATABASE_URL}"],
      "permissions": {
        "allow": ["SELECT"],
        "deny": ["INSERT", "UPDATE", "DELETE", "DROP", "TRUNCATE"]
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem",
               "/Users/me/projects/my-app"],
      "readonly": false
    },
    "internal-api": {
      "command": "node",
      "args": ["mcp/servers/internal-api.js"],
      "env": { "API_KEY": "\${INTERNAL_API_KEY}" }
    }
  }
}`,
      },
      {
        name: 'mcp/servers/internal-api.ts',
        description: 'Custom MCP server — exposes company APIs to Claude with input validation',
        content: `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: 'internal-api', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'search_knowledge_base',
      description: 'Full-text search of the internal knowledge base',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', minLength: 1, maxLength: 500 },
          limit: { type: 'number', minimum: 1, maximum: 20, default: 5 }
        },
        required: ['query']
      }
    }
  ]
}));

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  // ALWAYS validate inputs before execution
  if (name === 'search_knowledge_base') {
    if (!args.query || typeof args.query !== 'string') {
      throw new Error('query must be a non-empty string');
    }
    // Sanitize: remove SQL special characters
    const sanitized = args.query.replace(/[';--]/g, '');
    return await searchKB(sanitized, Math.min(args.limit ?? 5, 20));
  }

  throw new Error(\`Unknown tool: \${name}\`);
});

const transport = new StdioServerTransport();
await server.connect(transport);`,
      },
    ],
    claudeUsage: 'At startup, the AI orchestrator connects to all registered MCP servers and calls tools/list on each. The resulting tool catalog is included in Claude\'s system context. During a conversation, when Claude needs real-world data, it emits a tool_use block; the orchestrator routes it to the correct MCP server and returns the result as tool_result for Claude to continue reasoning.',
    workflow: [
      { actor: 'AI Orchestrator', action: 'Reads mcp/servers.json on startup' },
      { actor: 'MCP Servers', action: 'GitHub, Postgres, internal-api all establish connections' },
      { actor: 'Claude', action: 'Receives tool list in context: search_knowledge_base, list_prs, query_db...' },
      { actor: 'User', action: '"Summarize last 5 open PRs and check if any conflict with the auth schema"' },
      { actor: 'Claude', action: 'Emits tool_use: { name: "list_prs", input: { state: "open", limit: 5 } }' },
      { actor: 'GitHub MCP', action: 'Calls GitHub API, returns PR data' },
      { actor: 'Claude', action: 'Emits tool_use: { name: "query_db", input: { sql: "SELECT..." } }' },
      { actor: 'Claude', action: 'Uses both tool_results to generate grounded, accurate analysis' },
    ],
    keyInsight: 'MCP gives Claude a safe, auditable, permission-controlled way to interact with the real world. Every tool call is explicit, logged, and scoped. Without MCP, Claude can only work with information in its context window — with MCP, it can query databases, read PRs, and call any API.',
    goodPattern: {
      title: 'Read-only database with explicit deny list',
      content: `"postgres-readonly": {\n  "permissions": {\n    "allow": ["SELECT"],\n    "deny": ["INSERT", "UPDATE", "DELETE", "DROP", "TRUNCATE"]\n  }\n}`,
      explanation: 'Starting with SELECT-only protects production data. The deny list ensures even if the allow list is misconfigured, destructive operations cannot run.',
    },
    antiPattern: {
      title: 'Unrestricted production database access',
      content: `"postgres": {\n  "command": "npx @modelcontextprotocol/server-postgres",\n  "args": ["postgresql://root:password@prod-db/main"]\n  // No permissions configured\n}`,
      consequence: 'Claude can execute any SQL against production. A confused agent, a prompt injection attack, or an honest mistake can run DELETE FROM users or DROP TABLE without any protection.',
      fix: 'Always start read-only for initial implementation. Add write access explicitly with strict permission lists. Never connect production databases without a deny list for destructive operations.',
    },
  },

  'tests': {
    sampleFiles: [
      {
        name: 'tests/ai-evals/accuracy.eval.ts',
        description: 'AI quality evaluation suite — measures Claude response accuracy over time',
        content: `import { runEval } from '@company/eval-sdk';
import { aiOrchestrator } from '@/services/ai-orchestrator';

// 92% accuracy required — CI fails below this threshold
const ACCURACY_THRESHOLD = 0.92;

export const coreAccuracyEval = runEval({
  name: 'core-accuracy-eval',

  // 200+ golden examples: { input, context, expectedOutput }
  dataset: 'tests/ai-evals/golden-dataset.jsonl',

  async run(example) {
    const response = await aiOrchestrator.chat({
      message: example.input,
      context: example.context,
    });
    return response.content;
  },

  scorers: [
    {
      name: 'semantic-similarity',
      // Returns 0-1 similarity between output and expected
      score: (output, expected) => computeSemanticSimilarity(output, expected),
    },
    {
      name: 'hallucination-check',
      // Returns 0 if output contains claims not grounded in context
      score: (output, context) => checkGrounding(output, context),
    },
    {
      name: 'tool-use-correctness',
      // Verifies Claude used correct tools in correct order
      score: (output, expected) => compareToolUsage(output.toolCalls, expected.expectedTools),
    },
  ],

  threshold: ACCURACY_THRESHOLD,

  onFail(results) {
    console.error(\`Eval FAILED: \${results.failedCount} examples below threshold\`);
    console.error('Worst examples:', results.worstPerforming.slice(0, 3));
    process.exit(1); // Fails CI, blocks merge
  },
});`,
      },
    ],
    claudeUsage: 'AI evals are not used by Claude — they evaluate Claude. They run as a separate CI pipeline when prompts, agent configs, or MCP schemas change. They protect against quality regressions that TypeScript checks and unit tests are blind to: degraded reasoning, hallucinations, wrong tool use.',
    workflow: [
      { actor: 'Engineer', action: 'Opens PR that modifies the AI orchestrator system prompt' },
      { actor: 'GitHub CI', action: 'Detects change to services/ai-orchestrator/ — triggers ai-evals.yml' },
      { actor: 'Eval Pipeline', action: 'Runs 200 golden examples through the updated orchestrator' },
      { actor: 'Eval Pipeline', action: 'Scores: semantic-similarity 88%, hallucination 0.9, tool-use 0.85' },
      { actor: 'Eval Pipeline', action: 'Overall score: 87.7% — below 92% threshold' },
      { actor: 'CI', action: 'FAILS — blocks PR merge, posts results as PR comment' },
      { actor: 'Engineer', action: 'Revises prompt, re-runs evals, achieves 94.2% — PR passes' },
    ],
    keyInsight: 'For AI systems, the TypeScript compiler cannot catch the most important failures. Evals are the quality gate for AI behavior. Without them, "we hope the AI still works" after a prompt change. With them, "we know it does."',
    goodPattern: {
      title: 'Multi-dimension eval suite with CI enforcement',
      content: `scorers: [\n  { name: 'semantic-similarity', ... },\n  { name: 'hallucination-check', ... },\n  { name: 'tool-use-correctness', ... }\n],\nthreshold: 0.92,\nonFail: () => process.exit(1)  // fails CI`,
      explanation: 'Three scorers catch three different failure modes. The 92% threshold is a quantified quality bar. process.exit(1) turns an eval failure into a blocked merge.',
    },
    antiPattern: {
      title: 'Mocking Claude in unit tests',
      content: `// tests/ai-orchestrator.test.ts\nit('calls Claude', () => {\n  const mock = jest.fn().mockReturnValue('ok');\n  expect(orchestrator.chat('hello', mock)).toBeDefined();\n});`,
      consequence: 'Mocking Claude tests the plumbing, not the quality. A prompt change that makes Claude 35% less accurate passes all mocked unit tests. Real users experience the regression; your tests are silent.',
      fix: 'Write evals that call the real Claude API against a golden dataset. Measure semantic quality, not just response existence.',
    },
  },
};

// ── Guided learning path ──────────────────────────────────────────────────────

export const learningPath: LearningStep[] = [
  {
    stepNum: 1,
    nodeId: 'claude-md',
    title: 'The Intelligence Contract',
    estimatedTime: '2 min',
    lesson: 'CLAUDE.md is the first file Claude reads in every session — before any task. It is the initialization script for your AI engineering team. Every command you never have to explain, every TypeScript constraint you never have to re-state, and every architectural decision you never have to re-justify starts here. A 50-line CLAUDE.md well-written is worth 500 hours of re-explanation.',
    keyTakeaway: 'CLAUDE.md is not documentation — it is the session initialization contract. Time you invest writing it is multiplied by every future Claude interaction in the project.',
    question: 'Why must CLAUDE.md include build commands like "npm run dev"?',
    answer: 'Because Claude needs the EXACT command for this specific project. "npm start" may not exist. "yarn build" may use different config. Without explicit commands, Claude guesses and sometimes runs the wrong thing. Explicit commands eliminate this class of error entirely.',
  },
  {
    stepNum: 2,
    nodeId: 'claude-dir',
    title: 'The AI Configuration Layer',
    estimatedTime: '3 min',
    lesson: 'The .claude/ directory transforms Claude from a generic assistant into a project-aware engineering partner. While CLAUDE.md is the constitution, .claude/ is the full body of law: rules governing every task, commands encoding workflows, skills providing expertise on demand, hooks running quality gates automatically. Most engineers skip this and wonder why Claude is inconsistent.',
    keyTakeaway: 'Engineers without .claude/ use Claude as smart autocomplete. Engineers with .claude/ have a tireless expert colleague who has read every document about the project and never forgets the conventions.',
    question: 'What is the difference between .claude/rules/ and .claude/commands/?',
    answer: 'Rules are always-on constraints that govern HOW Claude works (TypeScript conventions, dark mode patterns). Commands are on-demand operations for WHAT to do (/add-page, /fix-ts). Rules shape passive behavior; commands trigger active work.',
  },
  {
    stepNum: 3,
    nodeId: 'claude-dir',
    title: 'Rules as Enforced Constraints',
    estimatedTime: '2 min',
    lesson: 'Rule files in .claude/rules/ are injected into Claude\'s context before relevant tasks. The critical insight: rules are not suggestions — they are constraints that shape code generation. A rule file with ✅/❌ examples, specific compiler flag references, and a verification command produces 99% compliant outputs. A vague rule file produces 70% compliant outputs — and you never know which 30% is wrong.',
    keyTakeaway: 'Rules convert "Claude usually does this right" to "Claude always does this right." The difference between 70% and 99% consistency is rule file specificity.',
    question: 'What makes a rule file effective vs. ineffective?',
    answer: 'Effective: shows ✅/❌ code examples, references the specific compiler option (verbatimModuleSyntax), includes the verification command (npx tsc --noEmit). Ineffective: "write type-safe code" — Claude has no actionable constraint to satisfy.',
  },
  {
    stepNum: 4,
    nodeId: 'claude-dir',
    title: 'Commands as Engineering Velocity',
    estimatedTime: '2 min',
    lesson: 'Slash commands in .claude/commands/ replace repetitive prompting. Every time you find yourself explaining the same context to Claude, that context belongs in a command file. /add-page, /fix-ts, /create-service — each encodes institutional knowledge into an instant, parameterized AI operation. A library of 10 well-designed commands transforms how quickly a team ships.',
    keyTakeaway: 'Commands are reusable prompt programs. Build them from the patterns you repeat. The time to write a command is repaid the second time you would have typed the same instructions.',
    question: 'What is the $ARGUMENTS placeholder in command files?',
    answer: 'When you type "/add-page UserDashboard", Claude Code replaces $ARGUMENTS with "UserDashboard" before executing the command. This makes commands parameterizable — the same template generates any page name.',
  },
  {
    stepNum: 5,
    nodeId: 'services',
    title: 'The AI Orchestration Layer',
    estimatedTime: '3 min',
    lesson: 'The ai-orchestrator service is the heart of a Claude-native backend. It manages the complete Claude interaction lifecycle: assembling system context (CLAUDE.md + rules), building tool definitions from the MCP registry, making Anthropic API calls, handling the tool_use ↔ tool_result loop, streaming responses, and persisting conversations. Getting this right is where production AI systems succeed or fail.',
    keyTakeaway: 'Building a chat UI is easy. Building a production AI orchestrator — with context management, tool lifecycle, observability, and graceful degradation — is the real engineering challenge.',
    question: 'Why does the AI orchestrator manage conversation history?',
    answer: 'Claude has no built-in memory. Each API call starts fresh. The orchestrator must retrieve previous messages and include them in every request to maintain conversation context. Without this, every message appears to start a new conversation.',
  },
  {
    stepNum: 6,
    nodeId: 'mcp',
    title: 'Claude Gets Hands',
    estimatedTime: '3 min',
    lesson: 'Without MCP, Claude works only with text in its context window. With MCP, Claude gains the ability to read databases, call APIs, search the web, execute code, and interact with any external system with an MCP server. MCP is the protocol that transforms Claude from a text generator into an AI that takes real-world actions — safely, auditaly, and with scoped permissions.',
    keyTakeaway: 'MCP is to Claude what HTTP is to a browser. Any tool that speaks MCP is instantly available to Claude without custom integration code. Permission scoping makes it safe for production.',
    question: 'Why should MCP write tools be permission-scoped?',
    answer: 'Because Claude\'s tool calls are based on reasoning, and reasoning can be wrong. An unscoped write tool means a confused agent, a prompt injection, or an honest mistake can cause real damage. Scoping ensures the worst-case Claude error is bounded.',
  },
  {
    stepNum: 7,
    nodeId: 'agents',
    title: 'Autonomous AI Workers',
    estimatedTime: '4 min',
    lesson: 'Single Claude calls handle simple tasks. Complex engineering work — "build an auth system", "debug this production issue", "migrate the entire data layer" — requires sequential decisions with error recovery and state that persists across many steps. Agents solve this with a persistent operational loop: perceive → plan → act → observe → repeat. Specialization (planner, executor, monitor) enables depth.',
    keyTakeaway: 'Agents add value when tasks require: 10+ sequential decisions, error recovery mid-task, persistent state between steps, or specialist knowledge that can\'t fit in one prompt. For simple tasks, a command is better.',
    question: 'Why is the planner agent separate from the executor agent?',
    answer: 'Decomposition and execution require different optimization. A planner needs full system context to make good task DAGs. An executor needs deep focus on one concrete task. Mixing them creates agents mediocre at both.',
  },
  {
    stepNum: 8,
    nodeId: 'packages',
    title: 'Shared Libraries',
    estimatedTime: '2 min',
    lesson: 'packages/ prevents the most common scaling failure: code duplication. When every app and service has its own copy of the AI client, type definitions, and UI components, a single bug fix requires 8 coordinated PRs. packages/ creates one source of truth. Fix once, all consumers get the fix on next dependency update.',
    keyTakeaway: 'Extract to packages/ at the second copy of the same code. By the third copy, the technical debt is already significant. The right time is always earlier than it feels.',
    question: 'What belongs in packages/ai-sdk/ vs services/ai-orchestrator/?',
    answer: 'packages/ai-sdk/ is the generic, reusable Anthropic API wrapper (retry logic, token counting, streaming) used by all services. services/ai-orchestrator/ is the application-specific logic (conversation management, context building, tool routing) for this particular system.',
  },
  {
    stepNum: 9,
    nodeId: 'tests',
    title: 'AI Quality Engineering',
    estimatedTime: '3 min',
    lesson: 'Traditional tests verify that code does what you wrote. AI evals verify that Claude does what you intended. A prompt change, model update, or context window modification can silently degrade AI quality without failing a single unit test. An eval suite with 200 golden examples and a CI threshold is the safety net that catches what traditional tests cannot.',
    keyTakeaway: 'The moment you ship AI to production without evals, you are flying blind. You have no objective signal if a change improved or degraded AI quality. Evals are not optional for production AI — they are the foundation.',
    question: 'What is the minimum useful AI eval suite?',
    answer: '20-50 golden question-answer pairs, a semantic similarity scorer, and a basic hallucination check. This catches the most common failures. Expand to 200+ examples with tool-use correctness scoring before high-stakes production deployment.',
  },
  {
    stepNum: 10,
    nodeId: 'infra',
    title: 'Production Operations',
    estimatedTime: '3 min',
    lesson: 'AI systems fail in production in ways traditional software does not: response quality degrades silently, hallucination rates spike under specific inputs, agent loops get stuck, tool calls fail intermittently. The infra/observability/ layer makes these failures visible and actionable. Without AI-specific monitoring (accuracy trends, hallucination rates, tool success rates), failures are invisible until users complain.',
    keyTakeaway: 'An AI system without observability is a black box that occasionally returns wrong answers for unknown reasons. Instrument everything AI-specific: accuracy per query type, hallucination rate over time, tool call success rate, agent task completion rate.',
    question: 'Which AI-specific metrics should be on the production dashboard?',
    answer: 'Token usage per request (cost), response latency P50/P99, accuracy vs eval baseline, hallucination rate, tool call success rate, agent task completion rate, error rate by error type. Standard web metrics (CPU, memory, HTTP errors) are necessary but not sufficient for AI systems.',
  },
];
