export type LabMode = 'beginner' | 'developer' | 'engineer' | 'enterprise' | 'architect';

export type LabSectionId =
  | 'tokens' | 'llm-reading' | 'context-windows' | 'attention'
  | 'tokenizer' | 'memory-sim' | 'cost-sim'
  | 'compression' | 'rag' | 'context-engineering' | 'claude-system'
  | 'economics' | 'failures' | 'multi-agent' | 'long-context'
  | 'optimization' | 'games' | 'enterprise' | 'bad-vs-good' | 'future';

export type LabSectionGroup = 'fundamentals' | 'interactive' | 'engineering' | 'advanced' | 'practice';

export interface LabModeContent {
  overview: string;
  keyPoints: string[];
  code?: string;
  callout?: { icon: string; title: string; body: string; color: string };
}

export interface LabSection {
  id: LabSectionId;
  group: LabSectionGroup;
  emoji: string;
  title: string;
  tagline: string;
  analogy: string;
  analogyDetail: string;
  interactiveType?: 'tokenizer' | 'context-sim' | 'cost-sim' | 'attention' | 'explosion' | 'bad-vs-good' | 'games';
  modeContent: Record<LabMode, LabModeContent>;
}

export interface FormatExample {
  label: string;
  text: string;
  description: string;
}

export interface AttentionExample {
  id: string;
  label: string;
  tokens: string[];
  weights: number[][];
  insight: string;
}

export interface PromptComparison {
  id: string;
  title: string;
  task: string;
  bad: { prompt: string; tokens: number; issues: string[] };
  good: { prompt: string; tokens: number; improvements: string[] };
  savings: number;
}

export const LAB_GROUPS: Record<LabSectionGroup, { label: string; color: string }> = {
  fundamentals: { label: 'Fundamentals',     color: '#3b82f6' },
  interactive:  { label: 'Interactive Labs', color: '#8b5cf6' },
  engineering:  { label: 'Engineering',      color: '#10b981' },
  advanced:     { label: 'Advanced',         color: '#f59e0b' },
  practice:     { label: 'Practice',         color: '#ec4899' },
};

export const LAB_MODES: Record<LabMode, { label: string; desc: string; color: string; icon: string }> = {
  beginner:   { label: 'Beginner',   desc: 'Concepts & analogies',      color: '#10b981', icon: '🌱' },
  developer:  { label: 'Developer',  desc: 'Code & APIs',               color: '#3b82f6', icon: '💻' },
  engineer:   { label: 'Engineer',   desc: 'Systems & performance',     color: '#8b5cf6', icon: '⚙️' },
  enterprise: { label: 'Enterprise', desc: 'Governance & cost',         color: '#f59e0b', icon: '🏢' },
  architect:  { label: 'Architect',  desc: 'Theory & first principles', color: '#ef4444', icon: '🏗️' },
};

export const GROUP_ORDER: LabSectionGroup[] = ['fundamentals', 'interactive', 'engineering', 'advanced', 'practice'];

export const formatExamples: FormatExample[] = [
  {
    label: 'Natural Language',
    text: 'The user John is thirty years old, lives in New York City, and works as a software engineer.',
    description: 'Plain prose — readable but structurally expensive',
  },
  {
    label: 'Key-Value',
    text: 'User: John | Age: 30 | City: NYC | Role: Software Engineer',
    description: 'Compact pipes — most token-efficient for structured data',
  },
  {
    label: 'JSON',
    text: '{"user":{"name":"John","age":30,"city":"New York City","role":"software engineer"}}',
    description: 'JSON — ubiquitous but ~20% structural overhead',
  },
  {
    label: 'XML',
    text: '<user><name>John</name><age>30</age><city>New York City</city><role>software engineer</role></user>',
    description: 'XML — highest token overhead, avoid in prompts',
  },
  {
    label: 'Markdown',
    text: '## User\n- **Name**: John\n- **Age**: 30\n- **City**: New York City\n- **Role**: Software Engineer',
    description: 'Markdown — medium overhead, best for human-readable prompts',
  },
];

export const attentionExamples: AttentionExample[] = [
  {
    id: 'pronoun',
    label: 'Pronoun Resolution',
    tokens: ['The', ' cat', ' sat', ' on', ' the', ' mat', ',', ' it', ' was', ' soft'],
    weights: [
      [0.68, 0.14, 0.06, 0.03, 0.04, 0.02, 0.01, 0.01, 0.007, 0.006],
      [0.10, 0.58, 0.11, 0.05, 0.04, 0.07, 0.02, 0.01, 0.005, 0.005],
      [0.05, 0.19, 0.44, 0.07, 0.05, 0.13, 0.02, 0.02, 0.01,  0.005],
      [0.04, 0.06, 0.12, 0.37, 0.06, 0.27, 0.03, 0.02, 0.01,  0.01 ],
      [0.32, 0.09, 0.05, 0.05, 0.31, 0.12, 0.02, 0.01, 0.008, 0.004],
      [0.04, 0.10, 0.15, 0.10, 0.05, 0.47, 0.02, 0.02, 0.02,  0.01 ],
      [0.09, 0.09, 0.09, 0.09, 0.09, 0.09, 0.35, 0.06, 0.05,  0.05 ],
      [0.02, 0.32, 0.05, 0.02, 0.02, 0.20, 0.03, 0.28, 0.04,  0.04 ],
      [0.03, 0.08, 0.05, 0.03, 0.03, 0.06, 0.03, 0.24, 0.40,  0.07 ],
      [0.02, 0.06, 0.04, 0.03, 0.02, 0.18, 0.02, 0.09, 0.06,  0.48 ],
    ],
    insight: "Token ' it' attends strongly to ' cat' (0.32) and ' mat' (0.20) — the model resolves the pronoun by attending back to the nearest relevant nouns, not just the closest word.",
  },
  {
    id: 'question',
    label: 'Q&A Focus Pattern',
    tokens: ['What', ' color', ' is', ' the', ' sky', '?', ' The', ' sky', ' is', ' blue'],
    weights: [
      [0.58, 0.15, 0.06, 0.03, 0.10, 0.04, 0.01, 0.01, 0.01, 0.01],
      [0.10, 0.54, 0.06, 0.05, 0.12, 0.03, 0.02, 0.02, 0.02, 0.04],
      [0.08, 0.10, 0.38, 0.09, 0.13, 0.04, 0.06, 0.05, 0.05, 0.04],
      [0.05, 0.08, 0.06, 0.33, 0.24, 0.04, 0.06, 0.08, 0.03, 0.03],
      [0.08, 0.13, 0.06, 0.05, 0.38, 0.04, 0.04, 0.14, 0.03, 0.05],
      [0.10, 0.10, 0.08, 0.05, 0.12, 0.32, 0.06, 0.06, 0.06, 0.05],
      [0.05, 0.05, 0.06, 0.14, 0.10, 0.04, 0.38, 0.11, 0.04, 0.03],
      [0.03, 0.14, 0.04, 0.05, 0.22, 0.04, 0.04, 0.33, 0.05, 0.06],
      [0.03, 0.05, 0.10, 0.05, 0.09, 0.04, 0.06, 0.11, 0.38, 0.09],
      [0.07, 0.17, 0.05, 0.03, 0.18, 0.05, 0.04, 0.13, 0.08, 0.20],
    ],
    insight: "Token ' blue' (the answer) attends strongly to ' color' (0.17) and ' sky' (0.18) from the question — the model links its answer back to the relevant question components.",
  },
  {
    id: 'negation',
    label: 'Negation Sensitivity',
    tokens: ['The', ' cat', ' did', ' not', ' sit', ' on', ' the', ' mat'],
    weights: [
      [0.60, 0.15, 0.06, 0.04, 0.05, 0.04, 0.04, 0.02],
      [0.12, 0.52, 0.10, 0.08, 0.08, 0.04, 0.03, 0.03],
      [0.05, 0.10, 0.42, 0.22, 0.12, 0.04, 0.03, 0.02],
      [0.04, 0.08, 0.28, 0.40, 0.14, 0.02, 0.02, 0.02],
      [0.04, 0.12, 0.16, 0.25, 0.32, 0.05, 0.03, 0.03],
      [0.03, 0.05, 0.04, 0.03, 0.08, 0.42, 0.18, 0.17],
      [0.04, 0.04, 0.04, 0.04, 0.04, 0.10, 0.44, 0.26],
      [0.03, 0.08, 0.04, 0.06, 0.10, 0.18, 0.18, 0.33],
    ],
    insight: "Token ' not' strongly attends to ' did' (0.28) and ' sit' (0.14) — negation tokens bind tightly to the verb they negate, which is why negation is hard to miss but easy to fail on edge cases.",
  },
];

export const promptComparisons: PromptComparison[] = [
  {
    id: 'feedback',
    title: 'Customer Feedback Analysis',
    task: 'Analyze feedback, extract themes and sentiment',
    bad: {
      tokens: 84,
      issues: [
        'Courtesy language ("Please", "carefully", "thoroughly") adds ~15 tokens of zero value',
        'Verb repetition: analyze + understand + identify + categorize all mean the same thing',
        'No output format specified — forces the model to choose structure and length',
        '"Be professional and detailed" adds tokens without adding constraint',
      ],
      prompt: `You are a very helpful AI assistant. Please analyze the following customer feedback very carefully and thoroughly. Take your time to understand the sentiment. Identify all the main issues and categorize them. Please also suggest improvements and write a comprehensive summary of your findings. Be professional and detailed in everything.

Feedback: {feedback}`,
    },
    good: {
      tokens: 30,
      improvements: [
        'Imperative tense removes all filler: "Analyze" not "Please analyze carefully"',
        'Explicit JSON schema forces structured output — no format inference overhead',
        '64% token reduction with identical task completion quality',
        'Model knows exactly what to return → faster, cheaper, more consistent',
      ],
      prompt: `Analyze this customer feedback. Return JSON:
{"sentiment":"positive|neutral|negative","issues":[],"improvements":[],"summary":""}

Feedback: {feedback}`,
    },
    savings: 64,
  },
  {
    id: 'code',
    title: 'Code Review Request',
    task: 'Review code for bugs, security, and quality',
    bad: {
      tokens: 70,
      issues: [
        'Role-setting ("You are an expert senior engineer...") burns tokens you already have for free',
        'Vague scope ("be thorough and detailed") generates verbosity without precision',
        'Courtesy language adds ~12 tokens per call — 12,000 wasted tokens at 1,000 calls/day',
        'No output structure means inconsistent response length and format every time',
      ],
      prompt: `You are an expert senior software engineer with decades of experience. I would like you to please carefully review the following code. Look for any bugs, security vulnerabilities, performance issues, and code quality problems. Please be thorough and detailed in your analysis and suggest improvements for each issue you find.

Code: {code}`,
    },
    good: {
      tokens: 22,
      improvements: [
        'Role is implied by task quality — never state it explicitly',
        'Categorized bullets create scannable, structured output at no extra cost',
        '69% token reduction per call — at 1K calls/day that is $7/day savings on Sonnet',
        'Explicit output schema → consistent responses → easier programmatic parsing',
      ],
      prompt: `Review this code. List:
- Bugs (with line refs)
- Security issues
- Performance
- Improvements

Code: {code}`,
    },
    savings: 69,
  },
  {
    id: 'summarize',
    title: 'Document Summarization',
    task: 'Summarize a long document into key points',
    bad: {
      tokens: 61,
      issues: [
        'Output length ("very concise but also comprehensive") is contradictory — model guesses',
        'Format unspecified — sometimes prose, sometimes bullets, never predictable',
        '"The document that follows" is pure overhead — model already knows the next text is the doc',
        'Repeating the task ("summarize... key points... main themes") triples instruction cost',
      ],
      prompt: `Please read the following document very carefully and provide a very concise but also comprehensive summary that covers all the main themes and key points. Make sure the summary is thorough. Also identify the most important takeaways from the document that follows:

{document}`,
    },
    good: {
      tokens: 18,
      improvements: [
        'Format explicit: 3 bullets + 1 sentence = predictable, parseable output every time',
        '"Key points" and "themes" collapsed into a single structured ask',
        '70% token reduction — and the output is more useful because it is constrained',
        'Removing "carefully" and "very" costs nothing and saves 2 tokens per call',
      ],
      prompt: `Summarize in 3 bullet points + 1-sentence conclusion:

{document}`,
    },
    savings: 70,
  },
];

export const labSections: LabSection[] = [
  // ── FUNDAMENTALS ──────────────────────────────────────────────────────────────
  {
    id: 'tokens',
    group: 'fundamentals',
    emoji: '🧩',
    title: 'What Are Tokens?',
    tagline: 'The atomic unit everything LLM reads and writes',
    analogy: 'Tokens are puzzle pieces of language',
    analogyDetail: 'Just as a jigsaw puzzle breaks a picture into irregular pieces, tokenization breaks text into irregular chunks. Common words become single pieces; rare words split into smaller sub-word fragments.',
    interactiveType: 'explosion',
    modeContent: {
      beginner: {
        overview: 'A token is the smallest chunk of text that Claude processes — not words, not characters, but pieces in between. Most common English words are 1 token, longer words split into pieces, and punctuation gets its own tokens.',
        keyPoints: [
          '"cat" = 1 token. "tokenization" = 3 tokens. "antidisestablishmentarianism" = 6 tokens',
          'A typical English page (~500 words) ≈ 650–700 tokens',
          'Code, JSON, and XML use more tokens than plain English for the same meaning',
          'Emojis are 1–3 tokens. Some Asian language characters cost 2–3 tokens each',
        ],
      },
      developer: {
        overview: 'Claude uses Byte-Pair Encoding (BPE) with a shared vocabulary of ~100K token IDs. Common subwords and byte-level fallbacks ensure every Unicode string is representable — even characters not in the training vocabulary.',
        keyPoints: [
          'Rule of thumb: ~4 chars/token for English, ~3.5 for code, ~2–3 for Chinese/Japanese',
          'Use the Anthropic token counting endpoint to get exact counts before expensive calls',
          'JSON adds ~20% overhead vs equivalent key-value pairs; XML adds ~35%',
          'Streaming counts tokens as generated — input tokens still cost even if output is truncated',
        ],
        code: `import anthropic

client = anthropic.Anthropic()
# Free token count — no inference, no charge
response = client.messages.count_tokens(
    model="claude-opus-4-7",
    messages=[{"role": "user", "content": "Hello, world!"}]
)
print(response.input_tokens)  # 10`,
      },
      engineer: {
        overview: 'Tokenization runs as a deterministic CPU pre-pass with no model involvement. It is never your throughput bottleneck. The token count directly determines KV cache memory, prefill compute cost, and time-to-first-token latency.',
        keyPoints: [
          'KV cache per token ≈ 2.4 KB for 70B-class models (2 × n_layers × n_heads × head_dim × fp16)',
          'Prefill (processing input) is compute-bound; decode (generating output) is memory-bandwidth-bound',
          'Token budget = context_limit − reserved_output − system_prompt_overhead',
          'Batching long prefills reduces per-token GPU cost significantly vs single-request mode',
        ],
        code: `# KV cache memory estimation
def kv_cache_gb(seq_len, n_layers=96, n_heads=96, head_dim=128):
    per_token_bytes = 2 * n_layers * n_heads * head_dim * 2  # fp16
    return (seq_len * per_token_bytes) / 1e9

print(f"10K  tokens: {kv_cache_gb(10_000):.1f} GB")   # 1.9 GB
print(f"100K tokens: {kv_cache_gb(100_000):.1f} GB")  # 18.9 GB
print(f"1M   tokens: {kv_cache_gb(1_000_000):.1f} GB") # 188.7 GB`,
      },
      enterprise: {
        overview: 'Token volume is the primary billing dimension for all LLM APIs. A 10-page document (~5,000 words) generates 6,500–8,000 tokens. At scale, unoptimized prompts are the single largest source of avoidable AI spend.',
        keyPoints: [
          '1M tokens/day at Claude Sonnet pricing ≈ $3 input + $15 output = $18/day floor cost',
          'JSON payloads, verbose system prompts, and retry storms are the top three token budget killers',
          'Token counting before sending is free — add a pre-flight check to all high-volume workflows',
          'Establish per-workflow token budgets and alert at 80% to prevent cost runaway events',
        ],
        callout: {
          icon: '💰',
          title: 'Token Budget Governance',
          body: 'Implement a token budget middleware that rejects requests exceeding per-workflow limits before they hit the API. A single runaway prompt loop can generate a 10× cost spike in under an hour.',
          color: '#f59e0b',
        },
      },
      architect: {
        overview: 'BPE is a greedy data compression algorithm repurposed for NLP. It iteratively merges the most frequent byte pair in the training corpus until target vocabulary size is reached, producing a tokenization that reflects training statistics — not linguistic structure.',
        keyPoints: [
          'Vocabulary size (~100K) balances compute cost (embedding lookup) vs rare-word coverage',
          'Token boundary effects: models learn position-dependent features within tokens, not only between them',
          'BPE tokenization is non-invertible for many Unicode sequences — byte-level fallback handles OOV',
          '"Solid words" and "solidwords" tokenize differently, introducing spurious positional signal into code generation tasks',
        ],
        code: `import tiktoken
enc = tiktoken.get_encoding("cl100k_base")  # same as Claude

# Same semantics, different token efficiency
formats = [
    ("Prose",    "John is thirty years old and lives in New York"),
    ("KV",       "name:John age:30 city:NewYork"),
    ("JSON",     '{"name":"John","age":30,"city":"New York"}'),
    ("XML",      "<name>John</name><age>30</age><city>New York</city>"),
]
for label, text in formats:
    n = len(enc.encode(text))
    print(f"{label:8} {n:3} tokens  {n/len(text):.2f} tok/char")`,
      },
    },
  },
  {
    id: 'llm-reading',
    group: 'fundamentals',
    emoji: '🧠',
    title: 'How LLMs Read Text',
    tagline: 'Sequential probability machines, not comprehension engines',
    analogy: 'LLMs read like a musician sight-reading sheet music',
    analogyDetail: 'A sight-reader processes each note in sequence, building context as they go, predicting what comes next from patterns they have seen thousands of times. They do not "understand" the music — they pattern-match and predict.',
    modeContent: {
      beginner: {
        overview: 'Claude does not read like a human. It processes tokens one by one from left to right, building up a mathematical representation of meaning as it goes. Every output word is a probabilistic prediction based on everything before it.',
        keyPoints: [
          'Every token Claude generates is a probability distribution — the "most likely" next token wins',
          'Earlier tokens influence every later token — order matters enormously',
          'Claude cannot re-read or skip ahead — it is a strictly left-to-right process',
          'Temperature controls how "daring" the predictions are — higher = more creative, lower = more predictable',
        ],
      },
      developer: {
        overview: 'The forward pass converts token IDs → embeddings → attention layers → a probability vector over the full vocabulary. Sampling (temperature, top-p) converts that distribution into the next token ID.',
        keyPoints: [
          'Output is sampled from a softmax distribution — determinism requires temperature=0',
          'Top-p (nucleus sampling) cuts off the long tail, improving coherence on open-ended tasks',
          'Stop sequences let you terminate generation early without burning output token budget',
          'Logprobs expose the raw probability distribution — useful for classification and calibration',
        ],
        code: `response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=200,
    temperature=0.0,          # deterministic
    stop_sequences=["\\n\\n"],  # stop on blank line
    messages=[{"role": "user", "content": "List 3 capitals:"}]
)`,
      },
      engineer: {
        overview: 'Each forward pass runs attention over all prior tokens in the sequence. Attention complexity is O(n²) in sequence length for standard transformers, making long contexts quadratically more expensive than short ones per generated token.',
        keyPoints: [
          'Multi-head attention parallelizes sequence processing within a layer but not across tokens',
          'KV cache reuses computed key/value tensors across decode steps — without it, generation is impossibly slow',
          'Flash Attention reduces memory from O(n²) to O(n) via tiled computation, enabling long contexts',
          'Token generation latency depends on memory bandwidth, not FLOPs — this is why GPUs with HBM win',
        ],
        code: `# Attention complexity growth
def attention_ops(seq_len, d_model=4096, n_heads=32):
    # QKV projections
    proj = 3 * seq_len * d_model * d_model
    # Attention scores: O(n^2 * d_head)
    scores = seq_len * seq_len * (d_model // n_heads) * n_heads
    return proj + scores

for n in [1_000, 10_000, 100_000]:
    ops = attention_ops(n)
    print(f"{n:>7} tokens: {ops/1e9:.1f}B ops")`,
      },
      enterprise: {
        overview: 'The probabilistic nature of LLMs is a feature (creativity, generalization) and a risk (hallucination, inconsistency). Production systems must account for non-determinism through structured outputs, validation layers, and output schemas.',
        keyPoints: [
          'Temperature=0 gives near-deterministic output — use it for structured data extraction',
          'Same prompt can produce different outputs on successive calls — build idempotent workflows',
          'Structured output modes (JSON schema enforcement) trade flexibility for reliability',
          'Model behavior can drift across model versions — version-pin in production and test on updates',
        ],
        callout: {
          icon: '⚠️',
          title: 'Non-Determinism in Production',
          body: 'LLMs are probabilistic. The same prompt with temperature > 0 produces different outputs every call. Design workflows that tolerate or test for output variation rather than assuming consistency.',
          color: '#ef4444',
        },
      },
      architect: {
        overview: 'Autoregressive language models decompose P(text) = ∏ P(token_i | token_{<i}). Each generation step performs a full forward pass computing attention over the entire prefix. This makes the model fundamentally sequential at inference despite parallel training.',
        keyPoints: [
          'Training uses teacher forcing (parallel over all positions); inference is inherently sequential',
          'Speculative decoding uses a small draft model to propose k tokens, verified in one forward pass',
          'Beam search is largely abandoned for LLMs — sampling with constraints outperforms it at scale',
          'Constitutional AI and RLHF shift the probability distribution toward preferred outputs without changing architecture',
        ],
        code: `# Approximate inference cost
def decode_cost_ms(seq_len, model_params_b=70, memory_bw_gbps=3000):
    # Memory bandwidth bound: load all params once per token
    model_bytes = model_params_b * 1e9 * 2  # bf16
    kv_bytes = seq_len * 2.4e3              # ~2.4 KB per token
    total_bytes = model_bytes + kv_bytes
    return (total_bytes / (memory_bw_gbps * 1e9)) * 1000

print(f"1K  ctx: {decode_cost_ms(1_000):.1f} ms/token")
print(f"100K ctx: {decode_cost_ms(100_000):.1f} ms/token")`,
      },
    },
  },
  {
    id: 'context-windows',
    group: 'fundamentals',
    emoji: '📏',
    title: 'Context Windows',
    tagline: 'The finite memory boundary that changes everything',
    analogy: 'The context window is working memory — everything outside it is forgotten',
    analogyDetail: 'Like a desk with limited space: you can only work with what fits on it. Once the desk is full, you must remove something to add something new. Whatever falls off the edge is gone until you deliberately retrieve it.',
    modeContent: {
      beginner: {
        overview: 'The context window is the maximum amount of text Claude can "hold in mind" at once — measured in tokens. Everything inside the window is available; everything outside might as well not exist.',
        keyPoints: [
          'Claude has a 200K token context window — roughly 150,000 words or 500+ pages',
          'Longer conversations mean older messages eventually get dropped or summarized',
          'System prompts, conversation history, tool results — all share the same context budget',
          'When context fills up, models do not crash — they just "forget" older information',
        ],
      },
      developer: {
        overview: 'The context window is a hard ceiling on the concatenation of: system prompt + conversation turns + tool results + any injected content. When total tokens exceed max_tokens_in_context, older turns must be evicted or summarized before the next API call.',
        keyPoints: [
          'Claude 3.5 Sonnet / Claude Opus 4: 200K token context window',
          'Track token budgets with count_tokens() before each call to avoid context overflow errors',
          'System prompt tokens are paid on every call — keep it lean (< 500 tokens for most apps)',
          'Tool results inject directly into context — a tool returning 10 pages of text costs 10 pages of tokens',
        ],
        code: `def send_with_budget(messages, system, max_ctx=190_000):
    total = client.messages.count_tokens(
        model="claude-sonnet-4-6",
        system=system,
        messages=messages
    ).input_tokens
    while total > max_ctx and len(messages) > 2:
        messages = messages[2:]  # drop oldest turn
        total = client.messages.count_tokens(...).input_tokens
    return client.messages.create(...)`,
      },
      engineer: {
        overview: 'Context window size determines KV cache memory requirements, prefill latency, and per-token cost. Larger contexts are not just more memory — they are quadratically more expensive in standard attention and require special hardware scheduling.',
        keyPoints: [
          'KV cache for 200K tokens at fp16: ~37.7 GB (96 layers × 96 heads × 128 dim × 2 × 200K × 2 bytes)',
          'Flash Attention 2 reduces this to O(n) in memory via recomputation — but latency still grows',
          'Context caching (prompt caching) amortizes repeated prefix cost across multiple requests',
          'Sliding window attention (Mistral, etc.) limits each token to attending to the last K tokens only',
        ],
        code: `# Estimate prompt cache benefit
def cache_savings(prompt_tokens, requests, cache_price_ratio=0.1):
    full_cost = prompt_tokens * requests
    cached_cost = prompt_tokens + (prompt_tokens * cache_price_ratio * (requests - 1))
    return 1 - cached_cost / full_cost

# 1000-token system prompt, 10K daily requests
print(f"Cache saves {cache_savings(1000, 10_000)*100:.0f}% on input costs")`,
      },
      enterprise: {
        overview: 'Long context is expensive. Enabling 200K context "just in case" turns every request into a budget event. Production systems should right-size context windows per workflow and use retrieval for anything that does not need to be in-context.',
        keyPoints: [
          'Input tokens are charged even if the model never "reads" them — context length = cost',
          'Prompt caching reduces repeated system prompt cost by up to 90% for high-volume deployments',
          'Large context windows are an expensive substitute for proper retrieval architecture',
          'Audit: what percentage of your context window is actually contributing to output quality?',
        ],
        callout: {
          icon: '📊',
          title: 'Right-Size Your Context',
          body: 'Most production tasks need < 8K tokens of context. Defaulting to 200K max context on every call without need is a budget leak. Measure actual context usage in production and set appropriate per-workflow limits.',
          color: '#f59e0b',
        },
      },
      architect: {
        overview: 'Context window size is fundamentally a memory-compute tradeoff in transformer architecture. The "lost in the middle" phenomenon suggests that attention mechanisms have learned positional priors that privilege the beginning and end of context over the middle.',
        keyPoints: [
          'Recurrent models (Mamba, RWKV) offer O(1) inference memory but at the cost of exact recall',
          'Ring Attention enables theoretically infinite context by distributing KV cache across devices',
          'Positional encoding schemes (RoPE, ALiBi) determine how well models generalize beyond training context',
          'Long context does not equal long coherence — cross-attention entropy grows with sequence length, degrading focus',
        ],
      },
    },
  },
  {
    id: 'attention',
    group: 'fundamentals',
    emoji: '👁️',
    title: 'Attention Mechanism',
    tagline: 'How LLMs decide what to focus on',
    analogy: 'Attention is a spotlight that can shine on multiple parts of the stage at once',
    analogyDetail: 'Unlike human attention that focuses on one thing at a time, transformer attention simultaneously queries every token about every other token, building a weighted map of relevance. The model learns which connections matter.',
    interactiveType: 'attention',
    modeContent: {
      beginner: {
        overview: 'When Claude processes text, every word "looks at" every other word to figure out how they relate. This is attention — a way of deciding which earlier words matter most for understanding the current word.',
        keyPoints: [
          'The word "it" looks back at all previous words to find what it refers to',
          'Verbs attend strongly to their subjects; adjectives attend to the nouns they modify',
          'Attention happens across every pair of words simultaneously — not one at a time',
          'This is why Claude understands long-range relationships ("he said earlier that...")',
        ],
      },
      developer: {
        overview: 'Attention computes Q·Kᵀ/√d_k between all token pairs to produce attention weights, then uses these to create weighted sums of value vectors. Multi-head attention runs this in parallel across many "perspectives" of the same sequence.',
        keyPoints: [
          'Each attention head learns different relationship types (syntax, coreference, semantics)',
          'Attention patterns are inspectable via logprobs and interpretability tools',
          'KV cache stores computed key and value tensors so they are not recomputed on each decode step',
          'Self-attention is the primary bottleneck for long contexts — O(n²) in sequence length',
        ],
        code: `import torch, torch.nn.functional as F
import math

def scaled_dot_product_attention(Q, K, V):
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)
    weights = F.softmax(scores, dim=-1)   # attention distribution
    return torch.matmul(weights, V), weights`,
      },
      engineer: {
        overview: 'Multi-head attention is both the most compute-intensive and memory-intensive operation in the transformer. For long-context workloads, Flash Attention 2 and GQA (Grouped Query Attention) are the standard solutions for memory efficiency.',
        keyPoints: [
          'Flash Attention reorders computation to avoid materializing the full n×n attention matrix in HBM',
          'GQA reduces KV cache size by sharing key/value heads across query groups',
          'Attention sink (Mistral): first few tokens receive disproportionate attention — do not truncate them',
          'Multi-query attention (MQA) — one K/V head per layer — reduces memory but harms quality',
        ],
        code: `# Flash Attention 2 via PyTorch (available in torch >= 2.0)
from torch.nn.functional import scaled_dot_product_attention

# Automatically uses Flash Attention on compatible hardware
with torch.backends.cuda.sdp_kernel(enable_flash=True):
    output = scaled_dot_product_attention(
        query, key, value,
        attn_mask=None,
        dropout_p=0.0,
        is_causal=True  # causal mask for autoregressive decoding
    )`,
      },
      enterprise: {
        overview: 'Attention is why large context windows are expensive. Every token attends to every other token — doubling context length quadruples attention cost. Understanding this drives architectural decisions like retrieval-augmented generation.',
        keyPoints: [
          'Attention cost grows quadratically — 2× longer context = 4× attention compute',
          'Retrieval systems (RAG) exist because injecting 10 relevant chunks is cheaper than loading 10,000 pages',
          '"More context is better" is often wrong economically — right-sized context outperforms bloated context',
          'Prompt caching pays attention cost once for shared prefixes across many requests',
        ],
      },
      architect: {
        overview: 'The attention mechanism is a differentiable memory read. Queries represent information needs, keys index stored information, and values carry the content. Training teaches the model to write useful keys and meaningful values via backpropagation.',
        keyPoints: [
          '"Attention is All You Need" (Vaswani 2017) replaced recurrence with pure attention — enabling parallelism',
          'Linear attention approximations (Performers, Linformer) sacrifice exact attention for O(n) complexity',
          'Sparse attention (BigBird, Longformer) uses structured sparsity patterns to reduce the n² bottleneck',
          'Mechanistic interpretability finds attention heads with identifiable circuits: induction heads, name movers, etc.',
        ],
      },
    },
  },

  // ── INTERACTIVE LABS ──────────────────────────────────────────────────────────
  {
    id: 'tokenizer',
    group: 'interactive',
    emoji: '⚡',
    title: 'Tokenization Visualizer',
    tagline: 'Type any text and watch it split into tokens in real time',
    analogy: 'See the invisible seams in language',
    analogyDetail: 'Every piece of text you type has invisible boundaries where the LLM splits it into pieces. This tool makes those boundaries visible — and shows you how different types of text fragment differently.',
    interactiveType: 'tokenizer',
    modeContent: {
      beginner: {
        overview: 'Try typing different kinds of text and watch how tokens appear. Notice how common words are single tokens but unusual words split up. Try typing code or JSON to see how differently they tokenize.',
        keyPoints: [
          'Spaces before words are usually part of the token: " hello" not "hello"',
          'Punctuation almost always gets its own token',
          'Try: emoji 🎉, a number like 12345, a URL, and a Python function',
          'The token count tells you exactly how much this text "costs" to process',
        ],
      },
      developer: {
        overview: 'This visualizer uses a simplified approximation of BPE tokenization. For production token counting, use the Anthropic token counting endpoint or tiktoken with cl100k_base encoding, which Claude shares with GPT-4.',
        keyPoints: [
          'BPE vocabulary is fixed after training — the same text tokenizes identically across all Claude calls',
          'Whitespace prefix: " word" and "word" are different tokens — context placement matters',
          'Python code tokenizes differently from JavaScript — experiment with both',
          'Token count × price_per_token = exact API call cost (input side)',
        ],
      },
      engineer: {
        overview: 'Tokenization patterns directly affect prompt efficiency. Structured data formats have measurably different token densities. Understanding these patterns lets you choose the most token-efficient format for each use case.',
        keyPoints: [
          'JSON keys tokenize expensively at boundaries: {"key": → 4 tokens vs key= → 2 tokens',
          'Python identifiers: snake_case splits less predictably than camelCase',
          'XML tags are token-heavy: <tag>...</tag> costs 5+ tokens per field vs none for prose',
          'Markdown headers (## ) cost 2 tokens per heading vs inline bold cost 4 tokens per word',
        ],
      },
      enterprise: {
        overview: 'Token density varies by format type by 20–40%. At enterprise scale (tens of millions of tokens daily), choosing the right prompt format can generate meaningful cost savings with no quality tradeoff.',
        keyPoints: [
          'Measure token density of your actual prompts, not theoretical estimates',
          'System prompts are paid every call — optimize them once for large ongoing savings',
          'Avoid XML-structured prompts in production — they are 30–40% more expensive than prose equivalents',
          'Structured output via JSON schema forces efficient response format without XML overhead',
        ],
      },
      architect: {
        overview: 'Token density is an emergent property of training data distribution. Common English fragments are compressed into single tokens; rare fragments split into bytes. This creates systematic encoding cost asymmetries across languages and domains.',
        keyPoints: [
          'Low-resource languages tokenize 2–4× more expensively per semantic unit than English',
          'Code tokenization reflects training corpus composition — Python tokenizes more efficiently than COBOL',
          'Byte-level fallback ensures lossless encoding but at maximum token cost per character',
          'Vocabulary extension (domain adaptation) can improve token efficiency for specialized corpora',
        ],
      },
    },
  },
  {
    id: 'memory-sim',
    group: 'interactive',
    emoji: '🌊',
    title: 'Context Memory Simulator',
    tagline: 'Watch AI memory fill up, evict, and degrade in real time',
    analogy: 'A whiteboard with finite space — once full, old notes must be erased',
    analogyDetail: 'Every message adds to the whiteboard. When it fills up, the oldest content must be erased to make room for new information. The AI never had "long-term memory" — just a whiteboard it continually rewrites.',
    interactiveType: 'context-sim',
    modeContent: {
      beginner: {
        overview: 'Keep chatting and watch the context bar fill up. Notice how older messages disappear when the window is nearly full. This is why AI chatbots sometimes "forget" things you said early in a long conversation.',
        keyPoints: [
          'Each message — yours and the AI\'s — consumes tokens from the shared budget',
          'System prompts are always kept but they eat into the budget from the start',
          'When the window fills, older messages get dropped — the AI genuinely cannot see them',
          'This is why starting a fresh chat sometimes works better than continuing a long one',
        ],
      },
      developer: {
        overview: 'The simulator demonstrates naive context management: append messages until the limit, then evict oldest turns. Real systems use sliding windows, summarization, or semantic compression to maintain coherence under token pressure.',
        keyPoints: [
          'Always maintain: system prompt + last N turns + any pinned context',
          'Summarize evicted context instead of dropping it — store summary as a "memory" injection',
          'Tool results are the most dangerous token consumers — truncate or summarize long tool outputs',
          'Use count_tokens() before every call in production to detect context overflow before it happens',
        ],
      },
      engineer: {
        overview: 'Naive FIFO eviction causes coherence collapse — the model loses task context while retaining irrelevant recent turns. Production systems implement priority-weighted eviction: system context → task instructions → recent turns → retrieved context.',
        keyPoints: [
          'Prioritize by information type: instructions > facts > recent turns > context > background',
          'Summarization loops: when context hits 80%, summarize the oldest 25% into a paragraph',
          'Semantic eviction: embed all turns and drop lowest-relevance-to-current-task first',
          'Token budgeting: reserve capacity for expected tool outputs before making tool calls',
        ],
      },
      enterprise: {
        overview: 'Context management failure is the most common cause of degraded AI accuracy in long-running enterprise workflows. Without explicit memory management, agents accumulate irrelevant history that crowds out the instructions they actually need.',
        keyPoints: [
          'Chatbots with no memory management degrade measurably after 10–15 turns',
          'Retrieval-augmented context (inject only relevant docs) outperforms full history for most enterprise tasks',
          'Memory tiers: hot (in-context), warm (vector DB), cold (document store) — right-size each tier',
          'Audit logs should track context utilization per session to detect memory management failures',
        ],
      },
      architect: {
        overview: 'The context window is a hard architectural constraint, not a soft limit. Building systems that treat it as infinite is a design error that manifests at scale. Principled memory management — tiered, priority-based, semantically compressed — is a required component of any production LLM system.',
        keyPoints: [
          'Memoryless architecture: context window is the full state — no implicit persistence across calls',
          'External memory patterns: vector stores, key-value caches, relational state — each with different recall characteristics',
          'Compression fidelity: summarization is lossy compression — design workflows that tolerate summarization error',
          'Forgetting as a feature: in some use cases (compliance, privacy), context eviction is a requirement, not a bug',
        ],
      },
    },
  },
  {
    id: 'cost-sim',
    group: 'interactive',
    emoji: '💰',
    title: 'Prompt Cost Simulator',
    tagline: 'Calculate the real cost of your AI workflow before shipping it',
    analogy: 'A utility bill calculator for language model inference',
    analogyDetail: 'Just as electricity costs depend on how many watts you use and for how long, LLM costs depend on how many tokens you process and at what tier. Small inefficiencies at scale compound into significant budget events.',
    interactiveType: 'cost-sim',
    modeContent: {
      beginner: {
        overview: 'Adjust the sliders to see how different prompt sizes and usage volumes affect cost. Notice how input tokens (what you send) are much cheaper than output tokens (what the AI generates).',
        keyPoints: [
          'Input tokens (your prompts) cost less than output tokens (AI responses) — often 5–10× less',
          'A single AI call can cost a fraction of a cent — but thousands of calls add up fast',
          'Longer system prompts cost money on every single call, not just when you write them',
          'Choose the right model: Haiku is 19× cheaper than Opus for simple tasks',
        ],
      },
      developer: {
        overview: 'Model the actual cost of your workflow: (input_tokens × input_price + output_tokens × output_price) × calls_per_day × 30 = monthly budget. Add 20% buffer for retries, token counting overhead, and model version migrations.',
        keyPoints: [
          'Claude Haiku: $0.80/$4.00 per 1M in/out. Sonnet: $3/$15. Opus: $15/$75',
          'Use Haiku for classification, extraction, routing — it handles structured tasks as well as Opus',
          'Reserve Opus for generation, reasoning, and complex synthesis tasks only',
          'Cache your system prompt: prompt caching reduces repeated prefix cost by ~90% at 0.1× the rate',
        ],
        code: `def monthly_cost(input_tok, output_tok, calls_per_day, model="sonnet"):
    prices = {
        "haiku":  (0.80,  4.00),
        "sonnet": (3.00, 15.00),
        "opus":   (15.00, 75.00),
    }
    inp, out = prices[model]
    per_call = (input_tok/1e6)*inp + (output_tok/1e6)*out
    return per_call * calls_per_day * 30

print(f"\${monthly_cost(2000, 500, 10_000):.2f}/month on Sonnet")`,
      },
      engineer: {
        overview: 'Cost optimization at the systems level requires choosing the right model tier for each operation type, implementing prompt caching for shared context, and batching calls to amortize per-request overhead.',
        keyPoints: [
          'Model tiering: classify with Haiku → generate with Sonnet → reason with Opus (route by complexity)',
          'Prompt caching saves ~90% on input cost for prefixes > 1,024 tokens repeated across calls',
          'Batch API (async) offers 50% discount for workloads tolerant of latency',
          'Streaming reduces time-to-first-token but does not reduce total token cost',
        ],
      },
      enterprise: {
        overview: 'LLM cost management is an operational discipline, not a one-time configuration. Unmonitored AI workloads commonly exceed budget by 2–5× within 90 days of launch due to scope creep, retry storms, and context bloat.',
        keyPoints: [
          'Set hard spending limits per API key and per workflow — not just global account limits',
          'Track cost per user, per feature, and per model to identify cost centers before they escalate',
          'Implement circuit breakers: if cost rate exceeds threshold, queue or shed load before alerting',
          'Chargebacks: allocate AI costs to the teams/products consuming them for accountability',
        ],
        callout: {
          icon: '🚨',
          title: 'Cost Runaway Pattern',
          body: 'A loop that calls the API on every user action without debouncing can generate 10,000+ calls/hour unexpectedly. Budget alerts at 50%/80%/100% of monthly spend are non-negotiable in production.',
          color: '#ef4444',
        },
      },
      architect: {
        overview: 'Inference cost is a function of model parameter count, context length, and hardware efficiency. As model capability per parameter improves (Chinchilla scaling laws), the frontier for a given cost point shifts but never disappears.',
        keyPoints: [
          'Inference economics: larger models cost more per token but require fewer tokens to achieve the same output quality',
          'Distillation and quantization reduce serving cost with bounded quality degradation',
          'Speculative decoding (draft + verify) reduces latency without changing cost structure significantly',
          'Long-term: cost per token is declining ~3–4× per year historically — architect for today\'s constraint, plan for tomorrow\'s abundance',
        ],
      },
    },
  },

  // ── ENGINEERING ───────────────────────────────────────────────────────────────
  {
    id: 'compression',
    group: 'engineering',
    emoji: '🗜️',
    title: 'Compression & Summarization',
    tagline: 'How AI systems reduce token pressure without losing meaning',
    analogy: 'Like compressing a photograph — you lose some pixels but keep the picture',
    analogyDetail: 'Summarization trades token efficiency for information fidelity. The art is choosing which details to drop so the compressed version still supports the downstream task.',
    modeContent: {
      beginner: {
        overview: 'When conversations get too long, AI systems compress older parts to free up space. This is like taking notes instead of saving the whole transcript — you keep the key points but lose some detail.',
        keyPoints: [
          'Summarization reduces a 10-page conversation to a 1-paragraph "memory"',
          'Some details are lost in compression — exact quotes, specific numbers, nuanced context',
          'Recursive summarization: summaries of summaries can maintain coherence over very long tasks',
          'Chunking splits long documents into pieces that fit in context for processing one at a time',
        ],
      },
      developer: {
        overview: 'Implement a memory layer that compresses older context on a rolling basis. The standard pattern: when context hits 75% full, summarize the oldest 30% of turns and replace them with the summary injected into the system prompt.',
        keyPoints: [
          'Map-reduce chunking: split → process each chunk → merge results — handles unlimited document length',
          'Hierarchical summarization preserves structure: chapter → section → paragraph summaries',
          'Progressive compression: store multiple compression levels and retrieve the one that fits your budget',
          'Always test summarization faithfulness — a wrong summary causes worse errors than no summary',
        ],
        code: `def compress_history(messages, target_tokens=2000):
    """Summarize oldest messages when approaching context limit."""
    old_turns = messages[:len(messages)//2]
    recent_turns = messages[len(messages)//2:]
    summary = client.messages.create(
        model="claude-haiku-4-5-20251001",  # cheap for summarization
        messages=[*old_turns,
            {"role": "user", "content": "Summarize our conversation so far in 3 sentences."}]
    ).content[0].text
    memory_msg = {"role": "system", "content": f"Earlier context: {summary}"}
    return [memory_msg, *recent_turns]`,
      },
      engineer: {
        overview: 'Compression quality determines downstream task performance. Lossy compression of task instructions degrades output quality catastrophically; lossy compression of background context degrades it gracefully. Design your compression strategy around information criticality.',
        keyPoints: [
          'Critical information (task spec, constraints, format) — never compress, always keep verbatim',
          'Factual information (document content, data) — compress aggressively with map-reduce',
          'Conversational history — compress to intent + key decisions, drop small talk and confirmations',
          'Measure compression faithfulness: run QA tests against compressed vs original context',
        ],
      },
      enterprise: {
        overview: 'Compression is the primary mechanism for controlling per-session context cost in production. Without it, long-running agent workflows accumulate token debt that makes each successive operation more expensive and less reliable.',
        keyPoints: [
          'Use a cheap fast model (Haiku) to do compression — it costs 20× less than Opus for the same task',
          'Compress tool outputs aggressively — API responses are often 10× larger than needed in context',
          'Store uncompressed versions in a database for audit; inject compressed versions into context',
          'Set a compression trigger at 70% context fill to avoid emergency eviction at 100%',
        ],
      },
      architect: {
        overview: 'Compression is fundamentally a choice between information-theoretic fidelity and task-relevant fidelity. For task-specific systems, semantic compression (keep what matters for the task) outperforms generic summarization, but requires task-aware compression models.',
        keyPoints: [
          'Extractive compression (selecting existing spans) is lossless within the extracted material',
          'Abstractive summarization introduces hallucination risk — validate factual claims in summaries',
          'Hierarchical context trees mirror how humans organize long-term project memory',
          'Memory consolidation timing matters: compress too early (lose context) or too late (degrade performance)',
        ],
      },
    },
  },
  {
    id: 'rag',
    group: 'engineering',
    emoji: '🔍',
    title: 'RAG & Retrieval',
    tagline: 'Why smart retrieval beats brute-force context stuffing',
    analogy: 'Like a reference librarian who fetches exactly the books you need — rather than giving you the whole library',
    analogyDetail: 'RAG separates storage (vector database) from processing (context window). Instead of loading everything into context, you retrieve only the relevant fragments, dramatically reducing cost while increasing relevance.',
    modeContent: {
      beginner: {
        overview: 'Retrieval-Augmented Generation (RAG) is how AI systems access information beyond their context window. Instead of loading a whole document library, the system finds the most relevant passages and injects only those into the context.',
        keyPoints: [
          'Documents are pre-split into chunks and stored with their vector embeddings',
          'Your query is converted to a vector and the nearest matching chunks are retrieved',
          'Only the top 3–5 relevant chunks get injected into context — not the entire library',
          'RAG is why AI can "know" things from your company docs without being fine-tuned on them',
        ],
      },
      developer: {
        overview: 'RAG pipeline: chunk → embed → store → query → retrieve → inject → generate. The most impactful variables are chunk size, embedding model quality, and the number of retrieved chunks. Start simple before adding hybrid search or re-ranking.',
        keyPoints: [
          'Chunk size trade-off: smaller = more precise retrieval; larger = more complete context per chunk',
          'Overlap chunks by 10–20% to avoid splitting context across boundaries',
          'Use cosine similarity for retrieval — Euclidean distance works poorly for embeddings',
          'Re-ranking with a cross-encoder significantly improves retrieval precision over bi-encoder alone',
        ],
        code: `# Minimal RAG with Anthropic embeddings
import anthropic, numpy as np

def embed(texts):
    r = client.embeddings.create(model="voyage-3", input=texts)
    return np.array([e.embedding for e in r.embeddings])

def retrieve(query, chunks, chunk_embs, k=3):
    q_emb = embed([query])[0]
    sims = chunk_embs @ q_emb / (
        np.linalg.norm(chunk_embs, axis=1) * np.linalg.norm(q_emb))
    return [chunks[i] for i in np.argsort(sims)[-k:][::-1]]`,
      },
      engineer: {
        overview: 'Production RAG requires attention to retrieval pipeline latency, index freshness, and retrieval failure modes. Naive dense retrieval degrades on keyword-heavy queries — hybrid search (dense + BM25) typically adds 10–20% relevance improvement.',
        keyPoints: [
          'Hybrid search: dense retrieval for semantic queries + BM25 for keyword/entity queries',
          'Metadata filtering reduces search space before vector similarity — dramatically improves recall for filtered queries',
          'Index update latency: new documents may not be immediately retrievable — design for eventual consistency',
          'Retrieval hallucination: model may claim to retrieve a document it actually generated — validate source attribution',
        ],
      },
      enterprise: {
        overview: 'RAG is the primary architecture for enterprise knowledge management with LLMs. It enables using proprietary data without fine-tuning, keeps knowledge updatable without retraining, and provides audit trails for source attribution.',
        keyPoints: [
          'RAG provides citation capabilities — every answer can be traced to a source document',
          'Access control: retrieval layer should respect document-level permissions before injecting into context',
          'Freshness control: time-weighted retrieval prevents stale documents from outranking recent ones',
          'Evaluate with RAGAs metrics: faithfulness, answer relevance, context relevance, context recall',
        ],
      },
      architect: {
        overview: 'RAG is a form of non-parametric memory augmentation. The retrieval system acts as an external episodic memory store, accessed via approximate nearest-neighbor search in a learned embedding space.',
        keyPoints: [
          'Dense retrieval assumes semantic locality in embedding space — this fails for compositional or multi-hop queries',
          'GraphRAG extends RAG to knowledge graphs, enabling multi-hop reasoning not possible in flat vector stores',
          'Agentic RAG uses Claude itself to formulate retrieval queries, iterate on results, and judge sufficiency',
          'Fine-tuning the embedding model on domain data improves retrieval quality more than prompt engineering the generation model',
        ],
      },
    },
  },
  {
    id: 'context-engineering',
    group: 'engineering',
    emoji: '🏗️',
    title: 'Context Engineering',
    tagline: 'The discipline of designing what goes into your context window',
    analogy: 'Context engineering is to prompting what architecture is to coding',
    analogyDetail: 'Prompt engineering asks "what do I say?". Context engineering asks "what does the model need to know, in what structure, at what granularity, from which sources, to complete this task optimally?"',
    modeContent: {
      beginner: {
        overview: 'Context engineering is the practice of carefully designing what information Claude sees and in what order. A well-engineered context is like a well-organized briefing document — everything the AI needs, nothing it does not.',
        keyPoints: [
          'Put the most important instructions at the beginning and end — models attend most to these positions',
          'Structure your prompt like a job description: role, task, constraints, examples, output format',
          'Fewer, clearer instructions outperform many vague ones every time',
          '"Context engineering" is replacing "prompt engineering" as AI systems get more complex',
        ],
      },
      developer: {
        overview: 'Context engineering covers system prompt design, conversation structure, tool result formatting, and example selection. The goal is maximum task performance per token consumed — a metric called context efficiency.',
        keyPoints: [
          'System prompts establish role, rules, and output format — keep them under 500 tokens for most apps',
          'Few-shot examples in context are the fastest way to teach output format without fine-tuning',
          'Separate instruction context (stable) from task context (dynamic) for effective prompt caching',
          'Use XML tags to delimit context sections: <context>, <task>, <examples>, <output_format>',
        ],
        code: `SYSTEM = """You are a data extraction agent.

<rules>
- Return only valid JSON
- Never infer missing fields — use null
- Dates in ISO 8601 format
</rules>

<output_schema>
{"name": str, "date": str|null, "amount": float|null}
</output_schema>"""`,
      },
      engineer: {
        overview: 'Context engineering at the systems level involves layered context assembly: static system config, retrieved knowledge, conversation state, tool outputs, and current task — each with different update frequencies and priority levels.',
        keyPoints: [
          'Layer by update frequency: static (per-deployment) → session (per-user) → request (per-call)',
          'Cache static layers (system prompt, user preferences) to eliminate repeated prefill cost',
          'Prioritize context sections: if eviction is needed, drop retrieved context before task instructions',
          'Measure context utilization: track which sections of context correlate with output quality',
        ],
      },
      enterprise: {
        overview: 'Context engineering is a core competency for enterprise AI teams. Poorly engineered context is the leading cause of inconsistent outputs, unexpected costs, and trust failures in production LLM systems.',
        keyPoints: [
          'Standardize context templates across teams — consistency reduces debugging time for LLM failures',
          'Version-control your system prompts the same way you version-control code',
          'A/B test context changes before rolling out — even small changes can shift output quality measurably',
          'Context auditing: log what goes into the context window for every high-stakes AI decision',
        ],
      },
      architect: {
        overview: 'Context engineering is fundamentally a compression problem: given a finite context window, choose the information subset that maximizes expected task performance. This framing connects it to information retrieval, knowledge distillation, and active learning theory.',
        keyPoints: [
          'Information value estimation: not all context tokens contribute equally to output quality',
          'Context routing: different tasks need different context compositions — a multi-agent system routes to the right context assembly',
          'Dynamic context: context assembled at inference time from live sources (databases, APIs, tools) vs. static baked-in context',
          'Optimal context length is task-dependent — over-contexting is as harmful as under-contexting for precision tasks',
        ],
      },
    },
  },
  {
    id: 'claude-system',
    group: 'engineering',
    emoji: '🤖',
    title: 'Claude Context System',
    tagline: 'How Claude assembles its context window on every call',
    analogy: 'A layers-of-a-sandwich approach: each ingredient sits in a defined position',
    analogyDetail: 'Claude\'s context is not free-form — it has a defined structure with specific layers: system prompt, project context, memory, conversation turns, tool results, and the current user message. Each layer has different semantics.',
    modeContent: {
      beginner: {
        overview: 'Every time Claude responds, it sees a carefully assembled package of information: your instructions, the conversation history, any documents or tools you gave it, and your current message. Understanding this structure explains a lot about how Claude behaves.',
        keyPoints: [
          'System prompt: permanent instructions that set Claude\'s role and rules for the whole session',
          'Conversation history: all previous turns between you and Claude',
          'Tool results: when Claude uses tools, their outputs inject directly into the context',
          'Your message always arrives last — giving it natural recency weight in the attention mechanism',
        ],
      },
      developer: {
        overview: 'The Messages API assembles context as: [system_prompt] + [messages array (alternating user/assistant)] + any tool_use/tool_result blocks inline in the conversation. Order matters — later content receives stronger attention than earlier content.',
        keyPoints: [
          'System prompt is separate from the messages array — it has different caching behavior',
          'Tool use is embedded inline: assistant message with tool_use block → user message with tool_result block',
          'Multiple tool calls in one turn are batched — the model waits for all results before continuing',
          'Projects add a persistent layer above the system prompt: project instructions → system → conversation',
        ],
        code: `messages = [
    {"role": "user",      "content": "What's the weather?"},
    {"role": "assistant", "content": [
        {"type": "tool_use", "id": "t1", "name": "get_weather",
         "input": {"location": "NYC"}}
    ]},
    {"role": "user", "content": [
        {"type": "tool_result", "tool_use_id": "t1",
         "content": "72°F, partly cloudy"}
    ]},
]`,
      },
      engineer: {
        overview: 'Understanding Claude\'s context assembly is critical for building agents. Tool result injection patterns, context budget allocation between system/history/retrieval, and prompt caching strategy all depend on knowing exactly how the context window is structured.',
        keyPoints: [
          'Prompt caching: prefix up to system_prompt + static messages — invalidates on any change to the prefix',
          'Tool result size is unbounded by default — always truncate large tool outputs before injection',
          'Multi-turn conversations pay full prefix cost unless caching is active — use long cache TTL for session state',
          'Extended thinking adds reasoning tokens to context — they count toward the input token limit',
        ],
      },
      enterprise: {
        overview: 'Claude\'s context architecture determines security boundaries, compliance scope, and audit granularity. Understanding what is in-context vs. external determines what Claude can and cannot do, know, or be held responsible for.',
        keyPoints: [
          'System prompt is not visible to users unless you expose it — it is your governance layer',
          'Personally identifiable information (PII) that enters context is subject to data processing regulations',
          'Tool results from external systems should be sanitized before injection to prevent prompt injection attacks',
          'Audit trail: log the full assembled context for every compliance-sensitive AI decision',
        ],
        callout: {
          icon: '🛡️',
          title: 'Prompt Injection Risk',
          body: 'Tool results from external sources (web pages, user-uploaded docs, API responses) can contain adversarial instructions. Sanitize and bracket all external content before injecting it into Claude\'s context.',
          color: '#ef4444',
        },
      },
      architect: {
        overview: 'Claude\'s context system implements a hierarchical principal-agent model: operator (system prompt) overrides user (messages array) in cases of conflict. Tool results occupy a special position as untrusted third-party content that is still inside the trust boundary of the conversation.',
        keyPoints: [
          'Principal hierarchy: Anthropic policies → operator system prompt → user messages → tool outputs',
          'Context window is the complete computational state — there is no implicit persistent state between calls',
          'Extended context (projects) adds a memoized layer above the system prompt with higher persistence',
          'Future architectures may have true persistent memory layers with selective recall — current Claude uses injection-based memory only',
        ],
      },
    },
  },

  // ── ADVANCED ──────────────────────────────────────────────────────────────────
  {
    id: 'economics',
    group: 'advanced',
    emoji: '📊',
    title: 'Token Economics',
    tagline: 'The financial reality of running AI at scale',
    analogy: 'Tokens are the electricity bill of AI — invisible until it hurts',
    analogyDetail: 'Small inefficiencies in token usage compound dramatically at production scale. A 10-token system prompt bloat is meaningless at 100 calls; it is $3/day at 1M calls.',
    modeContent: {
      beginner: {
        overview: 'Using AI costs money based on how many tokens you use. Input tokens (what you send to Claude) cost less than output tokens (what Claude generates). Choosing the right model for the task can save 19× on cost with little quality difference.',
        keyPoints: [
          'Claude Haiku is the cheapest — great for simple tasks like classification and extraction',
          'Claude Sonnet handles most complex tasks at a medium price point',
          'Claude Opus is the most capable and expensive — use it only when you need maximum quality',
          'Every word in your prompt has a cost — this is why clear, concise prompts are also cheaper prompts',
        ],
      },
      developer: {
        overview: 'Model your total token cost as: (avg_input_tokens + avg_output_tokens) × calls_per_day × model_price × 30 = monthly budget. Add retrieval costs (embedding + vector DB queries) for RAG systems.',
        keyPoints: [
          'Batch API: 50% discount for async workloads that tolerate hours of latency',
          'Prompt caching: ~90% discount on cached input tokens — requires 1,024+ token cacheable prefix',
          'Model routing: classify query complexity first (Haiku) → route complex queries to Sonnet/Opus',
          'Output token budgeting: set max_tokens to prevent runaway verbose responses from exploding cost',
        ],
        code: `# Monthly cost estimate with caching
def cost_with_caching(
    input_tok, output_tok, calls_per_day,
    cache_prefix_tok=500, model="sonnet"
):
    rates = {"haiku":(0.80,4.0), "sonnet":(3.0,15.0), "opus":(15.0,75.0)}
    inp, out = rates[model]
    cached_per_call = cache_prefix_tok * 0.1 / 1e6 * inp   # 90% off
    fresh_per_call = (input_tok - cache_prefix_tok) / 1e6 * inp
    out_cost = output_tok / 1e6 * out
    return (cached_per_call + fresh_per_call + out_cost) * calls_per_day * 30`,
      },
      engineer: {
        overview: 'Token economics at the systems level require optimizing across the full stack: model selection, context management, batching strategy, caching utilization, and output token control. Each dimension independently provides 2–10× cost reduction.',
        keyPoints: [
          'Model selection: 19× cost difference between Haiku and Opus — use the cheapest model that meets quality bar',
          'Context caching utilization: measure cache hit rate; < 60% means your prefix is too dynamic',
          'Output control: set max_tokens aggressively — verbose outputs are the fastest way to double cost',
          'Async batching: pipeline non-urgent workloads through the Batch API for 50% savings automatically',
        ],
      },
      enterprise: {
        overview: 'At enterprise scale, LLM costs become a managed budget line alongside cloud infrastructure. Governance requires per-team chargebacks, per-workflow cost SLAs, and automated anomaly detection for unexpected cost spikes.',
        keyPoints: [
          'Set API key-level rate limits and spending caps — one runaway workflow should not affect the whole org',
          'Cost attribution: tag every API call with team, feature, and experiment ID for granular billing',
          'Establish cost-per-outcome metrics (cost per successful case closed, cost per analyzed document) not just raw token counts',
          'Model version upgrades often change cost structure — budget and test before migrating production traffic',
        ],
      },
      architect: {
        overview: 'Inference costs are declining at roughly 3–4× per year (similar to Moore\'s Law for training). Architecture decisions made today should account for this: optimize for capability-per-dollar now, build for capability-at-near-zero-cost later.',
        keyPoints: [
          'Chinchilla scaling: compute-optimal training favors more data over larger models at fixed compute budget',
          'Mixture of Experts (MoE) models activate only a subset of parameters per token — improving inference economics dramatically',
          'Quantization (INT8, INT4) reduces memory and bandwidth requirements with controlled quality tradeoffs',
          'Edge inference (small models on device) eliminates API costs but requires model distillation investment',
        ],
      },
    },
  },
  {
    id: 'failures',
    group: 'advanced',
    emoji: '⚠️',
    title: 'Real-World Failures',
    tagline: 'How context problems manifest as production incidents',
    analogy: 'Every context failure is a predictable, preventable bug — not magic',
    analogyDetail: 'AI failures look mysterious until you understand the underlying mechanics. Most production failures trace back to context management: too little context, too much noise, evicted instructions, or injected adversarial content.',
    modeContent: {
      beginner: {
        overview: 'AI systems fail in specific, predictable ways. Understanding why they fail helps you design better systems and set appropriate expectations. Most "hallucinations" are actually context failures, not random fabrication.',
        keyPoints: [
          'Forgotten instructions: when context fills up, earlier instructions get evicted and ignored',
          'Context drift: in long conversations, the AI gradually loses track of the original task',
          'Hallucination: the model fills in missing context with plausible-sounding but incorrect information',
          'Repeated mistakes: without memory between sessions, the same errors recur every time',
        ],
      },
      developer: {
        overview: 'The most common production failure modes are: context overflow (instructions evicted), instruction amnesia (system prompt contradicted by user messages), tool result injection (adversarial content in tool outputs), and recursive prompt bloat (growing context across retries).',
        keyPoints: [
          'Context overflow: detect with count_tokens() before call; implement graceful eviction strategy',
          'Instruction bleed: user messages can override system instructions if the model weights them similarly',
          'Tool injection: malicious content in tool results can hijack AI behavior — sanitize external inputs',
          'Retry bloat: naive retry logic re-appends error messages to context, growing it exponentially',
        ],
        code: `# Detect and prevent context overflow before it fails
def safe_call(messages, system, model="claude-sonnet-4-6"):
    tokens = client.messages.count_tokens(
        model=model, system=system, messages=messages
    ).input_tokens
    if tokens > 180_000:
        raise ContextOverflowError(
            f"Context {tokens} tokens exceeds safe limit. "
            "Compress conversation history before continuing."
        )
    return client.messages.create(
        model=model, system=system, messages=messages, max_tokens=4096)`,
      },
      engineer: {
        overview: 'Production failure taxonomy for context systems: (1) Overflow failures — context limit exceeded. (2) Coherence failures — eviction removes critical task state. (3) Injection failures — adversarial content manipulates behavior. (4) Accumulation failures — context grows without bound in agent loops.',
        keyPoints: [
          'Agent loops: each tool call appends results — long loops can fill context in < 10 iterations with large outputs',
          'Lost-in-the-middle: information buried at token position 50K in a 200K context is 40–60% less likely to be recalled',
          'Memory corruption: summarization errors compound — a wrong summary generates wrong subsequent decisions',
          'Infinite orchestration: agents that retry on failure can create exponential context growth within minutes',
        ],
      },
      enterprise: {
        overview: 'Production AI incidents share common patterns: context-related failures account for > 60% of LLM system outages. Runbooks should include context management debugging steps alongside standard API error handling.',
        keyPoints: [
          'Incident #1 (context overflow): AI stops following instructions mid-session — check context token count first',
          'Incident #2 (cost spike): unusual token volume spike — usually retry storms or unbounded tool output injection',
          'Incident #3 (inconsistent outputs): same prompt gives different results — check for context cache invalidation or system prompt changes',
          'Incident #4 (hallucination spike): AI starts fabricating — often indicates context drift or retrieval failure',
        ],
        callout: {
          icon: '🚨',
          title: 'Incident Response Checklist',
          body: '1. Check context token count. 2. Verify system prompt integrity. 3. Review tool result sizes. 4. Check retry logic for exponential context growth. 5. Validate retrieval pipeline freshness.',
          color: '#ef4444',
        },
      },
      architect: {
        overview: 'LLM failure modes expose the gap between the model\'s training distribution and production deployment conditions. Context engineering failures are fundamentally distribution shift problems: the model was trained on certain context patterns and fails when those patterns break.',
        keyPoints: [
          'Lost-in-the-middle: Liu et al. (2023) showed 10–20% accuracy degradation for information at context midpoints',
          'Attention sink: first and last tokens accumulate disproportionate attention weight — a structural bias, not a bug',
          'Context poisoning: malicious content in retrieved documents can override operator instructions in practice',
          'Failure modes compound: context drift → worse retrieval → more hallucination → longer error traces → context overflow',
        ],
      },
    },
  },
  {
    id: 'multi-agent',
    group: 'advanced',
    emoji: '🕸️',
    title: 'Multi-Agent Memory',
    tagline: 'How agent networks manage shared and private context',
    analogy: 'Like a project team — each member has their own notes, and some go on a shared whiteboard',
    analogyDetail: 'In multi-agent systems, each agent has its own context window. They share information by passing messages, writing to shared memory stores, or reading from common retrieval systems. Private context stays private.',
    modeContent: {
      beginner: {
        overview: 'When multiple AI agents work together, they need ways to share information without overloading each other\'s memory. Think of it like a team meeting where each person has limited working memory — you need good notes and clear communication.',
        keyPoints: [
          'Each agent has its own separate context window — they do not share memory automatically',
          'Agents communicate by passing structured messages, not by reading each other\'s thoughts',
          'A shared memory store (like a database) lets all agents read and write common information',
          'The orchestrating agent sees outputs from all sub-agents — its context grows fastest',
        ],
      },
      developer: {
        overview: 'Multi-agent memory architectures: (1) message passing — agents communicate through structured API calls; (2) shared state — agents read/write a common key-value or vector store; (3) hierarchical — orchestrator holds summary state, sub-agents hold detail state.',
        keyPoints: [
          'Pass only summaries between agents — sending full context from one agent to another inflates token cost',
          'Shared state store should be external (Redis, database) not in-context to support parallel agent execution',
          'Orchestrator pattern: planner agent creates sub-task specs; worker agents execute; synthesizer agent merges results',
          'Agent output tokens = next agent input tokens — control output verbosity to manage cascade cost',
        ],
        code: `# Minimal orchestrator with shared state
def run_pipeline(task):
    state = {}  # shared external state

    # Step 1: Planner agent
    plan = call_agent("planner", task, context=state)
    state["plan"] = plan

    # Step 2: Parallel workers
    results = parallel_map(
        lambda subtask: call_agent("worker", subtask, context=state),
        plan["subtasks"]
    )
    state["results"] = results

    # Step 3: Synthesizer
    return call_agent("synthesizer", "Merge results", context=state)`,
      },
      engineer: {
        overview: 'Multi-agent context management requires explicit design: which information lives in each agent\'s context, what gets shared via external state, and how to prevent context explosion as the orchestration graph deepens.',
        keyPoints: [
          'Context budget allocation: orchestrator needs enough budget to hold all sub-agent summaries',
          'Parallel execution: independent sub-agents can run simultaneously but their results must be merged',
          'Cycle detection: agents that call each other can create infinite loops — track call depth with a counter',
          'Token accounting: total cost = sum of all agent calls × their respective context sizes',
        ],
      },
      enterprise: {
        overview: 'Multi-agent systems multiply both capability and risk. Each agent adds token cost, latency, and potential failure points. Production multi-agent systems require circuit breakers, cost caps, and explicit agent trust boundaries.',
        keyPoints: [
          'Agent cost explosion: a 3-agent pipeline with context sharing can cost 5–10× a single-agent solution',
          'Trust boundaries: sub-agents should not automatically inherit orchestrator privileges',
          'Audit trails become complex in multi-agent systems — log every agent call with full input/output',
          'Governance: who is responsible for an AI decision made by a chain of 5 agents? Answer this before deployment.',
        ],
      },
      architect: {
        overview: 'Multi-agent memory is a distributed systems problem embedded in an AI context. Shared state consistency, partition tolerance during agent failure, and the CAP theorem all apply. Agent memory architectures map to classical distributed computing patterns.',
        keyPoints: [
          'Blackboard architecture: agents communicate through a shared structured knowledge store — classic multi-agent pattern',
          'Actor model: each agent is an independent process with a mailbox — Erlang/Akka analogy',
          'Memory topology determines emergent capability: star (orchestrator) vs. mesh (peer) vs. hierarchical (tree) vs. pipeline',
          'Eventual consistency in shared memory: agents may have stale views — design for tolerance, not prevention',
        ],
      },
    },
  },
  {
    id: 'long-context',
    group: 'advanced',
    emoji: '🌊',
    title: 'Long Context Challenges',
    tagline: 'Why million-token windows are not a free lunch',
    analogy: 'A library card does not help if you cannot find the right book on the shelf',
    analogyDetail: 'Longer context windows expand capacity but not necessarily recall or reasoning quality. Information buried deep in a million-token context is often less accessible than information in a 10K-token focused context.',
    modeContent: {
      beginner: {
        overview: 'Having a huge memory does not mean you use it well. LLMs struggle to find specific information in very long contexts, and costs grow rapidly with context length. Longer is not always better — focused is usually better.',
        keyPoints: [
          '"Lost in the middle": information at the start and end of context is recalled better than information in the middle',
          'Very long contexts cost more per call, even if most of the context is unused',
          'A focused 8K context often outperforms a cluttered 200K context on precision tasks',
          'Retrieval systems exist specifically to avoid the need for massive contexts',
        ],
      },
      developer: {
        overview: 'Long context degrades in two ways: retrieval accuracy drops for information at middle positions, and cost grows with input token count regardless of whether that content contributes to the output. Design systems to minimize context size, not maximize it.',
        keyPoints: [
          '"Lost in the middle" effect: 10–20% accuracy drop for facts at middle positions vs. start/end',
          'Use retrieval to inject only relevant context — do not load entire documents when chunks suffice',
          'Attention dilution: each relevant token competes with more noise tokens in longer contexts',
          'Test with targeted QA: measure recall of specific facts at different positions in your context',
        ],
        code: `# Test for lost-in-the-middle in your context
def test_recall(facts, context_template, model="claude-sonnet-4-6"):
    results = []
    for pos in ["start", "middle", "end"]:
        context = context_template.format(facts_position=pos)
        answer = call_model(context, f"What is fact_3?")
        results.append({"position": pos, "correct": check(answer)})
    return results  # expect: start/end > middle`,
      },
      engineer: {
        overview: 'Long context introduces engineering challenges beyond model capabilities: prefill latency grows linearly, KV cache memory grows linearly, and attention compute grows quadratically. For production systems, these translate to latency SLO violations and hardware cost scaling.',
        keyPoints: [
          'Prefill latency for 200K tokens: typically 5–30 seconds depending on hardware and model',
          'KV cache memory for 200K tokens (70B model): ~37 GB — requires dedicated hardware per request',
          'Attention is O(n²) in standard transformers — 2× longer context = 4× attention compute',
          'Streaming output starts only after prefill completes — long prefill delays first-token time',
        ],
      },
      enterprise: {
        overview: 'Long context is expensive and rarely necessary. Most enterprise use cases require < 32K tokens. Defaulting to 200K context "just in case" is a significant and avoidable cost multiplier.',
        keyPoints: [
          'Audit your actual context utilization — most applications use < 20% of available context',
          'Right-size context per workflow: document Q&A (8K), code review (32K), legal analysis (100K)',
          'Long context increases latency, which affects UX — user-facing applications should minimize it',
          'Cost model: 200K-token input at Sonnet pricing = $0.60 per call — at 10K calls/day = $180/day',
        ],
      },
      architect: {
        overview: 'Long context is an unsolved research problem, not a solved capability. Current transformers exhibit attention entropy growth with sequence length that degrades precision recall. This is why retrieval-augmented approaches outperform full-context loading on precision-critical tasks.',
        keyPoints: [
          'Attention entropy grows with context length: at 200K tokens, attention is nearly uniform in lower layers',
          'Position-based degradation: models fine-tuned on 200K contexts still exhibit positional bias from training data distribution',
          'Needle-in-a-haystack benchmarks measure extreme cases — average-case recall degradation is more insidious',
          'Structured memory (knowledge graphs, databases) provides O(1) exact recall vs. O(n) attention-based approximate recall',
        ],
      },
    },
  },

  // ── PRACTICE ──────────────────────────────────────────────────────────────────
  {
    id: 'optimization',
    group: 'practice',
    emoji: '⚙️',
    title: 'Optimization Techniques',
    tagline: 'Practical strategies to reduce cost and improve quality simultaneously',
    analogy: 'Optimization is not about cutting corners — it is about cutting waste',
    analogyDetail: 'The best optimizations reduce tokens AND improve quality: structured output, precise instructions, and right-sized context all make responses more predictable at lower cost.',
    modeContent: {
      beginner: {
        overview: 'Small changes to how you write prompts can dramatically reduce cost and improve results. The most impactful techniques are: be specific about output format, remove filler words, and choose the right model for the task.',
        keyPoints: [
          'Always specify output format: "Return a bullet list" beats "Give me information about..."',
          'Remove courtesy language: "Please carefully analyze" costs 3 extra tokens vs "Analyze"',
          'Use Haiku for simple tasks (classification, extraction) — it is 19× cheaper than Opus',
          'Set max_tokens to a reasonable limit — prevents expensive verbose outputs',
        ],
      },
      developer: {
        overview: 'Systematic optimization layers: (1) prompt compression — remove redundancy; (2) model routing — cheapest model per task type; (3) output control — max_tokens and stop sequences; (4) caching — reuse stable prefixes; (5) batching — async workloads at 50% discount.',
        keyPoints: [
          'Audit token counts per prompt section — system prompt, examples, and task often have different optimization leverage',
          'Few-shot examples in context can be replaced with fine-tuned behavior at high enough call volume',
          'Stop sequences eliminate the need for explicit "stop after first answer" instructions',
          'Structured outputs (JSON schema) reduce output tokens by eliminating verbose explanatory prose',
        ],
        code: `# Prompt compression audit
def audit_prompt(prompt, context=""):
    sections = {"system": context, "user": prompt}
    for name, text in sections.items():
        toks = count_tokens(text)
        words = len(text.split())
        print(f"{name}: {toks} tokens, {words} words, "
              f"{toks/words:.2f} tok/word")
    # Improvement opportunities: tok/word > 1.5 suggests redundancy`,
      },
      engineer: {
        overview: 'System-level optimization targets: model routing saves 3–19×, caching saves 2–10×, batching saves 2×, output control saves 1.5–3×. Combined correctly, a 10–50× cost reduction is achievable without quality loss.',
        keyPoints: [
          'Model routing: train a lightweight classifier (Haiku) to route queries to the minimum-cost model that can answer them',
          'Cache hit optimization: normalize inputs (lowercase, strip whitespace) before hashing for cache keys',
          'Semantic deduplication: cluster similar queries and cache the canonical response',
          'Output token control: set max_tokens per task type — extraction tasks never need > 200 tokens',
        ],
      },
      enterprise: {
        overview: 'Optimization is a continuous process requiring measurement infrastructure. You cannot optimize what you do not measure. Build observability before optimization — track token count, latency, cost, and quality score per workflow.',
        keyPoints: [
          'Baseline first: measure current cost, latency, and quality before any optimization',
          'Optimize the highest-volume workflows first — 80% of cost comes from 20% of use cases',
          'Quality-gated optimization: every token reduction must maintain quality score above threshold',
          'Optimization backlog: maintain a prioritized list of cost-reduction opportunities with estimated impact',
        ],
      },
      architect: {
        overview: 'Optimization theory for LLM systems: minimize E[cost(C)] subject to E[quality(C)] ≥ threshold, where C is the context. This is an information-theoretic compression problem where "quality" is task-specific and must be empirically measured.',
        keyPoints: [
          'Pareto frontier: for each task type, map quality vs. cost tradeoff curve — choose the operating point',
          'Distillation: fine-tune a small model to match large-model outputs on your specific task distribution',
          'Constitutional AI and RLHF shift the distribution — optimized prompts for base models may underperform on RLHF models',
          'Optimization generalizes poorly: a prompt optimized for one model version may degrade on the next',
        ],
      },
    },
  },
  {
    id: 'games',
    group: 'practice',
    emoji: '🎮',
    title: 'Interactive Games',
    tagline: 'Learn by doing — two hands-on challenges',
    analogy: 'The fastest way to understand token economics is to feel the constraints yourself',
    analogyDetail: 'Abstract principles become intuitive through constraint. These games put you inside the token budget and force you to make the same tradeoffs that production AI engineers make every day.',
    interactiveType: 'games',
    modeContent: {
      beginner: {
        overview: 'Try the Token Trimmer game to feel what it is like to optimize a prompt, and the Context Overflow game to experience what it feels like when AI memory runs out.',
        keyPoints: [
          'Token Trimmer: cut a bloated prompt to the target size while keeping its meaning',
          'Context Overflow: keep a conversation coherent as the AI\'s memory fills up and evicts old messages',
          'Every word you remove in Token Trimmer saves real money in production',
          'Context Overflow shows you exactly why AI chatbots "forget" things in long conversations',
        ],
      },
      developer: {
        overview: 'These games simulate real production constraints. Token Trimmer reflects the daily task of prompt optimization; Context Overflow reflects designing long-running conversational agents. The patterns you discover here apply directly to production systems.',
        keyPoints: [
          'Token Trimmer target: maintain all required semantics in the minimum token budget',
          'Watch for: courtesy language, redundant instructions, unspecified output formats',
          'Context Overflow: notice which information types survive eviction longest',
          'Score reflects production reality: highest quality within the tightest budget wins',
        ],
      },
      engineer: {
        overview: 'Game mechanics mirror real engineering constraints: Token Trimmer models prompt optimization under quality SLA; Context Overflow models memory management policy design. The "best" strategies in these games are the best strategies in production.',
        keyPoints: [
          'Optimal Token Trimmer strategy: structured output + imperative tense + no courtesy language',
          'Optimal Context Overflow strategy: inject summaries before eviction to preserve task context',
          'Notice: some token reductions break semantics (high quality risk); others are pure waste',
          'Enterprise relevance: at 1M calls/day, every 1-token improvement = 1M tokens/day saved',
        ],
      },
      enterprise: {
        overview: 'These games quantify the business impact of prompt engineering decisions. Every token saved at scale translates directly to cost reduction. Use the Token Trimmer to build intuition for what is and is not necessary in your production prompts.',
        keyPoints: [
          'At 1M calls/day: saving 10 tokens/call = $0.03/day on Haiku or $0.30/day on Sonnet',
          'At 10M calls/day: saving 10 tokens/call = $3/day on Haiku or $30/day on Sonnet — $1K/month',
          'Context Overflow: watch for the governance failure mode where AI forgets compliance instructions mid-session',
          'Both games demonstrate why prompt review should be part of your deployment checklist',
        ],
      },
      architect: {
        overview: 'Game design encodes optimization theory: Token Trimmer is a minimum-description-length problem; Context Overflow is a cache eviction policy design problem. Both have known theoretical optima that real production systems approach but rarely reach.',
        keyPoints: [
          'Token Trimmer optimal: minimum Kolmogorov complexity representation of task intent',
          'Context Overflow optimal: Bélády\'s algorithm adapted for semantic relevance instead of recency',
          'Quality vs. compression tradeoffs in both games follow a rate-distortion curve',
          'Emergent insight: the best prompts and the best memory management strategies share a common principle — preserve information density, discard redundancy',
        ],
      },
    },
  },
  {
    id: 'enterprise',
    group: 'practice',
    emoji: '🏢',
    title: 'Enterprise Context Systems',
    tagline: 'How real organizations build production AI memory infrastructure',
    analogy: 'Enterprise AI memory is like a hospital\'s records system — tiered, permissioned, and auditable',
    analogyDetail: 'Hospitals tier records by urgency (ER notes vs. 10-year-old records), control access by role, and maintain complete audit trails. Enterprise AI memory systems need the same architecture for the same reasons.',
    modeContent: {
      beginner: {
        overview: 'Large companies using AI need systems to manage what the AI knows, who it can tell, and how to keep information current. This is not just about chatbots — it is about building reliable AI pipelines across thousands of users.',
        keyPoints: [
          'Different users need different AI context — a sales rep and an engineer should not see the same data',
          'Knowledge bases must be kept current — stale AI context leads to wrong answers',
          'Every AI decision affecting customers should be logged for compliance and debugging',
          'Cost governance prevents any one team from accidentally consuming the entire AI budget',
        ],
      },
      developer: {
        overview: 'Enterprise context architecture layers: user identity context (from IAM), team/role context (from directory), domain knowledge context (from RAG), task state (from session store), and audit context (for compliance logging). Each layer has different update frequency and security requirements.',
        keyPoints: [
          'Identity-aware context: inject user\'s role, permissions, and preferences into system prompt',
          'Tenant isolation: multi-tenant SaaS must ensure context from one customer cannot leak to another',
          'Context versioning: system prompts change — version them like code and test before rollout',
          'Compliance hooks: log full context assembly (including retrieved docs) for regulated workflows',
        ],
        code: `def build_enterprise_context(user_id, task):
    user = get_user_profile(user_id)           # IAM layer
    perms = get_permissions(user_id)           # authorization
    kb_chunks = retrieve_knowledge(task, perms)  # RAG with ACL filter
    return {
        "system": render_system_prompt(user, perms),
        "context": kb_chunks,
        "task": task,
        "audit_id": create_audit_record(user_id, task)
    }`,
      },
      engineer: {
        overview: 'Enterprise context systems require high availability, low latency, and strict isolation. The retrieval layer (vector DB) must handle thousands of concurrent queries; the context assembly layer must be fast enough to not add perceptible latency to the user experience.',
        keyPoints: [
          'P99 latency budget: context assembly should complete in < 100ms for interactive applications',
          'Vector DB replication: single-region vector DB is a reliability risk — replicate across zones',
          'Cache warming: pre-compute context for high-frequency user profiles to eliminate cold-start latency',
          'Circuit breakers: if vector DB is unavailable, fall back to cached context or minimal context mode',
        ],
      },
      enterprise: {
        overview: 'Enterprise AI memory governance requires three capabilities: access control (who sees what context), audit logging (who used what context for what decision), and content governance (what information is allowed in AI context at all).',
        keyPoints: [
          'Data classification: not all business data should be AI-accessible — classify before ingesting',
          'Retention policies: AI context (especially conversation history) may be subject to data retention laws',
          'Sensitive data detection: scan for PII, credentials, and IP before any document enters the knowledge base',
          'Quarterly context audits: review what is in your AI knowledge base — stale or wrong content causes silent failures',
        ],
        callout: {
          icon: '⚖️',
          title: 'Compliance Architecture',
          body: 'GDPR and similar regulations apply to AI context: if a user\'s data is in your AI knowledge base, they may have the right to erasure. Design knowledge base ingestion with deletion support from day one.',
          color: '#8b5cf6',
        },
      },
      architect: {
        overview: 'Enterprise AI memory is a distributed knowledge management problem. The key design decisions are: memory topology (centralized vs. federated), update propagation (push vs. pull), and consistency model (strong vs. eventual). These choices determine capability, cost, and operational complexity.',
        keyPoints: [
          'Centralized knowledge base: single source of truth but single point of failure and bottleneck',
          'Federated memory: each team/domain owns its knowledge store — enables autonomy but requires federation layer',
          'Knowledge graph overlay: adds structured relationships between concepts that vector search cannot represent',
          'Memory governance protocol: who can add, modify, or delete knowledge — and what approval is required',
        ],
      },
    },
  },
  {
    id: 'bad-vs-good',
    group: 'practice',
    emoji: '✅',
    title: 'Bad vs Good Prompts',
    tagline: 'Side-by-side comparison of real prompt anti-patterns and their fixes',
    analogy: 'A bad prompt is a long memo that says nothing specific. A good prompt is a clear work order.',
    analogyDetail: 'Most prompt inefficiency comes from natural language habits: politeness, hedging, repetition, and ambiguity. Removing these habits — without removing meaning — is the core skill of prompt optimization.',
    interactiveType: 'bad-vs-good',
    modeContent: {
      beginner: {
        overview: 'Compare how different prompt styles affect both token cost and output quality. Notice how the good prompts are shorter, clearer, and produce more useful and consistent outputs.',
        keyPoints: [
          'Courtesy language ("Please", "carefully") costs tokens and adds nothing',
          'Unspecified output format forces the model to guess — specify exactly what you want',
          'Saying the same thing three ways doubles your token cost without doubling quality',
          'The best prompt is the shortest one that fully specifies the task',
        ],
      },
      developer: {
        overview: 'Study these patterns and internalize the optimization rules. They apply to every prompt you write: remove filler, specify output schema, use imperative tense, and eliminate redundancy. A single pass with these rules typically reduces prompt size by 40–70%.',
        keyPoints: [
          'Imperative tense: "List 3 issues" not "Please provide a list of the three most important issues"',
          'Schema-first: specify output structure before content — it constrains both tokens and inference',
          'Avoid meta-commentary: "I\'d like you to..." and "Make sure to..." are pure overhead',
          'Measure the before/after: token count and output consistency both improve simultaneously',
        ],
      },
      engineer: {
        overview: 'Prompt anti-patterns have measurable cost at scale. A 50-token bloat at 1M calls/day costs $0.15/day on Haiku, $0.15/day on Sonnet input. Over a year, that is hundreds to thousands of dollars from a single unoptimized prompt template.',
        keyPoints: [
          'Template audits: review all system prompts and few-shot examples quarterly for redundancy',
          'A/B test before optimizing: verify quality is maintained, not just assumed',
          'Token cost calculator: (original_tokens - optimized_tokens) × daily_calls × price = annual savings',
          'Most optimization wins come from the first pass — diminishing returns after 50% reduction',
        ],
      },
      enterprise: {
        overview: 'Prompt quality governance prevents technical debt from compounding. Teams under time pressure write verbose prompts that work — then never go back to optimize them. A prompt review process embedded in the AI deployment workflow prevents this.',
        keyPoints: [
          'Establish prompt quality criteria: max token count, required output schema, banned anti-patterns',
          'Prompt review as a deployment gate: new system prompts require token count certification before production',
          'Shared prompt library: team-level templates reviewed and optimized centrally save redundant optimization effort',
          'Track prompt version history alongside A/B results — good prompts should be preserved and reused',
        ],
      },
      architect: {
        overview: 'Prompt optimization is a compression problem constrained by semantic preservation. The theoretical minimum prompt is the minimum-length description of the task that generates the correct output distribution. Current best practices approach but do not reach this theoretical minimum.',
        keyPoints: [
          'Information theory framing: every token either carries task-relevant information or it does not',
          'Few-shot vs. zero-shot: examples compress intent efficiently for pattern tasks; instruction compression works better for reasoning tasks',
          'Prompt robustness: overly compressed prompts may have higher variance — measure output distribution, not just mean quality',
          'Automated prompt optimization (DSPy, TextGrad) can find non-obvious compression opportunities that human review misses',
        ],
      },
    },
  },
  {
    id: 'future',
    group: 'practice',
    emoji: '🔮',
    title: 'Future of AI Memory',
    tagline: 'What comes after the context window',
    analogy: 'Context windows are RAM — the future is building the equivalent of a hard drive and an OS',
    analogyDetail: 'Current LLMs have working memory (context window) but no persistent long-term memory. The next decade of AI infrastructure development is largely about building the memory, storage, and retrieval systems that allow AI to maintain state across sessions, users, and years.',
    modeContent: {
      beginner: {
        overview: 'Today\'s AI has to "re-learn" who you are every conversation. Future AI systems will remember you across sessions, accumulate knowledge over time, and develop genuine long-term memory — not just a bigger context window.',
        keyPoints: [
          'Personal memory: AI that remembers your preferences, projects, and past decisions across sessions',
          'Knowledge accumulation: AI that learns from each interaction without forgetting old knowledge',
          'Selective forgetting: AI that knows what to remember and what to discard (like humans do)',
          'Infinite effective context: retrieval systems that make "what was in context 6 months ago" accessible',
        ],
      },
      developer: {
        overview: 'The near-term roadmap: (1) longer and cheaper context windows; (2) prompt caching improvements for lower latency on cached content; (3) structured memory APIs that persist specific facts across sessions; (4) improved RAG with tighter model-retrieval integration.',
        keyPoints: [
          'Claude already supports Projects — a form of persistent context that survives session boundaries',
          'Persistent memory will likely be implemented as a structured store with model-managed read/write',
          'Episodic memory (recall specific past events) vs. semantic memory (distilled knowledge) require different architectures',
          'Build with retrieval-first architecture now — it will remain the foundation even as context windows grow',
        ],
      },
      engineer: {
        overview: 'Future AI memory architectures will likely converge on tiered systems: hot (in-context), warm (fast KV store), and cold (vector DB + structured DB), with the model learning to manage its own memory tier placement.',
        keyPoints: [
          'Memory consolidation: autonomous summarization and knowledge distillation during idle periods',
          'Agentic memory management: model decides what to store, retrieve, and forget based on task context',
          'Cross-session continuity: vector embeddings of past sessions indexed for semantic retrieval',
          'Memory consistency: synchronizing memory across multiple parallel agent instances is an unsolved hard problem',
        ],
      },
      enterprise: {
        overview: 'Enterprise AI memory evolution will center on organizational knowledge management: AI systems that accumulate and apply institutional knowledge over years, respect data governance, and support compliance requirements for AI-assisted decisions.',
        keyPoints: [
          'Institutional memory: AI that knows your organization\'s history, decisions, and lessons learned',
          'Compliance-aware memory: automatic PII expiration, right-to-erasure support, and access logging',
          'Knowledge provenance: every AI-retrieved fact linked to its source document and ingestion date',
          'Memory health metrics: knowledge freshness, coverage gaps, contradiction detection — operational discipline for AI knowledge bases',
        ],
      },
      architect: {
        overview: 'The fundamental challenge of AI memory is the same as human memory: selective retention under resource constraints, context-dependent retrieval, and graceful degradation of old information. Neuroscience-inspired architectures (episodic, semantic, procedural memory separation) are beginning to influence LLM memory system design.',
        keyPoints: [
          'Complementary learning systems theory: fast online learning (in-context) + slow offline consolidation (training) — LLMs currently have only the former',
          'Continual learning without catastrophic forgetting remains unsolved for large transformers — current production memory is injection-only',
          'Recurrent-state models (Mamba, RWKV) offer implicit memory compression at O(1) state size — at the cost of exact recall',
          'The long-term goal: AI operating systems with explicit memory management primitives, not context windows as a workaround',
        ],
      },
    },
  },
];
