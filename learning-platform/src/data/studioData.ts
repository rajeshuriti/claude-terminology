export interface WorkflowStep {
  actor: 'User' | 'Claude' | 'System' | 'Tool' | 'MCP';
  action: string;
  detail: string;
}

export interface StudioItem {
  id: string;
  label: string;
  emoji: string;
  color: string;
  tagline: string;
  what: string;
  why: string;
  analogy: string;
  analogyDetail: string;
  workflow: WorkflowStep[];
  useCases: string[];
  enterprise: string[];
  bestPractices: string[];
  mistakes?: string[];
  security?: string;
}

export interface ConnectorItem {
  id: string;
  label: string;
  emoji: string;
  color: string;
  tagline: string;
  what: string;
  why: string;
  analogy: string;
  workflow: WorkflowStep[];
  useCases: string[];
  enterprise: string[];
  security: string;
}

// ── Shared items (reused across multiple sidebars) ──────────────────────────

const projectsItem: StudioItem = {
  id: 'projects',
  label: 'Projects',
  emoji: '📁',
  color: '#0ea5e9',
  tagline: 'Scoped AI workspaces with persistent organizational memory',
  what: 'Projects are persistent workspaces that give Claude deep context about a specific domain, team, or initiative. All conversations share the same instructions, uploaded documents, and history.',
  why: 'Without projects, you re-explain your context every conversation. With projects, Claude permanently remembers your codebase, team standards, and operational constraints.',
  analogy: 'A new hire who read your entire company handbook before day one',
  analogyDetail: 'Imagine hiring a contractor who reads your full company handbook, architecture docs, and team norms before starting — and never forgets any of it. Every conversation in a project starts with Claude having complete context automatically.',
  workflow: [
    { actor: 'User', action: 'Creates project workspace', detail: '"Create project: E-commerce Platform Engineering." Adds tech stack and team description.' },
    { actor: 'User', action: 'Adds context documents', detail: 'Uploads CLAUDE.md, architecture docs, API references, coding standards, business requirements.' },
    { actor: 'User', action: 'Sets custom instructions', detail: '"Always use TypeScript strict mode. Security team reviews MCP changes. No direct DB writes from agents."' },
    { actor: 'Claude', action: 'Loads full context in every conversation', detail: 'Every new chat starts with all docs + instructions loaded. Zero re-explaining needed, ever.' },
  ],
  useCases: [
    'Engineering: codebase context, architecture docs, coding standards — shared across team',
    'Customer initiatives: requirements, personas, brand voice, business rules',
    'Research programs: literature, hypotheses, experimental data, running findings',
    'Operations: runbooks, incident history, system diagrams, team responsibilities',
  ],
  enterprise: [
    'Platform Engineering project: all infra docs + standards, shared by all engineers',
    'Client projects: agency creates per-client project with brand guide + requirements',
    'Compliance: legal team project holds regulatory docs for consistent AI interpretation',
  ],
  bestPractices: [
    'Add your most important reference docs first — they compound in value over time',
    'Write project instructions like CLAUDE.md: commands, conventions, constraints',
    'Keep projects focused — one domain per project, not one massive company project',
    'Share with your team — AI context is a team asset, not individual knowledge',
  ],
  mistakes: [
    'Empty projects — value comes from context added, not the project itself',
    'Too broad scope — a project about "everything" serves no specific use case well',
    'Outdated documents — stale context misleads Claude; audit and refresh regularly',
  ],
};

const customizeItem: StudioItem = {
  id: 'customize',
  label: 'Customize',
  emoji: '⚙️',
  color: '#8b5cf6',
  tagline: 'Rules, commands, skills — tuning Claude\'s behavior for your team',
  what: 'Customize is where you configure how Claude behaves in your project. Rules define constraints. Commands create slash shortcuts. Skills inject domain expertise. Together they turn Claude into a specialist for your exact stack.',
  why: 'Generic Claude behavior isn\'t wrong — it\'s just not optimized. Customize eliminates repeated corrections by encoding your standards permanently into Claude\'s operating environment.',
  analogy: 'Onboarding handbook + keyboard shortcuts + specialist training combined',
  analogyDetail: 'When you hire an engineer you give them an onboarding doc (rules), teach them team shortcuts (commands), and pair them with domain experts (skills). Customize does all three for Claude — permanently and automatically.',
  workflow: [
    { actor: 'User', action: 'Identifies recurring correction', detail: '"Claude keeps writing inline ternaries instead of our tw() utility for dark mode."' },
    { actor: 'User', action: 'Encodes as a rule', detail: 'Adds .claude/rules/dark-mode.md: "Use tw() from @/lib/dm — never inline ternaries for dark mode."' },
    { actor: 'Claude', action: 'Applies rule automatically every session', detail: 'Rule loads at startup. Claude writes tw() without reminders. One correction, permanent fix.' },
    { actor: 'User', action: 'Creates command for complex recurring tasks', detail: 'Defines /add-page: scaffold page + add route + add sidebar entry — one command, full flow.' },
  ],
  useCases: [
    'Rules: TypeScript constraints, dark mode patterns, API conventions, test requirements',
    'Commands: /add-page, /fix-ts, /review-pr, /run-evals, /deploy-staging',
    'Skills: Security auditor, RAG specialist, API designer, performance expert',
    'Templates: Boilerplate starters for pages, services, agents, MCP servers',
  ],
  enterprise: [
    'Shared .claude/: all engineers get identical Claude behavior via version-controlled config',
    'Regulated industries: compliance rules prevent Claude suggesting non-compliant patterns',
    'Domain specialization: skills give Claude expertise in your niche technology stack',
  ],
  bestPractices: [
    'Start with rules for most frequently violated conventions — highest immediate ROI',
    'Write rules as positive constraints — "use X" is clearer than "don\'t use Y"',
    'Version-control .claude/ — treat it as critical engineering infrastructure',
    'Review and update regularly — rules decay as your stack evolves',
  ],
};

// ── Chat suggestion chips ────────────────────────────────────────────────────

export const chatChips: StudioItem[] = [
  {
    id: 'write',
    label: 'Write',
    emoji: '✏️',
    color: '#7c3aed',
    tagline: 'Turn ideas into polished content instantly',
    what: 'Content generation across all formats — emails, documentation, blog posts, summaries, rewrites. Claude handles the blank page so you focus on direction and refinement.',
    why: 'The hardest part of writing is starting. Claude eliminates blank-page syndrome and handles the drafting, leaving humans to direct and refine.',
    analogy: 'A ghostwriter with expertise in everything',
    analogyDetail: 'Like a ghostwriter who has read everything ever written, deeply understands any audience, and never gets writer\'s block. You provide the intent; Claude provides polished words instantly.',
    workflow: [
      { actor: 'User', action: 'Describes intent and audience', detail: '"Write a technical blog post explaining MCP to senior engineers. Practical tone, no fluff, 800 words."' },
      { actor: 'Claude', action: 'Drafts complete structured content', detail: 'Generates intro, body sections with examples, and conclusion following your specified tone.' },
      { actor: 'User', action: 'Refines with natural language', detail: '"Shorten section 2, add a real-world analogy, end with a call to action."' },
      { actor: 'Claude', action: 'Iterates to final version', detail: 'Applies all changes while preserving the structure and tone you approved.' },
    ],
    useCases: [
      'Email drafts — client communications, executive updates, incident reports',
      'Technical documentation — API references, runbooks, architecture decision records',
      'Blog posts — engineering blogs, thought leadership, product announcements',
      'Summaries — meeting notes, research synthesis, weekly status updates',
      'Rewrites — simplify complex content, change tone, adapt for new audiences',
    ],
    enterprise: [
      'Content pipeline: Marketing describes campaigns → Claude drafts all content → team edits',
      'Technical docs: Engineers describe features → Claude writes → tech writers polish',
      'Executive comms: Leadership provides bullet points → Claude drafts polished memos',
    ],
    bestPractices: [
      'Always give Claude your target audience — "for a non-technical VP" changes everything',
      'Specify tone explicitly — "professional but not stiff", "casual but credible"',
      'Give length targets — "under 300 words" prevents unnecessary padding',
      'Use artifacts for long content so you can edit in place',
    ],
    mistakes: [
      'Accepting first drafts without iteration — treat output as a starting point',
      'Vague requests — "write something about AI" produces generic filler',
      'No audience context — Claude can\'t optimize for readers it doesn\'t know about',
    ],
  },
  {
    id: 'learn',
    label: 'Learn',
    emoji: '🎓',
    color: '#0ea5e9',
    tagline: 'Your personal tutor with expertise in every subject',
    what: 'Interactive tutoring at any depth on any subject. Claude explains, answers follow-ups, creates examples, adjusts complexity, and tests your understanding — all adapted to what you already know.',
    why: 'Traditional learning materials are static. Claude adapts to exactly where you are, explains differently until something clicks, and goes as deep or shallow as you need.',
    analogy: 'A personal professor for every field, available 24/7',
    analogyDetail: 'Like a professor who adjusts complexity based on what you already know, never makes you feel dumb for basics, and can switch from Feynman simplicity to expert depth in the same conversation.',
    workflow: [
      { actor: 'User', action: 'Asks a question at any level', detail: '"Explain how MCP tool calling works in Claude."' },
      { actor: 'Claude', action: 'Calibrates and explains', detail: 'Reads your phrasing to judge experience level. Provides structured explanation with analogy.' },
      { actor: 'User', action: 'Digs deeper on unclear part', detail: '"I didn\'t follow the tool_result step. Show me the actual JSON."' },
      { actor: 'Claude', action: 'Goes concrete with examples', detail: 'Shows annotated JSON for the full tool_use → tool_result cycle.' },
      { actor: 'User', action: 'Tests understanding', detail: '"Quiz me on this."' },
      { actor: 'Claude', action: 'Creates targeted exercises', detail: 'Generates questions about what you just learned, explains any mistakes.' },
    ],
    useCases: [
      'Learning new technology — TypeScript generics, Kubernetes, AI architectures',
      'Concept breakdown — complex ideas explained via analogies you already understand',
      'Research synthesis — summarize papers, compare approaches, extract key findings',
      'Exam preparation — practice questions, weak area explanations, progress checks',
      'On-the-job learning — understand unfamiliar codebases or documentation quickly',
    ],
    enterprise: [
      'Onboarding: "Explain our architecture to a new hire who knows Python but not TypeScript"',
      'Compliance training: Interactive Q&A on policies, regulations, and procedures',
      'Customer education: Generate content explaining your product to users',
    ],
    bestPractices: [
      'State your experience level upfront — "I know Python but not Rust"',
      'Ask for analogies to concepts you already understand well',
      'Say when you\'re confused — Claude never tires of re-explaining differently',
      'Ask Claude to quiz you at the end to confirm understanding stuck',
    ],
    mistakes: [
      'Accepting explanations without testing understanding — always ask for a quiz',
      'Not giving your background — Claude may over- or under-explain without it',
      'Moving on when confused — one "explain this differently" often solves it',
    ],
  },
  {
    id: 'code-chip',
    label: 'Code',
    emoji: '</>',
    color: '#10b981',
    tagline: 'From idea to deployed feature with AI-native engineering',
    what: 'Full AI-native development — Claude reads, writes, refactors, and debugs across your entire codebase. In Claude Code, it actually executes changes rather than just suggesting them.',
    why: 'Traditional code assistants suggest. Claude Code executes — runs tests, edits files, iterates until correct. The difference between advice and action at every step.',
    analogy: 'A senior engineer who works alongside you, knows your full codebase',
    analogyDetail: 'Like a senior engineer who has read every line of your code, knows your conventions deeply, and handles complex multi-file changes autonomously — while explaining every decision.',
    workflow: [
      { actor: 'User', action: 'Describes task with context', detail: '"Add JWT auth to auth-service using the existing middleware pattern."' },
      { actor: 'Claude', action: 'Reads context and existing patterns', detail: 'Reads CLAUDE.md for conventions. Explores existing auth code. Forms implementation plan.' },
      { actor: 'Claude', action: 'Implements and verifies', detail: 'Writes code, runs tsc and tests after each function, fixes failures before continuing.' },
      { actor: 'User', action: 'Reviews and ships', detail: 'Reviews the diff. Claude explains decisions. Commits and creates PR.' },
    ],
    useCases: [
      'Feature implementation — Claude builds to your conventions without re-explaining',
      'Debugging — reads error trace, finds root cause, implements fix',
      'Refactoring — safely restructures with full awareness of all dependencies',
      'Code review — analyzes PRs against your specific standards, not generic ones',
      'Architecture exploration — "What would it take to migrate from REST to GraphQL?"',
    ],
    enterprise: [
      'Engineering velocity: Claude Code consistently reduces routine task time by 2-5x',
      'Code review automation: Claude reviews every PR before human reviewer',
      'Legacy migration: Claude understands old patterns, rewrites safely to new architecture',
    ],
    bestPractices: [
      'Write comprehensive CLAUDE.md — the most valuable investment you can make',
      'Use .claude/rules/ to encode team standards as enforced constraints',
      'Have Claude run tests — require it to verify correctness, not just write code',
      'Build incrementally — small verifiable tasks beat large unbounded rewrites',
    ],
    mistakes: [
      'Massive vague tasks — "rewrite our backend" produces unreliable results',
      'No CLAUDE.md — Claude operates on generic defaults, missing your conventions',
      'Not reading the diff — always understand what changed before committing',
    ],
  },
  {
    id: 'life',
    label: 'Life stuff',
    emoji: '✨',
    color: '#f59e0b',
    tagline: 'Personal productivity, planning, and life management',
    what: 'Practical AI assistance for everyday life — travel planning, communication, organization, decision-making, and anything requiring thinking, writing, or planning.',
    why: 'The reasoning capabilities that make Claude powerful in enterprise work just as well for personal life — and most people massively underutilize this.',
    analogy: 'A brilliant personal assistant covering every role simultaneously',
    analogyDetail: 'Like having a friend who is simultaneously a travel agent, financial advisor, communication coach, event planner, and research assistant — available instantly, with no judgment.',
    workflow: [
      { actor: 'User', action: 'Describes the life task with constraints', detail: '"Plan a 10-day Japan trip for 2. $5k budget. One loves history, one loves food."' },
      { actor: 'Claude', action: 'Generates personalized plan', detail: 'Day-by-day itinerary balancing both preferences, with budget breakdown and booking priorities.' },
      { actor: 'User', action: 'Refines preferences', detail: '"Skip Osaka, more time in Kyoto. Avoid peak tourist hours."' },
      { actor: 'Claude', action: 'Adjusts and optimizes', detail: 'Revises with timing strategy per site. Suggests optimal arrival times for popular temples.' },
    ],
    useCases: [
      'Travel — detailed itineraries, packing lists, local tips, budget tracking',
      'Communication — difficult emails, awkward messages, professional negotiations',
      'Decision making — pros/cons analysis, scenario modeling, second opinions',
      'Organization — goal decomposition, project planning, habit systems',
      'Research — product comparisons, expert summaries, background reading',
    ],
    enterprise: [
      'Personal development: goal setting, skill roadmaps, career path planning',
      'Communication coaching: navigating difficult conversations, giving feedback',
      'Event coordination: conference planning, offsites, detailed budget management',
    ],
    bestPractices: [
      'Give constraints upfront — budget, time, hard preferences, restrictions',
      'Share context about your situation — advice improves dramatically with background',
      'Iterate — first answer is rarely perfect; push back and refine freely',
      'Use artifacts for long plans so you can edit them in place',
    ],
  },
  {
    id: 'claudeschoice',
    label: "Claude's choice",
    emoji: '✺',
    color: '#d97706',
    tagline: 'Let Claude surface the highest-value workflows for you',
    what: 'Claude recommends workflows tailored to common needs — beginner journeys, productivity accelerators, trending AI-native patterns. It surfaces capabilities you might not discover on your own.',
    why: 'Most people don\'t know what they don\'t know. Claude\'s choice shows the highest-leverage capabilities that change how professionals work with AI.',
    analogy: 'A GPS that suggests better routes you didn\'t know existed',
    analogyDetail: 'Like a navigation app that not only takes you where you\'re going but proactively suggests faster routes, shortcuts, and destinations you\'d enjoy — without you asking.',
    workflow: [
      { actor: 'User', action: 'Clicks Claude\'s choice', detail: 'No input needed — Claude surfaces recommendations based on high-value usage patterns.' },
      { actor: 'Claude', action: 'Presents curated recommendations', detail: 'Shows 3-5 high-leverage workflows grouped by beginner/intermediate/advanced.' },
      { actor: 'User', action: 'Selects a suggested workflow', detail: 'Picks "Build your first MCP server" or "Run AI evals on your codebase."' },
      { actor: 'Claude', action: 'Guides through the workflow', detail: 'Step-by-step guided experience with checkpoints, examples, and educational context.' },
    ],
    useCases: [
      'Beginner onboarding — discover the most impactful Claude features first',
      'Workflow discovery — find AI-native approaches to manual repetitive tasks',
      'Productivity audit — identify where Claude can save the most time per week',
      'Advanced patterns — see what power users are doing differently',
    ],
    enterprise: [
      'Team adoption: curated use cases matched to each team\'s role and stack',
      'ROI identification: which workflows save the most engineer-hours per week?',
    ],
    bestPractices: [
      'Start here if you\'re new — it surfaces the highest-value entry points',
      'Revisit periodically — capabilities and recommendations evolve over time',
    ],
  },
];

// ── Chat sidebar items ───────────────────────────────────────────────────────

export const chatSidebarItems: StudioItem[] = [
  projectsItem,
  {
    id: 'artifacts',
    label: 'Artifacts',
    emoji: '📄',
    color: '#10b981',
    tagline: 'Interactive AI-generated outputs you can view, edit, and export',
    what: 'Artifacts are Claude\'s structured outputs — code, documents, diagrams, tables. Unlike chat messages, artifacts appear in a dedicated workspace where you can view, edit, and work with them directly.',
    why: 'Chat outputs scroll past and are hard to iterate on. Artifacts are persistent, editable workspaces for content that needs to live beyond a single message.',
    analogy: 'A collaborative document that AI generates on demand',
    analogyDetail: 'Like a Google Doc that Claude writes instantly from your description — then you can edit, refine, and export. The artifact is a collaborative workspace, not just a text response.',
    workflow: [
      { actor: 'User', action: 'Requests structured content', detail: '"Create a project status report for the Q4 API migration with risk assessment and timeline."' },
      { actor: 'Claude', action: 'Generates formatted artifact', detail: 'Creates structured report: exec summary, timeline table, risk matrix, recommendations.' },
      { actor: 'User', action: 'Edits and refines in place', detail: 'Updates sections directly. Asks Claude to revise specific parts. Iterates without losing work.' },
      { actor: 'User', action: 'Exports finished artifact', detail: 'Copies, downloads, or shares the polished document.' },
    ],
    useCases: [
      'Code artifacts — write, view, and iterate on complete working code files',
      'Document artifacts — reports, proposals, briefs needing editing and structure',
      'Data artifacts — tables and analyses from data you provide',
      'Diagrams — architecture maps, flowcharts, sequence diagrams',
    ],
    enterprise: [
      'Report generation: Claude generates status reports as artifacts teams can edit',
      'Documentation: Artifacts become first drafts for technical documentation',
      'Code scaffolding: Artifacts give engineers starting points, not blank files',
    ],
    bestPractices: [
      'Ask for artifacts explicitly — "Create this as an artifact I can edit"',
      'Use for any output you\'ll want to revisit, edit, or export',
      'Reference prior artifacts in follow-up — Claude can update them in place',
      'Keep requests focused — one clear output per artifact works best',
    ],
  },
  customizeItem,
];

// ── Cowork sidebar items ─────────────────────────────────────────────────────

export const coworkSidebarItems: StudioItem[] = [
  projectsItem,
  {
    id: 'scheduled',
    label: 'Scheduled',
    emoji: '⏰',
    color: '#8b5cf6',
    tagline: 'Recurring AI workflows that run automatically on your schedule',
    what: 'Scheduled tasks define Claude workflows that run automatically — daily briefings, weekly reports, nightly AI evaluations, and recurring operational pipelines without human intervention.',
    why: 'Many valuable AI workflows are repetitive. Scheduling turns one-time prompts into automated operational systems that run reliably without someone remembering to trigger them.',
    analogy: 'Cron jobs with AI reasoning instead of bash scripts',
    analogyDetail: 'Like cron jobs — you define what should happen and when, and it executes reliably. But instead of bash commands, you\'re scheduling AI reasoning workflows that adapt intelligently to what they find.',
    workflow: [
      { actor: 'User', action: 'Defines the recurring workflow', detail: '"Every Monday 9am: pull GitHub PRs from last week, summarize code quality trends, post to #engineering Slack."' },
      { actor: 'System', action: 'Triggers on schedule', detail: 'Monday 9am: workflow activates with defined context and MCP tool access.' },
      { actor: 'Claude', action: 'Executes the workflow end-to-end', detail: 'GitHub MCP → retrieves PR data → analyzes patterns → formats summary → Slack MCP → posts.' },
      { actor: 'User', action: 'Receives automated report', detail: 'Engineers arrive Monday morning to Claude\'s analysis already in Slack.' },
    ],
    useCases: [
      'Daily standup summaries — pull GitHub activity, format team update automatically',
      'Weekly engineering reports — PR analysis, code quality trends, velocity metrics',
      'Nightly AI evaluations — run eval suite against latest model/prompt changes',
      'Automated monitoring — watch metrics, send notifications when thresholds crossed',
    ],
    enterprise: [
      'Executive briefings: "Every Friday 4pm: generate executive summary of all engineering work"',
      'Compliance reporting: "Monthly: review all production changes against compliance rules"',
      'Security scanning: "Nightly: scan all code merged this week for security patterns"',
    ],
    bestPractices: [
      'Test manually first — run the workflow once before scheduling',
      'Define clear output format — especially for reports going to stakeholders',
      'Add error handling instructions — "If GitHub API fails, note it rather than skipping"',
      'Start simple before building complex chained pipelines',
    ],
  },
  {
    id: 'live-artifacts',
    label: 'Live artifacts',
    emoji: '⚡',
    color: '#10b981',
    tagline: 'Dynamic AI-generated outputs connected to live data sources',
    what: 'Live Artifacts are AI-generated outputs connected to data sources. Unlike static documents, they refresh automatically — dashboards, reports, and analysis that always reflect current information.',
    why: 'AI outputs become stale the moment they\'re generated. Live Artifacts connect Claude\'s analysis to real data streams — insights are always current, not from yesterday\'s report.',
    analogy: 'A spreadsheet where the formulas are AI reasoning over live data',
    analogyDetail: 'Like a spreadsheet where formulas aren\'t just math — they\'re AI reasoning over live data. The "formula" says: "Every hour, read our database, summarize trends, highlight anomalies, update this dashboard."',
    workflow: [
      { actor: 'User', action: 'Requests a live artifact', detail: '"Create a live engineering health dashboard that refreshes hourly from our metrics API."' },
      { actor: 'Claude', action: 'Generates artifact with data connections', detail: 'Creates structured artifact with defined data sources, refresh triggers, and display format.' },
      { actor: 'System', action: 'Refreshes automatically on schedule', detail: 'Every hour: pulls metrics, Claude re-analyzes, updates with fresh data and new insights.' },
      { actor: 'User', action: 'Always views current insights', detail: 'Opens artifact to see current status. Data is fresh, not from yesterday\'s report.' },
    ],
    useCases: [
      'Engineering dashboards — deployment frequency, error rates, AI accuracy trends',
      'Sales reports — live pipeline analysis, deal status, revenue tracking',
      'Customer health — usage patterns, at-risk account scores, renewal status',
      'Research summaries — continuously updated literature review from new publications',
    ],
    enterprise: [
      'Executive AI dashboard: "Live view of all AI systems — accuracy, usage, costs, anomalies"',
      'Customer status pages: "AI-generated status explaining outages in plain language"',
      'Competitive intelligence: "Weekly refresh of competitor product updates"',
    ],
    bestPractices: [
      'Define clear refresh triggers — time-based or event-based',
      'Specify exactly what data to pull — Claude needs precise access instructions',
      'Design for scanning — key insights should be visible in 30 seconds',
      'Include anomaly detection — "Flag anything that changed more than 20% since last refresh"',
    ],
  },
  {
    id: 'dispatch',
    label: 'Dispatch',
    emoji: '🎯',
    color: '#ef4444',
    tagline: 'AI task orchestration — delegate, route, and coordinate at scale',
    what: 'Dispatch is Claude\'s task routing system. Define complex multi-step workflows, delegate to specialized agents, and coordinate AI work across systems with human checkpoints at critical junctions.',
    why: 'Complex workflows need coordination. Dispatch routes tasks to the right workers, manages dependencies, and ensures end-to-end completion without constant supervision.',
    analogy: 'Air traffic control for AI tasks — coordinates without flying',
    analogyDetail: 'Air traffic control doesn\'t fly planes — it coordinates them safely. Dispatch doesn\'t execute tasks — it routes them, manages sequencing, handles failures, and ensures every task lands safely.',
    workflow: [
      { actor: 'User', action: 'Submits complex goal', detail: '"Build and ship the new auth system today: design, implement, test, document, deploy."' },
      { actor: 'System', action: 'Decomposes into task graph', detail: 'Breaks into ordered DAG: [research → design → implement → test → document → deploy].' },
      { actor: 'Claude', action: 'Routes to specialist agents', detail: 'Research agent finds patterns. Executor implements. Monitor reviews quality at each stage.' },
      { actor: 'System', action: 'Human checkpoint before deploy', detail: 'Sends summary to engineer for approval. No irreversible action without explicit sign-off.' },
    ],
    useCases: [
      'Feature delivery — research → implement → test → review → deploy as orchestrated flow',
      'Content production — brief → research → draft → review → publish with AI at each stage',
      'Incident response — detect → diagnose → remediate → post-mortem as coordinated pipeline',
    ],
    enterprise: [
      'Engineering automation: "All PRs: AI review → test → security scan → human approval → deploy"',
      'Customer onboarding: "New customer: provision → configure → educate → monitor → success"',
      'Risk management: "Major change: impact analysis → stakeholder review → approval → execute"',
    ],
    bestPractices: [
      'Define handoff criteria — when is a subtask done enough to trigger the next?',
      'Include human checkpoints for irreversible operations — deploy, delete, send',
      'Design for failure — what happens when a subtask fails? Retry, escalate, or stop?',
      'Log everything — audit trails are essential for understanding what happened',
    ],
    security: 'Dispatch has significant system access. Apply least-privilege permissions per workflow. Require human approval for destructive operations. Log all task executions with actor, action, timestamp, and result.',
  },
  customizeItem,
];

// ── Code sidebar items ───────────────────────────────────────────────────────

export const codeSidebarItems: StudioItem[] = [
  {
    id: 'sessions',
    label: 'Sessions',
    emoji: '💻',
    color: '#0ea5e9',
    tagline: 'Persistent coding conversations with full project context',
    what: 'Claude Code sessions are engineering conversations where Claude has full access to your project — files, git history, running tests, terminal. It remembers decisions from prior sessions and builds on them.',
    why: 'Traditional assistants start fresh every conversation. Sessions maintain codebase context, recent decisions, and work in progress — compounding in value the longer you use them.',
    analogy: 'A senior engineer assigned long-term to your project',
    analogyDetail: 'Like a senior engineer who has been on your team for months — knows the codebase intimately, remembers last week\'s architecture decisions, picks up exactly where you left off without any re-onboarding.',
    workflow: [
      { actor: 'Claude', action: 'Auto-loads project context', detail: 'Reads CLAUDE.md, .claude/rules/, git status, recent commits, open files before first message.' },
      { actor: 'Claude', action: 'Acknowledges prior work', detail: '"I see the JWT middleware from our last session is partially done. Continue from here?"' },
      { actor: 'User', action: 'Directs next task', detail: '"Yes — also add rate limiting. See the existing pattern in gateway-service."' },
      { actor: 'Claude', action: 'Executes and verifies', detail: 'Reads pattern, implements consistently, runs tests, fixes failures, reports completion with diff.' },
    ],
    useCases: [
      'Feature development — multi-session implementation of complex features',
      'Debugging — reads error trace, finds root cause, implements fix with tests',
      'Refactoring — safely restructures with full dependency awareness',
      'Code review — analyzes PRs against your specific team standards',
      'Architecture exploration — "What\'s the impact of switching to event sourcing?"',
    ],
    enterprise: [
      'Engineering velocity: Claude Code sessions reduce routine task time by 2-5x consistently',
      'Knowledge transfer: New engineers learn the codebase by asking Claude to explain it',
      'Technical debt: "Refactor one module per sprint" as scheduled recurring sessions',
    ],
    bestPractices: [
      'Keep CLAUDE.md current and comprehensive — it\'s the most valuable investment',
      'Use .claude/rules/ to encode standards that Claude enforces without reminders',
      'Have Claude run tests before declaring tasks complete — don\'t just accept code',
      'Use /compact when context fills up — preserve key facts, restart efficiently',
    ],
    mistakes: [
      'No CLAUDE.md — Claude operates on generic defaults, missing your conventions',
      'Accepting code without tests — plausible-looking wrong code is the hardest bug',
      'Unbounded tasks — 10 targeted sessions beat one "refactor everything" session',
    ],
  },
  {
    id: 'routines',
    label: 'Routines',
    emoji: '🔄',
    color: '#8b5cf6',
    tagline: 'Reusable AI engineering workflows you trigger on demand',
    what: 'Routines are saved, reusable Claude Code workflows that encode complex engineering tasks as repeatable procedures. Define once, trigger with a command, Claude executes identically every time.',
    why: 'Engineering has high-value repetitive tasks: PR reviews, deployment checklists, security scans. Routines ensure these happen the same rigorous way every time — not depending on who runs them or when.',
    analogy: 'Bash scripts with AI reasoning and context built in',
    analogyDetail: 'Like scripts that aren\'t just commands — they\'re intelligent workflows that understand context, adapt to what they find, and explain what they\'re doing. The script doesn\'t just run lint — it analyzes results, prioritizes issues, and drafts fixes.',
    workflow: [
      { actor: 'User', action: 'Defines routine once', detail: 'Creates "pr-review": run tests → check types → scan security patterns → check conventions → draft review.' },
      { actor: 'User', action: 'Triggers on every PR', detail: 'Runs /pr-review. Claude executes the full analysis identically on every pull request.' },
      { actor: 'Claude', action: 'Executes all steps reliably', detail: 'tsc --noEmit → tests → security grep → convention check → generates structured review comment.' },
      { actor: 'Claude', action: 'Delivers consistent quality', detail: 'Every PR gets identical thorough analysis — no review fatigue, no missed steps, no variation.' },
    ],
    useCases: [
      'PR review — comprehensive review before human reviewer ever sees the PR',
      'Deployment checklist — verify all conditions met before production deploy',
      'Security scan — check new code for injection, auth bypass, secret exposure',
      'Performance audit — find N+1 queries, missing indexes, expensive operations',
    ],
    enterprise: [
      'Quality gates: Every PR runs "company-standards-check" routine automatically via CI',
      'Compliance audit: Monthly "compliance-review" checks all recent changes against rules',
      'Incident response: "incident-triage" routine standardizes first 15 minutes of every P0',
    ],
    bestPractices: [
      'Define exact output format — specify what the routine should produce',
      'Make routines idempotent — safe to run multiple times on the same input',
      'Version your routines — like code, they need review and improvement over time',
      'Combine with hooks — trigger routines automatically on git events',
    ],
  },
  customizeItem,
];

// ── Connectors ───────────────────────────────────────────────────────────────

export const connectors: ConnectorItem[] = [
  {
    id: 'github',
    label: 'GitHub',
    emoji: '🐙',
    color: '#6366f1',
    tagline: 'Claude becomes a senior engineer with full repository access',
    what: 'GitHub MCP gives Claude read and write access to repositories — read code, create branches, write commits, open PRs, review pull requests, and manage issues.',
    why: 'Without GitHub, Claude only suggests code changes. With it, Claude implements them end-to-end — from reading the codebase to shipping the PR.',
    analogy: '"Claude becomes a senior engineer with full repo access and commit rights."',
    workflow: [
      { actor: 'User', action: 'Describes the feature', detail: '"Add rate limiting to the auth endpoint. Follow the pattern in gateway-service."' },
      { actor: 'Claude', action: 'Reads existing code', detail: 'GitHub MCP reads gateway-service rate-limit implementation and auth-service structure.' },
      { actor: 'Claude', action: 'Creates branch and implements', detail: 'Creates feat/auth-rate-limiting branch. Implements following existing pattern exactly.' },
      { actor: 'Claude', action: 'Opens pull request', detail: 'Creates PR with description, links issues, assigns reviewers per CODEOWNERS.' },
    ],
    useCases: [
      'Implement features end-to-end: branch → code → test → PR',
      'Read codebase before writing anything new — understand existing patterns first',
      'Automated PR review — Claude reviews every PR before human reviewer',
      'Issue resolution — "Fix this bug" → Claude reads issue, implements fix, closes it',
    ],
    enterprise: [
      'Engineering teams use Claude to maintain all internal tooling and automation',
      'Security teams automatically review every PR for common vulnerability patterns',
      'Platform teams keep documentation in sync with all codebase changes',
    ],
    security: 'Least privilege: read-only by default. Separate bot account for writes. Branch protection required — no direct push to main. Log all commits. Human approval before any production-affecting operation.',
  },
  {
    id: 'slack',
    label: 'Slack',
    emoji: '💬',
    color: '#4a154b',
    tagline: 'Claude joins your team communication channels',
    what: 'Slack MCP lets Claude read channels, send messages, search history, and respond to mentions — an active participant in team communication workflows.',
    why: 'Team knowledge lives in Slack. Without it, Claude operates blind to decisions, context, and ongoing conversations. With it, Claude synthesizes tribal knowledge and automates communication.',
    analogy: '"Claude sits at a desk in your office, reading and responding to messages."',
    workflow: [
      { actor: 'User', action: 'Tags @claude in channel', detail: '"@claude Summarize all blockers mentioned in #engineering this week."' },
      { actor: 'Claude', action: 'Reads channel history semantically', detail: 'Searches 7 days of messages. Identifies blockers, owners, and business impact.' },
      { actor: 'Claude', action: 'Synthesizes and posts', detail: '5 blockers, owners, days blocked, impact — formatted for immediate action by the team.' },
      { actor: 'User', action: 'Acts on the insights', detail: 'Manager uses summary to prioritize unblocking work in next standup.' },
    ],
    useCases: [
      'Standup summaries — pull previous day\'s updates, format for team review',
      'Incident communications — draft stakeholder updates during active incidents',
      'Knowledge retrieval — "What did we decide about X in last month\'s architecture meeting?"',
      'Cross-team coordination — route questions to right people automatically',
    ],
    enterprise: [
      'Executive briefings: Every Monday, Claude posts prior week summary to #exec-updates',
      'Incident response: Claude drafts customer-facing incident comms in real time',
      'Customer escalations: Claude monitors for customer name mentions, alerts CSM team',
    ],
    security: 'Minimal scopes only — read:channels may suffice; restrict write:messages. Never post publicly without human approval first. Audit all Claude-sent messages. No HR or legal channel access.',
  },
  {
    id: 'postgresql',
    label: 'PostgreSQL',
    emoji: '🐘',
    color: '#336791',
    tagline: 'Claude gains structured organizational memory',
    what: 'PostgreSQL MCP gives Claude read access to your database — run queries, explore schema, understand data relationships, and answer business questions with real data.',
    why: 'Without database access, Claude reasons conceptually about data. With it, Claude queries actual data to give specific, accurate, real answers.',
    analogy: '"Claude gains structured organizational memory stored in relational form."',
    workflow: [
      { actor: 'User', action: 'Asks a data question in plain English', detail: '"How many users signed up last 30 days vs. the prior quarter?"' },
      { actor: 'Claude', action: 'Writes and executes accurate SQL', detail: 'Reads schema → writes correct query → executes via MCP → gets real results.' },
      { actor: 'Claude', action: 'Analyzes and explains significance', detail: 'Compares periods, identifies trends, flags data quality issues, explains meaning.' },
      { actor: 'User', action: 'Follows up naturally', detail: '"Break that down by acquisition channel."' },
      { actor: 'Claude', action: 'Iterates the query', detail: 'Adds GROUP BY, re-executes, presents segmented analysis with key observations.' },
    ],
    useCases: [
      'Business intelligence — answer questions from data without waiting for an analyst',
      'Data exploration — understand what\'s in a database, find anomalies and patterns',
      'Report generation — turn raw data into formatted reports automatically',
      'Data validation — "Are there orphaned records? Are required fields populated?"',
    ],
    enterprise: [
      'Data decisions: "Which customers are at risk of churning based on usage patterns?"',
      'Finance: "Generate Q3 revenue breakdown from the transactions table"',
      'Compliance: "Show all data processing activities for GDPR Article 30 reporting"',
    ],
    security: 'CRITICAL: Read-only connections exclusively. Never write access to production. Mask PII columns. Row-level security for sensitive tables. Log all queries. Use a read replica for AI workloads to protect production performance.',
  },
  {
    id: 'playwright',
    label: 'Playwright',
    emoji: '🎭',
    color: '#2ead33',
    tagline: 'Claude gets eyes, a mouse, and a keyboard',
    what: 'Playwright MCP gives Claude control over a real web browser — navigate, click, fill forms, take screenshots, and extract content from any website.',
    why: 'Much of the world\'s functionality is only accessible through web interfaces. Playwright gives Claude hands to interact with web applications, automate workflows, and test UI behavior.',
    analogy: '"Claude gets eyes, a mouse, and a keyboard to operate any website."',
    workflow: [
      { actor: 'User', action: 'Assigns a web task', detail: '"Monitor our competitor\'s pricing page daily. Alert me when any price changes."' },
      { actor: 'Claude', action: 'Navigates and captures', detail: 'Opens browser, navigates to URL, screenshots page, identifies pricing elements semantically.' },
      { actor: 'Claude', action: 'Compares to baseline', detail: 'Compares with yesterday\'s data. Identifies changed prices, new products, removed items.' },
      { actor: 'Claude', action: 'Alerts on changes', detail: 'Sends Slack notification with screenshot comparison and detailed change summary.' },
    ],
    useCases: [
      'Web testing — automated UI tests written in plain English',
      'Data extraction — scrape content from sites with no API',
      'Workflow automation — multi-step web form submission and navigation',
      'Competitor monitoring — track changes on competitor sites at scale',
    ],
    enterprise: [
      'QA automation: Write tests in natural language, Playwright executes accurately',
      'Competitive intelligence: Monitor competitor pricing and features continuously',
      'Compliance: Verify required legal disclosures appear on all pages',
    ],
    security: 'Sandbox execution in isolated containers. Don\'t allow login to sensitive accounts without per-action human approval. Monitor for credential exposure. Rate-limit to avoid ToS violations or IP bans.',
  },
  {
    id: 'filesystem',
    label: 'Filesystem',
    emoji: '📁',
    color: '#64748b',
    tagline: 'Claude reads and writes local files and directories',
    what: 'Filesystem MCP gives Claude access to specified directories — read files, create new ones, edit content, and organize structures on your local machine or server.',
    why: 'Without filesystem access, Claude can only describe what to do. With it, Claude reads your project files, writes output, and manages content directly — no copy-paste.',
    analogy: '"Claude gains a desk drawer with your project files, open to read and write."',
    workflow: [
      { actor: 'User', action: 'Assigns a file-based task', detail: '"Read all Markdown files in /docs and generate a comprehensive table of contents."' },
      { actor: 'Claude', action: 'Reads files intelligently', detail: 'Traverses docs/, reads each .md file, understands hierarchy and content relationships.' },
      { actor: 'Claude', action: 'Generates and writes output', detail: 'Creates well-structured TOC with headings and links. Writes to docs/README.md.' },
      { actor: 'User', action: 'Reviews in place', detail: 'TOC already generated in the file. User reads, requests changes, Claude re-writes.' },
    ],
    useCases: [
      'Code reading — understand unfamiliar codebases across multiple files in context',
      'Documentation — generate, update, and maintain docs from code automatically',
      'Config management — update configuration across multiple environments at once',
      'Batch processing — apply the same transformation to many files simultaneously',
    ],
    enterprise: [
      'Documentation automation: "Keep /docs in sync with /src — read code, update docs"',
      'Config management: "Update all microservice configs to new logging standard"',
      'Audit preparation: "Read all recent code changes, generate compliance report"',
    ],
    security: 'Restrict to specific allowed directories only. Never grant access to /, ~/.ssh, ~/.aws, or secrets paths. Explicit allowlist approach. Read vs. write permissions are separate grants.',
  },
  {
    id: 'notion',
    label: 'Notion',
    emoji: '📓',
    color: '#6b7280',
    tagline: 'Claude gains access to your team\'s knowledge base',
    what: 'Notion MCP gives Claude read and write access to your workspace — pages, databases, projects. Claude reads knowledge, creates pages, updates documentation, and manages structured data.',
    why: 'Team knowledge lives in Notion. Claude with access synthesizes it, keeps it updated, answers questions from it, and ensures it stays current as work evolves.',
    analogy: '"Claude becomes a full member of your knowledge management team."',
    workflow: [
      { actor: 'User', action: 'Asks a knowledge question', detail: '"What architectural decisions did we make about authentication last quarter?"' },
      { actor: 'Claude', action: 'Searches workspace', detail: 'Searches pages matching the query. Reads multiple relevant pages for context.' },
      { actor: 'Claude', action: 'Synthesizes with citations', detail: 'Consistent answer with page references and dates.' },
      { actor: 'User', action: 'Requests documentation update', detail: '"Add today\'s JWT rotation decision to the auth architecture page."' },
      { actor: 'Claude', action: 'Updates page precisely', detail: 'Finds correct page, adds decision with date and rationale. Preserves existing content.' },
    ],
    useCases: [
      'Knowledge retrieval — answer questions from existing team documentation',
      'Documentation maintenance — keep pages current as systems evolve',
      'Meeting notes — auto-generate structured notes from conversation transcript',
      'Onboarding — Claude guides new employees through documentation contextually',
    ],
    enterprise: [
      'Living documentation: "After each sprint, update Notion with what was built and why"',
      'Decision registry: "Create a decision record for every architectural choice"',
      'Knowledge base: "Convert support tickets into searchable FAQ articles in Notion"',
    ],
    security: 'Read-only tokens for retrieval use cases. Restrict write to specific workspaces. Log all page modifications. Do not expose financial, HR, or legal pages without explicit permission.',
  },
  {
    id: 'aws',
    label: 'AWS',
    emoji: '☁️',
    color: '#ff9900',
    tagline: 'Claude gains infrastructure awareness and operational capability',
    what: 'AWS MCP gives Claude access to your cloud — read resource state, check CloudWatch metrics, manage deployments, read logs, and interact with AWS services through Claude\'s reasoning.',
    why: 'Infrastructure management requires synthesizing data from dozens of services. Claude with AWS access understands your entire cloud footprint and diagnoses issues in minutes, not hours.',
    analogy: '"Claude becomes your infrastructure engineer with full cloud visibility."',
    workflow: [
      { actor: 'User', action: 'Reports latency spike', detail: '"User-facing latency spiked 10 minutes ago. What happened?"' },
      { actor: 'Claude', action: 'Reads multiple AWS sources simultaneously', detail: 'CloudWatch → ECS logs → RDS performance insights → ALB logs — in parallel.' },
      { actor: 'Claude', action: 'Synthesizes root cause', detail: '"RDS connection pool exhausted at 14:23. Caused by slow query on user_events table."' },
      { actor: 'Claude', action: 'Presents options and waits for approval', detail: '"I can increase max_connections. Would you like me to apply this change?"' },
    ],
    useCases: [
      'Incident investigation — synthesize logs and metrics to find root cause fast',
      'Infrastructure audit — inventory resources, find unused capacity, flag anomalies',
      'Cost analysis — understand cloud spend and identify optimization opportunities',
      'Security review — check IAM policies, exposed S3 buckets, permission drift',
    ],
    enterprise: [
      'FinOps: "Monthly: identify all untagged resources and over-provisioned instances"',
      'Security: "Audit all IAM policies created last week for least-privilege violations"',
      'Operations: "Investigate all ECS task failures in last 24 hours across services"',
    ],
    security: 'CRITICAL: Read-only IAM roles for investigation. Write operations require MFA-verified human approval per action. Never admin permissions. No production changes without explicit per-action authorization.',
  },
  {
    id: 'kubernetes',
    label: 'Kubernetes',
    emoji: '☸️',
    color: '#326ce5',
    tagline: 'Claude understands and manages your container orchestration layer',
    what: 'Kubernetes MCP gives Claude access to your cluster — read pod status, deployment health, logs, resource usage, and execute kubectl operations with Claude\'s reasoning layer.',
    why: 'Kubernetes debugging requires reading dozens of resources simultaneously. Claude synthesizes pod logs, events, and configuration to diagnose issues that take engineers hours to trace manually.',
    analogy: '"Claude becomes a Kubernetes platform engineer with cluster-wide visibility."',
    workflow: [
      { actor: 'User', action: 'Reports deployment stuck', detail: '"The ai-orchestrator has been Pending for 20 minutes."' },
      { actor: 'Claude', action: 'Reads cluster state', detail: 'kubectl describe pod → events show FailedScheduling. kubectl describe nodes → capacity analysis.' },
      { actor: 'Claude', action: 'Diagnoses root cause', detail: '"nodeSelector gpu=true but no GPU nodes have capacity. 3 pods queued ahead."' },
      { actor: 'Claude', action: 'Presents options, waits for choice', detail: '"Options: 1) Remove GPU requirement. 2) Scale GPU node group. 3) Use spot instances."' },
    ],
    useCases: [
      'Incident diagnosis — understand why pods are failing, crashing, or stuck',
      'Resource optimization — identify over-provisioned deployments and waste',
      'Configuration audit — check deployments for best-practice violations',
      'Capacity planning — analyze usage trends and predict future needs',
    ],
    enterprise: [
      'Platform: "Audit all deployments for missing resource limits and liveness probes"',
      'FinOps: "Identify all namespaces with over-provisioned resource requests"',
      'Security: "Find all pods running as root or with privileged security context"',
    ],
    security: 'RBAC with namespace restrictions. Read-only by default. Write operations (scale, restart, delete) require human approval per action. Never cluster-admin. Log all kubectl in audit log.',
  },
];

// ── Architecture topics ──────────────────────────────────────────────────────

export const architectureItems: StudioItem[] = [
  {
    id: 'context-loading',
    label: 'Context Loading',
    emoji: '📥',
    color: '#8b5cf6',
    tagline: 'How Claude assembles its complete understanding before responding',
    what: 'Context loading is Claude\'s startup sequence: reading CLAUDE.md, loading rules, injecting skills, assembling tool catalog — all before processing any user message.',
    why: 'Claude has no persistent memory between API calls. Context loading reconstructs its understanding from scratch every session — project context, rules, available tools.',
    analogy: 'A surgeon reviewing the patient file before entering the OR',
    analogyDetail: 'Before operating, a surgeon reviews patient history, medications, and the procedure plan. Claude does the same: reads project history, active rules, custom instructions, and tool catalog — before touching any task.',
    workflow: [
      { actor: 'System', action: 'Auto-loads CLAUDE.md', detail: 'Loaded from repository root. Contains: commands, architecture overview, pointers to rule files.' },
      { actor: 'System', action: 'Injects all rule files', detail: '.claude/rules/*.md loaded into system prompt. Each rule becomes a hard constraint on behavior.' },
      { actor: 'System', action: 'Activates skills', detail: 'Active skill files injected to specialize Claude\'s expertise for this session\'s domain.' },
      { actor: 'MCP', action: 'Assembles tool catalog', detail: 'Connects to MCP servers, reads tool schemas, builds permission-filtered tool registry.' },
      { actor: 'Claude', action: 'Ready to reason with full context', detail: 'Knows the project, follows rules, has tools, remembers conversation history.' },
    ],
    useCases: [
      'Understanding why CLAUDE.md matters most — it loads first, every session',
      'Debugging ignored rules — rules must be in .claude/rules/ to load automatically',
      'Optimizing context size — every token in context costs time and money per request',
      'Understanding /compact — preserves key facts while freeing context window space',
    ],
    enterprise: [
      'Enterprise teams design context loading strategically — what every session must know',
      'Compliance teams inject mandatory legal/compliance rules that always load',
      'Security teams ensure security constraints are always in context, not just comments',
    ],
    bestPractices: [
      'Keep CLAUDE.md focused — loaded every session, so every word costs tokens',
      'Use .claude/rules/ for detailed constraints — keeps CLAUDE.md concise',
      'Audit context regularly — stale rules waste tokens and confuse Claude',
      'Design rules as positive constraints — "use X" rather than "don\'t use Y"',
    ],
  },
  {
    id: 'tool-use',
    label: 'Tool Use Lifecycle',
    emoji: '🔧',
    color: '#ec4899',
    tagline: 'How Claude safely requests and receives external capabilities',
    what: 'The tool_use lifecycle is the protocol when Claude needs to act in the real world. Claude emits a tool_use block, the system executes the tool, returns a tool_result, and Claude uses it to continue reasoning.',
    why: 'Claude is a reasoning engine — it cannot directly read databases or call APIs. The tool_use protocol creates a safe, structured, auditable interface for external interaction.',
    analogy: 'A surgeon requesting instruments from a scrub nurse',
    analogyDetail: 'A surgeon requests "scalpel" and the nurse hands it over safely. Claude requests "query_database" and the orchestrator executes safely and returns results. Same structured, auditable handoff.',
    workflow: [
      { actor: 'Claude', action: 'Decides a tool is needed', detail: '"To answer accurately I need real data. I should not guess at facts I can query."' },
      { actor: 'Claude', action: 'Emits tool_use block', detail: '{ "type": "tool_use", "name": "query_database", "input": { "sql": "SELECT..." } }. stop_reason: "tool_use".' },
      { actor: 'System', action: 'Validates and routes', detail: 'Checks tool exists, validates input schema, verifies user permission, routes to MCP server.' },
      { actor: 'MCP', action: 'Executes and returns result', detail: 'Runs operation. Returns { "type": "tool_result", "content": [...] }.' },
      { actor: 'Claude', action: 'Uses result, may chain more tools', detail: 'Incorporates real data. Continues reasoning. Loop until stop_reason: "end_turn".' },
    ],
    useCases: [
      'Understanding why Claude stops mid-response (waiting for tool results)',
      'Debugging tool failures — what happens when Claude gets a bad tool_result?',
      'Designing MCP tools — what schema helps Claude use tools correctly?',
      'Understanding costs — each tool call is a separate API round trip with latency',
    ],
    enterprise: [
      'Audit systems capture every tool_use block — who called what, when, and what returned',
      'Permission systems filter tool catalog per user — Claude only calls allowed tools',
      'Rate limiting on tool calls prevents runaway agent loops from hitting API limits',
    ],
    bestPractices: [
      'Give tools descriptive names and descriptions — Claude uses them to select correctly',
      'Use restrictive inputSchema — validates inputs before execution, prevents injection',
      'Return structured errors in tool_result — Claude needs to understand failures to recover',
      'Log every tool_use block — essential for debugging and auditing agentic systems',
    ],
  },
  {
    id: 'multi-agent',
    label: 'Multi-Agent Orchestration',
    emoji: '🤖',
    color: '#f59e0b',
    tagline: 'Specialized AI agents coordinating to complete complex tasks',
    what: 'Multi-agent orchestration uses multiple specialized Claude instances working together — a planner that decomposes goals, executors that implement, monitors that review quality, and an orchestrator that coordinates.',
    why: 'Single Claude conversations hit limits on context, specialization, and parallelism. Multi-agent systems distribute work across specialists with focused contexts and independent operation.',
    analogy: 'A software engineering team structure replicated in AI',
    analogyDetail: 'A team has a tech lead (planner), developers (executors), QA engineers (monitors), and a project manager (orchestrator). Multi-agent systems mirror this — with AI workers that never sleep and maintain perfect consistency.',
    workflow: [
      { actor: 'User', action: 'Submits complex goal', detail: '"Build and test a user authentication system."' },
      { actor: 'Claude', action: 'Planner decomposes into DAG', detail: '[research] → [design schema] → [implement] → [write tests] → [deploy].' },
      { actor: 'Claude', action: 'Retrieval agent runs first', detail: 'Searches codebase and docs for existing auth patterns before any code is written.' },
      { actor: 'Claude', action: 'Executor implements with context', detail: 'Receives spec + retrieval findings. Writes code. Runs tests after each function.' },
      { actor: 'Claude', action: 'Monitor reviews quality', detail: 'Checks security issues, test coverage, standards adherence. Flags issues to planner.' },
      { actor: 'User', action: 'Approves before deploy', detail: 'Human checkpoint before any irreversible action. No deploy without explicit sign-off.' },
    ],
    useCases: [
      'Complex feature delivery: research → implement → test → document as coordinated flow',
      'Large-scale migrations that exceed single-context capacity',
      'Continuous monitoring systems that watch for issues and respond autonomously',
      'Data pipelines with quality gates between each processing stage',
    ],
    enterprise: [
      'Engineering: Teams deploy multi-agent systems for full sprint feature automation',
      'Quality: Monitor agent continuously checks all deployments for regressions',
      'Incident: Detect → diagnose → remediate pipeline operates with minimal human input',
    ],
    bestPractices: [
      'Design agents with focused, narrow contexts — generalist agents lose quality',
      'Define clear handoff schemas — what data passes between agents?',
      'Include human checkpoints at irreversible operations — especially early on',
      'Log all inter-agent communication — debugging distributed AI requires full traces',
    ],
    security: 'Agents have significant system access. Least-privilege tool permissions per agent. Sandbox execution environments. Human approval for any destructive operations. Comprehensive audit logs are mandatory.',
  },
];
