export type CmdMode = 'beginner' | 'practitioner' | 'expert' | 'enterprise' | 'architect';

export type CmdSectionId =
  | 'deep-think' | 'chain-logic' | 'analytical-modes' | 'cognitive-patterns'
  | 'prompt-patterns' | 'system-prompts' | 'few-shot' | 'prompt-chaining'
  | 'agent-orchestration' | 'workflow-patterns' | 'multi-agent' | 'token-economics'
  | 'strategic-analysis' | 'research-systems' | 'production-engineering'
  | 'thinking-pipeline' | 'simulator-hub' | 'real-vs-fake';

export type CmdSectionGroup = 'reasoning' | 'prompting' | 'orchestration' | 'strategy' | 'simulators';

export interface CmdModeContent {
  overview: string;
  keyPoints: string[];
  tip?: string;
  framework?: string;
}

export interface CmdSection {
  id: CmdSectionId;
  group: CmdSectionGroup;
  emoji: string;
  title: string;
  tagline: string;
  interactiveType?: 'thinking-pipeline' | 'multi-sim' | 'real-vs-fake' | 'workflow-map' | 'agent-map' | 'token-sim';
  modeContent: Record<CmdMode, CmdModeContent>;
}

export interface ReasoningMode {
  id: string;
  name: string;
  trigger: string;
  color: string;
  emoji: string;
  description: string;
  whenToUse: string;
  example: string;
  costMultiplier: string;
}

export interface PromptPattern {
  id: string;
  name: string;
  category: 'structure' | 'reasoning' | 'output' | 'context' | 'constraint';
  emoji: string;
  before: string;
  after: string;
  improvement: string;
  tokenSavings?: string;
}

export interface AgentTopology {
  id: string;
  name: string;
  emoji: string;
  description: string;
  structure: string;
  bestFor: string;
  tokenCost: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface WorkflowPattern {
  id: string;
  name: string;
  emoji: string;
  description: string;
  steps: string[];
  useCase: string;
  pitfall: string;
}

export interface RealVsFakeScenario {
  scenario: string;
  real: { label: string; code: string; icon: string; result: string };
  fake: { label: string; code: string; icon: string; result: string };
}

// ── Constants ─────────────────────────────────────────────────────────────────
export const CMD_GROUPS: Record<CmdSectionGroup, { label: string; color: string; emoji: string }> = {
  reasoning:     { label: 'Reasoning Modes',    color: '#8b5cf6', emoji: '🧠' },
  prompting:     { label: 'Prompt Engineering', color: '#3b82f6', emoji: '✍️' },
  orchestration: { label: 'Orchestration',      color: '#f59e0b', emoji: '🔗' },
  strategy:      { label: 'Strategy & Analysis', color: '#10b981', emoji: '🎯' },
  simulators:    { label: 'Simulators',         color: '#ec4899', emoji: '🖥️' },
};

export const CMD_MODES: Record<CmdMode, { label: string; desc: string; color: string; icon: string }> = {
  beginner:     { label: 'Beginner',     desc: 'Concepts & why',        color: '#10b981', icon: '🌱' },
  practitioner: { label: 'Practitioner', desc: 'Patterns & recipes',    color: '#3b82f6', icon: '💡' },
  expert:       { label: 'Expert',       desc: 'Deep mechanics',        color: '#8b5cf6', icon: '⚡' },
  enterprise:   { label: 'Enterprise',   desc: 'Governance & scale',    color: '#f59e0b', icon: '🏢' },
  architect:    { label: 'Architect',    desc: 'System design',         color: '#ef4444', icon: '🏗️' },
};

export const CMD_GROUP_ORDER: CmdSectionGroup[] = ['reasoning', 'prompting', 'orchestration', 'strategy', 'simulators'];

// ── Reasoning Modes ────────────────────────────────────────────────────────────
export const REASONING_MODES: ReasoningMode[] = [
  {
    id: 'deepthink',
    name: '/deepthink',
    trigger: 'Type "/deepthink" or "think carefully" before your request',
    color: '#8b5cf6',
    emoji: '🔮',
    description: 'Forces extended reasoning before answering — Claude explores multiple angles, considers edge cases, and synthesizes before responding',
    whenToUse: 'Complex debugging, architectural decisions, nuanced tradeoff analysis',
    example: '/deepthink — What are the second-order effects of switching from REST to GraphQL for our mobile clients?',
    costMultiplier: '2–4×',
  },
  {
    id: 'chainlogic',
    name: 'CHAINLOGIC',
    trigger: 'Prefix with "CHAINLOGIC:" or "step by step"',
    color: '#3b82f6',
    emoji: '⛓️',
    description: 'Forces explicit chain-of-thought — Claude writes out every reasoning step before arriving at a conclusion',
    whenToUse: 'Math problems, logical deductions, multi-step processes where intermediate steps matter',
    example: 'CHAINLOGIC: If our API handles 10K req/s and each request needs 3 DB queries at 5ms each, what is the maximum DB throughput required?',
    costMultiplier: '1.5–2×',
  },
  {
    id: 'xray',
    name: 'XRAY',
    trigger: 'Prefix with "XRAY:" or "analyze assumptions"',
    color: '#f97316',
    emoji: '🔍',
    description: 'Makes Claude identify and surface hidden assumptions — in your request, in the problem domain, and in its own reasoning',
    whenToUse: 'Requirements analysis, debugging mysterious failures, architectural review',
    example: 'XRAY: Our users are complaining the app is slow. What assumptions am I making about where the bottleneck is?',
    costMultiplier: '1.5×',
  },
  {
    id: 'invert',
    name: 'INVERT',
    trigger: 'Prefix with "INVERT:" or "what could go wrong"',
    color: '#ef4444',
    emoji: '🔄',
    description: 'Forces inversion thinking — instead of "how do we succeed?", Claude reasons from "what would guarantee failure?" to find non-obvious risks',
    whenToUse: 'Pre-mortems, risk analysis, stress-testing plans, finding blind spots',
    example: 'INVERT: We want our microservices migration to succeed. What are all the ways it could catastrophically fail?',
    costMultiplier: '1.5×',
  },
  {
    id: 'wargame',
    name: 'WARGAME',
    trigger: 'Prefix with "WARGAME:" or "simulate adversary"',
    color: '#ec4899',
    emoji: '⚔️',
    description: 'Simulates an adversarial perspective — Claude argues against your plan, plays devil\'s advocate, or simulates competitor/attacker behavior',
    whenToUse: 'Strategy validation, security analysis, competitive planning, decision stress-testing',
    example: 'WARGAME: Here is our go-to-market strategy for Q3. Argue why it will fail from a competitor\'s perspective.',
    costMultiplier: '2×',
  },
  {
    id: 'overthink',
    name: 'OVERTHINK',
    trigger: 'Prefix with "OVERTHINK:" or "be exhaustive"',
    color: '#10b981',
    emoji: '🌀',
    description: 'Deliberately exhaustive — Claude generates every possible interpretation, edge case, and consideration before narrowing down',
    whenToUse: 'Requirements gathering, edge case discovery, when you suspect you\'re missing something important',
    example: 'OVERTHINK: What are all the ways our password reset flow could fail or be exploited?',
    costMultiplier: '3–5×',
  },
];

// ── Prompt Patterns ───────────────────────────────────────────────────────────
export const PROMPT_PATTERNS: PromptPattern[] = [
  {
    id: 'role-constraint',
    name: 'Role + Constraint',
    category: 'structure',
    emoji: '🎭',
    before: 'Fix the bug in my code.',
    after: 'You are a senior TypeScript engineer. Fix the bug in this code WITHOUT changing the function signature or adding new dependencies. Explain the root cause in one sentence.',
    improvement: 'Role primes the model; constraints prevent scope creep',
    tokenSavings: '~40% fewer output tokens from reduced verbosity',
  },
  {
    id: 'output-format',
    name: 'Output Format Specification',
    category: 'output',
    emoji: '📋',
    before: 'Summarize this article.',
    after: 'Summarize this article as: 1) ONE sentence (max 20 words) for the headline, 2) THREE bullet points of key findings, 3) ONE sentence on implications. No other content.',
    improvement: 'Explicit format prevents freeform verbose responses',
    tokenSavings: '~60% token reduction vs unstructured summary',
  },
  {
    id: 'few-shot-example',
    name: 'Few-Shot with Counter-Example',
    category: 'reasoning',
    emoji: '🎯',
    before: 'Classify this email as spam or not spam.',
    after: 'Classify emails. Examples:\n✓ NOT SPAM: "Meeting at 3pm tomorrow" — direct, personal\n✗ SPAM: "WINNER! Claim your prize now" — urgency + vague reward\n\nClassify: [email text here]',
    improvement: 'Counter-examples prevent false positives and calibrate decision boundary',
  },
  {
    id: 'chain-of-thought',
    name: 'Chain of Thought Trigger',
    category: 'reasoning',
    emoji: '⛓️',
    before: 'Which database should we use for this use case?',
    after: 'Which database should we use? Think through: 1) data access patterns, 2) scale requirements, 3) consistency needs, 4) team expertise, then recommend ONE option with the top 2 tradeoffs.',
    improvement: 'Structured thinking prevents snap decisions; numbered steps prevent skipping',
  },
  {
    id: 'context-priming',
    name: 'Context Priming',
    category: 'context',
    emoji: '📚',
    before: 'How should I handle errors in this microservice?',
    after: 'Context: Node.js microservice, handles payment processing, requires ACID guarantees, team uses TypeScript + Express. How should I handle errors? Focus on patterns that prevent silent data corruption.',
    improvement: 'Domain context prevents generic advice; focus clause prevents encyclopedic answers',
  },
  {
    id: 'negative-constraint',
    name: 'Negative Constraint',
    category: 'constraint',
    emoji: '🚫',
    before: 'Refactor this function to be more readable.',
    after: 'Refactor this function for readability. DO NOT: add new abstractions, change the public interface, introduce new dependencies, or add comments. Only restructure existing logic.',
    improvement: 'Negative constraints prevent over-engineering; removes ambiguity about scope',
  },
];

// ── Agent Topologies ──────────────────────────────────────────────────────────
export const AGENT_TOPOLOGIES: AgentTopology[] = [
  {
    id: 'single',
    name: 'Single Agent',
    emoji: '🤖',
    description: 'One Claude instance with tools — the simplest reliable architecture',
    structure: 'User → Claude → [tools] → Claude → User',
    bestFor: 'Most tasks: code generation, analysis, writing, Q&A with tool access',
    tokenCost: '1,000–50,000 per task',
    riskLevel: 'low',
  },
  {
    id: 'orchestrator-subagent',
    name: 'Orchestrator + Subagents',
    emoji: '🎭',
    description: 'One orchestrator Claude decomposes tasks and delegates to specialized subagent Claudes',
    structure: 'Orchestrator → [Subagent A, Subagent B, Subagent C] → Orchestrator → User',
    bestFor: 'Parallel workloads: multi-file analysis, concurrent research, independent subtasks',
    tokenCost: '50,000–500,000 per workflow',
    riskLevel: 'medium',
  },
  {
    id: 'pipeline',
    name: 'Sequential Pipeline',
    emoji: '🔗',
    description: 'Output of each Claude instance becomes input to the next — like a data pipeline',
    structure: 'Stage A → Stage B → Stage C → Output',
    bestFor: 'ETL workflows, multi-step transformations, document processing pipelines',
    tokenCost: '10,000–100,000 per pipeline run',
    riskLevel: 'low',
  },
  {
    id: 'reviewer',
    name: 'Generator + Reviewer',
    emoji: '✅',
    description: 'One Claude generates; a second Claude reviews and critiques — then generator refines',
    structure: 'Generator → Draft → Reviewer → Critique → Generator → Final',
    bestFor: 'High-stakes content: code review, document writing, critical analysis',
    tokenCost: '20,000–80,000 per reviewed output',
    riskLevel: 'low',
  },
];

// ── Workflow Patterns ─────────────────────────────────────────────────────────
export const WORKFLOW_PATTERNS: WorkflowPattern[] = [
  {
    id: 'map-reduce',
    name: 'Map-Reduce',
    emoji: '🗺️',
    description: 'Split input into N chunks, process each in parallel with separate Claude calls, merge results',
    steps: ['Split: divide large input into manageable chunks (≤ 10K tokens each)', 'Map: send each chunk to Claude with consistent prompt', 'Reduce: send all summaries to Claude for synthesis'],
    useCase: 'Summarizing 100 customer feedback items, analyzing a large codebase, processing log files',
    pitfall: 'Merge step can lose nuance — always include "note inconsistencies" in reduce prompt',
  },
  {
    id: 'react-loop',
    name: 'ReAct Loop',
    emoji: '🔁',
    description: 'Reason → Act (tool call) → Observe → Reason → Act until task complete',
    steps: ['Reason: Claude decides next action based on current state', 'Act: Claude calls a tool with specific arguments', 'Observe: tool result injected into context', 'Repeat until stop condition'],
    useCase: 'Autonomous debugging, research workflows, code + test + fix cycles',
    pitfall: 'Loops without step limits or budget caps can spiral — always set max_steps and token_budget',
  },
  {
    id: 'tree-of-thought',
    name: 'Tree of Thought',
    emoji: '🌳',
    description: 'Generate multiple reasoning paths in parallel, evaluate each, select the best branch to continue',
    steps: ['Generate: create 3–5 different reasoning approaches to the problem', 'Evaluate: score each approach on correctness, feasibility, risk', 'Select: choose highest-scoring branch', 'Continue: develop selected branch to completion'],
    useCase: 'Complex problem-solving, architectural decisions, strategy development',
    pitfall: 'Cost multiplies with branches (3 branches = 3× cost) — use sparingly for high-value decisions only',
  },
  {
    id: 'checkpoint-resume',
    name: 'Checkpoint + Resume',
    emoji: '💾',
    description: 'Write intermediate results to files after each major step — enables resuming failed workflows',
    steps: ['Execute step N', 'Write result to checkpoint file (e.g., step-2-output.json)', 'Verify checkpoint quality before proceeding', 'On failure: resume from last good checkpoint, not the beginning'],
    useCase: 'Long multi-hour workflows, expensive orchestration, unreliable environments',
    pitfall: 'Checkpoint files can become stale — include timestamps and validation checksums',
  },
];

// ── Real vs Fake Scenarios ─────────────────────────────────────────────────────
export const REAL_VS_FAKE: RealVsFakeScenario[] = [
  {
    scenario: 'Debugging a production error',
    real: {
      label: 'Real acceleration',
      icon: '✅',
      code: 'claude -p "$(tail -50 app.log)"\n# → Instant root cause + fix suggestion\n# 2 minutes vs 30 minutes manual log triage',
      result: 'Root cause identified: JWT expiry not handled in middleware. Fix applied in 3 minutes.',
    },
    fake: {
      label: 'AI theater',
      icon: '❌',
      code: '# Spending 20 minutes crafting the\n# "perfect" log analysis prompt\n# → Same output, 10× more effort spent',
      result: 'Same answer, 10× longer to get there. The prompt crafting added no value.',
    },
  },
  {
    scenario: 'Writing a PR description',
    real: {
      label: 'Real acceleration',
      icon: '✅',
      code: 'claude -p "$(git diff main)"\n# → Full PR description in 10 seconds\n# Genuine 15-minute time savings per PR',
      result: 'PR description: summary, test plan, risks, screenshots — complete in 10 seconds.',
    },
    fake: {
      label: 'AI theater',
      icon: '❌',
      code: '# Asking Claude to "write perfect code"\n# without providing any context\n# → Generic boilerplate needing full rewrite',
      result: 'Generic PR template that takes longer to edit than writing from scratch.',
    },
  },
  {
    scenario: 'Understanding an unfamiliar codebase',
    real: {
      label: 'Real acceleration',
      icon: '✅',
      code: '/init && /add src/\n> "Explain the auth flow"\n# → Accurate architecture map in 2 min\n# vs 2 hours reading cold',
      result: 'Accurate mental model of the auth system with entry points and dependencies in 2 minutes.',
    },
    fake: {
      label: 'AI theater',
      icon: '❌',
      code: '# Using Claude without /init\n# on a codebase it has never seen\n# → Generic advice based on assumptions\n# → More confusion, not less',
      result: 'Generic advice about "typical auth flows" that does not match the actual codebase.',
    },
  },
  {
    scenario: 'Running repetitive transformations',
    real: {
      label: 'Real acceleration',
      icon: '✅',
      code: 'for f in data/*.json; do\n  claude -p "$(cat $f)" >> out.txt\ndone\n# → 1,000 transforms automated',
      result: '1,000 items processed in 20 minutes with consistent output format.',
    },
    fake: {
      label: 'AI theater',
      icon: '❌',
      code: '# Asking Claude to "check everything"\n# in a 200K-token codebase in one shot\n# → Context overflow, wrong answers',
      result: 'Context overflow. First 50K tokens processed; rest hallucinated or truncated.',
    },
  },
  {
    scenario: 'Architectural decision making',
    real: {
      label: 'Real acceleration',
      icon: '✅',
      code: '/deepthink — Compare PostgreSQL vs\nMongoDB for our event-sourcing use case.\nConstraints: 50M events/day, 10ms p99,\nteam knows SQL.',
      result: 'Structured tradeoff analysis with specific numbers, team skill consideration, and clear recommendation.',
    },
    fake: {
      label: 'AI theater',
      icon: '❌',
      code: '# Asking "which database is best?"\n# without context or constraints\n# → Generic pros/cons lists\n# → No actionable decision',
      result: 'Generic pros/cons list that says "it depends" — you already knew that.',
    },
  },
];

// ── Sections ──────────────────────────────────────────────────────────────────
export const cmdSections: CmdSection[] = [
  {
    id: 'deep-think',
    group: 'reasoning',
    emoji: '🔮',
    title: 'Deep Think Modes',
    tagline: '/deepthink, CHAINLOGIC, OVERTHINK — forcing Claude to reason, not react',
    interactiveType: 'thinking-pipeline',
    modeContent: {
      beginner: {
        overview: 'By default, Claude gives you its first good answer. Deep think modes make it slow down, explore multiple angles, and synthesize before responding. The result is more accurate but more expensive.',
        keyPoints: [
          'Add "think step by step" before any complex question to get structured reasoning',
          '/deepthink before a question forces extended exploration before answering',
          'Use deep thinking for decisions that matter — not for simple lookups',
        ],
      },
      practitioner: {
        overview: 'Deep think modes are specific triggers that change how Claude processes your request. Each has a different reasoning style and cost tradeoff. Choose the right one for your task type.',
        keyPoints: [
          '/deepthink: multi-angle exploration — best for complex tradeoffs and design decisions',
          'CHAINLOGIC: sequential step-by-step — best for math, logic, and multi-stage processes',
          'OVERTHINK: exhaustive enumeration — best for edge case discovery and risk analysis',
        ],
        tip: 'Combine modes: "/deepthink CHAINLOGIC: [question]" gets both multi-angle exploration AND explicit step tracking',
      },
      expert: {
        overview: 'Deep thinking modes trigger different sampling and attention patterns. Extended thinking allocates more compute budget to self-consistency checking — the model generates multiple reasoning traces and reconciles them before producing output.',
        keyPoints: [
          'Extended thinking uses a separate reasoning budget (tokens not billed as output) — check model pricing',
          'Self-consistency emerges from multi-path reasoning — divergent paths signal ambiguous problems',
          'Token budget for thinking: plan for 2–10× the normal output tokens when using deep modes',
        ],
      },
      enterprise: {
        overview: 'Enterprise deep think usage requires: cost budgets per workflow, logging of reasoning traces for audit, and approval gates before acting on deep-think conclusions for high-stakes decisions.',
        keyPoints: [
          'Deep think tokens cost 2–10× normal — set per-workflow token budgets before enabling',
          'Log reasoning traces for high-stakes decisions: compliance requires showing why Claude concluded X',
          'Human review gates: deep think recommendations for irreversible actions require human sign-off',
        ],
      },
      architect: {
        overview: 'Deep thinking is architecturally significant because it changes the latency/quality/cost tradeoff surface. Design systems with separate fast-path (reactive, low-latency) and slow-path (deliberative, high-accuracy) Claude invocations.',
        keyPoints: [
          'Latency-sensitive paths use standard Claude; accuracy-sensitive paths use extended thinking',
          'Caching deep-think results: if the same complex question recurs, cache the reasoning trace',
          'Escalation architecture: trigger deep think only when standard Claude expresses low confidence',
        ],
      },
    },
  },
  {
    id: 'chain-logic',
    group: 'reasoning',
    emoji: '⛓️',
    title: 'Chain of Thought',
    tagline: 'Step-by-step reasoning — making Claude show its work',
    modeContent: {
      beginner: {
        overview: 'Chain of thought means asking Claude to think out loud — to show each step rather than just giving you the final answer. This catches errors and makes the reasoning checkable.',
        keyPoints: [
          'Add "think step by step" to any question to enable chain of thought',
          'You can check each step for errors — catch mistakes before they compound',
          'Step-by-step reasoning works especially well for math, logic, and sequential decisions',
        ],
      },
      practitioner: {
        overview: 'Chain of thought (CoT) prompting dramatically improves accuracy for multi-step problems. The key is providing scaffolding that matches the problem structure — numbered steps for sequential problems, bullet trees for hierarchical ones.',
        keyPoints: [
          'Zero-shot CoT: just append "Think step by step" — works for most problems',
          'Few-shot CoT: show 1–2 worked examples with visible steps before your question — highest accuracy',
          'Self-ask CoT: "Before answering, list the sub-questions you need to answer first" — good for research',
        ],
        framework: 'Template: "To answer this, I need to: 1) [sub-question 1], 2) [sub-question 2], 3) [synthesize]. Let\'s work through each."',
      },
      expert: {
        overview: 'CoT works because it provides intermediate computation steps that the model can attend to. Without CoT, the model must produce the final answer in one forward pass with limited context; with CoT, each step becomes a token the model can reference when computing the next step.',
        keyPoints: [
          'CoT benefit scales with problem complexity — O(1) improvement for simple problems, O(n) for complex',
          'Self-consistency sampling: run CoT 5× with temperature 0.7, take majority vote — highest accuracy',
          'Structured reasoning chains (numbered steps) outperform unstructured prose reasoning by ~15–25%',
        ],
      },
      enterprise: {
        overview: 'Enterprise CoT usage: audit the reasoning chain not just the conclusion, detect reasoning shortcuts through step validation, and create standardized reasoning templates for high-stakes workflows.',
        keyPoints: [
          'Reasoning audit: for compliance, you need the WHY — store CoT traces with decisions',
          'Step validation: automated checks can verify intermediate reasoning steps before accepting conclusions',
          'Standardized templates: create domain-specific CoT scaffolds for common high-stakes workflows',
        ],
      },
      architect: {
        overview: 'CoT is an architectural pattern for AI systems: it externalizes latent computation into explicit tokens, making it inspectable, cacheable, and composable. Design systems that treat reasoning chains as first-class artifacts.',
        keyPoints: [
          'Reasoning chains as data: store, index, and retrieve past reasoning chains for similar problems',
          'Chain composition: the output reasoning of step A is the input context of step B — pipeline reasoning',
          'Verification layer: build automated reasoning checkers that validate step-by-step logic before acting on conclusions',
        ],
      },
    },
  },
  {
    id: 'analytical-modes',
    group: 'reasoning',
    emoji: '🔍',
    title: 'Analytical Modes',
    tagline: 'XRAY, INVERT, GAPFINDER — surfacing what you cannot see',
    modeContent: {
      beginner: {
        overview: 'Analytical modes help Claude find problems you did not think to look for. Instead of answering your specific question, they help Claude question your assumptions and find gaps in your thinking.',
        keyPoints: [
          'XRAY: "What assumptions am I making that could be wrong?"',
          'INVERT: "What would guarantee this fails?" — finds risks by thinking backwards',
          'GAPFINDER: "What important things am I not asking about?" — discovers unknown unknowns',
        ],
      },
      practitioner: {
        overview: 'Analytical modes shift Claude from answer-generation to assumption-questioning. Use them when you suspect you are missing something, when a plan seems too clean, or when you want adversarial validation.',
        keyPoints: [
          'XRAY before major decisions: surfaces hidden assumptions that could invalidate your plan',
          'INVERT for risk management: pre-mortem analysis finds failure modes that forward analysis misses',
          'GAPFINDER for requirements: discovers scope gaps before committing to a design',
        ],
        tip: 'Run XRAY + INVERT together on any important decision: "XRAY my assumptions, then INVERT to find failure modes"',
      },
      expert: {
        overview: 'Analytical modes exploit Claude\'s ability to hold multiple frames simultaneously. XRAY activates meta-cognitive reasoning about the query itself; INVERT shifts from optimization to adversarial thinking; GAPFINDER samples from the distribution of "what else matters" given the context.',
        keyPoints: [
          'Assumption surfacing accuracy improves significantly with domain context — always provide it',
          'INVERT is most powerful for irreversible decisions — failure mode analysis prevents catastrophic mistakes',
          'Combine GAPFINDER with domain expertise: "Given that this is a healthcare system, what safety-critical questions am I not asking?"',
        ],
      },
      enterprise: {
        overview: 'Enterprise analytical modes: use XRAY for requirements validation before committing resources, INVERT for production readiness reviews, and GAPFINDER during architecture reviews to catch scope gaps.',
        keyPoints: [
          'Pre-commit XRAY: before any multi-week project, surface assumptions that could invalidate the entire effort',
          'Production readiness INVERT: what failure modes does this feature introduce in production?',
          'Regulatory GAPFINDER: what compliance requirements are we not considering for this data flow?',
        ],
      },
      architect: {
        overview: 'Analytical modes are systematic uncertainty quantification for AI-assisted design. XRAY maps the assumption landscape; INVERT stress-tests against adversarial conditions; GAPFINDER identifies the boundary of the problem as posed vs. the actual problem space.',
        keyPoints: [
          'Assumption mapping: XRAY outputs become explicit design constraints to validate and track',
          'Adversarial design: INVERT failure modes become test cases for chaos engineering',
          'Problem reframing: GAPFINDER often reveals that the original problem statement was incomplete',
        ],
      },
    },
  },
  {
    id: 'cognitive-patterns',
    group: 'reasoning',
    emoji: '🧩',
    title: 'Cognitive Patterns',
    tagline: 'WARGAME, /premortem, LEVERAGE — strategic thinking frameworks',
    modeContent: {
      beginner: {
        overview: 'Cognitive patterns are structured ways to think about complex situations. They help Claude simulate adversaries, find leverage points, and stress-test plans before committing to them.',
        keyPoints: [
          'WARGAME: "How would a competitor or adversary attack this plan?"',
          '/premortem: "Imagine it is 6 months from now and this failed — what went wrong?"',
          'LEVERAGE: "What is the highest-impact thing I should focus on first?"',
        ],
      },
      practitioner: {
        overview: 'Cognitive patterns apply structured mental models to your specific context. Unlike generic analysis, they force Claude to take a specific perspective — adversarial, temporal, or leverage-focused.',
        keyPoints: [
          'WARGAME is best for competitive and security analysis — gives you the adversary\'s move before they make it',
          '/premortem is most powerful when run BEFORE implementation — not after things go wrong',
          'LEVERAGE finds the 20% of effort that produces 80% of results — use before planning a sprint',
        ],
        framework: '/premortem template: "It is [date 6 months out]. This project failed completely. Write the incident post-mortem explaining what went wrong and why."',
      },
      expert: {
        overview: 'Cognitive patterns activate different attentional priors in the model. WARGAME shifts weight toward adversarial distribution; /premortem anchors in a hypothetical future failure state and reasons backward (counterfactual reasoning); LEVERAGE applies impact-effort decomposition.',
        keyPoints: [
          'WARGAME accuracy improves with adversary specification — "a well-funded nation-state actor" vs "a script kiddie"',
          'Pre-mortem depth scales with problem context — more context = more specific and useful failure modes',
          'LEVERAGE works best with constraints: "Given we have 2 engineers for 3 weeks, what is the highest leverage work?"',
        ],
      },
      enterprise: {
        overview: 'Enterprise cognitive pattern usage: standardize WARGAME for security reviews, /premortem for project kick-offs, and LEVERAGE for sprint planning. These patterns scale thinking quality consistently across team members.',
        keyPoints: [
          'WARGAME in security reviews: mandatory adversarial analysis before any auth or payment change ships',
          '/premortem in project kick-offs: capture failure modes while the team still has time to mitigate them',
          'LEVERAGE in sprint planning: ensures team consistently works on highest-impact items',
        ],
      },
      architect: {
        overview: 'Cognitive patterns encode strategic reasoning frameworks as prompting primitives. Architecturally, they are a library of reasoning modes that can be composed, parameterized, and systematically applied to AI-assisted decision processes.',
        keyPoints: [
          'Pattern composition: WARGAME + /premortem = adversarial pre-mortem for highest-risk decisions',
          'Parameterized patterns: "WARGAME as [role]" — different adversaries yield different attack surfaces',
          'Pattern libraries: build organization-specific cognitive patterns for domain-specific analysis',
        ],
      },
    },
  },
  {
    id: 'prompt-patterns',
    group: 'prompting',
    emoji: '✍️',
    title: 'Prompt Engineering',
    tagline: 'Role, constraint, format, few-shot — the mechanics of precise prompting',
    modeContent: {
      beginner: {
        overview: 'A well-structured prompt tells Claude WHO it is, WHAT to do, HOW to format the output, and what NOT to do. Each element reduces ambiguity and improves accuracy.',
        keyPoints: [
          'Start with a role: "You are a senior security engineer..." sets the right frame',
          'Add output format: "Respond as a JSON array with fields: issue, severity, fix"',
          'Include a negative constraint: "Do NOT suggest new dependencies or architectural changes"',
        ],
      },
      practitioner: {
        overview: 'Prompt patterns are reusable structures that solve specific communication problems. Master these 6 and you can construct precise prompts for virtually any task: role+constraint, output format, few-shot+counter-example, chain-of-thought, context priming, and negative constraints.',
        keyPoints: [
          'Role + Constraint: primes the model AND scopes the response to prevent scope creep',
          'Output format specification: the most underused pattern — cuts verbose responses by 40–60%',
          'Few-shot with counter-example: show what you DO want AND what you do NOT want',
        ],
        tip: 'Stack patterns: Role + Output Format + Negative Constraint = dramatically better first-pass results',
      },
      expert: {
        overview: 'Prompt patterns influence attention allocation and sampling during generation. Role tokens shift the activation distribution toward domain expertise; format specifications act as constraints on the output distribution; few-shot examples provide in-context learning that updates the model\'s implicit prior.',
        keyPoints: [
          'Role specificity matters: "security engineer" < "OWASP-focused security engineer who has triaged 500+ CVEs"',
          'Format as constraint: XML tags in prompts can enforce structured output more reliably than prose instructions',
          'Calibration: few-shot examples need to be representative of the actual distribution, not best-case examples',
        ],
      },
      enterprise: {
        overview: 'Enterprise prompt engineering: version-control prompt templates, measure and track prompt performance metrics, and standardize patterns across teams to ensure consistent quality.',
        keyPoints: [
          'Prompt versioning: treat prompts as code — track changes, measure quality regression',
          'A/B testing prompts: measure quality metrics (accuracy, hallucination rate, format compliance) across prompt versions',
          'Prompt library: shared organizational library of validated prompts for common high-value use cases',
        ],
      },
      architect: {
        overview: 'Prompt engineering is interface design for the model. The architecture question is: how do you separate the stable structural elements (role, format, constraints) from the dynamic content (task, context) to maximize reusability and cacheability?',
        keyPoints: [
          'Prompt architecture: stable prefix (role + format + constraints) + dynamic suffix (task + context)',
          'Cache optimization: put cacheable elements at the top of the prompt — stable content enables prefix caching',
          'Prompt as contract: define the expected input/output interface explicitly — enables automated quality checking',
        ],
      },
    },
  },
  {
    id: 'system-prompts',
    group: 'prompting',
    emoji: '⚙️',
    title: 'System Prompts',
    tagline: 'Operator vs user role — building AI systems with persistent context',
    modeContent: {
      beginner: {
        overview: 'The system prompt is what you set before the conversation starts — it defines Claude\'s role, rules, and context. Everything in the system prompt applies to the entire conversation.',
        keyPoints: [
          'System prompt = the briefing Claude reads before any user message arrives',
          'Put stable rules, role, and constraints in the system prompt — not in every user message',
          'System prompts are invisible to users in production apps — they define the product behavior',
        ],
      },
      practitioner: {
        overview: 'System prompts define the operator layer — you as the developer set behavior that users cannot override. The architecture separates: system (operator instructions) → human (user messages) → assistant (Claude responses).',
        keyPoints: [
          'Operator trust > user trust: Claude follows operator instructions even if users ask otherwise',
          'Persistent context: put project documentation, API specs, and coding conventions in system prompts',
          'Constraint hierarchy: system prompt sets the outer boundary; users operate within it',
        ],
        framework: 'System prompt structure: [Role] + [Context/Knowledge] + [Behavioral Rules] + [Output Format] + [Refusal Rules]',
      },
      expert: {
        overview: 'System prompts implement the operator abstraction in Claude\'s three-tier model: Anthropic → Operator → User. The system prompt is how you as the operator customize Claude behavior within Anthropic\'s policies.',
        keyPoints: [
          'Caching optimization: system prompts > 1,024 tokens benefit from prompt caching — saves 90% on repeated calls',
          'Context injection strategy: put frequently-needed context in system prompt, not in every user turn',
          'Instruction conflict resolution: Claude follows system prompt > user request when they conflict on constrained behaviors',
        ],
      },
      enterprise: {
        overview: 'Enterprise system prompt governance: version control all system prompts, audit changes, test for behavioral regression, and restrict system prompt modification to authorized roles.',
        keyPoints: [
          'System prompts are AI product configuration — treat with the same rigor as application config',
          'Inject compliance requirements into system prompts: data handling rules, refusal policies, audit requirements',
          'Test system prompts against an adversarial prompt test suite before deploying changes',
        ],
      },
      architect: {
        overview: 'The system prompt is the primary architectural mechanism for customizing Claude behavior at scale. It implements the operator layer, enables prompt caching, and defines the behavioral contract between your system and the model.',
        keyPoints: [
          'Layered system prompts: base layer (company policies) + application layer (product behavior) + session layer (task context)',
          'Cache-first design: structure system prompts to maximize the stable prefix for token caching',
          'System prompt as API: define the exact I/O contract in the system prompt — enables automated testing and regression detection',
        ],
      },
    },
  },
  {
    id: 'few-shot',
    group: 'prompting',
    emoji: '🎯',
    title: 'Few-Shot Learning',
    tagline: 'Show, don\'t tell — examples as in-context calibration',
    modeContent: {
      beginner: {
        overview: 'Few-shot means showing Claude 1–3 examples of what you want before asking it to do the task. It is much more effective than trying to describe what you want in words.',
        keyPoints: [
          'One good example is worth 100 words of description',
          'Include what you DO want AND what you do NOT want (counter-examples)',
          'Use examples from YOUR domain — generic examples give generic results',
        ],
      },
      practitioner: {
        overview: 'Few-shot prompting provides in-context learning — Claude calibrates its output distribution based on your examples. The key skills are: selecting representative examples, including edge cases, and knowing how many examples are enough.',
        keyPoints: [
          '1 example (one-shot): dramatically better than zero — use when token budget is tight',
          '3 examples: optimal for most tasks — covers variety without wasting context',
          '5+ examples: use when task has high variance or many edge cases to handle',
        ],
        tip: 'Golden rule for examples: if your example set would not fully train a junior human, it will not fully calibrate Claude either',
      },
      expert: {
        overview: 'Few-shot prompting is in-context learning (ICL) — the model updates its implicit task distribution from the examples without gradient updates. Key research finding: label correctness matters LESS than format consistency and example coverage.',
        keyPoints: [
          'Format > correctness: even wrong-labeled examples with consistent format improve performance over no examples',
          'Distribution coverage: examples should cover the actual input distribution, not just easy cases',
          'Ordering matters: put harder/edge-case examples later — models weight recent context more heavily',
        ],
      },
      enterprise: {
        overview: 'Enterprise few-shot: curate and version-control example sets, test for distribution shift when inputs change, and audit examples for bias before deploying to production.',
        keyPoints: [
          'Example curation is a product asset — invest in building high-quality, validated example libraries',
          'Distribution monitoring: if real inputs drift from your examples, performance degrades — monitor and update',
          'Bias audit: examples encode assumptions — review them for unintended demographic or domain biases',
        ],
      },
      architect: {
        overview: 'Few-shot examples are a form of soft configuration — they influence model behavior without changing system prompts or model weights. Design systems with dynamic example injection: retrieve relevant examples based on query similarity.',
        keyPoints: [
          'Dynamic few-shot: retrieve examples from a vector database based on similarity to current query',
          'Example as cache: cacheable static examples amortize cost across many calls — put in stable system prompt',
          'Retrieval-augmented few-shot: combine RAG + few-shot for complex domain-specific classification tasks',
        ],
      },
    },
  },
  {
    id: 'prompt-chaining',
    group: 'prompting',
    emoji: '🔗',
    title: 'Prompt Chaining',
    tagline: 'Sequential prompting — the output of one prompt becomes the input of the next',
    modeContent: {
      beginner: {
        overview: 'Prompt chaining means breaking a complex task into steps and using Claude\'s output from step 1 as input to step 2. Like an assembly line — each step handles one thing well.',
        keyPoints: [
          'Never ask Claude to do everything in one prompt — chain it',
          'Each step should have one clear job and a verifiable output',
          'You can review and correct the output between steps',
        ],
      },
      practitioner: {
        overview: 'Prompt chains beat single mega-prompts because: each step can use a different model, you can validate at each step, and errors fail early rather than corrupting the whole output. Master patterns: extract → transform → validate → synthesize.',
        keyPoints: [
          'Extract first: "Extract all requirement statements from this spec" → then analyze each requirement',
          'Transform separately: "Convert this JSON to CSV" is a separate step from "analyze the CSV"',
          'Gate on quality: check step N output before passing to step N+1 — prevents error propagation',
        ],
        tip: 'Model routing in chains: use Haiku for extract/transform steps, Sonnet for analysis, Opus only for synthesis/judgment',
      },
      expert: {
        overview: 'Prompt chaining implements sequential composition of probabilistic functions — each call\'s output distribution becomes the input context of the next call. The architectural challenge is managing error propagation and context accumulation across steps.',
        keyPoints: [
          'Error compound rate: if step accuracy is 90%, a 5-step chain has ~59% end-to-end accuracy — validate aggressively',
          'Context handoff design: what information from step N is essential for step N+1? Pass only that.',
          'Stop condition verification: each chain step needs a verifiable completion criterion, not just "Claude says done"',
        ],
      },
      enterprise: {
        overview: 'Enterprise prompt chains are production workflows: they need SLAs, monitoring, error handling, and runbooks. Treat every chain as a microservice with defined inputs, outputs, and failure modes.',
        keyPoints: [
          'Chain as service: document input schema, output schema, failure modes, and rollback procedure for every chain',
          'Cost budgeting: measure per-step token costs — chains can be expensive and need pre-deployment cost approval',
          'Partial failure handling: chains fail midway — design for step-level retry without re-running completed steps',
        ],
      },
      architect: {
        overview: 'Prompt chains are the fundamental composition primitive for AI systems. The architectural decisions — step granularity, context passing strategy, error handling, parallelism — determine system reliability, cost, and maintainability.',
        keyPoints: [
          'Composability principle: design each chain step as a pure function (deterministic input → output) where possible',
          'Parallelism: identify independent steps and parallelize them — reduces latency proportionally',
          'Idempotency: each step should be safe to retry — enables automatic failure recovery without data corruption',
        ],
      },
    },
  },
  {
    id: 'agent-orchestration',
    group: 'orchestration',
    emoji: '🤖',
    title: 'Agent Orchestration',
    tagline: 'ReAct loops, planning, tool selection — making agents work reliably',
    interactiveType: 'agent-map',
    modeContent: {
      beginner: {
        overview: 'Agent orchestration means setting up Claude to work through a multi-step task on its own — it plans, executes tools, observes results, and adapts. You define the goal; Claude designs the path.',
        keyPoints: [
          'Give agents bounded goals: "debug this specific error" not "improve the codebase"',
          'Always set a maximum step count — agents without limits can run indefinitely',
          'Monitor execution — especially for tool calls that have real-world effects',
        ],
      },
      practitioner: {
        overview: 'Agent workflows implement the ReAct pattern: Reason (decide action) → Act (call tool) → Observe (see result) → Reason → Act... Choose the right topology for your task: single agent for focused tasks, orchestrator+subagents for parallel work.',
        keyPoints: [
          'ReAct budget: estimate tokens-per-step × steps × expected retries before running',
          'Step budgets: "Solve this in at most 8 steps — if you cannot, report what is blocking you"',
          'Topology selection: single agent for most tasks; orchestrator+subagents for parallel workloads',
        ],
        tip: 'Always define the stopping condition explicitly — not just "when done" but a verifiable criterion like "when all tests pass"',
      },
      expert: {
        overview: 'Agent architectures implement autonomous decision loops over a state space. The key engineering challenges are: convergence guarantees (will the agent terminate?), error recovery (what happens when a tool fails?), and context management (preventing drift in long-running agents).',
        keyPoints: [
          'Convergence proof: well-designed agents must converge in bounded steps — prove this by design, not by hope',
          'Context management: agents accumulate context with each step — budget this explicitly, truncate at 80% fill',
          'Circuit breakers: implement automatic halt conditions beyond step count — cost ceiling, error rate threshold',
        ],
      },
      enterprise: {
        overview: 'Production agents require the same engineering rigor as any production service: SLAs, monitoring, cost caps, approval gates for consequential actions, and documented runbooks for every failure mode.',
        keyPoints: [
          'Human approval gates: any agent action that is irreversible or external (email, deploy, DB write) requires human confirmation',
          'Cost per workflow: measure and budget the p50/p95 token cost before enabling in production',
          'Incident classification: agent failures are production incidents — severity defined by impact, not cause',
        ],
      },
      architect: {
        overview: 'Agent architecture is actor model design applied to LLMs. Each agent is an actor with: a mailbox (context window), a behavior function (the model), and a message-passing interface (tool calls). The architecture determines what messages the actor can receive and what actions it can take.',
        keyPoints: [
          'Actor isolation: each agent should have the minimum context required for its role — prevents cross-contamination',
          'Composability: design agents as composable units — the output of one agent is the valid input of another',
          'Observability requirement: if you cannot trace every agent action and its result, you cannot operate agents in production',
        ],
      },
    },
  },
  {
    id: 'workflow-patterns',
    group: 'orchestration',
    emoji: '🗺️',
    title: 'Workflow Patterns',
    tagline: 'Map-reduce, tree-of-thought, checkpoint-resume — proven orchestration architectures',
    interactiveType: 'workflow-map',
    modeContent: {
      beginner: {
        overview: 'Workflow patterns are proven solutions to common AI orchestration problems. Map-reduce handles large inputs, checkpoint-resume handles failures, tree-of-thought handles complex decisions.',
        keyPoints: [
          'Map-reduce: too much content? Split → process each piece → merge',
          'Checkpoint: long workflow? Save progress after each step so failure does not mean starting over',
          'Sequential pipeline: complex transformation? One step per concern, output feeds next step',
        ],
      },
      practitioner: {
        overview: 'Mastering 4 workflow patterns covers 80% of production AI use cases: map-reduce for scale, ReAct for autonomy, tree-of-thought for decisions, and checkpoint-resume for reliability.',
        keyPoints: [
          'Map-reduce: mandatory for inputs > 20K tokens — split first, never try to process in one shot',
          'ReAct loop: use for interactive tasks where each action depends on observing the previous result',
          'Checkpoint-resume: any workflow > 5 steps or > $1 token cost should checkpoint intermediate results',
        ],
        tip: 'Compose patterns: use map-reduce inside a ReAct loop to handle large parallel tool results efficiently',
      },
      expert: {
        overview: 'Workflow patterns are abstractions over DAGs (directed acyclic graphs) of LLM calls. Each pattern makes different tradeoffs: map-reduce optimizes for throughput; tree-of-thought optimizes for decision quality; checkpoint-resume optimizes for reliability.',
        keyPoints: [
          'Cost models: map-reduce cost = N × per-chunk cost + merge cost; tree-of-thought cost = branches × depth × per-call cost',
          'Latency models: sequential pipeline latency = sum of steps; map-reduce latency = max(parallel steps) + merge',
          'Error models: each additional step adds error probability — design patterns with explicit error recovery paths',
        ],
      },
      enterprise: {
        overview: 'Enterprise workflow patterns must be: documented with input/output contracts, tested with production-representative data volumes, deployed with cost monitoring, and validated against rollback procedures.',
        keyPoints: [
          'Pattern selection: match pattern to cost and latency SLAs — tree-of-thought is expensive; sequential is slow',
          'Volume testing: test workflow patterns at 10× expected production volume before deployment',
          'Cost governance: set per-workflow-type cost caps; alert on overruns; automatic circuit breaker at 2× expected cost',
        ],
      },
      architect: {
        overview: 'Workflow patterns implement distributed systems design principles applied to LLM computation: decomposition, parallelism, idempotency, and fault tolerance. The architectural challenge is that each LLM call is probabilistic, not deterministic — patterns must handle variance.',
        keyPoints: [
          'Pattern library: build an organization-specific workflow pattern library with tested implementations',
          'Variability management: LLM calls have variance — design patterns to be robust to output format variance',
          'Platform extraction: repeated workflow patterns become platform primitives — build reusable infrastructure',
        ],
      },
    },
  },
  {
    id: 'multi-agent',
    group: 'orchestration',
    emoji: '🕸️',
    title: 'Multi-Agent Systems',
    tagline: 'Orchestrator → subagents, parallel execution, communication patterns',
    modeContent: {
      beginner: {
        overview: 'Multi-agent means multiple Claude instances working together. One orchestrator Claude breaks down a big task and delegates parts to specialized subagent Claudes. Like a team of specialists instead of one generalist.',
        keyPoints: [
          'Use multi-agent when tasks can be done in parallel or require different specializations',
          'The orchestrator is responsible for the overall goal; subagents handle specific subtasks',
          'Multi-agent is more expensive and complex — use only when single-agent cannot do the job',
        ],
      },
      practitioner: {
        overview: 'Multi-agent architecture patterns: orchestrator+subagents (parallel delegation), generator+reviewer (quality loop), sequential pipeline (handoff chain). Each has specific use cases and cost/quality tradeoffs.',
        keyPoints: [
          'Orchestrator+subagents: best for parallel workloads — N subtasks done concurrently reduces latency N×',
          'Generator+reviewer: best for quality-critical outputs — second model catches errors the first missed',
          'Sequential pipeline: best for transformations — each stage specializes in one transformation type',
        ],
        tip: 'Start with the simplest architecture that works — single agent > orchestrator+subagents > complex topologies',
      },
      expert: {
        overview: 'Multi-agent systems introduce emergent complexity: communication overhead, context synchronization, error propagation, and emergent behaviors from agent interaction. Engineer for these explicitly.',
        keyPoints: [
          'Communication overhead: each inter-agent message incurs latency and token cost — minimize message count',
          'Context isolation: subagents should not share global state through context — pass explicit typed messages',
          'Emergent behavior testing: test the multi-agent system as a whole, not just individual agents',
        ],
      },
      enterprise: {
        overview: 'Enterprise multi-agent governance: define agent roles and permissions, audit inter-agent communication, set cost budgets per agent role, and implement kill switches for runaway agent systems.',
        keyPoints: [
          'Agent role definitions: each agent type has explicit capabilities, tool access, and token budget',
          'Communication audit: all inter-agent messages are logged with sender, receiver, content, and timestamp',
          'Kill switch: ability to halt all agents in a workflow immediately — required for production safety',
        ],
      },
      architect: {
        overview: 'Multi-agent architecture is distributed systems design where each node is a probabilistic reasoner. Apply established distributed systems patterns: message queues for decoupling, circuit breakers for fault tolerance, and event sourcing for auditability.',
        keyPoints: [
          'Message queue architecture: decouple orchestrator from subagents via queues — enables retry, backpressure, and monitoring',
          'Idempotent agents: design subagents to produce the same result given the same inputs — enables safe retry',
          'Event sourcing: record every agent action as an immutable event — enables replay, audit, and debugging',
        ],
      },
    },
  },
  {
    id: 'token-economics',
    group: 'orchestration',
    emoji: '💎',
    title: 'Token Economics',
    tagline: 'Cost engineering, model routing, caching — making AI workflows financially sustainable',
    interactiveType: 'token-sim',
    modeContent: {
      beginner: {
        overview: 'Every token you send to Claude costs money. Understanding token economics means knowing: which model to use, how to write efficient prompts, and how to avoid expensive mistakes in automated workflows.',
        keyPoints: [
          'Model cost ladder: Haiku (~$0.001/1K) → Sonnet (~$0.003/1K) → Opus (~$0.015/1K)',
          'Use Haiku for simple extraction/classification, Sonnet for generation, Opus for complex reasoning',
          'Check token count with /context before starting expensive workflows — plan your budget',
        ],
      },
      practitioner: {
        overview: 'Token cost optimization has 5 levers: model selection (19× spread), prompt compression, output control (max_tokens), context management (clear between tasks), and caching (90% savings for repeated system prompts).',
        keyPoints: [
          'Model routing: classify task complexity → route to minimum-cost model that meets quality requirements',
          'Output control: `--max-tokens N` on every automated call — prevents unbounded verbose output',
          'Cache the stable parts: system prompt + instructions that repeat across calls = prime for caching',
        ],
        tip: 'Measure before optimizing: use --verbose to capture actual token counts per workflow step, not estimates',
      },
      expert: {
        overview: 'Token economics at scale: the total cost is context_size × calls × retries × agents × models. Each factor compounds — a 2× reduction in any factor yields 2× cost savings. Optimize the highest-leverage factors first.',
        keyPoints: [
          'Cost decomposition: break down per-workflow cost by: input tokens, output tokens, model, caching hit rate',
          'Prompt caching ROI: for workflows with stable system prompts called 100+ times/day, caching pays off immediately',
          'Model routing efficiency: building a classifier to route tasks to cheap models saves more than prompt compression',
        ],
      },
      enterprise: {
        overview: 'Enterprise token economics: establish cost baselines per workflow type, implement automated cost alerts, run quarterly optimization sprints, and allocate AI cost to business units for accountability.',
        keyPoints: [
          'Cost attribution: tag every Claude call with team, workflow, and use case — enables chargeback and optimization targeting',
          'Budget governance: set monthly AI spend limits per team; require approval for workflows > $100/day',
          'Optimization ROI: track cost savings from optimization efforts — justify engineering time against savings',
        ],
      },
      architect: {
        overview: 'Token economics is an architectural property, not a per-call optimization. The system architecture determines: how much context is assembled per call, how many calls are made, which models are used, and what is cached. Optimize architecture, not individual prompts.',
        keyPoints: [
          'Architecture cost drivers: context assembly strategy (what goes in context?) determines cost more than prompt wording',
          'Cost trajectory: per-token costs fall ~3–4× per year — design economically viable systems at current prices, not projected future prices',
          'Cost as NFR: define cost-per-operation SLAs alongside latency and accuracy SLAs from day one',
        ],
      },
    },
  },
  {
    id: 'strategic-analysis',
    group: 'strategy',
    emoji: '🎯',
    title: 'Strategic Analysis',
    tagline: 'WARGAME, /scenario, competitive intelligence — AI-powered strategic thinking',
    modeContent: {
      beginner: {
        overview: 'Claude can help you think through strategy by simulating adversaries, exploring scenarios, and finding leverage points you might have missed. These tools make your thinking more rigorous without requiring a strategy consultant.',
        keyPoints: [
          'WARGAME: ask Claude to argue against your strategy from a competitor\'s viewpoint',
          '/scenario: explore "what if" futures before committing to a plan',
          'Always give Claude your actual constraints — generic strategic advice is useless',
        ],
      },
      practitioner: {
        overview: 'Strategic AI workflows combine scenario analysis, adversarial simulation, and leverage identification to stress-test plans before execution. The most valuable pattern: WARGAME your plan, run /premortem, then LEVERAGE to find the highest-impact mitigation.',
        keyPoints: [
          'Scenario analysis: generate 3 futures (optimistic/base/pessimistic) and design for the base case',
          'Competitive intelligence: "Given these public signals, what is [competitor] likely planning?"',
          'Decision validation: "Here is my decision. What would change it? What would you need to know to reverse it?"',
        ],
        framework: 'Strategic analysis chain: XRAY assumptions → WARGAME → /premortem → LEVERAGE mitigations',
      },
      expert: {
        overview: 'AI strategic analysis works because Claude has absorbed patterns from thousands of strategic situations. The key is providing enough specific context to activate relevant knowledge rather than generic frameworks.',
        keyPoints: [
          'Context specificity: "fintech startup, Series A, competing with incumbent banks in SMB lending" >> "a startup"',
          'Signal extraction: "Given these public signals [list], what strategic moves are most likely?"',
          'Belief elicitation: "What would you need to believe for this strategy to fail?" — reveals key assumptions to test',
        ],
      },
      enterprise: {
        overview: 'Enterprise strategic AI: competitive intelligence gathering, scenario planning for major initiatives, decision support for executive teams, and strategic assumption monitoring.',
        keyPoints: [
          'Competitive intelligence workflows: structured analysis of competitor signals (pricing, hiring, product changes)',
          'Scenario planning: AI-generated futures help teams prepare for discontinuous change',
          'Strategic assumption tracking: XRAY key assumptions quarterly — track which ones changed',
        ],
      },
      architect: {
        overview: 'Strategic AI systems are decision support infrastructure. Architecturally, they combine: real-time signal ingestion (news, job posts, product changes), pattern matching against historical strategic databases, and scenario generation.',
        keyPoints: [
          'Signal → insight pipeline: automated ingestion of competitive signals → Claude analysis → structured insight output',
          'Strategic memory: store and retrieve past strategic analyses — detect when situations resemble past cases',
          'Decision audit trail: log all strategic AI recommendations with context, assumptions, and confidence levels',
        ],
      },
    },
  },
  {
    id: 'research-systems',
    group: 'strategy',
    emoji: '🔬',
    title: 'Research Systems',
    tagline: 'DOSSIER, TRENDSCAN, synthesis pipelines — AI-powered deep research',
    modeContent: {
      beginner: {
        overview: 'Claude can help you research topics by searching the web (with MCP tools), synthesizing multiple sources, and organizing findings. The key is structuring the research task clearly.',
        keyPoints: [
          'Break research into: search, summarize each source, then synthesize across sources',
          'Tell Claude what you already know — avoids repeating your existing knowledge',
          'Specify the output format: briefing doc, comparison table, timeline, etc.',
        ],
      },
      practitioner: {
        overview: 'Research workflows implement map-reduce at the source level: search and summarize each source independently, then synthesize across summaries. This scales to arbitrarily large research tasks.',
        keyPoints: [
          'DOSSIER pattern: comprehensive background on a person/company/topic — systematic multi-source synthesis',
          'TRENDSCAN pattern: map the trend landscape across a domain — identify signals and weak signals',
          'Citation quality: always ask Claude to include source URLs and distinguish primary from secondary sources',
        ],
        tip: 'Research prompt template: "Research [topic]. For each source: extract key claims, note confidence level, flag any contradictions. Then synthesize into a coherent summary."',
      },
      expert: {
        overview: 'AI research systems face two failure modes: hallucinated citations (fabricated sources) and context dilution (too much content, key facts get lost). Engineer explicitly against both.',
        keyPoints: [
          'Citation hallucination: always verify sources via web search tool — never trust unverified citations',
          'Context budget for sources: each source gets a token budget — summarize before injecting into synthesis',
          'Confidence tagging: ask Claude to tag each claim with confidence (certain/likely/uncertain) based on source quality',
        ],
      },
      enterprise: {
        overview: 'Enterprise research systems: automated competitive monitoring, regulatory change tracking, technical literature synthesis, and knowledge management integration.',
        keyPoints: [
          'Automated monitoring: scheduled research workflows that alert when signals match predefined patterns',
          'Knowledge integration: research outputs feed into enterprise knowledge management systems',
          'Research governance: define what research workflows can access what data sources — especially proprietary information',
        ],
      },
      architect: {
        overview: 'Research system architecture: source ingestion layer (web search, databases, documents) → extraction layer (per-source summarization) → synthesis layer (cross-source integration) → delivery layer (structured output, citations).',
        keyPoints: [
          'Source graph: model the provenance graph of each claim — essential for research quality assurance',
          'Contradiction detection: design synthesis prompts to explicitly surface conflicting claims across sources',
          'Freshness management: research outputs decay — design with TTL and automated refresh for time-sensitive domains',
        ],
      },
    },
  },
  {
    id: 'production-engineering',
    group: 'strategy',
    emoji: '🏭',
    title: 'Production AI Engineering',
    tagline: 'SLAs, monitoring, cost governance — running AI systems in production',
    modeContent: {
      beginner: {
        overview: 'Running AI in production means it is not just you experimenting — real users or real processes depend on it. Production AI needs the same discipline as any production software: monitoring, error handling, and cost control.',
        keyPoints: [
          'Test AI workflows before deploying — unexpected edge cases can cost a lot in production',
          'Monitor AI outputs in production — quality can degrade without obvious errors',
          'Set spending limits on your API key before enabling any automated workflow',
        ],
      },
      practitioner: {
        overview: 'Production AI engineering checklist: model versioning, output validation, cost budgeting, quality monitoring, error handling with retry limits, and documented rollback procedures.',
        keyPoints: [
          'Model pinning: pin the exact model version in production — model updates can change behavior',
          'Output validation: parse and validate AI output before downstream use — format variance breaks pipelines',
          'Retry budget: max 3 retries with exponential backoff — never use unbounded retry on API calls',
        ],
        framework: 'Pre-launch checklist: ✓ model pinned ✓ output validated ✓ retry capped ✓ cost budgeted ✓ quality metrics defined ✓ rollback tested',
      },
      expert: {
        overview: 'Production AI systems face unique reliability challenges: non-determinism, latency variance, model drift, and cost spikes. Engineer against these with: sampling strategies, SLO definitions, drift detection, and automated circuit breakers.',
        keyPoints: [
          'Non-determinism: run evaluations against a fixed test set after any system change — detect behavioral regression',
          'Latency SLOs: p50/p95/p99 latency targets — AI models have longer tail latency than traditional services',
          'Cost circuit breaker: auto-halt any workflow that exceeds 2× expected cost per execution',
        ],
      },
      enterprise: {
        overview: 'Enterprise AI production operations: change management for AI deployments, incident classification and response, cost governance with chargeback, compliance auditing, and continuous improvement processes.',
        keyPoints: [
          'AI change management: AI workflow changes follow software change management — review, staging, gradual rollout',
          'Incident response: define severity levels for AI failures — what requires immediate action vs routine monitoring',
          'Continuous improvement: establish AI quality review cadence — monthly review of output quality metrics, cost efficiency, and failure patterns',
        ],
      },
      architect: {
        overview: 'Production AI architecture is platform engineering for probabilistic systems. The platform must abstract the non-determinism, provide consistent interfaces, enforce guardrails, and enable observability across all AI-powered components.',
        keyPoints: [
          'AI platform primitives: standardize the interfaces for: model calls, output validation, cost tracking, and quality metrics',
          'Guardrail architecture: build guardrails as a separate layer from AI logic — independently testable and updatable',
          'Observability stack: token usage, latency, quality scores, cost attribution — instrument from day one',
        ],
      },
    },
  },
  {
    id: 'thinking-pipeline',
    group: 'simulators',
    emoji: '🧠',
    title: 'Claude Thinking Pipeline',
    tagline: 'Visualize the 7-step internal processing pipeline — tokens in, thoughts out',
    interactiveType: 'thinking-pipeline',
    modeContent: {
      beginner: {
        overview: 'This simulator shows you what happens inside Claude from the moment you send a message to the moment it responds. Each step transforms your words into understanding and action.',
        keyPoints: [
          'Step 1: Your text is received as characters',
          'Step 2: Characters are broken into tokens (roughly 4 chars each)',
          'Steps 3–7: Tokens flow through the transformer — attending, reasoning, deciding, responding',
        ],
      },
      practitioner: {
        overview: 'Understanding the internal pipeline helps you write better prompts. Context assembly (step 2) is where CLAUDE.md + session history + your message combine — the order matters. Tool decision (step 5) is where Claude chooses between direct answer and tool use.',
        keyPoints: [
          'Context assembly: your CLAUDE.md and session history are injected BEFORE your current message',
          'Token encoding: complex words become multiple tokens — affects cost calculation and model attention',
          'Tool decision: the model chooses tool_use vs direct answer — understanding this explains why Claude sometimes calls tools you did not expect',
        ],
      },
      expert: {
        overview: 'The 7-step pipeline: User Input → Context Assembly → Token Encoding → Transformer (O(n²) attention) → Tool Decision → Tool Execution (optional) → end_turn. Each step has distinct cost and latency characteristics.',
        keyPoints: [
          'Transformer attention is O(n²) in sequence length — doubling context quadruples attention computation',
          'Tool use adds a second forward pass: model runs once to generate tool_use block, tool executes, model runs again with tool_result',
          'end_turn cost: output tokens are ~3× more expensive than input tokens in most pricing models',
        ],
      },
      enterprise: {
        overview: 'Enterprise pipeline visibility: understanding the processing pipeline helps design cost-efficient architectures, debug unexpected tool call behavior, and set realistic latency expectations for SLA definition.',
        keyPoints: [
          'Latency model: TTFT (time-to-first-token) ≈ context processing time; generation time ≈ output tokens × per-token time',
          'Cost model: total cost = (input tokens × input price) + (output tokens × output price) + (tool result tokens × input price)',
          'Streaming: use streaming responses for user-facing features — dramatically improves perceived latency',
        ],
      },
      architect: {
        overview: 'The processing pipeline defines the system\'s fundamental performance envelope. Architecture decisions about context size, tool count, and output length directly determine latency and cost at the pipeline level.',
        keyPoints: [
          'Context size is the primary lever: 2× context = 4× attention computation = 2× latency and cost (approximately)',
          'Tool call amplification: each tool call triggers an additional pipeline execution — minimize tool calls in latency-sensitive paths',
          'Streaming architecture: design for streaming from the start — retrofitting streaming is complex',
        ],
      },
    },
  },
  {
    id: 'simulator-hub',
    group: 'simulators',
    emoji: '🖥️',
    title: 'Simulator Hub',
    tagline: '5 live simulations: Terminal · Token Explosion · Context Overflow · Prompt Optimizer · Agent Loop',
    interactiveType: 'multi-sim',
    modeContent: {
      beginner: {
        overview: 'Five interactive simulations to build intuition for Claude Code behavior. Start with the Terminal to practice commands safely, then Token Explosion to understand cost dynamics.',
        keyPoints: [
          'Terminal: practice claude CLI commands without any real API calls or costs',
          'Token Explosion: see how agent complexity drives cost — adjust sliders and watch numbers scale',
          'Context Overflow: experience what happens when context fills up in a live chat simulation',
        ],
      },
      practitioner: {
        overview: 'Use the simulators to verify your mental models before applying them to real workflows. The Prompt Optimizer shows token savings from better prompts; the Agent Loop demonstrates how context-filling errors compound.',
        keyPoints: [
          'Prompt Optimizer: compress a bloated prompt and see the token savings in real time',
          'Agent Loop: watch a poorly-constrained agent spiral — internalize why step limits are critical',
          'Context Overflow: experience the degradation as context approaches 100% — plan your workflows to stay under 80%',
        ],
      },
      expert: {
        overview: 'Simulators provide parameterized exploration of the design space. Use Token Explosion to find the crossover point where agent concurrency becomes economically viable; use Context Overflow to determine optimal context management checkpoints.',
        keyPoints: [
          'Token Explosion: model your actual workflow parameters — use the cost outputs for production cost budgeting',
          'Agent Loop: the spiral pattern illustrates why bounded context architectures are a necessity, not an optimization',
          'Terminal: test automation scripts in the simulator before using real API calls — saves cost and mistakes',
        ],
      },
      enterprise: {
        overview: 'Simulator hub for enterprise training: use for onboarding, security training (what happens with unbounded token loops?), and demonstrating AI concepts to non-technical stakeholders.',
        keyPoints: [
          'Onboarding: new team members practice all Claude Code operations with zero risk and zero cost',
          'Security training: demonstrate token explosion and context overflow risks to build intuition for governance',
          'Executive demos: visual simulations make AI concepts accessible without requiring technical knowledge',
        ],
      },
      architect: {
        overview: 'Simulators model the system state machine: each command is a state transition with predictable effects on context, cost, and model behavior. Use them to verify your system architecture assumptions before committing to implementation.',
        keyPoints: [
          'State machine verification: simulate your workflow step sequence to verify token budget assumptions',
          'Failure mode modeling: simulate failure scenarios (context overflow, token explosion) to design recovery procedures',
          'Cost modeling: parameterize the Token Explosion simulator with your production workflow parameters for realistic cost projections',
        ],
      },
    },
  },
  {
    id: 'real-vs-fake',
    group: 'simulators',
    emoji: '⚖️',
    title: 'Real vs Fake AI Work',
    tagline: 'Separate genuine AI productivity from AI theater — 5 scenario comparisons',
    interactiveType: 'real-vs-fake',
    modeContent: {
      beginner: {
        overview: 'Not all AI usage is equal. Real AI productivity means Claude genuinely saves time or improves quality. Fake AI productivity — "AI theater" — looks like AI usage but adds effort without adding value.',
        keyPoints: [
          'Real: Claude + specific context + bounded task = genuine time savings',
          'Fake: Claude + vague request + no context = more work than doing it manually',
          'Test: would a well-briefed junior colleague get the same result faster? If yes, that is real productivity.',
        ],
      },
      practitioner: {
        overview: 'Real vs fake AI productivity separates workflows where AI genuinely accelerates work from those where it creates the appearance of productivity without the substance.',
        keyPoints: [
          'Real productivity = specific input + bounded task + verifiable output + time saved',
          'AI theater = vague input + open-ended task + output requiring complete rewrite + time wasted',
          'The tell: does the AI output need major editing? If > 30% needs changing, the prompt was not specific enough',
        ],
        framework: 'Productivity test: would you have spent more than 2× the time doing this manually? If no, reconsider using AI for this task.',
      },
      expert: {
        overview: 'AI theater persists because it LOOKS productive — you are using AI, writing prompts, reviewing outputs. But if the output is generic, ungrounded, or requires full rewrite, the AI added no value over direct work.',
        keyPoints: [
          'Root cause of AI theater: insufficient context injection — Claude cannot be specific about things it does not know',
          'Quality signal: specificity of output = specificity of input (approximately) — generic input yields generic output',
          'Overhead analysis: prompt crafting time + output review time + edit time vs direct effort — measure it',
        ],
      },
      enterprise: {
        overview: 'Enterprise AI theater detection: measure actual time saved per workflow, track revision rates on AI output, and report genuine productivity metrics rather than vanity metrics (AI calls made, tokens consumed).',
        keyPoints: [
          'Measurement: track revision rate (% of AI output that required major editing) per workflow type',
          'ROI accountability: require teams to report time saved per AI workflow, not just AI usage volume',
          'Portfolio review: quarterly review of AI workflows — stop ones with negative ROI, scale ones with positive ROI',
        ],
      },
      architect: {
        overview: 'Real vs fake AI productivity is an architectural signal: AI theater often indicates missing context injection architecture. Systems that produce generic outputs are not providing Claude with the specific context it needs to be accurate and useful.',
        keyPoints: [
          'Context injection architecture: systems that automatically provide Claude with relevant context (from CLAUDE.md, RAG, session history) produce genuine value',
          'Specificity as a design requirement: design AI workflows with explicit specificity requirements — what context is mandatory for useful output?',
          'Theater detection: build quality metrics that distinguish generic from specific outputs — automate the detection of low-value AI usage',
        ],
      },
    },
  },
];
