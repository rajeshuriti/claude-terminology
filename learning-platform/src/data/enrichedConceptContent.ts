// Deep educational content for each concept
// Covers: simple explanation, technical dive, scenarios, mistakes, tradeoffs,
// failure modes, certification focus, metrics, advanced insights, simulators

export interface Scenario {
  title: string;
  context: string;
  how: string;
  outcome: string;
  type: 'enterprise' | 'agent' | 'production' | 'failure';
}

export interface Mistake {
  mistake: string;
  why: string;
  impact: string;
  fix: string;
  severity: 'beginner' | 'intermediate' | 'production';
}

export interface FailureMode {
  mode: string;
  cause: string;
  detection: string;
  resolution: string;
}

export interface Metric {
  name: string;
  value: string;
  context: string;
}

export interface EnrichedContent {
  simpleExplanation: {
    hook: string;
    analogy: string;
    whyItExists: string;
    forBeginners: string;
  };
  technicalDive: {
    mechanics: string;
    productionPatterns: string[];
    apiDetails: string;
    orchestrationImplications: string;
  };
  realWorldScenarios: Scenario[];
  commonMistakes: Mistake[];
  tradeoffs: {
    advantages: string[];
    disadvantages: string[];
    whenNotToUse: string[];
    scalingNote: string;
  };
  failureModes: FailureMode[];
  certFocus: {
    whyItMatters: string;
    examThinking: string[];
    architectureReasoning: string;
  };
  prerequisites: string[];
  nextConcepts: string[];
  metrics?: Metric[];
  advancedInsight: string;
  simulatorType?: 'temperature' | 'top-p' | 'context-window' | 'chunking' | 'rag-pipeline' | 'token-budget';
  architectureDiagram?: string;
}

export const enrichedContent: Record<string, EnrichedContent> = {

  // ─── temperature ────────────────────────────────────────────────────────────
  'temperature': {
    simpleExplanation: {
      hook: 'Temperature is the dial between a predictable machine and a creative collaborator.',
      analogy: 'Imagine you\'re asking 100 people to complete the sentence "The capital of France is...". At temperature=0, every single person says "Paris." At temperature=1, most say "Paris" but a few say "Lyon," "London," or even "cheese." At temperature=2, someone might say "the moon." Temperature controls how willing the model is to pick surprising answers.',
      whyItExists: 'Language models generate text by predicting the probability of the next token. Without temperature, the model would always pick the single most likely token — producing very repetitive, boring text. Temperature was invented to give practitioners control over this randomness tradeoff.',
      forBeginners: 'When an AI generates text, it calculates a probability score for every possible next word. Temperature is a multiplier that either flattens (high temperature) or sharpens (low temperature) these probabilities before the AI makes its choice. Low temperature makes the AI act on high-confidence picks. High temperature makes it consider more options — including unexpected, creative ones.',
    },
    technicalDive: {
      mechanics: 'Before token sampling, the model\'s raw output (logits) is divided by the temperature value. At temperature=1, logits pass through unchanged. At temperature<1 (e.g., 0.3), dividing makes high logits even higher relative to low ones — the distribution becomes "spikier" and the top token dominates. At temperature>1, logits get compressed together — probabilities flatten out and random picks become more likely. The modified logits are then passed through softmax to produce the final probability distribution from which a token is sampled.',
      productionPatterns: [
        'Code generation and extraction: temperature 0.0–0.2 for deterministic, repeatable outputs',
        'Chat and Q&A: temperature 0.3–0.7 for natural, varied but focused responses',
        'Creative writing and brainstorming: temperature 0.7–1.0 for diverse, unexpected ideas',
        'Never set temperature above 1.0 in production — reliability degrades sharply',
        'Always pair with deterministic seed (where available) for regression testing at low temperatures',
      ],
      apiDetails: 'In the Claude API: `{"temperature": 0.2}`. Claude supports 0.0 to 1.0. The default is 1.0 (full stochasticity). Setting temperature=0 is not truly deterministic in all implementations — some providers use greedy decoding differently. Always test in your specific environment.',
      orchestrationImplications: 'For extraction pipelines, evals, and structured outputs: always use temperature ≤ 0.2. Any temperature above 0.3 in a structured extraction pipeline is an architecture smell. Temperature has multiplicative effects on hallucination rates — doubling temperature does not double randomness, it compounds it.',
    },
    realWorldScenarios: [
      {
        title: 'Invoice Extraction Pipeline',
        context: 'A fintech company processes 50,000 invoices per month, extracting vendor, amount, date, and line items into structured JSON.',
        how: 'Temperature is set to 0.0. Every invoice with the same content produces identical output. This enables regression testing — if the prompt changes, they compare outputs against a golden dataset.',
        outcome: '99.2% first-pass accuracy. When accuracy drops, they know the prompt changed — temperature never contributes noise to their debugging.',
        type: 'enterprise',
      },
      {
        title: 'AI Research Assistant',
        context: 'A research agent that surfaces novel hypothesis connections across scientific papers.',
        how: 'Temperature set to 0.8 for the "insight generation" step. The agent intentionally introduces creativity — it finds non-obvious connections between papers that a temperature=0 agent would miss because it always picks the "safe" familiar connection.',
        outcome: 'Researchers find 3x more novel hypothesis candidates compared to keyword search, though 30% require human filtering for scientific rigor.',
        type: 'agent',
      },
      {
        title: 'Production Code Review Bot',
        context: 'GitHub bot that auto-reviews PRs for security vulnerabilities and style issues.',
        how: 'Temperature 0.1 for security checks (must be precise, repeatable) but temperature 0.5 for style suggestions (allows natural language variation in phrasing suggestions).',
        outcome: 'Zero false negatives on SQL injection patterns across 10,000 PRs. Style suggestions feel human and vary naturally, reducing review fatigue.',
        type: 'production',
      },
      {
        title: 'Flaky Test Generation at High Temperature',
        context: 'A team generating synthetic test cases for their eval suite using temperature=0.9.',
        how: 'High temperature causes the model to occasionally generate semantically invalid test cases — edge cases that violate business rules (e.g., negative invoice amounts) not as intentional adversarial tests but as random noise.',
        outcome: '15% of generated tests are semantically invalid. Team wastes time debugging test suite failures caused by bad test data, not code bugs. Root cause: high temperature for a precision task.',
        type: 'failure',
      },
    ],
    commonMistakes: [
      {
        mistake: 'Using default temperature (1.0) for extraction tasks',
        why: 'Default temperature is optimized for conversation, not structured data extraction.',
        impact: 'Extraction outputs vary between identical runs, breaking deterministic pipelines and making debugging impossible.',
        fix: 'Always explicitly set temperature=0.0 or 0.1 for any extraction, classification, or JSON generation task.',
        severity: 'production',
      },
      {
        mistake: 'Setting temperature very high (>1.0) for "more creative" outputs',
        why: 'Many APIs cap at 1.0 — values above this produce incoherent outputs in Claude, not just "more creative" ones.',
        impact: 'Garbled text, broken JSON schemas, hallucinated facts presented with confidence.',
        fix: 'Use 0.7–1.0 for creative tasks. The creativity plateau is around 0.9 — going higher only adds noise.',
        severity: 'beginner',
      },
      {
        mistake: 'Using the same temperature for all steps in a multi-step pipeline',
        why: 'Different pipeline steps have different reliability requirements. Extraction needs 0.0; synthesis may benefit from 0.6.',
        impact: 'Either over-constrains creative steps or under-constrains extraction steps.',
        fix: 'Configure temperature per pipeline step based on that step\'s reliability vs. creativity needs.',
        severity: 'intermediate',
      },
    ],
    tradeoffs: {
      advantages: [
        'Simple single-parameter control over generation diversity',
        'Works immediately — no additional system changes required',
        'Independent of prompt content — can tune without rewriting prompts',
        'Enables deterministic outputs (temperature=0) for testable pipelines',
      ],
      disadvantages: [
        'High temperature dramatically increases hallucination frequency',
        'Cannot target specific semantic areas for creativity — it\'s global randomness',
        'Does not guarantee output quality at any temperature setting',
        'Interacts with top_p in non-obvious ways when both are configured',
      ],
      whenNotToUse: [
        'When you need guaranteed reproducibility across identical inputs — even temperature=0 may not be perfectly deterministic across hardware/software updates',
        'As a substitute for prompt engineering — a better-structured prompt at temperature=0 outperforms a vague prompt at any temperature',
        'When you want targeted creativity (e.g., "be creative about metaphors but precise about facts") — temperature is global',
      ],
      scalingNote: 'At high request volumes, even small differences in temperature between 0.0 and 0.1 can compound into significant differences in overall output quality metrics. Run evals across your specific temperature range before production deployment.',
    },
    failureModes: [
      {
        mode: 'Schema violation at high temperature',
        cause: 'Temperature above 0.3 causes the model to occasionally ignore JSON schema constraints, outputting malformed structures.',
        detection: 'Schema validation failures spike in monitoring. Look for JSON parse errors in tool call logs.',
        resolution: 'Lower temperature to ≤0.1 for any structured output task. Add schema validation as a hard gate before downstream processing.',
      },
      {
        mode: 'Inconsistent extraction across batch',
        cause: 'Temperature > 0 causes identical input documents to produce slightly different extractions across batch runs.',
        detection: 'Diffing batch results against a golden set shows variance > 0.',
        resolution: 'Set temperature=0 for extraction. Accept that this trades some natural language variation for perfect reproducibility.',
      },
    ],
    certFocus: {
      whyItMatters: 'Temperature is one of the most tested concepts because it sits at the intersection of reliability, cost, and quality — all core architect concerns. Expect scenario questions asking you to choose the appropriate temperature for a given pipeline step.',
      examThinking: [
        'If the question mentions extraction, classification, or JSON output → temperature should be 0.0–0.2',
        'If the question mentions creativity, brainstorming, or content generation → temperature 0.6–0.9',
        'Any answer suggesting high temperature for a precision/reliability task is wrong',
        'Temperature alone cannot prevent hallucination — it reduces it, but RAG and grounding are also needed',
      ],
      architectureReasoning: 'The key architect insight: temperature is a reliability knob disguised as a creativity knob. Low temperature = deterministic, testable, reliable. High temperature = creative, varied, unpredictable. Enterprise systems almost always want the former unless explicitly in a creative domain.',
    },
    prerequisites: ['token', 'sampling'],
    nextConcepts: ['top-p', 'deterministic-generation', 'hallucination', 'structured-outputs'],
    metrics: [
      { name: 'Hallucination rate at temp=0.0', value: 'Baseline', context: 'Minimum achievable with current prompt' },
      { name: 'Hallucination rate at temp=0.7', value: '2–4x baseline', context: 'Increases non-linearly with temperature' },
      { name: 'Latency impact', value: 'None', context: 'Temperature affects sampling, not model computation' },
    ],
    advancedInsight: 'Temperature is often the last thing engineers optimize when it should be the first. Most teams spend weeks refining prompts while running extraction tasks at temperature=1.0 — introducing entropy that makes their prompt changes impossible to evaluate cleanly. Set temperature first, then refine prompts.',
    simulatorType: 'temperature',
  },

  // ─── top-p ──────────────────────────────────────────────────────────────────
  'top-p': {
    simpleExplanation: {
      hook: 'top_p is a smarter form of randomness control — it filters out the "long tail" of implausible words before sampling begins.',
      analogy: 'Imagine you\'re playing a word association game. Someone says "ocean" and you\'re picking the next word. There are thousands of valid words, but 80% of reasonable people would say water, waves, fish, blue, or deep. top_p=0.8 means: only consider the words that together make up 80% of all reasonable guesses, discard everything else, then pick randomly from that smaller pool.',
      whyItExists: 'Temperature alone has a problem: even at low temperatures, the probability distribution still includes thousands of tokens with tiny but non-zero probabilities. These "long tail" tokens are usually incoherent choices. top_p solves this by hard-cutting off the probability distribution at a threshold — only tokens whose cumulative probability reaches p are considered.',
      forBeginners: 'While temperature scales all probabilities up or down, top_p sets a minimum probability mass that must be covered by the candidates before the random pick happens. If top_p=0.9, the model first ranks all possible next words by probability, keeps adding from the top until the cumulative probability reaches 90%, then randomly picks from only those top candidates. Everything below the 90% line is ignored entirely.',
    },
    technicalDive: {
      mechanics: 'Nucleus sampling (top_p) works as follows: (1) Compute token probability distribution (post-softmax). (2) Sort tokens by probability descending. (3) Cumulatively sum probabilities. (4) Find the minimum set of tokens whose cumulative probability ≥ p. (5) Re-normalize this "nucleus" to sum to 1. (6) Sample from the nucleus. This is more dynamic than top_k sampling because the nucleus size adapts — if the model is very confident, the nucleus might be just 3 tokens; if uncertain, it might be 300.',
      productionPatterns: [
        'Most production deployments use either temperature or top_p, rarely both at extreme values simultaneously',
        'top_p=0.9 is a safe default that eliminates incoherent tail tokens without restricting natural variation',
        'top_p=0.3 significantly restricts outputs — use for code completion and highly structured domains',
        'Claude\'s default top_p is effectively 1.0 (no nucleus restriction) — rely on temperature for most use cases',
        'If using both temperature=0.7 and top_p=0.7 simultaneously, understand their interaction: nucleus is computed AFTER temperature scaling',
      ],
      apiDetails: 'In Claude API: `{"top_p": 0.9}`. The interaction with temperature is sequential: temperature scaling happens first (modifying the logits), then top_p nucleus selection happens on the temperature-scaled distribution. This means temperature=0.1 + top_p=0.9 behaves differently from temperature=0.9 + top_p=0.1.',
      orchestrationImplications: 'For most production use cases, configure temperature and leave top_p at default. Only tune top_p if you have a specific need to eliminate low-probability tokens without affecting the temperature scaling. In extraction pipelines, temperature=0 already effectively acts like top_p=0 (greedy selection) — adding top_p is redundant.',
    },
    realWorldScenarios: [
      {
        title: 'Code Autocomplete System',
        context: 'A code completion tool for a TypeScript IDE extension.',
        how: 'top_p=0.95 with temperature=0.2. The near-complete nucleus ensures code suggestions are always syntactically valid Python (the long tail of invalid tokens is eliminated) while temperature=0.2 keeps suggestions predictable and deterministic.',
        outcome: 'Zero syntactically invalid completions. Developers accept 73% of suggestions, up from 51% with temperature=0.5 and default top_p.',
        type: 'production',
      },
      {
        title: 'Legal Document Drafting',
        context: 'An AI-assisted legal document assistant drafting contract clauses.',
        how: 'top_p=0.7 with temperature=0.6. The restricted nucleus ensures legal terminology is always within standard legal vocabulary, while temperature=0.6 allows natural variation in phrasing.',
        outcome: 'Zero outputs containing non-legal vocabulary. Attorneys report clauses feel professionally written rather than formulaic.',
        type: 'enterprise',
      },
    ],
    commonMistakes: [
      {
        mistake: 'Setting both temperature=0 and top_p=0 simultaneously',
        why: 'This is contradictory — temperature=0 already does greedy selection. Adding top_p=0 may cause undefined behavior in some implementations.',
        impact: 'Potential API errors or unpredictable behavior depending on the provider\'s implementation.',
        fix: 'Use temperature=0 alone for greedy deterministic outputs. Don\'t pile on top_p restrictions.',
        severity: 'beginner',
      },
      {
        mistake: 'Confusing top_p with top_k',
        why: 'top_k always keeps exactly k candidates regardless of probability. top_p keeps a variable number based on cumulative probability. They are not equivalent.',
        impact: 'Using top_k=10 when you intended top_p=0.9 behaves completely differently in uncertain vs. confident model states.',
        fix: 'Claude uses top_p, not top_k. Don\'t apply top_k intuition to top_p configuration.',
        severity: 'intermediate',
      },
    ],
    tradeoffs: {
      advantages: [
        'More adaptive than top_k — nucleus size adjusts to model confidence',
        'Eliminates incoherent long-tail token selection without hard-capping diversity',
        'Provides a complementary control axis to temperature',
        'Works naturally across different vocabulary sizes and domains',
      ],
      disadvantages: [
        'Interaction with temperature is non-obvious and hard to reason about',
        'Most use cases are adequately handled by temperature alone',
        'Low top_p can make outputs overly predictable in ways hard to distinguish from temperature effects',
        'Testing both parameters independently requires 2D grid search in evals',
      ],
      whenNotToUse: [
        'Don\'t configure top_p separately when temperature alone meets your needs — unnecessary complexity',
        'Don\'t use very low top_p (<0.3) as a substitute for prompt engineering to restrict vocabulary',
        'Don\'t rely on top_p to prevent hallucinations — it reduces low-probability tokens but hallucinations often come from high-probability incorrect associations',
      ],
      scalingNote: 'top_p configuration is a set-it-and-forget-it parameter for most production systems. Unlike temperature, it rarely needs per-request adjustment. Standardize on a value (typically 0.9 or 1.0) and leave it fixed across your platform.',
    },
    failureModes: [
      {
        mode: 'Output truncation with very low top_p',
        cause: 'top_p=0.1 on a task where the model is uncertain causes the nucleus to contain only 1–2 tokens, making outputs repetitive and truncated.',
        detection: 'Outputs end with repetitive token loops or abrupt stops. Monitor average nucleus size if your provider exposes it.',
        resolution: 'Raise top_p to at least 0.8 for generative tasks. Use top_p restriction only for highly constrained domains.',
      },
    ],
    certFocus: {
      whyItMatters: 'top_p questions typically appear in context of comparing it to temperature, or in "what\'s wrong with this configuration" scenarios. The key insight to demonstrate is understanding their interaction and when to use one vs. both.',
      examThinking: [
        'Top_p restricts the TOKEN POOL before sampling; temperature changes the DISTRIBUTION within that pool',
        'For extraction: temperature=0 makes top_p irrelevant',
        'For creative tasks: use temperature, consider top_p only if you need to eliminate specific long-tail tokens',
        'Remember: they both reduce randomness, but via completely different mechanisms',
      ],
      architectureReasoning: 'The architect decision: temperature for general randomness control, top_p only when you need to hard-eliminate low-probability incoherent tokens from a specific domain. In most enterprise architectures, temperature suffices.',
    },
    prerequisites: ['temperature', 'sampling', 'token'],
    nextConcepts: ['deterministic-generation', 'structured-outputs', 'temperature'],
    advancedInsight: 'In practice, 95% of production Claude deployments configure temperature and leave top_p at default. top_p becomes relevant when working with specialized vocabularies (medical, legal, code) where eliminating long-tail tokens meaningfully improves coherence. For most teams, understanding temperature deeply is more valuable than understanding top_p deeply.',
    simulatorType: 'top-p',
  },

  // ─── rag ────────────────────────────────────────────────────────────────────
  'rag': {
    simpleExplanation: {
      hook: 'RAG transforms an AI from a "trained expert" into a "researcher with access to a library" — it can look things up instead of only remembering.',
      analogy: 'Imagine two consultants. The first has an incredible memory but knows only what was in their training materials. The second has a library card and can look up current information before answering. RAG gives the second consultant\'s library card to the first consultant\'s brain. Before answering your question, the AI searches its knowledge base, retrieves the most relevant documents, and uses those as the factual basis for its answer.',
      whyItExists: 'Large language models are trained on data from a specific point in time and cannot access proprietary information. RAG solves both problems: it enables real-time retrieval of current information and allows models to answer questions about private enterprise data without expensive fine-tuning.',
      forBeginners: 'When you ask an RAG system a question, it doesn\'t just ask the AI directly. Instead: (1) Your question is converted into a mathematical representation (embedding). (2) That representation is compared against pre-computed representations of all your documents. (3) The most semantically similar documents are retrieved. (4) Those documents are injected into the AI\'s prompt as context. (5) The AI answers using those documents as its source of truth. The AI\'s answer is grounded in your specific documents, not just its training data.',
    },
    technicalDive: {
      mechanics: 'A production RAG system has several stages: (1) Ingestion: documents are split into chunks, each chunk is embedded using an embedding model (e.g., text-embedding-3-small), and stored in a vector database with metadata. (2) Retrieval: at query time, the query is embedded using the same model, cosine similarity search finds the top-k most similar chunks. (3) Reranking (optional): a cross-encoder reranker re-scores the top-k chunks by actual relevance to re-order them. (4) Augmentation: the top chunks are injected into the prompt as context. (5) Generation: the LLM generates a response grounded in the retrieved context. Each step is a failure point.',
      productionPatterns: [
        'Use a metadata filter before semantic search to dramatically narrow the search space (e.g., filter by document_type="legal" before semantic search)',
        'Hybrid retrieval (BM25 + dense embeddings) significantly outperforms pure semantic search for enterprise documents with precise terminology',
        'Always include source metadata in retrieved chunks for citation and provenance tracking',
        'Cache embeddings for frequently-accessed documents — embedding generation is the bottleneck, not vector search',
        'Monitor retrieval quality separately from answer quality — most RAG failures are retrieval failures, not generation failures',
      ],
      apiDetails: 'RAG is an architecture pattern, not an API feature. It requires: an embedding model API (OpenAI, Cohere, or Anthropic partner), a vector database (Pinecone, Weaviate, Chroma, pgvector), and orchestration logic to wire them together. Tools like LangChain, LlamaIndex, and Haystack provide pre-built RAG pipelines.',
      orchestrationImplications: 'In multi-agent systems, RAG retrieval is typically implemented as a tool that agents can call. The retrieval step should be designed to return structured results with citation IDs, not just raw text. In high-stakes domains (legal, medical), implement a "confidence gate" that routes low-confidence retrievals (< threshold similarity score) to human review rather than generation.',
    },
    realWorldScenarios: [
      {
        title: 'Enterprise Internal Knowledge Base',
        context: 'A 5,000-employee company with 20 years of internal policies, procedures, and technical documentation in SharePoint.',
        how: 'Documents are ingested nightly, chunked at paragraph level with 50-token overlap, embedded with text-embedding-3-small, stored in Weaviate with document_type, department, and updated_at metadata. Employees query via chat; the system retrieves top-5 chunks filtered by department, generates answers with citations.',
        outcome: '78% reduction in HR ticket volume for policy questions. Average answer response time 2.3 seconds. Source citations allow employees to verify answers directly.',
        type: 'enterprise',
      },
      {
        title: 'Customer Support Agent with Product Documentation',
        context: 'A SaaS company\'s support AI that answers questions about their product using official documentation and historical support ticket resolutions.',
        how: 'Two retrieval sources: (1) product documentation (chunked by section), (2) resolved support tickets (chunked by resolution). Hybrid BM25+dense search. Retrieved context includes the exact doc section URL for citation in responses.',
        outcome: '65% of support tickets resolved without human intervention. CSAT for AI responses: 4.2/5, comparable to human agents.',
        type: 'agent',
      },
      {
        title: 'RAG Failure: Poor Chunking Strategy',
        context: 'A legal tech startup building a contract analysis tool that chunks PDF contracts at 500-character fixed intervals.',
        how: 'Fixed character chunking splits contract clauses mid-sentence: "The liability cap shall be limited to $500,000. This cap applies to..." gets split with "This cap applies to" in a separate chunk. Retrieval for "liability cap" returns the first chunk, missing the crucial qualifying clause in the next chunk.',
        outcome: 'The AI incorrectly answers that the liability cap is $500,000 when it actually had crucial conditions in the next chunk. The legal team misses contract risk. Root cause: chunking at semantic boundaries (sentence/clause level) is critical for legal documents.',
        type: 'failure',
      },
      {
        title: 'Production RAG Pipeline with Reranking',
        context: 'A research institution RAG system where initial retrieval precision is 60% but researchers need >90% precision.',
        how: 'Initial retrieval: top-20 chunks via dense embedding search. Reranking: cross-encoder (ms-marco-MiniLM) rescores all 20 and keeps top-3. Final generation: only top-3 highly-relevant chunks injected into prompt.',
        outcome: 'Retrieval precision improves from 60% to 91%. Context window usage drops 85% (20 chunks → 3 chunks). Generation quality improves because the model sees only highly relevant context, not noise.',
        type: 'production',
      },
    ],
    commonMistakes: [
      {
        mistake: 'Using fixed-size character chunking for structured documents',
        why: 'Fixed-size chunking ignores semantic structure, splitting clauses, tables, and definitions mid-meaning.',
        impact: 'Retrieval returns semantically incomplete chunks that miss critical context (e.g., the condition that modifies the main clause).',
        fix: 'Use semantic/structural chunking: split at paragraph boundaries for prose, by row for tables, by definition for glossaries. Add overlap (100–200 tokens) at chunk boundaries.',
        severity: 'production',
      },
      {
        mistake: 'Not monitoring retrieval quality separately from answer quality',
        why: 'End-to-end answer quality metrics hide whether failures come from retrieval or generation.',
        impact: 'Teams spend weeks prompt-engineering the LLM when the actual problem is that the wrong documents are being retrieved.',
        fix: 'Implement separate retrieval evaluation: given 100 labeled queries, measure what % retrieve the correct document in top-3. Fix retrieval before optimizing generation.',
        severity: 'production',
      },
      {
        mistake: 'Injecting too many chunks without a context budget',
        why: 'Retrieving 20 chunks per query fills the context window with marginal information, triggering "lost in the middle" effects.',
        impact: 'The model ignores information buried in the middle of 20 chunks, producing answers that miss critical facts that were technically provided.',
        fix: 'Start with top-3 to top-5 chunks. Only increase if evals show consistent missing-context failures. Use reranking to get quality over quantity.',
        severity: 'intermediate',
      },
    ],
    tradeoffs: {
      advantages: [
        'Access to current, proprietary, and domain-specific information without fine-tuning',
        'Source citations enable answer verification and build user trust',
        'Much cheaper to update than fine-tuning — update the index, not the model',
        'Modular architecture — swap embedding models, vector DBs, or LLMs independently',
        'Dramatically reduces hallucination for factual queries within the knowledge domain',
      ],
      disadvantages: [
        'Retrieval quality is the ceiling for answer quality — poor retrieval guarantees poor answers',
        'Multi-step pipeline with multiple failure points (embedding, indexing, retrieval, generation)',
        'Latency overhead from retrieval (100–500ms for vector search on large corpora)',
        'Chunking strategy requires domain expertise — one size does not fit all document types',
        'Does not implicitly learn relationships between concepts — complex multi-hop reasoning is harder',
      ],
      whenNotToUse: [
        'When the model already contains the required knowledge and retrieval adds only latency',
        'When knowledge requires reasoning across many documents simultaneously (RAG retrieves fragments, not whole documents)',
        'When sub-second latency is critical and retrieval overhead is unacceptable',
        'When the knowledge is better expressed as fine-tuning (behavioral patterns, consistent formatting, specialized vocabulary)',
      ],
      scalingNote: 'RAG scales well horizontally for retrieval (vector DB scaling is mature). The bottleneck is typically embedding generation for large document ingestion — plan for async embedding pipelines. Context injection costs scale with retrieved chunk size × number of API calls.',
    },
    failureModes: [
      {
        mode: 'Semantic search misalignment',
        cause: 'Embedding model trained on general text performs poorly on specialized domain terminology (medical ICD codes, legal Latin, financial jargon).',
        detection: 'Retrieval precision drops in specific document categories. Track per-category retrieval metrics.',
        resolution: 'Use domain-fine-tuned embedding models for specialized corpora, or add terminology glossary chunks that act as "bridges" between lay terms and technical terms.',
      },
      {
        mode: 'Stale index serving outdated information',
        cause: 'Document ingestion pipeline fails silently; new documents aren\'t indexed but the RAG system continues serving old content as current.',
        detection: 'Monitor index document count and last-updated timestamp. Alert on ingestion pipeline failures.',
        resolution: 'Implement ingestion monitoring with alerts on failure. Include document date metadata in retrieved chunks so users can see how current the source is.',
      },
      {
        mode: 'Context injection causing "lost in the middle"',
        cause: 'Injecting 10+ retrieved chunks into a single prompt; the model\'s attention degrades for context in the middle of a long prompt.',
        detection: 'Answer accuracy on multi-chunk questions significantly lower than single-chunk questions. Test with known multi-document scenarios.',
        resolution: 'Limit to 3–5 high-quality chunks using reranking. Structure the context injection so the most relevant chunk appears first or last in the context.',
      },
    ],
    certFocus: {
      whyItMatters: 'RAG is arguably the most important topic in the certification. It combines context management, retrieval systems, embedding quality, orchestration, and reliability into one complex system. Expect multiple questions about RAG architecture decisions.',
      examThinking: [
        'RAG failures are almost always retrieval failures — when answers are wrong, check retrieval before blaming generation',
        'Chunking strategy must match document structure — this is a non-negotiable architectural decision',
        'Citations are a feature of schema design, not an afterthought — build citation_id into your extraction schema',
        'Hybrid retrieval (BM25 + dense) outperforms pure semantic search in enterprise contexts with precise terminology',
      ],
      architectureReasoning: 'The architect must think about RAG as a pipeline of components, each with its own failure modes and optimization levers. The hierarchy of impact: chunking strategy > embedding model > retrieval algorithm > reranking > injection strategy > generation parameters. Improve in that order.',
    },
    prerequisites: ['embeddings', 'vector-database', 'context-injection', 'semantic-search'],
    nextConcepts: ['chunking', 'hybrid-retrieval', 'reranking', 'citation', 'context-window'],
    metrics: [
      { name: 'Retrieval latency (vector DB)', value: '10–100ms', context: 'For indexes up to 10M vectors on managed services' },
      { name: 'Embedding generation time', value: '50–200ms per chunk', context: 'Using text-embedding-3-small; async for bulk ingestion' },
      { name: 'End-to-end latency', value: '1–4 seconds', context: 'Including retrieval + generation; varies by context size' },
      { name: 'Token cost vs. no-RAG', value: '+30–200% tokens', context: 'Injected context adds tokens but replaces expensive fine-tuning' },
    ],
    advancedInsight: 'The biggest mistake in RAG implementations is focusing on the LLM while neglecting the retrieval pipeline. A mediocre LLM with excellent retrieval beats an excellent LLM with mediocre retrieval every time. Most RAG failures in production are retrieval failures, not generation failures — but teams spend 80% of their optimization effort on prompts.',
    simulatorType: 'rag-pipeline',
  },

  // ─── context-window ──────────────────────────────────────────────────────────
  'context-window': {
    simpleExplanation: {
      hook: 'The context window is the AI\'s working memory — everything it can "see" at once while thinking. Once something leaves the window, it\'s gone forever.',
      analogy: 'Imagine writing on a whiteboard. The whiteboard has a fixed size — you can only fit so much. When it fills up, you must erase something old to write something new. An AI\'s context window is that whiteboard. Everything you and the AI have discussed, plus any documents you\'ve shared, plus the AI\'s instructions — all of it lives on that whiteboard. If it fills up, older content gets removed.',
      whyItExists: 'Transformer models are computationally bounded — they can only attend to a finite number of tokens simultaneously. This is a hard architectural limit, not a software choice. The context window grew from 4k tokens (GPT-3) to 200k+ tokens (Claude) as hardware and algorithmic improvements made larger attention possible.',
      forBeginners: 'The context window is measured in tokens (roughly 3/4 of a word each). Everything that goes into a Claude request — your system prompt, the conversation history, any documents you inject, retrieved RAG chunks, tool definitions, and tool results — all of it consumes tokens from the same budget. When the budget runs out, older content is typically dropped or the request fails with a "context length exceeded" error.',
    },
    technicalDive: {
      mechanics: 'In transformer architecture, attention is computed over all tokens in the context simultaneously. This means computation scales quadratically with context length (O(n²)). The practical implication: doubling context length approximately quadruples inference latency and memory usage. This is why very long contexts (100k+ tokens) are significantly more expensive and slower than short ones. Modern approaches like sparse attention, sliding window attention, and Flash Attention reduce this cost but don\'t eliminate it.',
      productionPatterns: [
        'Allocate context budget explicitly: system prompt (fixed) + retrieved context (variable) + conversation history (prunable) + output reserve',
        'Monitor context utilization per request — alert when > 80% to trigger proactive compression',
        'Use conversation summarization to compress older turns while preserving key decisions',
        'For RAG systems: retrieved context should not exceed 40% of total context budget to leave room for reasoning',
        'Long context does not equal better performance — "lost in the middle" effect means information at context boundaries is better recalled',
      ],
      apiDetails: 'Claude 3.5 Sonnet: 200k token context. Each API call\'s context size = system prompt tokens + all message tokens + tool definition tokens + expected output tokens. Context length is checked before inference begins — requests exceeding limits return HTTP 400. Context token costs are the same as input token costs in billing.',
      orchestrationImplications: 'In agent systems, context grows with every tool call — tool definitions, tool inputs, and tool outputs all consume tokens. A 10-tool agent with verbose tool outputs can consume 20-50k tokens per orchestration cycle. Design compact tool output schemas and implement progressive summarization as context approaches limits.',
    },
    realWorldScenarios: [
      {
        title: 'Document Analysis System',
        context: 'A legal AI analyzing 300-page contracts. Each page is approximately 500 tokens.',
        how: 'The full contract (150k tokens) fits in Claude\'s 200k context — but barely. The system prompt (2k), question (0.5k), and expected output (5k) consume 7.5k more, leaving 192.5k for the document. The contract fits with a 25% buffer.',
        outcome: 'Works for 300-page contracts but fails silently for 350+ page contracts when the context limit is hit mid-document. The AI analyzes only the portion that fits, but the system doesn\'t inform the user. Monitoring was added to track when documents exceed 80% of context.',
        type: 'enterprise',
      },
      {
        title: '"Lost in the Middle" Failure',
        context: 'A code review agent given a 150k-token codebase to review for security issues.',
        how: 'The agent receives the entire codebase as context. Security vulnerabilities in files near the 60k–120k token range (middle of the context) are systematically missed while vulnerabilities at the beginning and end of the context are caught.',
        outcome: 'Security audit misses 3 SQL injection vulnerabilities in middle-context files. Root cause: "lost in the middle" — transformer attention degrades for content in the middle of very long contexts. Fix: restructure injection so critical code files are at context boundaries, or use RAG to retrieve only relevant code sections.',
        type: 'failure',
      },
    ],
    commonMistakes: [
      {
        mistake: 'Assuming "large context window = perfect memory"',
        why: 'Transformer attention quality degrades for content in the middle of long contexts — this is empirically documented behavior called "lost in the middle."',
        impact: 'Critical information buried in the middle of a 100k-token context is recalled less reliably than information at the start or end.',
        fix: 'Place the most critical information at the beginning or end of the context. Use RAG to surface relevant portions rather than injecting entire documents.',
        severity: 'production',
      },
      {
        mistake: 'Not accounting for output token reservation',
        why: 'Context limit applies to total tokens: input + output. If you have 198k tokens of input and a 200k context limit, the model has only 2k tokens for its response.',
        impact: 'Model responses are truncated mid-sentence, producing incomplete outputs that break downstream parsing.',
        fix: 'Always reserve at minimum 2x your expected output length from the total context budget. For extraction outputs, add 50% buffer.',
        severity: 'production',
      },
    ],
    tradeoffs: {
      advantages: [
        'Large context eliminates the need for complex memory management for many use cases',
        'Enables coherent long-form analysis — the model has full awareness of the document',
        'Simplifies architecture by avoiding retrieval for documents that fit entirely in context',
      ],
      disadvantages: [
        'Cost scales linearly with context size — 100k context costs ~100x more than 1k context',
        'Latency scales super-linearly — a 100k context request is significantly slower than 10 × 10k requests',
        '"Lost in the middle" effect means large contexts don\'t guarantee reliable recall of all content',
        'Context growth in agent loops can quickly exhaust the budget without careful management',
      ],
      whenNotToUse: [
        'Don\'t use maximum context as default — configure context budget explicitly for each use case',
        'Don\'t rely on large context as a substitute for RAG when document sets exceed context limits',
        'Don\'t fill context with low-relevance information hoping the model will "find what it needs"',
      ],
      scalingNote: 'At scale, context size is the primary cost driver. A system handling 10,000 requests/day at 100k average context costs roughly 100x more than the same system at 1k average context. Context budget management is a critical operational capability.',
    },
    failureModes: [
      {
        mode: 'Context overflow mid-agent-execution',
        cause: 'Agent tool calls accumulate context (tool inputs + outputs) until the limit is hit. The agent fails with a context length error mid-task.',
        detection: 'Monitor context utilization per agent turn. Alert at 80% usage to trigger summarization before hitting the hard limit.',
        resolution: 'Implement rolling summarization: when context reaches 70%, summarize older conversation turns into a compact summary and replace them. Use /compact equivalent patterns.',
      },
    ],
    certFocus: {
      whyItMatters: 'Context window management is a core architecture skill. Exam questions test whether you understand the "lost in the middle" effect, context budget allocation, and when to use RAG vs. direct context injection.',
      examThinking: [
        '"Large context window" is never the solution to a context management problem in exam scenarios',
        '"Lost in the middle" — remember that context position matters for recall reliability',
        'When a question involves "how to handle long documents" — always consider RAG over brute-force injection',
        'Token budget = system prompt + history + retrieved context + tool definitions + output reservation',
      ],
      architectureReasoning: 'Context window is not a feature to maximize — it\'s a resource to budget. Good architects think about context allocation the same way engineers think about memory allocation: explicit, bounded, and monitored.',
    },
    prerequisites: ['token', 'max-tokens'],
    nextConcepts: ['token-budgeting', 'context-pruning', 'memory-compression', 'rag', 'recursive-summarization'],
    metrics: [
      { name: 'Cost scaling', value: 'Linear with tokens', context: 'Claude input tokens: $0.003/1k (Sonnet). 100k context ≈ $0.30 per request' },
      { name: 'Latency scaling', value: 'Super-linear', context: '100k context ~3–5x slower than 10k context due to attention computation' },
      { name: '"Lost in the middle" onset', value: '~32k tokens', context: 'Recall degrades for content at 30–70% position in contexts >32k tokens' },
    ],
    advancedInsight: '"Bigger context window" is the most overused solution proposal in AI system design. In practice, a well-designed RAG system with 10k context outperforms a naive 200k-context system for enterprise knowledge retrieval because the RAG system surfaces only the relevant 2% of your document corpus.',
    simulatorType: 'context-window',
  },

  // ─── chunking ───────────────────────────────────────────────────────────────
  'chunking': {
    simpleExplanation: {
      hook: 'Chunking is how you prepare your documents for the AI\'s library — the wrong filing system means the right information never gets found.',
      analogy: 'Imagine you\'re organizing a massive encyclopedia into index cards for quick lookup. You could cut every card at exactly 100 characters (fixed-size chunking) — but you\'d often split sentences mid-thought. Or you could cut at paragraph boundaries (semantic chunking) — cards stay coherent. Now imagine someone asks "What is the boiling point of water?" and needs to find the card with "water boils at 100°C at sea level." Fixed-size chunking might put "water boils at 100°C" and "at sea level" on different cards — the lookup returns the wrong card.',
      whyItExists: 'Vector databases store fixed-size numerical representations of text (embeddings). Each embedding captures the semantic meaning of one chunk. If chunks are too large, the embedding captures too many concepts and retrieval becomes imprecise. If chunks are too small, a single concept is split across multiple chunks and retrieved incompletely.',
      forBeginners: 'Before storing documents in a RAG system, you split them into smaller pieces (chunks). Each chunk gets embedded as a vector. When a user queries the system, their query is compared against all chunk vectors to find the most similar chunks. Chunking strategy determines whether the retrieved chunks actually contain complete, useful answers or just fragments.',
    },
    technicalDive: {
      mechanics: 'The chunking pipeline: (1) Parse the document into its structural units (paragraphs, sections, table rows). (2) Apply chunking strategy: fixed-size (split at N tokens), sentence (split at sentence boundaries), semantic (use an LLM or clustering to split at topic shifts), or hierarchical (maintain parent-child relationships). (3) Add overlap (e.g., 50 tokens from the previous chunk) to ensure boundary context isn\'t lost. (4) Attach metadata (source, page, section, date) to each chunk. (5) Embed each chunk. Chunk size is a hyperparameter that must be tuned per document type.',
      productionPatterns: [
        'Financial reports: chunk by section (Balance Sheet, Income Statement) — each section is semantically coherent',
        'Legal contracts: chunk by clause with clause number as metadata — never split clauses',
        'Technical documentation: chunk by paragraph with section breadcrumb as metadata',
        'Q&A documents: chunk by question-answer pair — the question and its answer must stay together',
        'Code: chunk by function or class — never split mid-function',
        'Optimal chunk size: 200–500 tokens for most prose; 50–100 tokens for high-precision lookup',
      ],
      apiDetails: 'Chunking is performed before the LLM API is called — it\'s a preprocessing step in your data ingestion pipeline. Libraries: LangChain\'s TextSplitters, LlamaIndex\'s NodeParsers, or custom implementations using tiktoken for accurate token counting.',
      orchestrationImplications: 'Chunk metadata is as important as chunk content for production RAG. Include: source_document, section_path, chunk_index, page_number, created_at, and content_type. This enables metadata filtering (e.g., "retrieve only from documents updated in the last 30 days") which dramatically improves precision.',
    },
    realWorldScenarios: [
      {
        title: 'Contract Analysis — Semantic Chunking',
        context: 'A legal AI that answers questions about software vendor contracts.',
        how: 'Contracts are chunked by clause (identified by section headings and numbered paragraphs). Each chunk includes the clause number and section heading as metadata. A 50-page contract produces ~120 chunks averaging 200 tokens each.',
        outcome: 'Queries about specific clauses retrieve the exact relevant clause. Answer precision: 94%. When fixed-size chunking was used previously, precision was 61% due to clause splits.',
        type: 'enterprise',
      },
    ],
    commonMistakes: [
      {
        mistake: 'Fixed-size chunking for structured documents',
        why: 'Structure (clauses, paragraphs, sections) carries semantic meaning. Fixed splits ignore it.',
        impact: 'Retrieved chunks are semantically incomplete — answers miss critical qualifications, conditions, or context.',
        fix: 'Match chunking strategy to document type. Use structural chunking (by paragraph, section, clause) for formatted documents.',
        severity: 'production',
      },
      {
        mistake: 'No chunk overlap',
        why: 'Without overlap, information at chunk boundaries is only accessible via the chunk it lands in. Cross-boundary context is lost.',
        impact: 'Queries requiring information spanning two adjacent chunks fail because neither chunk contains the complete answer.',
        fix: 'Add 50–150 token overlap between consecutive chunks. The last 50 tokens of chunk N are repeated as the first 50 tokens of chunk N+1.',
        severity: 'intermediate',
      },
    ],
    tradeoffs: {
      advantages: ['Enables semantic retrieval at appropriate granularity', 'Metadata attachment at chunk level enables precision filtering', 'Different strategies can be applied to different document types'],
      disadvantages: ['Complex multi-hop reasoning fails when answer spans many chunks', 'Wrong chunking strategy is hard to diagnose and fix retroactively', 'Re-chunking requires re-embedding — expensive for large corpora'],
      whenNotToUse: ['When documents are already small enough to fit entirely in context (< 2k tokens)', 'When precise term matching is required — BM25 keyword search may be better'],
      scalingNote: 'Chunk count grows linearly with document volume. 1 million documents at 100 chunks each = 100 million vectors. Vector database selection and index configuration become critical at this scale.',
    },
    failureModes: [
      {
        mode: 'Clause splitting in legal/financial documents',
        cause: 'Fixed-size chunking splits a clause mid-sentence: "the liability shall not exceed... $500,000 per incident" across two chunks.',
        detection: 'Low retrieval precision on specific factual queries about amounts, dates, or conditions. Manual inspection of retrieved chunks reveals splits.',
        resolution: 'Switch to structural chunking that respects document formatting (headers, numbered sections, paragraph breaks).',
      },
    ],
    certFocus: {
      whyItMatters: 'Chunking is tested because it represents a structural architectural decision that cannot be fixed by prompt engineering. The exam tests whether you recognize that chunking strategy must match document structure.',
      examThinking: [
        'Bad chunking → bad retrieval → bad answers. This cascade is the core chunking insight.',
        'When a scenario describes RAG failures with structured documents (contracts, manuals), chunking is usually the first diagnosis',
        'Chunk overlap is always better than no overlap for boundary-spanning content',
      ],
      architectureReasoning: 'Chunking is the most underrated component of RAG architecture. Teams optimize embeddings and LLMs while using naive fixed-size chunking, then wonder why their enterprise RAG doesn\'t work well. Fix chunking first.',
    },
    prerequisites: ['rag', 'embeddings', 'vector-database'],
    nextConcepts: ['semantic-search', 'hybrid-retrieval', 'reranking', 'context-injection'],
    advancedInsight: 'The golden rule: chunk at semantic boundaries, not at byte or token boundaries. The semantic unit for a contract clause is the clause itself. The semantic unit for a FAQ is the question-answer pair. Chunking at character positions is almost always wrong for structured documents.',
    simulatorType: 'chunking',
  },

  // ─── tool-use ──────────────────────────────────────────────────────────────
  'tool-use': {
    simpleExplanation: {
      hook: 'Tool use transforms Claude from a brilliant conversationalist into an active agent — it can do things, not just say things.',
      analogy: 'Imagine the difference between a consultant who gives advice verbally versus one who can actually access your databases, run your code, and update your systems in real-time. Without tools, Claude is the advisor who says "you should check that database for the answer." With tools, Claude is the advisor who checks the database itself and brings you the actual result.',
      whyItExists: 'Language models alone are bounded by their training knowledge — they cannot access real-time data, execute code, interact with APIs, or persist changes. Tool use bridges the gap between language intelligence and actual system interaction, enabling agents that can do real work rather than just talk about it.',
      forBeginners: 'Tool use works in a conversation loop: (1) You describe available tools to Claude with their schemas. (2) Claude decides a tool is needed. (3) Claude outputs a structured tool_use block (not regular text) specifying the tool name and arguments. (4) Your code executes the actual tool function. (5) You return the result as a tool_result message. (6) Claude continues, now informed by the actual result. Claude never executes tools itself — it only requests them. Your code executes them.',
    },
    technicalDive: {
      mechanics: 'Tool use is implemented via a special message format. The model outputs `{"type": "tool_use", "name": "tool_name", "input": {...}}` instead of text. Your orchestration layer intercepts this, executes the tool, and returns `{"type": "tool_result", "tool_use_id": "...", "content": "result"}`. Multiple tool calls can occur in a single response turn. Tool definitions (JSON Schema describing each tool) are injected as part of the API request and consume tokens. The model uses tool descriptions to decide when and how to call each tool.',
      productionPatterns: [
        'Design tool output schemas for machine consumption, not human reading — the model needs structured data, not prose',
        'Tool error handling: return structured errors with error_type and error_message fields — never crash silently',
        'Tool timeout handling: set maximum execution time per tool; return timeout error rather than hanging',
        'Tool result size: truncate large results and include a `truncated: true` flag — massive results cause context bloat',
        'Parallel tool calls: when the model outputs multiple tool_use blocks in one response, execute them concurrently',
      ],
      apiDetails: 'Tool definitions are passed as the `tools` parameter in the API request. Each tool has: `name`, `description` (critical for model behavior), and `input_schema` (JSON Schema). `tool_choice` controls how tools are used: `auto` (model decides), `any` (must use a tool), or `{"type":"tool","name":"X"}` (must use specific tool). Tool definitions consume input tokens — a system with 50 tools may use 5–10k tokens just for tool definitions.',
      orchestrationImplications: 'In multi-step agent flows, tool results accumulate in the conversation and consume context. Design an aggressive context management strategy: summarize old tool results when context approaches limits. Implement tool call tracking to detect infinite loops (same tool called with same arguments repeatedly) and break them.',
    },
    realWorldScenarios: [
      {
        title: 'Extraction Agent with Validation Tool',
        context: 'An insurance claim processing agent that extracts claim data and validates it against policy rules.',
        how: 'Three tools: extract_claim_data(document), validate_claim(claim_data), and submit_claim(claim_id). The agent always calls extract → validate → submit. tool_choice="any" ensures the agent always uses a tool rather than generating prose answers.',
        outcome: '94% of claims processed without human review. The validate_claim tool enforces business rules deterministically — the LLM cannot invent policy exceptions.',
        type: 'enterprise',
      },
      {
        title: 'Research Agent — Tool Selection Failure',
        context: 'An agent with 50+ connector tools that frequently selects the wrong database connector.',
        how: 'Agent given all 50 connectors simultaneously in tool definitions. With 50 options, it selects the wrong connector 40% of the time even with detailed descriptions.',
        outcome: 'Switched to dynamic tool scoping: first call search_connectors to narrow to 2–3 matches, then expose only those tools to the agent. Wrong-connector selection drops to <5%.',
        type: 'failure',
      },
    ],
    commonMistakes: [
      {
        mistake: 'Vague or missing tool descriptions',
        why: 'Tool descriptions are how the model decides when and how to use each tool. A description of "database tool" gives zero guidance.',
        impact: 'Wrong tool selection, incorrect argument formatting, missed tool calls when a tool would have been appropriate.',
        fix: 'Write descriptions as instructions: "Use this tool to search the product inventory database. Returns item details including price, SKU, and availability. Do NOT use for order status — use get_order_status instead."',
        severity: 'production',
      },
      {
        mistake: 'Not validating tool arguments before execution',
        why: 'Models occasionally hallucinate arguments — passing a made-up user_id to a production database tool.',
        impact: 'Database errors, null results, or worse — accidentally operating on the wrong record in production.',
        fix: 'Always validate tool arguments against the schema before executing. Return validation errors back to the model with explicit error messages so it can self-correct.',
        severity: 'production',
      },
    ],
    tradeoffs: {
      advantages: ['Extends model capabilities to real-time data and system interactions', 'Deterministic execution of business logic (rules enforced in tool code, not prompts)', 'Enables auditable agent actions — every tool call is logged', 'Separates concerns: model handles reasoning, tools handle execution'],
      disadvantages: ['Each tool call adds latency (network round-trip for external APIs)', 'Tool call loops can consume large amounts of context and cost', 'Complex tool result formats require careful schema design', 'Tool selection quality degrades with too many available tools simultaneously'],
      whenNotToUse: ['When the task doesn\'t require external data or system interactions — pure reasoning tasks don\'t need tools', 'When every possible user intent maps to the same tool call — use the tool directly without LLM overhead'],
      scalingNote: 'Tool call latency is additive. An agent making 10 sequential tool calls each taking 200ms adds 2 seconds to response time. Design for parallel tool execution where possible, and cache frequently-called, cacheable tool results.',
    },
    failureModes: [
      {
        mode: 'Tool call infinite loop',
        cause: 'Agent calls a tool that returns an error, then retries the same call with the same arguments, repeatedly failing.',
        detection: 'Monitor for identical consecutive tool calls (same name + arguments). Alert if the same tool is called > 3 times with similar inputs.',
        resolution: 'Implement tool call deduplication: if the same tool with the same arguments has failed twice, return a structured stop message to the agent rather than retrying infinitely.',
      },
      {
        mode: 'Argument hallucination',
        cause: 'Model generates a plausible-looking but non-existent ID or invalid format for a required tool argument.',
        detection: 'Tool returns "not found" or schema validation failure. High rate of these errors indicates argument hallucination.',
        resolution: 'Add enum constraints for known values, include format examples in parameter descriptions, and return typed validation errors (not generic failures) when the model passes wrong arguments.',
      },
    ],
    certFocus: {
      whyItMatters: 'Tool use is the foundation of agentic systems — understanding it deeply enables everything from simple retrieval agents to complex multi-agent orchestrations. The exam tests tool design decisions, not just basic tool use syntax.',
      examThinking: [
        'Business rules must be enforced in tool code, not in prompts — prompts are probabilistic, tools are deterministic',
        'Tool description quality is the #1 determinant of tool selection accuracy',
        '"too many tools" is an architectural smell — use dynamic scoping',
        'tool_choice="any" forces a tool call — critical for guaranteed structured output',
      ],
      architectureReasoning: 'Think of tools as the API boundary between probabilistic LLM reasoning and deterministic system execution. Everything that cannot be probabilistic (business rules, data writes, validated lookups) must live in the tool layer, not the prompt layer.',
    },
    prerequisites: ['agent', 'function-calling', 'tool-schema'],
    nextConcepts: ['tool-choice', 'mcp', 'tool-annotations', 'structured-outputs', 'orchestration'],
    advancedInsight: 'Tool reliability is consistently harder than engineers expect. The tool definitions, argument validation, error handling, result formatting, and context management together represent more engineering complexity than the LLM integration itself. Plan for 3–5x the development time you estimate for "adding tools."',
  },

  // ─── hallucination ──────────────────────────────────────────────────────────
  'hallucination': {
    simpleExplanation: {
      hook: 'Hallucination is the AI equivalent of a confident person who sounds completely authoritative while being completely wrong.',
      analogy: 'Imagine asking a brilliant friend about a medical condition. They\'ve read extensively about medicine and can discuss it fluently. But occasionally — with the same confident, authoritative tone — they state something that sounds completely plausible but is simply wrong. Not a lie; they genuinely believe it. They\'ve pattern-matched from their vast reading to generate a plausible-sounding answer that happens to be false. That\'s hallucination: confident, fluent, wrong.',
      whyItExists: 'Language models don\'t retrieve facts — they generate text that statistically follows from what they\'ve learned. When asked about something they\'re uncertain about, they generate the most plausible-sounding continuation rather than saying "I don\'t know." This is a fundamental property of how they work, not a bug that can be patched.',
      forBeginners: 'When Claude generates text, it predicts the most likely next word based on all the context. It doesn\'t "know" things the way humans do — it generates text that sounds coherent given what\'s come before. When asked about facts it\'s uncertain about, it generates text that sounds like a plausible answer rather than refusing to answer. The output sounds confident because it\'s always statistically confident in the next word — it has no separate "confidence about the world" module.',
    },
    technicalDive: {
      mechanics: 'Hallucinations arise from several mechanisms: (1) Distributional shift: training data didn\'t contain specific facts (e.g., a recent event), so the model generates the most statistically likely continuation. (2) Knowledge conflicts: multiple contradictory facts in training data cause averaged, incorrect outputs. (3) Compounding errors: in multi-step reasoning, an early error propagates and amplifies. (4) Instruction conflict: the model prioritizes helpfulness (give an answer) over honesty (say "I don\'t know"). This is partly Constitutional AI\'s territory — Anthropic explicitly trains Claude to say "I don\'t know" more often than base models.',
      productionPatterns: [
        'Use RAG to ground answers in retrieved, verifiable documents — hallucination rates drop dramatically when facts are provided as context',
        'Structured output modes + schema validation catches hallucinated data that violates format constraints',
        'Citation enforcement: require the model to cite specific document sections — uncited claims flag for human review',
        'Temperature=0 reduces but does not eliminate hallucination — it just makes hallucination more consistent (same wrong answer every time)',
        'Human-in-the-loop gates for high-stakes outputs where hallucination risk is unacceptable',
      ],
      apiDetails: 'Claude is specifically trained to refuse more often than many base models. Extended thinking mode can reduce hallucination in complex reasoning tasks by allowing more internal deliberation. System prompts can explicitly instruct Claude to say "I don\'t know" rather than hallucinate — this is partially effective but not foolproof.',
      orchestrationImplications: 'In agent systems, hallucinations in tool argument generation are particularly dangerous — a hallucinated customer_id passed to update_customer() could corrupt a production database. Design all tool inputs to be looked up (returned by a preceding tool call) rather than generated.',
    },
    realWorldScenarios: [
      {
        title: 'Citation Hallucination in Legal Research',
        context: 'A legal research AI generates case citations to support its arguments.',
        how: 'Without citation enforcement, the model generates plausible-sounding case names (United States v. Johnson (2019)), jurisdiction, and legal reasoning — all fabricated. The citations look legitimate but link to non-existent cases.',
        outcome: 'A lawyer files a brief citing AI-generated cases. Judge sanctions the attorney for citing non-existent precedent. $50k in sanctions. Root cause: no citation verification against a known legal database.',
        type: 'failure',
      },
      {
        title: 'RAG-Grounded Medical Information',
        context: 'A hospital patient information chatbot answering questions about medications.',
        how: 'Every response requires retrieval from the approved medication database. The model cannot answer about medications not in the retrieved context. When documents don\'t contain an answer, it explicitly says so rather than generating an answer.',
        outcome: 'Zero hallucinated medication interactions in 6 months. Clinicians trust the system because all answers are citations-backed. When the database lacks information, it routes to a pharmacist.',
        type: 'production',
      },
    ],
    commonMistakes: [
      {
        mistake: 'Believing hallucination can be fully prevented by prompt instructions',
        why: '"Never hallucinate" is a probabilistic instruction in a probabilistic system. At sufficient scale, the model will hallucinate despite instructions.',
        impact: 'Teams remove human review gates thinking prompt instructions are sufficient. Hallucinated data corrupts downstream systems.',
        fix: 'Design for hallucination: implement structural prevention (RAG, citations, schema validation) AND fallback human review for high-stakes decisions.',
        severity: 'production',
      },
      {
        mistake: 'Using hallucination as a reason to avoid LLMs entirely',
        why: 'Human experts also hallucinate, misremember, and confabulate. The question is relative reliability, not perfection.',
        impact: 'Over-reaction leads to rejection of valuable AI-assisted systems in favor of entirely manual processes that are slower and often less accurate.',
        fix: 'Design systems that leverage AI capabilities while structurally managing hallucination risk — RAG, citations, human review gates, evals.',
        severity: 'intermediate',
      },
    ],
    tradeoffs: {
      advantages: ['Hallucination is the cost of fluent, natural language generation — accepting some risk enables powerful capabilities'],
      disadvantages: ['Hallucinations are confident and fluent — users cannot easily distinguish true from false outputs', 'Hallucination rates vary by domain — rare for well-covered topics, high for obscure or recent facts', 'Hallucinations in agentic systems can cascade (wrong tool argument → wrong action → real-world consequence)'],
      whenNotToUse: ['Any application where a confident wrong answer is more dangerous than no answer — require citation verification or human review'],
      scalingNote: 'At scale, even a 0.1% hallucination rate means 1,000 hallucinated outputs per million requests. Design your system for this reality.',
    },
    failureModes: [
      {
        mode: 'Tool argument hallucination',
        cause: 'Agent generates a plausible-sounding but non-existent ID, email, or value as a tool argument.',
        detection: 'Tool returns "not found" for supposed valid IDs. Monitor this error pattern specifically.',
        resolution: 'Return all IDs from previous tool calls — never ask the model to generate an ID from memory. If the user says "update order #12345", validate #12345 exists via a lookup tool before any mutation.',
      },
      {
        mode: 'Stale RAG context causing factual errors',
        cause: 'RAG retrieves an old document version. The model treats stale facts as current.',
        detection: 'User reports that AI gave outdated information that contradicts current policy/data.',
        resolution: 'Include document_date metadata in retrieved chunks. In generation, instruct the model to note when sources are older than X months. Implement automatic index re-freshness monitoring.',
      },
    ],
    certFocus: {
      whyItMatters: 'Hallucination management is a core systems engineering concern. The exam tests your ability to design architectural mitigations, not just understand the phenomenon.',
      examThinking: [
        'Structural mitigations (RAG, citations, schema validation) > prompt-based mitigations',
        'Hallucination cannot be eliminated — design for it with human-in-the-loop for high stakes',
        'Citation ≠ correctness — the model can cite a real source while misrepresenting its content',
        'Tool argument hallucination is uniquely dangerous because it triggers real-world actions',
      ],
      architectureReasoning: 'The hallucination-conscious architect designs systems where: (1) Facts come from retrieval, not generation. (2) Every claim has a verifiable source. (3) High-stakes decisions require human confirmation. (4) Agent actions operate on verified IDs, not generated ones.',
    },
    prerequisites: ['temperature', 'rag', 'calibration'],
    nextConcepts: ['evals', 'rag', 'citation', 'confidence-scoring', 'guardrails'],
    advancedInsight: 'The single most important architectural truth about hallucination: language models are not lookup systems — they are generation systems. Expecting zero hallucination from a generation system is like expecting a human expert to never misremember. Design for managed error rates, not zero error rates.',
  },

  // ─── evals ──────────────────────────────────────────────────────────────────
  'evals': {
    simpleExplanation: {
      hook: 'Evals are the difference between "we think our AI works" and "we know our AI works" — and most teams skip them until disaster strikes.',
      analogy: 'Imagine building a bridge without load-testing it. You\'ve used good materials, hired experienced engineers, and followed standard practices. But you haven\'t actually verified it can hold the traffic it needs to carry. An AI system without evals is that untested bridge — it looks fine until real-world load exposes failure modes.',
      whyItExists: 'AI systems degrade in subtle, hard-to-detect ways. A prompt change that improves one use case may silently break another. A model update may shift accuracy for specific document types. Without systematic evaluation, teams discover these failures only after they\'ve caused real-world damage.',
      forBeginners: 'An eval suite is a collection of test cases with known correct answers. You run your AI system against these test cases and measure how often it produces the correct answer. When you change anything — the prompt, the model, the retrieval parameters — you re-run the evals and compare before-versus-after. If accuracy drops for any test category, you\'ve caught a regression before it reaches users.',
    },
    technicalDive: {
      mechanics: 'A production eval system consists of: (1) Labeled dataset: N examples with input and expected output, maintained as a golden dataset. (2) Evaluation harness: code that runs your AI system against the dataset and collects outputs. (3) Metrics: task-specific measures (exact match, F1, BLEU, semantic similarity, LLM-as-judge). (4) Reporting: per-category breakdown and trend over time. (5) CI/CD integration: evals run automatically on every deployment. The quality of your evals is determined by: dataset representativeness, metric appropriateness, and update discipline.',
      productionPatterns: [
        'Start with a golden dataset of 100 labeled examples per task type — grow it as you encounter real failures',
        'LLM-as-judge evals: use a separate Claude evaluation to rate outputs when human judgment is too expensive — but validate your LLM judge against human ground truth first',
        'Stratified evals: break down accuracy by input type, difficulty, document format — aggregate metrics hide category-specific failures',
        'Regression evals: always compare new deployment against current production baseline, not an absolute threshold',
        'Shadow mode: run new system in parallel with old system on real traffic, compare outputs without serving the new outputs',
      ],
      apiDetails: 'Claude can be used as an LLM judge via the API. Prompt the judge model to evaluate outputs on specific criteria (accuracy, completeness, citation quality) and return a structured score. Always validate LLM judge scores against human scores on a sample — LLM judges have systematic biases.',
      orchestrationImplications: 'Evals should be automated and integrated into your deployment pipeline. A deployment that drops accuracy by > 5% on any category should be blocked automatically. Treat AI eval failures with the same severity as unit test failures.',
    },
    realWorldScenarios: [
      {
        title: 'Prompt Change Regression Discovery',
        context: 'A team adding new features to their invoice extraction prompt discovers that a new formatting instruction silently breaks date extraction for European date formats.',
        how: 'Their eval suite includes 50 invoices with European date formats in the labeled dataset. When they run evals after the prompt change, European date accuracy drops from 94% to 67%.',
        outcome: 'Regression caught before deployment. Without evals, this would have corrupted date data for all European invoices processed until a user reported the problem — typically weeks later.',
        type: 'production',
      },
      {
        title: 'No Evals — Model Update Disaster',
        context: 'A medical documentation AI switched from one model version to the next without running evals.',
        how: 'The new model version was better at general text but had different behavior for medical abbreviations (e.g., expanding "h/o" as "history of" vs. keeping the abbreviation). All medical records processed for 3 days contained inconsistently formatted abbreviation expansions.',
        outcome: 'Data quality audit required. 3 days of records manually reviewed. Doctors lost trust in the AI system. Root cause: no evals for medical-specific formatting before deployment.',
        type: 'failure',
      },
    ],
    commonMistakes: [
      {
        mistake: 'Using aggregate accuracy metrics without stratification',
        why: 'Aggregate 97% accuracy hides 61% accuracy for a specific document type that represents 10% of volume.',
        impact: 'You deploy thinking performance is high, but a specific critical use case is failing. You don\'t discover this until users complain.',
        fix: 'Always break down eval results by input type, document format, difficulty level, and any other meaningful categorical dimension.',
        severity: 'production',
      },
      {
        mistake: 'Not updating the eval dataset as the application evolves',
        why: 'Edge cases discovered in production aren\'t added back to the eval dataset.',
        impact: 'The eval suite doesn\'t test real failure modes, giving false confidence. Same failures recur after every deployment.',
        fix: 'When production failures are found, always add that failure case to the eval dataset before fixing it. Make this a team discipline.',
        severity: 'production',
      },
    ],
    tradeoffs: {
      advantages: ['Enables safe, confident iteration — change anything knowing regressions will be caught', 'Forces explicit specification of what "correct" means for your system', 'Enables meaningful comparison between model versions, prompt versions, and parameter configurations'],
      disadvantages: ['Initial dataset curation is expensive — 100 labeled examples per category takes significant human time', 'LLM-as-judge evals have systematic biases that must be calibrated against human judgment', 'Evals can become stale if not maintained as the application evolves'],
      whenNotToUse: ['Early prototyping — too expensive before you know what you\'re actually building', 'When the output space is so open-ended that "correct" can\'t be specified (though LLM-as-judge helps here)'],
      scalingNote: 'Eval infrastructure is an operational investment that pays compound returns. The cost of building evals is fixed; the cost of not having evals compounds with every deployment.',
    },
    failureModes: [
      {
        mode: 'Benchmark contamination',
        cause: 'Eval dataset examples were inadvertently included in training data, producing inflated accuracy metrics.',
        detection: 'Eval accuracy is unusually high compared to user-reported experience. Check if eval examples overlap with training data.',
        resolution: 'Use only real production examples as eval cases — never synthesize eval data from the same process that generated training data.',
      },
    ],
    certFocus: {
      whyItMatters: 'Evals represent the engineering maturity of your AI team. The certification values systems thinking — evals are the feedback loop that makes iterative improvement reliable rather than risky.',
      examThinking: [
        'No evals = no reliable way to improve — any change might break something you\'ll discover in production',
        'LLM-as-judge must be calibrated against human judgment before trusting',
        'Aggregate metrics hide segment-specific failures — always stratify',
        'Evals are not optional for production systems — they are a core architectural component',
      ],
      architectureReasoning: 'The architect designs not just the AI system but the eval infrastructure around it. A system without evals cannot safely improve. A system with good evals can iterate confidently. This is a systems engineering principle, not an AI-specific one.',
    },
    prerequisites: ['first-pass-success', 'calibration'],
    nextConcepts: ['calibration', 'regression-testing', 'hallucination', 'confidence-scoring'],
    advancedInsight: 'The teams that build production AI systems the fastest are not the ones that skip evals to move quickly — they\'re the teams that invest in evals early and iterate with confidence. Every AI system without evals is one deployment away from a production incident.',
  },

  // ─── orchestration ──────────────────────────────────────────────────────────
  'orchestration': {
    simpleExplanation: {
      hook: 'Orchestration is the conductor of the AI orchestra — without it, even brilliant AI musicians play cacophony instead of symphony.',
      analogy: 'Imagine hiring 10 brilliant specialists — a researcher, a lawyer, a data analyst, a writer — to work on a project together. Without coordination, they duplicate work, contradict each other, and miss deadlines. An orchestration layer is the project manager who assigns tasks, manages handoffs, tracks progress, and ensures everyone\'s output gets integrated into the final product.',
      whyItExists: 'Complex AI tasks cannot be accomplished by a single prompt. They require multiple steps, multiple specialized capabilities, and coordination between them. Orchestration exists because real-world AI workflows are inherently multi-step, multi-agent, and stateful — and someone (or something) needs to manage the flow.',
      forBeginners: 'Orchestration is the system that coordinates AI agents and tools to accomplish complex goals. It decides: which agent does what task, in what order, with what context, and how their outputs get combined. The simplest orchestration is a for-loop that chains a sequence of prompts. The most complex orchestration manages dozens of parallel agents with dynamic task allocation and error recovery.',
    },
    technicalDive: {
      mechanics: 'Orchestration patterns range from simple to complex: (1) Sequential chains: output of step N becomes input of step N+1. (2) Parallel fans: coordinator spawns N workers simultaneously, merges results. (3) Conditional routing: different paths based on content classification. (4) Loop patterns: retry or refinement loops. (5) Dynamic decomposition: coordinator decides task breakdown based on input. Each pattern has different context management requirements, failure modes, and scaling characteristics.',
      productionPatterns: [
        'Design orchestration as state machines — explicit states (planning, executing, reviewing, synthesizing) make flow visible and debuggable',
        'Implement circuit breakers: if an agent fails N times, route to human escalation rather than infinite retry',
        'Use structured handoffs — agents should receive clearly structured inputs, not raw conversation history',
        'Emit events at each orchestration step for observability — you need to know exactly what each agent did',
        'Timeout all agent invocations — a hung agent should not block the entire orchestration',
      ],
      apiDetails: 'Orchestration frameworks like LangGraph provide graph-based orchestration where nodes are agent invocations and edges are conditional routing logic. The Claude API itself provides multi-turn conversations and tool use as the primitives that orchestration builds on.',
      orchestrationImplications: 'Orchestration layers are where most production AI failures occur — not in the model itself. A small error in task assignment, handoff format, or error handling can cascade into complete pipeline failures. Invest heavily in orchestration observability: log every state transition, every agent invocation, every tool call.',
    },
    realWorldScenarios: [
      {
        title: 'Document Processing Pipeline',
        context: 'A financial services firm processing regulatory filings through a multi-step extraction and analysis pipeline.',
        how: 'Orchestrator: routes each filing to appropriate sub-pipeline based on document type. Sub-agents: OCR → extraction → validation → enrichment → storage. Each step is atomic with explicit retry logic. Failures route to human review queue.',
        outcome: '85% of filings fully processed automatically. Clear audit trail of every step for regulatory compliance. When steps fail, the orchestration log shows exactly which agent, with what input, produced what error.',
        type: 'enterprise',
      },
      {
        title: 'Orchestration Failure Cascade',
        context: 'A research agent system where the synthesis agent times out, causing the entire research pipeline to fail.',
        how: 'Five research agents complete their work. The synthesis agent times out after 30 seconds. The orchestration has no timeout handling — it waits indefinitely. Other research jobs queue behind the hanging orchestration.',
        outcome: 'System hangs for 2 hours until manually restarted. All 5 agents\' completed work is lost. Fix: implement 30-second timeout on all agent invocations, checkpoint completed work to durable storage, and implement orchestration-level timeout handling.',
        type: 'failure',
      },
    ],
    commonMistakes: [
      {
        mistake: 'Building orchestration without observability',
        why: 'Without logging every state transition and agent invocation, debugging orchestration failures is near-impossible.',
        impact: 'When the pipeline fails (and it will), you have no visibility into which step failed, with what input, and why.',
        fix: 'Emit structured log events at every orchestration decision: task_assigned, agent_started, tool_called, result_received, error_occurred, task_completed.',
        severity: 'production',
      },
      {
        mistake: 'Not handling partial failures in parallel agent pools',
        why: 'If 11 of 12 parallel agents complete but 1 fails, the orchestrator must decide: retry the failing agent, synthesize from 11 results, or fail the entire task.',
        impact: 'Partial failures cause the entire orchestration to fail when a partial result would have been acceptable.',
        fix: 'Design explicit partial failure policies before building: what % failure is acceptable? What partial results can be synthesized?',
        severity: 'production',
      },
    ],
    tradeoffs: {
      advantages: ['Enables complex, multi-step AI workflows', 'Separation of concerns: each agent specializes, orchestrator coordinates', 'Scalability through parallel agent execution', 'Explicit state management enables resumability after failure'],
      disadvantages: ['Orchestration complexity grows super-linearly with number of agents and conditions', 'Context management between agents is manually designed and error-prone', 'Debugging orchestration failures requires specialized tooling and expertise', 'Orchestration latency accumulates across multiple agent roundtrips'],
      whenNotToUse: ['Simple single-step tasks that don\'t require multi-step coordination', 'When a single well-designed prompt can accomplish the task — orchestration adds complexity for no benefit'],
      scalingNote: 'At scale, orchestration coordination costs can exceed the cost of the agent invocations themselves. Design for parallel execution and minimize sequential dependencies.',
    },
    failureModes: [
      {
        mode: 'Context bleed between agents',
        cause: 'Agent A\'s output is injected verbatim into Agent B\'s context, including A\'s reasoning artifacts, not just its conclusions. B\'s reasoning is contaminated by A\'s wrong intermediate steps.',
        detection: 'Agent B produces outputs that are inexplicably influenced by A\'s domain even when the task is entirely within B\'s domain.',
        resolution: 'Design explicit handoff schemas — agents should output only their conclusions in a clean structured format, never their intermediate reasoning. The orchestrator extracts and re-structures before passing to the next agent.',
      },
    ],
    certFocus: {
      whyItMatters: 'Orchestration is arguably the most important architectural skill for the certification. Most advanced exam questions involve designing or debugging multi-step agent orchestrations.',
      examThinking: [
        'Most production AI failures are orchestration failures, not model failures',
        'Sequential vs. parallel orchestration has profound latency and cost implications',
        'Every agent needs explicit context injection — no implicit context inheritance',
        'Error handling must be designed before the happy path — not bolted on after',
      ],
      architectureReasoning: 'The orchestration architect thinks about: (1) What are the independent vs. dependent tasks? (2) What can be parallelized? (3) Where are the failure points and what happens when they fail? (4) How is context managed between agents? (5) What does the audit trail look like?',
    },
    prerequisites: ['agent', 'tool-use', 'multi-agent-systems'],
    nextConcepts: ['planner-agent', 'executor-agent', 'synthesis-subagent', 'observability', 'orchestration-layers'],
    advancedInsight: 'The single most important truth in AI systems engineering: orchestration is harder than prompting. Teams that spend 80% of their time on prompt engineering while neglecting orchestration architecture are building on sand. A mediocre prompt with excellent orchestration outperforms an excellent prompt with mediocre orchestration.',
  },

};

// ─── Fallback generator ───────────────────────────────────────────────────────
// Generates reasonable educational content for concepts not explicitly enriched

import type { Concept } from '@/types';

export function generateFallbackContent(concept: Concept): EnrichedContent {
  return {
    simpleExplanation: {
      hook: `${concept.term} is a foundational concept in AI systems engineering that every architect must understand.`,
      analogy: `Think of ${concept.term} as ${concept.description.toLowerCase().replace(/\.$/, '')} — understanding when and how to use it correctly separates solid architectures from brittle ones.`,
      whyItExists: concept.purpose,
      forBeginners: `${concept.description} It is used for ${concept.usage.toLowerCase()}.`,
    },
    technicalDive: {
      mechanics: `${concept.description} At the technical level: ${concept.example}`,
      productionPatterns: [
        `Always validate inputs and outputs when using ${concept.term}`,
        `Monitor ${concept.term} performance metrics in production`,
        `Test ${concept.term} behavior under failure conditions before deployment`,
      ],
      apiDetails: `See the Claude API documentation for ${concept.term} configuration options and usage patterns.`,
      orchestrationImplications: `In multi-agent systems, ${concept.term.toLowerCase()} requires careful consideration of state management and error handling.`,
    },
    realWorldScenarios: [
      {
        title: `Enterprise Application of ${concept.term}`,
        context: `A production enterprise system using ${concept.term} for ${concept.usage}.`,
        how: concept.example,
        outcome: `When implemented correctly with proper validation and monitoring, ${concept.term.toLowerCase()} achieves high reliability.`,
        type: 'enterprise',
      },
      {
        title: `Common ${concept.term} Failure`,
        context: 'Production scenario without proper safeguards.',
        how: `Using ${concept.term.toLowerCase()} without understanding its limitations: ${concept.insight}`,
        outcome: 'Reliability issues emerge at scale. Proper architecture and monitoring prevent this failure mode.',
        type: 'failure',
      },
    ],
    commonMistakes: [],
    tradeoffs: {
      advantages: [`${concept.term} enables ${concept.purpose.toLowerCase()}`, 'When used correctly, provides significant architectural benefits'],
      disadvantages: [concept.insight],
      whenNotToUse: ['When simpler alternatives achieve the same goal with less complexity'],
      scalingNote: 'Evaluate scaling implications before production deployment.',
    },
    failureModes: [
      {
        mode: `${concept.term} misuse`,
        cause: concept.insight,
        detection: 'Monitor system metrics and output quality in production.',
        resolution: 'Review architecture decisions and apply the established best practices for this component.',
      },
    ],
    certFocus: {
      whyItMatters: `${concept.term} is a Priority ${concept.certificationPriority}/5 certification topic. Understanding its tradeoffs is essential for the architect exam.`,
      examThinking: [
        `${concept.term} questions focus on architecture tradeoffs, not implementation details`,
        'Consider reliability, scalability, and operational complexity in every scenario',
        'Structural solutions (schema design, tool boundaries) are preferred over probabilistic ones (prompt instructions)',
      ],
      architectureReasoning: `Apply systems thinking: understand when ${concept.term.toLowerCase()} solves a problem better than alternatives and what failure modes to anticipate.`,
    },
    prerequisites: concept.relatedConcepts.slice(0, 2),
    nextConcepts: concept.relatedConcepts.slice(2),
    advancedInsight: concept.insight,
  };
}
