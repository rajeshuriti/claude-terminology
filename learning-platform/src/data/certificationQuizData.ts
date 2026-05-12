export type ExamDomain =
  | 'schema-design'
  | 'batch-processing'
  | 'tool-design'
  | 'mcp-security'
  | 'error-handling'
  | 'agentic-architecture'
  | 'context-management'
  | 'output-validation';

export interface CertQuestion {
  id: number;
  domain: ExamDomain;
  difficulty: 'intermediate' | 'advanced';
  scenario: string;
  question: string;
  options: { letter: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctLetter: 'A' | 'B' | 'C' | 'D';
  correctIndex: number; // 0-based
  explanation: string;
  whyOthersWrong: Array<{ letter: string; reason: string }>;
  examTakeaway: string;
  reference: string;
}

export const domainMeta: Record<ExamDomain, { label: string; color: string; icon: string; description: string }> = {
  'schema-design': { label: 'Schema Design & Self-Correction', color: '#8b5cf6', icon: '📐', description: 'Extraction schemas, semantic validation, provenance preservation' },
  'batch-processing': { label: 'Batch Processing & Cost', color: '#0ea5e9', icon: '📦', description: 'Message Batches API, SLA math, cost optimization' },
  'tool-design': { label: 'Tool Design & Interfaces', color: '#f59e0b', icon: '🔧', description: 'Tool schemas, enums, pagination, chaining, identifiers' },
  'mcp-security': { label: 'MCP & Security', color: '#dc2626', icon: '🛡️', description: 'MCP annotations, trust boundaries, resource catalogs' },
  'error-handling': { label: 'Error Handling', color: '#f97316', icon: '⚠️', description: 'Transient vs. syntax errors, retry strategies, self-correction' },
  'agentic-architecture': { label: 'Agentic Architecture', color: '#10b981', icon: '🤖', description: 'Subagent spawning, parallelism, coordinator patterns, state handoffs' },
  'context-management': { label: 'Context Management', color: '#6366f1', icon: '🧠', description: 'Lost-in-the-middle, provenance, summarization, citation IDs' },
  'output-validation': { label: 'Output Validation & Gating', color: '#ec4899', icon: '✅', description: 'Confidence thresholds, stratified accuracy, automation gating' },
};

export const certQuestions: CertQuestion[] = [
  // ─── Q1 ────────────────────────────────────────────────────────────────────
  {
    id: 1,
    domain: 'schema-design',
    difficulty: 'advanced',
    scenario: 'Schema Design & Self-Correction',
    question: 'An automated invoice extraction pipeline occasionally outputs structured JSON where the extracted line items do not add up to the total amount extracted from the invoice. What is the best architectural approach to handle this semantic error?',
    options: [
      { letter: 'A', text: 'Add a calculated_total field alongside the stated_total field, compare them, and flag mismatches for human review.' },
      { letter: 'B', text: 'Automatically adjust the line item values so they mathematically sum to the stated total.' },
      { letter: 'C', text: 'Introduce a secondary LLM step to reconcile the math errors.' },
      { letter: 'D', text: 'Add more few-shot examples of correct math to the prompt.' },
    ],
    correctLetter: 'A',
    correctIndex: 0,
    explanation: 'JSON schemas prevent syntax errors (wrong types, missing fields) but they cannot prevent semantic errors — cases where the data is structurally valid but logically wrong. The most robust self-correction pattern here is a dual-field comparison: extract what the document explicitly states (stated_total) AND independently calculate the sum of all line items (calculated_total). When these two values diverge, it means either the source document has an error or the LLM misread a value — both require human judgment, not automated "fixing." This approach preserves data fidelity while surfacing anomalies for human review without fabricating corrected values.',
    whyOthersWrong: [
      { letter: 'B', reason: 'Automatically adjusting line item values invents data not present in the source document. This corrupts data integrity — you are now storing values that no invoice ever contained. In financial systems this is a compliance violation.' },
      { letter: 'C', reason: 'A secondary LLM step adds architectural overhead and latency. Arithmetic verification is a deterministic operation (addition) — using another probabilistic LLM to "reconcile" it is the wrong tool when explicit calculated_total comparison is available and free.' },
      { letter: 'D', reason: 'Few-shot examples can improve formatting but cannot guarantee deterministic arithmetic consistency. The model may still make extraction errors on novel invoice layouts, making this a probabilistic rather than structural fix.' },
    ],
    examTakeaway: 'Design self-correction flows by extracting both a stated value and a calculated value, routing mismatches to human review rather than silently "fixing" source document errors. JSON schema enforces structure, not semantic truth.',
    reference: 'Claude Docs: Tool Use & Structured Outputs — Validation Patterns',
  },

  // ─── Q2 ────────────────────────────────────────────────────────────────────
  {
    id: 2,
    domain: 'batch-processing',
    difficulty: 'intermediate',
    scenario: 'Batch Processing & Cost Optimization',
    question: 'You are preparing to process 50,000 legacy documents using the Batch API. An initial test on 500 documents reveals that 18% of them require 2–3 prompt refinements to extract data correctly. What is the most cost-efficient strategy for scaling this workload?',
    options: [
      { letter: 'A', text: 'Refine the prompt interactively on a representative sample to maximize first-pass success, then process all 50,000 documents via the Batch API.' },
      { letter: 'B', text: 'Use the Batch API to process all 50,000 documents immediately, identify failures at scale, and resubmit them.' },
      { letter: 'C', text: 'Process the 50,000 documents using the synchronous API to handle prompt refinement dynamically per document.' },
      { letter: 'D', text: 'Begin submitting 5,000-document batches to incrementally learn failure modes in production.' },
    ],
    correctLetter: 'A',
    correctIndex: 0,
    explanation: 'The Batch API offers ~50% cost savings but those savings are destroyed if you need iterative resubmissions. With 18% failure requiring 2–3 refinements, running 50,000 documents immediately without fixing the prompt first means paying full batch cost multiple times. The correct pattern is to treat prompt refinement as a separate, cheap, interactive phase on a small representative sample (e.g., 500 documents). Once you achieve high first-pass success on the sample, run the full 50,000 batch once with high confidence. This is the "sharpen the axe before cutting" principle in batch processing.',
    whyOthersWrong: [
      { letter: 'B', reason: 'Paying batch prices for prompt learning at 50,000-document scale is massively expensive. With 18% failure × 2–3 resubmissions, you could be paying for 60,000–80,000 total document processing runs instead of 50,000.' },
      { letter: 'C', reason: 'The synchronous API discards the 50% cost discount the Batch API provides. For a non-time-critical 50,000-document job, synchronous processing is never the right choice.' },
      { letter: 'D', reason: 'Processing 5,000-document sub-batches to "incrementally learn" still pays for iterative failure at high scale. You are learning expensive lessons when a 500-document interactive test would be 10x cheaper.' },
    ],
    examTakeaway: 'Refine prompts on a representative sample first to maximize first-pass success, then run the full volume through the Batch API. The Batch API\'s 50% discount is only valuable when you minimize resubmission cycles.',
    reference: 'Claude Docs: Message Batches API — Optimization Patterns',
  },

  // ─── Q3 ────────────────────────────────────────────────────────────────────
  {
    id: 3,
    domain: 'batch-processing',
    difficulty: 'advanced',
    scenario: 'SLA Management & Async APIs',
    question: 'Your system processes asynchronous user requests with a strict SLA requiring results within 30 hours of submission. You plan to use the Message Batches API, which can take up to 24 hours to complete. Which batch submission schedule best meets the SLA while maximizing cost efficiency?',
    options: [
      { letter: 'A', text: 'Submit batches every 6 hours.' },
      { letter: 'B', text: 'Submit one large batch at the end of each day.' },
      { letter: 'C', text: 'Use the synchronous API instead to guarantee the SLA.' },
      { letter: 'D', text: 'Submit batches every 4 hours.' },
    ],
    correctLetter: 'D',
    correctIndex: 3,
    explanation: 'The SLA math is: worst-case wait time = batch frequency window + max batch processing time. A document arriving immediately after a batch cutoff waits the full frequency window before being included in the next batch.\n\n• Every 4 hours: worst case = 4h wait + 24h processing = 28 hours ✅ (2-hour safety buffer)\n• Every 6 hours: worst case = 6h wait + 24h processing = 30 hours ❌ (zero buffer, any delay = SLA breach)\n• End of day (24h): 24h + 24h = 48 hours ❌ (fails SLA entirely)\n\nThe 4-hour schedule is the minimum frequency that guarantees a meaningful safety buffer while still using the cost-efficient Batch API.',
    whyOthersWrong: [
      { letter: 'A', reason: '6h + 24h = exactly 30 hours. This leaves zero operational buffer. Any minor processing delay — a busy cluster, network hiccup — means SLA breach. Production systems always need a margin.' },
      { letter: 'B', reason: '24h wait + 24h processing = 48 hours. This fails the 30-hour SLA by 18 hours. End-of-day batching only works when your SLA is 48 hours or longer.' },
      { letter: 'C', reason: 'The synchronous API sacrifices the ~50% cost discount. If the Batch API with 4-hour submissions satisfies the SLA, there is no reason to use the more expensive synchronous path.' },
    ],
    examTakeaway: 'Calculate worst-case SLA by adding the batch frequency interval to the 24-hour max processing time. Always leave an operational buffer — never design to exactly hit the SLA limit.',
    reference: 'Claude Docs: Message Batches API — Timing and SLA Design',
  },

  // ─── Q4 ────────────────────────────────────────────────────────────────────
  {
    id: 4,
    domain: 'schema-design',
    difficulty: 'advanced',
    scenario: 'Schema Engineering & Provenance',
    question: 'An extraction pipeline processes technical manuals. A specific manual lists two conflicting battery capacities: one in the text and a different one in a detailed specs table. Historical data shows the specs table is correct 90% of the time. How should the extraction schema handle this?',
    options: [
      { letter: 'A', text: 'Halt processing and flag the document for manual correction before extraction.' },
      { letter: 'B', text: 'Use a single-value schema and prompt the model to pick the most likely correct value.' },
      { letter: 'C', text: 'Hard-code a rule to always extract the value from the specs table.' },
      { letter: 'D', text: 'Change the field to capture all conflicting values along with their source locations to preserve provenance for downstream reconciliation.' },
    ],
    correctLetter: 'D',
    correctIndex: 3,
    explanation: 'Forcing premature value collapse — choosing one value and discarding the other — is the core anti-pattern here. When the source document itself is ambiguous, the extraction layer should preserve that ambiguity rather than resolve it unilaterally. By changing the schema to accept an array of values with explicit source metadata (e.g., [{value: "3500mAh", source: "body_text", page: 4}, {value: "3200mAh", source: "specs_table", page: 8}]), you preserve full provenance. Downstream business logic, humans, or domain-specific rules can then make the reconciliation decision with complete context.',
    whyOthersWrong: [
      { letter: 'A', reason: 'Halting processing for every ambiguous document is impractical at pipeline scale. Legacy documents often have such inconsistencies, and blocking on each one creates massive review bottlenecks.' },
      { letter: 'B', reason: 'A single-value schema forces the LLM to silently destroy evidence of the conflict. The model picks one value and the other is permanently lost — including the fact that a conflict existed at all.' },
      { letter: 'C', reason: 'A hard-coded specs-table preference is brittle and will output the wrong value 10% of the time (the 10% where body text was correct). This bakes a known error rate into the architecture with no visibility.' },
    ],
    examTakeaway: 'Preserve conflicting source data in the structured output instead of forcing premature collapse into a single value. Extract all conflicting values with source location metadata so downstream systems can make informed reconciliation decisions.',
    reference: 'Claude Docs: Structured Outputs — Provenance and Schema Design',
  },

  // ─── Q5 ────────────────────────────────────────────────────────────────────
  {
    id: 5,
    domain: 'tool-design',
    difficulty: 'intermediate',
    scenario: 'Tool Interfaces & Identifiers',
    question: 'An agent uses a search_documents tool to find files, and subsequently uses share_document(document_id, email) and move_document(document_id, folder) to act on them. How should the search_documents tool format its output to ensure reliable chaining?',
    options: [
      { letter: 'A', text: 'Return clickable human-readable URLs.' },
      { letter: 'B', text: 'Return structured data containing document_id and metadata for each result.' },
      { letter: 'C', text: 'Return detailed prose summaries of the document contents.' },
      { letter: 'D', text: 'Return a simple list of document titles.' },
    ],
    correctLetter: 'B',
    correctIndex: 1,
    explanation: 'Multi-step tool workflows require explicit input/output contracts. The downstream tools (share_document, move_document) both require a document_id as their primary parameter. If search_documents only returns human-readable output (URLs, titles, prose), the agent must guess, parse, or infer the machine-usable ID — introducing a failure point at every step. Returning structured data with document_id as an explicit field creates a clean, reliable pipeline: search returns {document_id, title, metadata}, and those IDs flow directly into subsequent tool calls without any parsing or inference.',
    whyOthersWrong: [
      { letter: 'A', reason: 'Human-readable URLs are designed for browsers. The agent would need to extract an ID by parsing the URL string, which is fragile and breaks if URL formats change.' },
      { letter: 'C', reason: 'Prose summaries of document content provide no programmatic identifier. The agent cannot pass a prose description into a document_id parameter — it would need to call search again to get the actual ID.' },
      { letter: 'D', reason: 'Titles are ambiguous (two documents can have the same title) and cannot be passed into an ID-based API parameter. They provide no machine-usable identifier for subsequent tool calls.' },
    ],
    examTakeaway: 'Multi-step tool workflows require machine-usable identifiers. Tools designed for chaining must return structured data containing explicit IDs alongside human-readable metadata — the downstream tool accepts the ID, not the title.',
    reference: 'Claude Docs: Tool Use — Designing Tools for Chaining',
  },

  // ─── Q6 ────────────────────────────────────────────────────────────────────
  {
    id: 6,
    domain: 'tool-design',
    difficulty: 'intermediate',
    scenario: 'Agentic Tool Integration',
    question: 'When designing agentic workflows, what is the primary advantage of enforcing structured JSON output for tool responses and agent outputs?',
    options: [
      { letter: 'A', text: 'It makes the LLM\'s reasoning process perfectly deterministic.' },
      { letter: 'B', text: 'It ensures the semantic truth of the data fetched from backend APIs.' },
      { letter: 'C', text: 'It significantly reduces token consumption compared to standard text.' },
      { letter: 'D', text: 'It allows the agent and downstream systems to reliably access specific fields directly without parsing free-form text.' },
    ],
    correctLetter: 'D',
    correctIndex: 3,
    explanation: 'Structured outputs provide a stable schema contract between system components. Instead of using regex or fuzzy text parsing to extract an account number, currency amount, or status code from a verbose prose response, downstream systems and subsequent agent tools can directly reference the exact JSON key (e.g., response["account_id"]). This creates a reliable, version-controlled interface that dramatically reduces integration errors in chained tool operations and agent-to-agent handoffs. Structured output is fundamentally an interface reliability mechanism.',
    whyOthersWrong: [
      { letter: 'A', reason: 'JSON enforces the shape and types of the output, but LLM reasoning remains fundamentally probabilistic. The model can still generate different valid JSON structures meeting the schema — the values themselves are probabilistic.' },
      { letter: 'B', reason: 'Schema validation checks format correctness (field types, required fields) but has no knowledge of whether the data values are semantically true. A model can return perfectly valid JSON with incorrect facts.' },
      { letter: 'C', reason: 'JSON formatting actually tends to increase token usage compared to plain prose due to quotation marks, colons, brackets, and field name repetition. This is the opposite of what option C claims.' },
    ],
    examTakeaway: 'Structured output gives agents reliable field-level access, preventing downstream errors associated with parsing free-form text. It\'s an interface contract, not a reasoning mechanism or accuracy guarantee.',
    reference: 'Claude Docs: Tool Use — Structured Outputs and Tool Results',
  },

  // ─── Q7 ────────────────────────────────────────────────────────────────────
  {
    id: 7,
    domain: 'tool-design',
    difficulty: 'advanced',
    scenario: 'Context & Tool Management',
    question: 'An agent has access to over 50 different API connector tools. During execution, it frequently selects the wrong connector, even when explicitly instructed to search first. What is the most effective architectural change to fix this tool selection failure?',
    options: [
      { letter: 'A', text: 'Rewrite the tool descriptions for all 50 connectors to be more detailed.' },
      { letter: 'B', text: 'Combine all 50 connectors into a single monolithic API call.' },
      { letter: 'C', text: 'Implement better error handling so the agent can recover after selecting the wrong connector.' },
      { letter: 'D', text: 'Provide a search_connectors tool that dynamically scopes the available tool set, exposing only the relevant matched connectors to the agent.' },
    ],
    correctLetter: 'D',
    correctIndex: 3,
    explanation: 'The root cause of tool selection failure here is decision complexity overload. Exposing 50+ tools simultaneously causes cognitive saturation in the model — even with good descriptions, the attention mechanism struggles to reliably discriminate between 50 subtle variations. The architectural fix is dynamic scoping: the agent calls search_connectors with a query, the system programmatically filters to 2–3 relevant matches, and only those tools are injected into the model\'s context for the next turn. This reduces the selection problem from "choose from 50" to "choose from 3."',
    whyOthersWrong: [
      { letter: 'A', reason: 'Better descriptions improve individual tool clarity but do not solve the fundamental problem of having 50+ options active simultaneously. At 50+ tools, the model\'s attention is still overwhelmed regardless of description quality.' },
      { letter: 'B', reason: 'A monolithic API call removes the model\'s ability to inspect individual tool parameter requirements and choose correctly among subtle variants. It also pushes all disambiguation logic into the API itself, creating a worse interface.' },
      { letter: 'C', reason: 'Error handling is reactive — it occurs after the wrong selection has already been made. Dynamic scoping is proactive — it prevents the wrong selection from being possible in the first place.' },
    ],
    examTakeaway: 'Reduce decision complexity by dynamically exposing only relevant tools to the agent. A search-then-scope pattern (search_connectors → inject 2–3 matches) is architecturally superior to exposing 50+ tools simultaneously.',
    reference: 'Claude Docs: Tool Use — Managing Tool Selection and Context',
  },

  // ─── Q8 ────────────────────────────────────────────────────────────────────
  {
    id: 8,
    domain: 'tool-design',
    difficulty: 'intermediate',
    scenario: 'Tool Schema Engineering',
    question: 'An agent needs to query specific internal databases, but users often refer to them using ambiguous natural language (e.g., "research database" instead of "db_res_01"). How should the tool\'s input schema be designed to handle this reliably?',
    options: [
      { letter: 'A', text: 'Use an enum parameter explicitly listing the allowed database system names.' },
      { letter: 'B', text: 'Use a freeform string parameter and use backend fuzzy matching to find the right database.' },
      { letter: 'C', text: 'Allow freeform strings but reject the tool call at runtime if the name is incorrect.' },
      { letter: 'D', text: 'Default to searching all databases simultaneously if the user is ambiguous.' },
    ],
    correctLetter: 'A',
    correctIndex: 0,
    explanation: 'Enums create a strict, constrained input contract. When the tool schema lists the exact backend values as enum options (e.g., ["db_res_01", "db_prod_02", "db_analytics_03"]), the LLM can leverage its semantic understanding to map ambiguous natural language ("research database") to the correct backend identifier ("db_res_01") before execution. This semantic mapping happens at the token generation level — the model selects from the enum list — rather than requiring brittle fuzzy matching at the backend. The enum effectively serves as a natural language disambiguation layer encoded directly in the schema.',
    whyOthersWrong: [
      { letter: 'B', reason: 'Backend fuzzy matching pushes ambiguity resolution into infrastructure code, making behavior unpredictable, harder to debug, and dependent on matching algorithm quality. The model is better at semantic understanding than string distance algorithms.' },
      { letter: 'C', reason: 'Runtime rejection wastes an entire execution turn (the model generates a bad call, gets rejected, must regenerate). Upfront schema validation via enum prevents bad calls from being generated in the first place.' },
      { letter: 'D', reason: 'Searching all databases simultaneously spikes cost, latency, and context bloat (results from 10 databases instead of 1). It also makes subsequent processing much harder.' },
    ],
    examTakeaway: 'Use enum fields in tool schemas to map ambiguous natural language to strict backend values. The LLM\'s semantic understanding handles disambiguation at generation time — you don\'t need backend fuzzy matching when enums provide the mapping layer.',
    reference: 'Claude Docs: Tool Use — Input Schema Design and Enums',
  },

  // ─── Q9 ────────────────────────────────────────────────────────────────────
  {
    id: 9,
    domain: 'tool-design',
    difficulty: 'intermediate',
    scenario: 'Tool Output Optimization',
    question: 'A search tool automatically fetches and returns all matching records from a database. This frequently causes severe latency and context bloat, as most agent tasks only need the first few results. What is the best way to redesign this tool\'s output?',
    options: [
      { letter: 'A', text: 'Silently limit the results to the top 5 most relevant hits.' },
      { letter: 'B', text: 'Return the first page of results along with pagination metadata (e.g., total count, cursor) so the agent can fetch more if needed.' },
      { letter: 'C', text: 'Create a separate fetch_next_page tool for the agent to use.' },
      { letter: 'D', text: 'Add a max_pages parameter to let the agent decide how many pages to fetch internally.' },
    ],
    correctLetter: 'B',
    correctIndex: 1,
    explanation: 'The optimal design gives the agent both sufficient data for common cases AND situational awareness to decide whether more is needed. Returning the first page (e.g., 10 records) alongside metadata like {total_matches: 847, next_cursor: "eyJwYWdlIjoyfQ"} allows the agent to evaluate: "I need exactly one result — I have it, done" vs "I need to find a specific record not in the first 10 — pass the cursor back for page 2." This pagination-aware design avoids both silent truncation (losing information) and massive over-fetching (wasting tokens and latency).',
    whyOthersWrong: [
      { letter: 'A', reason: 'Silently truncating results hides potentially critical information from the agent without any warning. The agent has no way to know there were 847 matches when it only sees 5 — it may incorrectly conclude no more results exist.' },
      { letter: 'C', reason: 'A separate fetch_next_page tool clutters the toolset. Pagination should be a first-class feature of the original search tool, not an auxiliary tool that creates unnecessary coupling.' },
      { letter: 'D', reason: 'A max_pages parameter still encourages the tool to make multiple sequential fetches internally, incurring hidden latency. The agent should receive page 1 + a cursor and explicitly decide whether to make another call.' },
    ],
    examTakeaway: 'Return the first page with total match count and a continuation cursor. Give the agent explicit pagination state — never silently truncate (hides information) or eagerly fetch everything (wastes tokens and time).',
    reference: 'Claude Docs: Tool Use — Tool Output Design and Pagination',
  },

  // ─── Q10 ────────────────────────────────────────────────────────────────────
  {
    id: 10,
    domain: 'mcp-security',
    difficulty: 'advanced',
    scenario: 'Security & Model Context Protocol',
    question: 'A third-party MCP server provides tools annotated with readOnlyHint=true. You are designing the user confirmation flow for your agent application. How should you treat these tool annotations?',
    options: [
      { letter: 'A', text: 'Trust the annotations automatically because the MCP server runs locally.' },
      { letter: 'B', text: 'Treat the annotations as untrusted metadata, and base your confirmation bypass policy on your trust of the vendor/server, not the self-reported labels.' },
      { letter: 'C', text: 'Infer the server\'s trustworthiness by testing the tools in a sandbox first.' },
      { letter: 'D', text: 'Bypass user confirmations safely, as the readOnlyHint guarantees no destructive actions can occur.' },
    ],
    correctLetter: 'B',
    correctIndex: 1,
    explanation: 'MCP tool annotations like readOnlyHint, destructiveHint, and idempotentHint are entirely self-reported by the MCP server. They are metadata labels, not cryptographic guarantees or system-level enforcement. A malicious or poorly implemented MCP server could mark a destructive operation as readOnlyHint=true. Your confirmation bypass policy must be grounded in explicit trust of the vendor or server source — not in taking the server\'s self-reported labels at face value. Just as you wouldn\'t trust a random website claiming "this file is safe to run," you shouldn\'t trust a third-party MCP server\'s self-declared annotations unconditionally.',
    whyOthersWrong: [
      { letter: 'A', reason: 'Local execution does not imply trustworthiness. A malicious MCP server running locally has the same file system access as any local process. Local vs. remote is an orthogonal concern to the server\'s intent.' },
      { letter: 'C', reason: 'Sandbox testing reveals observable behavior during tests, but it cannot guarantee that malicious capabilities aren\'t hidden behind specific trigger conditions or time delays that weren\'t exercised during testing.' },
      { letter: 'D', reason: 'readOnlyHint is a self-reported label, not a system-level constraint or cryptographic guarantee. A malicious server declaring readOnlyHint=true can still perform writes, deletions, or exfiltration.' },
    ],
    examTakeaway: 'Treat MCP annotations as untrusted self-reported metadata. Base confirmation bypass policies on explicit trust of the vendor/server source — never on the server\'s own self-declared labels.',
    reference: 'Claude Docs: MCP — Security Considerations and Annotations',
  },

  // ─── Q11 ────────────────────────────────────────────────────────────────────
  {
    id: 11,
    domain: 'tool-design',
    difficulty: 'intermediate',
    scenario: 'Tool Interface Design',
    question: 'An agent frequently executes a two-step sequence: it calls get_property_details(property_id) to find an address, then passes that address to get_neighborhood_info(address). This chaining increases latency and failure rates. How should the tool design be improved?',
    options: [
      { letter: 'A', text: 'Merge both tools into a single get_all_property_data tool.' },
      { letter: 'B', text: 'Modify get_neighborhood_info to accept property_id directly and resolve the address internally.' },
      { letter: 'C', text: 'Improve the prompt to ensure the agent extracts the address more reliably.' },
      { letter: 'D', text: 'Create a middle-tier helper tool to manage the data handoff.' },
    ],
    correctLetter: 'B',
    correctIndex: 1,
    explanation: 'The property_id → address lookup is a purely mechanical, predictable resolution step — it has nothing to do with the agent\'s reasoning. Forcing the LLM to orchestrate a simple ID-to-string lookup wastes tokens, adds a network round-trip failure point, and increases latency for zero reasoning benefit. The correct fix is to update get_neighborhood_info to accept property_id as its parameter and internally handle the address resolution. This "interface simplification" pattern abstracts the mechanical dependency away from the LLM while keeping the tools logically separate (neighborhood data vs. property data remain distinct capabilities).',
    whyOthersWrong: [
      { letter: 'A', reason: 'Over-consolidating distinct capabilities (property details and neighborhood info) reduces the modularity of your tool architecture. These are logically separate domains — they should remain separate tools that happen to share a resolve step.' },
      { letter: 'C', reason: 'Prompt improvements address the agent\'s extraction behavior but do not fix the underlying architectural issue of unnecessary sequential tool calls. Latency and failure rates remain even if the extraction is more reliable.' },
      { letter: 'D', reason: 'A middle-tier helper tool adds more surface area to the toolset and preserves the two-call chaining pattern at a different abstraction level — it doesn\'t reduce latency or failure coupling.' },
    ],
    examTakeaway: 'Design tools to internalize predictable, mechanical dependencies (like ID-to-address lookups) to reduce avoidable chaining, latency, and failure coupling. If the agent always needs to do X before Y, make X part of Y\'s interface.',
    reference: 'Claude Docs: Tool Use — Tool Interface Simplification Patterns',
  },

  // ─── Q12 ────────────────────────────────────────────────────────────────────
  {
    id: 12,
    domain: 'tool-design',
    difficulty: 'intermediate',
    scenario: 'External Integrations & Tool Responses',
    question: 'An agent tracks shipments using tools that call multiple different shipping carrier APIs. Each carrier returns timestamps, statuses, and delay codes in completely different JSON formats. How should you design the tool output provided to the agent?',
    options: [
      { letter: 'A', text: 'Pass the raw JSON to the agent and provide extensive prompt instructions on how to parse each carrier\'s format.' },
      { letter: 'B', text: 'Normalize the carrier responses into a single common schema (e.g., status, estimated_delivery) before returning it to the agent.' },
      { letter: 'C', text: 'Create separate tracking tools for each carrier to keep the raw schemas distinct.' },
      { letter: 'D', text: 'Return both the normalized schema and the full raw response to maximize context.' },
    ],
    correctLetter: 'B',
    correctIndex: 1,
    explanation: 'Agents reason most effectively over consistent, predictable data structures. When multiple carriers return heterogeneous JSON (FedEx uses "deliveryStatus", UPS uses "pkg_state", DHL uses "shipment_tracking_status"), the LLM must expend significant attention parsing format variations rather than solving the actual problem (determining delivery status). Normalizing responses in your middleware layer into a common schema ({carrier, status, estimated_delivery, delay_reason}) makes the agent\'s reasoning task dramatically simpler and more reliable. This is the "normalize at the boundary" pattern.',
    whyOthersWrong: [
      { letter: 'A', reason: 'Pushing format-parsing logic into the prompt makes reasoning brittle. The agent must remember complex format rules for each carrier, and those rules can conflict or be forgotten under context pressure.' },
      { letter: 'C', reason: 'Separate tools per carrier bloat the toolset (5 carriers = 5 tracking tools). The agent then has to decide which carrier tool to use before even querying, adding an unnecessary decision step.' },
      { letter: 'D', reason: 'Adding the full raw response alongside the normalized data just adds token noise. The agent only needs the normalized fields — the raw response provides no additional reasoning value and wastes context window space.' },
    ],
    examTakeaway: 'Normalize heterogeneous API responses into a consistent common schema in your middleware before returning them to the agent. Agents should reason over business-domain concepts, not API format variations.',
    reference: 'Claude Docs: Tool Use — Normalizing External API Responses',
  },

  // ─── Q13 ────────────────────────────────────────────────────────────────────
  {
    id: 13,
    domain: 'tool-design',
    difficulty: 'advanced',
    scenario: 'Tool Input Brittleness',
    question: 'An agent updates sports scores using an update_game_score(date, team_name) tool. The tool frequently fails due to ambiguous team nicknames, rematches on the same day, and date format variations. What is the most reliable tool design to fix this?',
    options: [
      { letter: 'A', text: 'Require strict ISO-8601 date formats and official full team names in the tool schema.' },
      { letter: 'B', text: 'Improve the tool description to provide examples of correct formatting.' },
      { letter: 'C', text: 'Add regex validation to the tool parameters to catch formatting errors early.' },
      { letter: 'D', text: 'Introduce a search_games tool that returns a game_id, and update the scoring tool to accept only the game_id.' },
    ],
    correctLetter: 'D',
    correctIndex: 3,
    explanation: 'Natural language attributes (human-readable dates, team names) are inherently ambiguous and brittle when used as database keys. The architectural fix is the "lookup then act" pattern: separate game discovery from game mutation. A search_games(query) tool returns a machine-usable identifier ({game_id: "g_20240915_LAL_GSW", ...}), and the update tool accepts only that stable, unambiguous game_id. This completely eliminates date format variations (the search handles natural language → date conversion), team name ambiguity (the search finds the specific entity), and same-day rematch issues (each game has a unique ID regardless of teams/date).',
    whyOthersWrong: [
      { letter: 'A', reason: 'Requiring strict formatting still fails for rematches (two games on the same day between the same teams can\'t be disambiguated by date + team name alone). LLMs also still struggle with consistent strict date formulation.' },
      { letter: 'B', reason: 'Better documentation doesn\'t eliminate the fundamental ambiguity of using human-readable attributes as database keys. Examples help but don\'t solve the structural problem.' },
      { letter: 'C', reason: 'Validation catches formatting errors but doesn\'t help the agent resolve which specific game is intended when there are rematches or when team names are ambiguous.' },
    ],
    examTakeaway: 'Replace tools relying on ambiguous human-entered text fields with a two-step lookup/action pattern. Lookup tools return machine-usable IDs; action tools accept only those strict IDs.',
    reference: 'Claude Docs: Tool Use — Identifier Design and Lookup Patterns',
  },

  // ─── Q14 ────────────────────────────────────────────────────────────────────
  {
    id: 14,
    domain: 'tool-design',
    difficulty: 'advanced',
    scenario: 'System Boundaries & Security',
    question: 'An agent processes employee reimbursements. Company policy dictates that payouts over $500 must go to a pending approval queue and cannot be disbursed automatically. You need to ensure this threshold absolutely cannot be bypassed by the agent. Where should this rule be enforced?',
    options: [
      { letter: 'A', text: 'Add a requires_approval boolean parameter to the tool schema that the agent must set.' },
      { letter: 'B', text: 'Enforce the $500 threshold inside the process_reimbursement tool logic itself.' },
      { letter: 'C', text: 'Write a strict system prompt instructing the agent to never disburse amounts over $500.' },
      { letter: 'D', text: 'Provide two separate tools (disburse and request_approval) and trust the agent to select correctly.' },
    ],
    correctLetter: 'B',
    correctIndex: 1,
    explanation: 'The key word in the question is "absolutely cannot be bypassed." This requirement demands a deterministic enforcement mechanism. Business rules with this level of criticality must live in backend code — not in probabilistic LLM instructions. When the $500 threshold check is inside the tool\'s own logic (if amount > 500: route_to_approval_queue()), it executes deterministically every single time, regardless of what prompt the agent was given, what it hallucinated, or whether prompt injection occurred. This is defense-in-depth: the guard exists at the system boundary, not in the reasoning layer.',
    whyOthersWrong: [
      { letter: 'A', reason: 'A requires_approval parameter in the schema leaves the security gate in the LLM\'s hands. The agent could hallucinate requires_approval=false for a $600 reimbursement, and the tool would process it — policy bypassed.' },
      { letter: 'C', reason: 'Prompt constraints are probabilistic. Under adversarial prompting, prompt injection, or edge-case reasoning failures, the agent could violate the instruction. "Absolutely cannot be bypassed" is incompatible with probabilistic enforcement.' },
      { letter: 'D', reason: 'Agent tool selection can fail. If the agent incorrectly calls disburse for an $800 reimbursement (which does happen under certain reasoning failures), the policy is violated. You\'ve created two tools but no hard enforcement.' },
    ],
    examTakeaway: 'Strict business rules and approval thresholds must be enforced deterministically inside the backend tool logic. Never implement "cannot be bypassed" rules via prompt instructions, schema parameters, or agent tool selection.',
    reference: 'Claude Docs: Tool Use — Business Logic and Security Boundaries',
  },

  // ─── Q15 ────────────────────────────────────────────────────────────────────
  {
    id: 15,
    domain: 'tool-design',
    difficulty: 'beginner' as unknown as 'intermediate',
    scenario: 'Tool Schema Documentation',
    question: 'During execution, an agent repeatedly struggles to format inputs correctly for user_id and fields_to_update when calling an update tool. What is the most effective way to help the model understand exactly what values and formats to provide?',
    options: [
      { letter: 'A', text: 'Write clear, detailed parameter descriptions in the tool schema.' },
      { letter: 'B', text: 'Make the JSON schema extremely strict with complex regex constraints.' },
      { letter: 'C', text: 'Rename the tool to include formatting hints in the tool name itself.' },
      { letter: 'D', text: 'Add error-handling logic that explains the formatting rules only when the tool fails.' },
    ],
    correctLetter: 'A',
    correctIndex: 0,
    explanation: 'Tool parameter descriptions are the primary mechanism models use to understand expected inputs at generation time. A parameter description like: "description": "UUID of the user to update. Format: lowercase UUID v4 (e.g., \'550e8400-e29b-41d4-a716-446655440000\'). Required field." directly guides the model\'s token generation before the tool is even called. This is proactive guidance at the generation stage, not reactive correction at the validation stage. Clear descriptions with format examples and constraints are the highest-leverage intervention for input formatting problems.',
    whyOthersWrong: [
      { letter: 'B', reason: 'Strict regex validation rejects malformed input after it\'s already been generated, but it doesn\'t tell the model how to generate correct input in the first place. The model still doesn\'t know the format — it just gets rejected more explicitly.' },
      { letter: 'C', reason: 'Tool names have character limits and are not the mechanism for detailed format guidance. This is a minor workaround vastly inferior to using the dedicated description field which exists precisely for this purpose.' },
      { letter: 'D', reason: 'Reactive error messages waste execution turns. The model generates a bad call, gets rejected, reads the error, then tries again. Proactive schema descriptions prevent the bad generation in the first place, saving a full round-trip.' },
    ],
    examTakeaway: 'Clear, detailed parameter descriptions in the JSON schema are the primary and most important mechanism for guiding a model on input formatting. Include format, examples, and constraints in the description field — this is proactive guidance at generation time.',
    reference: 'Claude Docs: Tool Use — Writing Effective Tool and Parameter Descriptions',
  },

  // ─── Q16 ────────────────────────────────────────────────────────────────────
  {
    id: 16,
    domain: 'error-handling',
    difficulty: 'advanced',
    scenario: 'Error Recovery in Workflows',
    question: 'A tool experiences two types of errors: transient network timeouts, and permanent user syntax errors. How should the tool handle these errors to optimize the agent workflow?',
    options: [
      { letter: 'A', text: 'Pass all errors to the agent and prompt it to retry timeouts but stop on syntax errors.' },
      { letter: 'B', text: 'Automatically retry transient network timeouts inside the tool, but immediately return syntax errors with clear validation details to the agent.' },
      { letter: 'C', text: 'Uniformly auto-retry all errors 3 times before returning a failure message to the agent.' },
      { letter: 'D', text: 'Return all errors immediately to the agent as generic "Tool Execution Failed" messages.' },
    ],
    correctLetter: 'B',
    correctIndex: 1,
    explanation: 'The two error types require fundamentally different handling strategies:\n\n1. Transient network timeouts: These are system-level, predictable, and fixable by waiting and retrying. No agent reasoning is required — a standard exponential backoff retry loop inside the tool (3 retries, 1s/2s/4s delays) handles these transparently without wasting expensive LLM execution turns.\n\n2. Syntax/validation errors: These require the agent\'s reasoning capability to fix the input. A malformed UUID or invalid field name cannot be fixed by retrying — the model needs to understand the error and generate a corrected call. Returning clear validation details immediately ("user_id must be UUID v4 format, received: \'user123\'") allows the agent to self-correct in the next turn.\n\nThe principle: handle what the LLM can\'t add value to inside the tool; surface what requires LLM reasoning to the LLM.',
    whyOthersWrong: [
      { letter: 'A', reason: 'Pushing network retry loops to the LLM wastes expensive execution turns. The LLM adds zero value to "wait 2 seconds and try again" — that\'s pure engineering logic that belongs in the tool.' },
      { letter: 'C', reason: 'Retrying syntax errors 3 times is a waste of compute. A malformed UUID will fail identically all 3 times. Uniform retries conflate the two fundamentally different error types.' },
      { letter: 'D', reason: 'Generic "Tool Execution Failed" messages give the LLM zero context to self-correct. The agent doesn\'t know whether to retry, change its input, or escalate — it\'s flying blind.' },
    ],
    examTakeaway: 'Abstract transient error retries (timeouts, rate limits) into backend tool logic. Return syntax/validation errors immediately to the agent with explicit details. The rule: if LLM reasoning can\'t help, handle it in the tool.',
    reference: 'Claude Docs: Tool Use — Error Handling Patterns',
  },

  // ─── Q17 ────────────────────────────────────────────────────────────────────
  {
    id: 17,
    domain: 'tool-design',
    difficulty: 'intermediate',
    scenario: 'Tool Boundaries & Selection',
    question: 'An agent has access to an archive_file tool and a delete_file tool. It frequently calls delete_file when it should have archived a backup file. What is the most direct way to fix this tool selection error?',
    options: [
      { letter: 'A', text: 'Expand the tool descriptions to clearly define the purpose, boundaries, and specific scenarios where archiving is preferred over deleting.' },
      { letter: 'B', text: 'Add a confirmation prompt directly inside the delete_file tool logic.' },
      { letter: 'C', text: 'Remove the delete_file tool entirely and handle deletions via a separate batch process.' },
      { letter: 'D', text: 'Provide few-shot examples in the system prompt showing correct usage.' },
    ],
    correctLetter: 'A',
    correctIndex: 0,
    explanation: 'Tool descriptions are the highest-leverage mechanism for resolving tool selection errors. When two tools have overlapping capabilities, their descriptions must include explicit negative constraints and boundary definitions. For example:\n\ndelete_file: "Permanently and irreversibly removes a file from the system. Do NOT use this for compliance files, backup files, or any file that may need future access — use archive_file instead."\n\narchive_file: "Moves a file to long-term storage while preserving it for future retrieval. Use this for backup files, compliance documents, or any file that must be retained."\n\nThe negative constraints ("Do NOT use this for...") directly address the confusion pattern and steer the model toward the correct selection.',
    whyOthersWrong: [
      { letter: 'B', reason: 'A confirmation prompt inside delete_file protects against damage but doesn\'t fix the upstream selection error. The agent still incorrectly selects delete_file — the confirmation is a safety net, not a cure.' },
      { letter: 'C', reason: 'Removing the tool entirely is a massive architectural change that might violate system requirements. It\'s far disproportionate to a description-writing fix that can be done in minutes.' },
      { letter: 'D', reason: 'Few-shot prompting in the system prompt is helpful but less robust than the structural tool description fix. Tool descriptions are part of the tool definition itself and persist across all uses — system prompt examples may be forgotten under context pressure.' },
    ],
    examTakeaway: 'When models confuse similar tools, rewrite the tool descriptions to explicitly define negative boundaries ("Do NOT use this for...") and specific scenarios for use. Tool descriptions are the primary disambiguation mechanism.',
    reference: 'Claude Docs: Tool Use — Writing Tool Descriptions for Disambiguation',
  },

  // ─── Q18 ────────────────────────────────────────────────────────────────────
  {
    id: 18,
    domain: 'agentic-architecture',
    difficulty: 'intermediate',
    scenario: 'Iterative Workflows & State Updates',
    question: 'You are using an agent to analyze a 12-file codebase. After the agent completes its initial review, a developer modifies 3 of the files. You want the agent to update its findings efficiently. What is the best approach?',
    options: [
      { letter: 'A', text: 'Resume the session, explicitly inform the agent which 3 files changed, and instruct it to re-analyze only those files in the context of its prior findings.' },
      { letter: 'B', text: 'Start a completely fresh session and have the agent re-analyze all 12 files from scratch.' },
      { letter: 'C', text: 'Resume the session but don\'t explicitly mention the changes, trusting the agent to notice the file diffs organically.' },
      { letter: 'D', text: 'Create a new session containing only the 3 modified files, discarding the context of the other 9 files.' },
    ],
    correctLetter: 'A',
    correctIndex: 0,
    explanation: 'When the majority of session context remains valid, resuming is both correct and efficient. The key is explicitly providing the delta — informing the agent precisely which 3 files changed. Without this, the agent has no way to know its prior tool results might be stale for those specific files. With the explicit diff notification, the agent can:\n1. Reuse its existing understanding of the 9 unchanged files (avoiding redundant re-analysis)\n2. Specifically re-examine the 3 modified files with the full context of how they relate to the rest\n3. Update only the relevant sections of its findings\n\nThis is the delta-informed resume pattern.',
    whyOthersWrong: [
      { letter: 'B', reason: 'Starting fresh throws away valid context for 9 unchanged files — that\'s 75% of the analysis wasted. This is expensive, slow, and produces no benefit for files that haven\'t changed.' },
      { letter: 'C', reason: 'The agent cannot "notice" file diffs organically without being explicitly told or having tools that surface changes. Without notification, it may reason as if its prior findings for those 3 files are still current, producing stale analysis.' },
      { letter: 'D', reason: 'Isolating to only 3 files removes crucial cross-file context. Code analysis requires understanding how changes in file A impact the 9 other files that depend on it — that context is in the original session.' },
    ],
    examTakeaway: 'When resuming sessions after targeted changes, explicitly inform the resumed session of the specific delta (which files/data changed) to enable targeted re-analysis without discarding valid prior context.',
    reference: 'Claude Docs: Claude Code — Session Management and Context Reuse',
  },

  // ─── Q19 ────────────────────────────────────────────────────────────────────
  {
    id: 19,
    domain: 'mcp-security',
    difficulty: 'advanced',
    scenario: 'Discovery via Model Context Protocol',
    question: 'An agent interacting with multiple MCP servers wastes significant context and time performing sequential lookup calls just to discover what data (issue tickets, docs, schemas) is available. How can you improve data discovery?',
    options: [
      { letter: 'A', text: 'Consolidate all the MCP servers into a single, massive endpoint.' },
      { letter: 'B', text: 'Add a new discover_data tool to every MCP server.' },
      { letter: 'C', text: 'Implement keyword-based routing in the coordinator to send queries to the right server automatically.' },
      { letter: 'D', text: 'Expose each MCP server\'s content catalog as an MCP Resource, allowing the agent to read what data exists before making targeted tool calls.' },
    ],
    correctLetter: 'D',
    correctIndex: 3,
    explanation: 'MCP has a deliberate architectural distinction between Tools (for taking actions or making specific queries) and Resources (for exposing available context and data for the agent to read). Content catalogs — summaries of available issue tickets, document hierarchies, database schemas — are perfect candidates for MCP Resources. The agent can read these lightweight catalogs to understand what data exists across all servers, then make highly targeted tool calls for exactly what it needs. This eliminates the "exploratory spam" pattern where the agent queries each server to figure out what it holds.',
    whyOthersWrong: [
      { letter: 'A', reason: 'Consolidating all servers into a single endpoint destroys microservice boundaries, creates a single point of failure, and doesn\'t actually solve the discovery problem — it just puts all the data in one place that still needs to be explored.' },
      { letter: 'B', reason: 'Adding a discover_data tool re-invents what MCP Resources are designed for. Resources are the native, built-in MCP mechanism for exposing readable catalogs — creating custom tools for this is redundant.' },
      { letter: 'C', reason: 'Keyword routing is brittle and fails when questions span multiple systems or when the routing logic doesn\'t anticipate the query pattern. It doesn\'t help the agent understand what data is available before querying.' },
    ],
    examTakeaway: 'Use MCP Resources to expose content catalogs (document hierarchies, schema summaries, issue lists) so agents can discover available data before making targeted tool calls. Resources are read-only context; Tools are for actions.',
    reference: 'Claude Docs: MCP — Resources vs. Tools Architecture',
  },

  // ─── Q20 ────────────────────────────────────────────────────────────────────
  {
    id: 20,
    domain: 'agentic-architecture',
    difficulty: 'advanced',
    scenario: 'Workflow Decomposition',
    question: 'An agent is responsible for reviewing pull requests. Every PR must be reviewed for three specific aspects: code style, security vulnerabilities, and documentation accuracy. Which architectural pattern is best suited for this workflow?',
    options: [
      { letter: 'A', text: 'Dynamic subagent decomposition, letting a coordinator agent decide which aspects to check case-by-case.' },
      { letter: 'B', text: 'A routing agent that categorizes the PR and sends it to either a style, security, or docs specialist.' },
      { letter: 'C', text: 'A single, massive prompt instructing one agent to analyze all three aspects simultaneously.' },
      { letter: 'D', text: 'Prompt chaining: reviewing style, security, and documentation in separate sequential passes, then merging the outputs into a final synthesis.' },
    ],
    correctLetter: 'D',
    correctIndex: 3,
    explanation: 'This workflow has three characteristics that make prompt chaining the superior pattern:\n\n1. Predictable: Every PR always requires all three reviews — there\'s no uncertainty about which tasks are needed.\n2. Mandatory: You cannot skip security or docs for a PR — all three must happen.\n3. Cognitively distinct: Style, security, and docs require different mental lenses. A model analyzing all three simultaneously experiences attention dilution — it may over-focus on style errors while missing a SQL injection vulnerability.\n\nBy chaining three separate focused passes (style agent → security agent → docs agent → synthesis), each agent brings its full attention to one cognitive domain, dramatically improving thoroughness compared to one overwhelmed generalist.',
    whyOthersWrong: [
      { letter: 'A', reason: 'Dynamic decomposition is for unpredictable workflows where required tasks vary per input. When the decomposition is always identical (style + security + docs), dynamic decision-making adds overhead for no benefit.' },
      { letter: 'B', reason: 'A routing agent sends the PR to one specialist OR another. The question says every PR gets all three reviews. Routing is for mutually exclusive paths, not mandatory parallel coverage.' },
      { letter: 'C', reason: 'A single massive all-in-one prompt causes severe attention dilution. The model must track three different evaluation frameworks simultaneously, leading to missed items. Known as the "one-agent cognitive overload" anti-pattern.' },
    ],
    examTakeaway: 'Use prompt chaining for predictable, static multi-aspect workflows where every execution requires the same set of distinct tasks. Isolate distinct cognitive domains into separate sequential passes before synthesizing outputs.',
    reference: 'Claude Docs: Agentic Systems — Prompt Chaining vs. Dynamic Decomposition',
  },

  // ─── Q21 ────────────────────────────────────────────────────────────────────
  {
    id: 21,
    domain: 'agentic-architecture',
    difficulty: 'advanced',
    scenario: 'Agentic Architecture & Context Management',
    question: 'In a production environment, follow-up summarization queries to a multi-agent system take over 40 seconds. Investigation shows the coordinator spawns a synthesis subagent for each follow-up, passing 80,000 tokens of findings. The coordinator already holds these findings in its context. What is the most effective fix?',
    options: [
      { letter: 'A', text: 'Compress findings before passing them to the synthesis subagent.' },
      { letter: 'B', text: 'Increase the synthesis subagent\'s context window.' },
      { letter: 'C', text: 'Handle the summarization directly using the coordinator\'s existing context.' },
      { letter: 'D', text: 'Cache synthesis subagent responses.' },
    ],
    correctLetter: 'C',
    correctIndex: 2,
    explanation: 'The architectural flaw is unnecessary delegation. The coordinator already possesses all 80,000 tokens of findings in its current context — they were accumulated during orchestration. Spawning a synthesis subagent means:\n1. Serializing 80,000 tokens\n2. Starting a new model instance from scratch (zero context)\n3. Transmitting 80,000 tokens to that new instance\n4. Waiting for the new instance to process them\n\nAll of this is avoidable. The coordinator can answer follow-up summarization queries directly from its existing context, with near-zero additional latency. The principle: if the coordinator already owns the data, don\'t delegate work that requires moving that data to a fresh context.',
    whyOthersWrong: [
      { letter: 'A', reason: 'Compressing before passing reduces token count but still spawns the subagent unnecessarily. The 40-second latency comes from the spawning and transfer overhead, not just token volume. This is a partial fix that doesn\'t address the architectural flaw.' },
      { letter: 'B', reason: 'Context window size is not the bottleneck here. The problem is the unnecessary overhead of spawning a new agent instance and transferring data — not that the subagent can\'t fit the tokens.' },
      { letter: 'D', reason: 'Caching is a band-aid. It helps for repeated identical queries but doesn\'t help for unique follow-up questions. More importantly, it doesn\'t fix the incorrect delegation pattern.' },
    ],
    examTakeaway: 'If the coordinator already has the information in its context, handle it at the coordinator level. Never spawn a subagent just to re-process data the coordinator already owns — subagent spawning has significant overhead.',
    reference: 'Claude Docs: Agentic Systems — Coordinator vs. Subagent Responsibility',
  },

  // ─── Q22 ────────────────────────────────────────────────────────────────────
  {
    id: 22,
    domain: 'agentic-architecture',
    difficulty: 'advanced',
    scenario: 'Agentic Architecture & Subagent Isolation',
    question: 'After web search and document analysis subagents finish their tasks, the coordinator needs to spawn a synthesis subagent to combine the findings. What is the correct approach for providing the synthesis subagent with the information it needs?',
    options: [
      { letter: 'A', text: 'Let the synthesis subagent call the search and analysis tools itself.' },
      { letter: 'B', text: 'Let the synthesis subagent read directly from the coordinator\'s session history.' },
      { letter: 'C', text: 'Pass a prose summary of the findings to the synthesis subagent.' },
      { letter: 'D', text: 'Pass complete findings embedded directly in the synthesis subagent\'s prompt using a structured format separating content from metadata.' },
    ],
    correctLetter: 'D',
    correctIndex: 3,
    explanation: 'Subagents start with zero knowledge and cannot inherit the coordinator\'s conversation history (this is a hard architectural constraint). Therefore, every piece of information the synthesis agent needs must be explicitly injected into its initial prompt.\n\nUsing a structured format with explicit metadata fields ({claim, evidence, source_url, date, confidence}) is critical because:\n1. The synthesis agent needs to attribute claims to sources — without source_url it will hallucinate citations\n2. Temporal ordering requires dates — without dates it cannot distinguish old vs. new data\n3. Confidence levels affect how findings are presented — without confidence it treats all claims equally\n\nUnstructured prose summaries lose this metadata under compression.',
    whyOthersWrong: [
      { letter: 'A', reason: 'Synthesis agents should synthesize — not perform searches. Having the synthesis agent re-run searches violates tool scoping, duplicates work, may return different results, and significantly increases latency.' },
      { letter: 'B', reason: 'This is architecturally impossible. Subagents start fresh with zero context inheritance from the coordinator. The coordinator\'s session history is not accessible to subagents — they have no mechanism to read it.' },
      { letter: 'C', reason: 'Prose summaries lose source attribution, methodology information, and temporal metadata. The synthesis agent cannot properly cite sources it has no structured record of, leading to hallucinated citations in the final output.' },
    ],
    examTakeaway: 'Explicitly inject all prior findings into the subagent\'s prompt using a structured {claim, evidence, source, date} format. Subagents have zero context inheritance — never rely on implicit context sharing.',
    reference: 'Claude Docs: Agentic Systems — Subagent Context Injection Patterns',
  },

  // ─── Q23 ────────────────────────────────────────────────────────────────────
  {
    id: 23,
    domain: 'agentic-architecture',
    difficulty: 'advanced',
    scenario: 'Agent Adaptability & Prompt Engineering',
    question: 'A coordinator provides exact search queries, source priorities, and date filters step-by-step to a web search subagent. However, the subagent often reports "insufficient results" instead of trying alternatives, drops in quality on emerging topics, and rarely surfaces unconventional sources. What is the most effective way to improve the subagent\'s adaptability?',
    options: [
      { letter: 'A', text: 'Add a fallback instruction to report failure if fewer than 5 results are found.' },
      { letter: 'B', text: 'Replace procedural instructions with goal-oriented prompts detailing research goals and quality criteria.' },
      { letter: 'C', text: 'Expand the exact query lists to cover emerging topics.' },
      { letter: 'D', text: 'Provide generic, single-word queries to broaden the search base.' },
    ],
    correctLetter: 'B',
    correctIndex: 1,
    explanation: 'Over-specifying coordinator prompts with step-by-step procedural instructions turns the subagent into a rigid rule-follower. When the exact prescribed steps fail (no results for a specific query, no data from specified sources), the agent has no authority to adapt — it hits a dead end and reports failure.\n\nGoal-oriented prompts provide:\n- Research intent: "Find current market size estimates for quantum computing in manufacturing"\n- Quality criteria: "Minimum 5 distinct claims from at least 3 different source types"\n- Success conditions: "Coverage of at least 2024 data points and primary company reports"\n\nThis grants the subagent authority to form its own queries, try alternative sources, and validate its own work against criteria — producing adaptive, high-quality research rather than mechanical compliance.',
    whyOthersWrong: [
      { letter: 'A', reason: 'This reinforces the rigidity. Reporting failure at <5 results just codifies the quitting behavior without giving the agent authority to try alternatives.' },
      { letter: 'C', reason: 'Still procedural — you cannot hard-code queries for unknown emerging patterns or topics that haven\'t been anticipated. The query list will always be incomplete for novel domains.' },
      { letter: 'D', reason: 'Single-word queries degrade research specificity. The agent needs focus, not vague broad queries that return irrelevant results.' },
    ],
    examTakeaway: 'Replace procedural step-by-step instructions with research goals, quality criteria, and success conditions to give subagents the authority to adapt their approach when pre-specified paths fail.',
    reference: 'Claude Docs: Agentic Systems — Goal-Oriented vs. Procedural Agent Prompts',
  },

  // ─── Q24 ────────────────────────────────────────────────────────────────────
  {
    id: 24,
    domain: 'agentic-architecture',
    difficulty: 'advanced',
    scenario: 'Latency Optimization & Tool Execution',
    question: 'A document analysis subagent processes citations in complex legal cases sequentially. A landmark case citing 12 precedents currently takes over 3 minutes to process. What is the most effective way to reduce this latency?',
    options: [
      { letter: 'A', text: 'Increase the subagent\'s context window.' },
      { letter: 'B', text: 'Have the coordinator emit multiple Task tool calls simultaneously in a single response.' },
      { letter: 'C', text: 'Use fork_session to speed up processing.' },
      { letter: 'D', text: 'Use the Message Batches API.' },
    ],
    correctLetter: 'B',
    correctIndex: 1,
    explanation: 'The root cause is sequential processing of independent, parallelizable work. Analyzing 12 precedent citations one by one means total time = sum of all individual analysis times (12 × ~15s = ~3 minutes).\n\nThe fix: instead of a loop that spawns one subagent, waits for it, then spawns the next, the coordinator emits all 12 Task tool calls in a single response turn. This spawns 12 parallel analysis subagents simultaneously. Total time drops from the sum of all tasks to the duration of the slowest single task (~15-20 seconds) — roughly a 10x latency reduction for this case.\n\nThis is the fundamental parallelism pattern for independent agentic workloads.',
    whyOthersWrong: [
      { letter: 'A', reason: 'Context window size is not the bottleneck. The problem is the sequential loop architecture. A larger context window doesn\'t enable parallel execution.' },
      { letter: 'C', reason: 'fork_session is designed for divergent exploration (branching to try different approaches). It\'s not a parallelism mechanism for independent, homogeneous tasks like citation analysis.' },
      { letter: 'D', reason: 'The Message Batches API has up to a 24-hour processing SLA. Using it would make this "3-minute" task potentially take hours — the opposite of latency reduction.' },
    ],
    examTakeaway: 'Emit multiple Task tool calls in a single coordinator response turn to achieve parallel execution. For N independent tasks processed sequentially, parallelization reduces latency from O(N) to O(max single task time).',
    reference: 'Claude Docs: Agentic Systems — Parallel Subagent Spawning',
  },

  // ─── Q25 ────────────────────────────────────────────────────────────────────
  {
    id: 25,
    domain: 'context-management',
    difficulty: 'advanced',
    scenario: 'Context Management & Synthesis Precision',
    question: 'Final reports consistently mishandle uncertainty. A web search agent returns a $50B estimate (unspecified methodology), while a document analysis agent returns a $35B estimate (±$7B, 95% CI). The coordinator either picks one arbitrarily or produces a vague hedged statement. What approach best avoids this?',
    options: [
      { letter: 'A', text: 'Instruct the coordinator to always prefer peer-reviewed sources.' },
      { letter: 'B', text: 'Ask the synthesis subagent to pick the most recent figure.' },
      { letter: 'C', text: 'Have the coordinator average the two conflicting values.' },
      { letter: 'D', text: 'Require subagents to return structured data with methodology/confidence metadata and a conflict_detected flag to preserve both values.' },
    ],
    correctLetter: 'D',
    correctIndex: 3,
    explanation: 'Unstructured prose findings lose provenance and methodology information. When subagents return plain text, the coordinator sees two numbers and has no structured basis to distinguish a rigorous peer-reviewed study from a back-of-envelope estimate. The fix is structural: require subagents to return objects like {claim: "$50B", source_type: "analyst_report", methodology: "unspecified", confidence: null, date: "2024-Q1"}. When two claims conflict, a programmatic conflict_detected: true flag forces the synthesis agent to surface both values with their full source context in the final report — enabling readers to make informed judgments rather than receiving a silently collapsed single number.',
    whyOthersWrong: [
      { letter: 'A', reason: 'A prompt-based preference rule is probabilistic and fails when only non-peer-reviewed data is available (which is common for emerging topics). The coordinator can\'t reliably identify source type from prose.' },
      { letter: 'B', reason: 'Recency does not equal accuracy. A $50B analyst estimate from last month is not more accurate than a rigorous $35B study from last year just because it\'s newer.' },
      { letter: 'C', reason: 'Averaging fabricates a number ($42.5B) that no source ever stated, supported by neither methodology. This destroys attribution and presents a synthetic number as if it were a real finding.' },
    ],
    examTakeaway: 'Require subagents to return structured metadata objects including methodology and confidence. Use a conflict_detected boolean to explicitly surface conflicts for attribution rather than silently collapsing conflicting values.',
    reference: 'Claude Docs: Agentic Systems — Structured Claim Metadata and Conflict Handling',
  },

  // ─── Q26 ────────────────────────────────────────────────────────────────────
  {
    id: 26,
    domain: 'context-management',
    difficulty: 'advanced',
    scenario: 'Context Budgets & Downstream Handoffs',
    question: 'A web search agent gathers 120k tokens of raw content, a document analysis agent extracts 15k tokens of insights, and a synthesis agent produces a 3k-token narrative draft. The coordinator must pass context to a report generation agent for final output with proper citations. Which context-passing strategy provides the best balance of completeness and efficiency?',
    options: [
      { letter: 'A', text: 'Pass the 120k tokens of raw content and all intermediate outputs.' },
      { letter: 'B', text: 'Pass only the 3k-token synthesis narrative.' },
      { letter: 'C', text: 'Pass the synthesis narrative and the full document analysis reasoning chain.' },
      { letter: 'D', text: 'Pass the synthesis narrative along with a lean, structured citation index and conflict flags.' },
    ],
    correctLetter: 'D',
    correctIndex: 3,
    explanation: 'The challenge is balancing completeness (the report agent needs citation data to avoid hallucinating sources) against efficiency (flooding 138k+ tokens triggers the "lost in the middle" effect where the LLM ignores context buried in the middle of a massive prompt).\n\nThe optimal solution passes:\n1. The dense narrative backbone (3k tokens) — the coherent structure the report agent builds on\n2. A compact structured citation index (5–8k tokens) — {citation_id, claim, source_url, key_quote, date} for each source\n3. Conflict flags — unresolved discrepancies the report must handle explicitly\n\nThis gives the report agent everything it needs for proper attribution without the "lost in the middle" degradation that 138k tokens would cause.',
    whyOthersWrong: [
      { letter: 'A', reason: '138k+ tokens causes severe "lost in the middle" degradation. Research shows LLMs reliably process content at the start and end of context, but information in the middle of very long prompts is frequently ignored.' },
      { letter: 'B', reason: 'The 3k narrative alone has no citation metadata. The report agent will hallucinate source attribution — confidently inventing plausible-sounding citations that don\'t exist.' },
      { letter: 'C', reason: 'Internal reasoning chains are the analysis agent\'s working notes — they are verbose, often contradictory mid-reasoning, and add noise without value for the report generation task.' },
    ],
    examTakeaway: 'Pass the synthesis narrative plus a structured citation index — strip raw content and reasoning chains entirely. The "lost in the middle" effect degrades LLM performance significantly at 100k+ token contexts.',
    reference: 'Claude Docs: Context Management — Lost in the Middle and Context Budget Optimization',
  },

  // ─── Q27 ────────────────────────────────────────────────────────────────────
  {
    id: 27,
    domain: 'context-management',
    difficulty: 'advanced',
    scenario: 'Metadata Preservation & Attribution',
    question: 'A synthesis agent receives findings from upstream agents and passes a consolidated prose summary to a report generation agent. During testing, the report generator makes factual claims but cannot accurately attribute them because source metadata was lost during the summarization step. What is the most effective approach to ensure proper source attribution?',
    options: [
      { letter: 'A', text: 'Ask the synthesis agent to re-include the full source text in its summary.' },
      { letter: 'B', text: 'Assign a citation_id at the earliest agent, and require the synthesis agent to produce an inline-tagged narrative alongside a preserved structured citation index.' },
      { letter: 'C', text: 'Instruct the report agent to infer the original sources from the claim content.' },
      { letter: 'D', text: 'Instruct the synthesis agent to "preserve sources" in its prose output.' },
    ],
    correctLetter: 'B',
    correctIndex: 1,
    explanation: 'Prose summarization inherently destroys metadata — URLs, page numbers, publication dates, and author information collapse into readable sentences during the compression process. The structural fix is to separate content from metadata across the entire pipeline:\n\n1. At the source discovery stage: assign a stable citation_id (e.g., "src_001") to each source\n2. The synthesis agent writes the narrative using inline tags: "Market size is estimated at $35B [src_001]"\n3. The citation index ({src_001: {url, title, date, key_quote}}) is passed alongside the narrative as a separate structured array\n\nThe report agent can then access both the cited narrative AND the complete source metadata for every citation in the text.',
    whyOthersWrong: [
      { letter: 'A', reason: 'Re-including full source text re-inflates the context window — potentially adding 100k+ tokens and triggering "lost in the middle" degradation in the final report agent.' },
      { letter: 'C', reason: 'The report agent has no access to the original sources. "Inferring" means hallucinating — it will confidently fabricate plausible-sounding citations that don\'t exist.' },
      { letter: 'D', reason: 'Prompt-based instructions to "preserve sources" are probabilistic and fail under token pressure. As context grows, LLMs progressively drop metadata from prose. This is a known compression behavior.' },
    ],
    examTakeaway: 'Assign citation_id tags at the earliest stage. Require the synthesis agent to output an inline-tagged narrative paired with a separate structured citation index. Never rely on prose to preserve source metadata.',
    reference: 'Claude Docs: Agentic Systems — Citation Tracking Across Multi-Agent Pipelines',
  },

  // ─── Q28 ────────────────────────────────────────────────────────────────────
  {
    id: 28,
    domain: 'agentic-architecture',
    difficulty: 'advanced',
    scenario: 'Stateful Orchestration & Failure Recovery',
    question: 'A multi-agent research pipeline crashes after processing 12 out of 18 documents. Each agent has partially completed work. You need to resume the pipeline without losing the fidelity of prior findings or repeating completed work. What is the best state management approach?',
    options: [
      { letter: 'A', text: 'Run the --resume command directly on the crashed session.' },
      { letter: 'B', text: 'Use fork_session from the crash point to branch the execution.' },
      { letter: 'C', text: 'Write completed findings to a structured checkpoint file, start a fresh session, and inject the checkpoint as structured context.' },
      { letter: 'D', text: 'Resume the session without noting partial document states.' },
    ],
    correctLetter: 'C',
    correctIndex: 2,
    explanation: 'When a pipeline crashes mid-execution, the tool call results in that session become unreliable. The agent\'s internal state about which documents were processed may be inconsistent with actual tool execution results. Blindly resuming risks the agent re-processing completed documents or incorrectly treating partially-processed documents as complete.\n\nThe correct pattern:\n1. Extract confirmed completed findings into a durable structured checkpoint file: [{doc_id, status: "complete", findings: {...}}, {doc_id, status: "partial", completed_sections: ["intro", "methods"]}, {doc_id, status: "pending"}]\n2. Start a fresh session with reliable initial state\n3. Inject the checkpoint explicitly: "12 documents complete, 1 partial (sections A-C done, D-F pending), 5 pending. Do not reprocess completed documents."\n\nThis ensures clean, reliable state with no ambiguity about what was and wasn\'t completed.',
    whyOthersWrong: [
      { letter: 'A', reason: 'Stale tool results from the crashed session are unreliable. The agent may have partial tool outputs that succeeded before the crash, creating inconsistent state that blindly resuming will mishandle.' },
      { letter: 'B', reason: 'fork_session creates parallel divergent explorations from a point — it\'s for trying alternative approaches, not for recovering from crashes. It doesn\'t resolve the stale state problem.' },
      { letter: 'D', reason: 'Without explicitly noting partial document states, the agent will likely either re-process all 18 documents (wasting work) or incorrectly assume the partially-processed document is complete, producing incomplete findings.' },
    ],
    examTakeaway: 'Extract completed work to a structured checkpoint file and start a fresh session with explicit state injection. Never blindly --resume a crashed session — stale tool results create unreliable state.',
    reference: 'Claude Docs: Agentic Systems — Checkpoint and Recovery Patterns',
  },

  // ─── Q29 ────────────────────────────────────────────────────────────────────
  {
    id: 29,
    domain: 'context-management',
    difficulty: 'advanced',
    scenario: 'Data Synthesis & Schema Design',
    question: 'During research on "renewable energy adoption," a web search agent returns statistics from 2024, while a document analysis agent returns statistics from 2021. The synthesis agent incorrectly flags these as contradictory rather than recognizing a growth trend over time. What single change best enables the synthesis agent to correctly interpret this difference?',
    options: [
      { letter: 'A', text: 'Instruct the synthesis agent in the system prompt to ignore date discrepancies when comparing statistics.' },
      { letter: 'B', text: 'Require publication_date in the subagent output schema, and update synthesis instructions to treat values from distinct time periods as temporal progression rather than conflict.' },
      { letter: 'C', text: 'Remove temporal metadata from structured outputs to simplify the synthesis process.' },
      { letter: 'D', text: 'Use a separate time-series analysis agent to pre-process all temporal data before synthesis.' },
    ],
    correctLetter: 'B',
    correctIndex: 1,
    explanation: 'Without structured temporal metadata, the synthesis agent sees two different numeric values (e.g., 15% adoption in 2021 vs. 34% in 2024) and treats the difference as a contradiction — because it has no structural representation of when each value was true.\n\nThe fix requires two coordinated changes:\n1. Schema change: enforce publication_date as a required field in all subagent output schemas. This ensures temporal context is explicitly captured rather than buried or lost in prose.\n2. Instruction change: update synthesis logic to recognize that differing values across distinct dates are temporal progression data (chronological growth) while conflict_detected: true should only trigger for values claiming to describe the same time period.\n\nThis is a structural + semantic fix working together.',
    whyOthersWrong: [
      { letter: 'A', reason: 'Ignoring date discrepancies entirely is too broad — some date discrepancies are genuine contradictions (two sources disagreeing about the same year). The goal is to correctly classify temporal progression vs. true conflict, not to ignore dates.' },
      { letter: 'C', reason: 'Removing temporal metadata is the opposite of what\'s needed. Without dates, the synthesis agent can never distinguish growth trends from contradictions — it will flag all differences as conflicts.' },
      { letter: 'D', reason: 'Adding a separate time-series pre-processing agent adds architectural complexity and latency. The problem is solved more elegantly by adding publication_date to the existing schema — a much simpler structural fix.' },
    ],
    examTakeaway: 'Always include temporal metadata (publication_date) in extraction schemas. Without structured dates, synthesis agents cannot distinguish chronological growth from genuine data contradiction.',
    reference: 'Claude Docs: Agentic Systems — Temporal Metadata in Multi-Agent Pipelines',
  },

  // ─── Q30 ────────────────────────────────────────────────────────────────────
  {
    id: 30,
    domain: 'output-validation',
    difficulty: 'advanced',
    scenario: 'Output Validation & Automation Gating',
    question: 'An extraction system has operated with 100% human review for 3 months. Analysis shows that extractions with model confidence ≥90% have a 97% accuracy overall. To reduce reviewer workload, you plan to automate high-confidence extractions. What validation step is most critical before deploying automation?',
    options: [
      { letter: 'A', text: 'Segment the accuracy metrics by document type and field.' },
      { letter: 'B', text: 'Deploy the automation globally at the ≥90% confidence threshold immediately.' },
      { letter: 'C', text: 'Run a random sample review across all documents before deploying.' },
      { letter: 'D', text: 'Increase the confidence threshold to ≥95% just to be safe.' },
    ],
    correctLetter: 'A',
    correctIndex: 0,
    explanation: 'An aggregate accuracy of "97% overall" is statistically dangerous because it can mask catastrophic failure rates in specific segments. For example:\n• Standard digital invoices: 99.2% accurate at ≥90% confidence ✅\n• Handwritten forms: 61.0% accurate at ≥90% confidence 🚨\n• Medical billing codes: 78.3% accurate at ≥90% confidence 🚨\n\nDeploying automation globally based on the aggregate 97% figure would mean automating handwritten forms with only 61% accuracy — a disaster. Stratified analysis by document type AND field reveals exactly which segments are safe for automation and which require continued human review, allowing a targeted, safe rollout rather than blanket automation.',
    whyOthersWrong: [
      { letter: 'B', reason: 'Global deployment based on an aggregate metric is precisely the failure mode this question warns against. Aggregate metrics mask minority subset failures that can be catastrophic.' },
      { letter: 'C', reason: 'A random sample review still produces aggregate metrics, not stratified ones. If 80% of your documents are standard invoices (99.2% accurate), a random sample will be dominated by the high-accuracy segment and miss the handwritten form problem.' },
      { letter: 'D', reason: 'Raising the threshold to 95% reduces the automation rate but doesn\'t reveal which document types/fields are problematic. A handwritten form with 65% actual accuracy might still achieve ≥95% model confidence due to overconfident model calibration.' },
    ],
    examTakeaway: 'Before automating based on aggregate confidence thresholds, run stratified accuracy analysis by document type and field. Aggregate metrics mask minority failure rates that can be catastrophic in production.',
    reference: 'Claude Docs: Evaluation and Reliability — Stratified Validation and Confidence Thresholds',
  },
];

export const TOTAL_QUESTIONS = certQuestions.length;
export const DOMAIN_COUNT = Object.keys(domainMeta).length;
