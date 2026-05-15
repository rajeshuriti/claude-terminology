import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { LabMode, LabSectionId, LabSectionGroup } from '@/data/contextLabData';
import {
  labSections, LAB_MODES, LAB_GROUPS, GROUP_ORDER,
  formatExamples, attentionExamples, promptComparisons,
} from '@/data/contextLabData';
import { tw } from '@/lib/dm';

// ── Tokenizer utility ──────────────────────────────────────────────────────────
function approximateTokens(text: string): string[] {
  if (!text) return [];
  const result: string[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '\n') { result.push('↵'); i++; continue; }
    if (ch === ' ') {
      let j = i + 1;
      while (j < text.length && /[a-zA-Z]/.test(text[j])) j++;
      if (j > i + 1) { result.push(text.slice(i, j)); i = j; }
      else { result.push('·'); i++; }
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      let j = i;
      while (j < text.length && /[a-zA-Z]/.test(text[j])) j++;
      result.push(text.slice(i, j)); i = j; continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < text.length && /[0-9]/.test(text[j])) j++;
      const s = text.slice(i, j);
      if (s.length <= 2) result.push(s); else for (const d of s) result.push(d);
      i = j; continue;
    }
    if (i + 1 < text.length) {
      const pair = text.slice(i, i + 2);
      if (['=>', '->', '::', '**', '//', '!=', '==', '<=', '>=', '/*', '*/'].includes(pair)) {
        result.push(pair); i += 2; continue;
      }
    }
    result.push(ch); i++;
  }
  return result;
}

const TOKEN_COLORS = [
  '#3b82f6','#8b5cf6','#ec4899','#f59e0b',
  '#10b981','#ef4444','#06b6d4','#f97316',
  '#a855f7','#84cc16','#14b8a6','#f43f5e',
];

// ── Interactive: Token Explosion ───────────────────────────────────────────────
function TokenExplosionPanel({ dm }: { dm: boolean }) {
  const [idx, setIdx] = useState(0);
  const counts = useMemo(() => formatExamples.map(ex => approximateTokens(ex.text).length), []);
  const max = Math.max(...counts);
  const ex = formatExamples[idx];
  const tokens = useMemo(() => approximateTokens(ex.text), [ex]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {formatExamples.map((f, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i === idx ? 'text-white shadow-sm' : `${tw(dm,'body')} ${tw(dm,'hover')} ${tw(dm,'card')}`}`}
            style={i === idx ? { background: TOKEN_COLORS[i * 2] } : {}}>
            {f.label}
          </button>
        ))}
      </div>
      <div className={`rounded-xl p-4 ${tw(dm,'cardAlt')}`}>
        <div className="text-xs font-mono mb-3 opacity-60">{ex.text}</div>
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((tok, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded text-xs font-mono border"
              style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] + '22', color: TOKEN_COLORS[i % TOKEN_COLORS.length], borderColor: TOKEN_COLORS[i % TOKEN_COLORS.length] + '44' }}>
              {tok}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-lg font-bold" style={{ color: TOKEN_COLORS[idx * 2] }}>{tokens.length}</span>
          <span className={`text-sm ${tw(dm,'muted')}`}>tokens</span>
          <span className={`text-xs ${tw(dm,'muted')}`}>· {ex.description}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className={`text-xs font-bold uppercase tracking-wider ${tw(dm,'muted')}`}>Format comparison</div>
        {formatExamples.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`text-xs w-28 shrink-0 ${i === idx ? 'font-bold' : tw(dm,'muted')}`}>{f.label}</div>
            <div className="flex-1 h-5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(counts[i] / max) * 100}%`, background: TOKEN_COLORS[i * 2] }} />
            </div>
            <div className="text-xs font-mono w-12 text-right" style={{ color: TOKEN_COLORS[i * 2] }}>{counts[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Interactive: Attention Heatmap ─────────────────────────────────────────────
function AttentionPanel({ dm }: { dm: boolean }) {
  const [exIdx, setExIdx] = useState(0);
  const [selectedRow, setSelectedRow] = useState(7);
  const ex = attentionExamples[exIdx];
  const weights = ex.weights[Math.min(selectedRow, ex.weights.length - 1)];
  const maxW = Math.max(...weights);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {attentionExamples.map((a, i) => (
          <button key={i} onClick={() => { setExIdx(i); setSelectedRow(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i === exIdx ? 'bg-violet-600 text-white' : `${tw(dm,'body')} ${tw(dm,'hover')} ${tw(dm,'card')}`}`}>
            {a.label}
          </button>
        ))}
      </div>
      <div className={`p-4 rounded-xl ${tw(dm,'cardAlt')}`}>
        <div className={`text-xs ${tw(dm,'muted')} mb-3`}>Click a token to see what it attends to</div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {ex.tokens.map((tok, i) => (
            <button key={i} onClick={() => setSelectedRow(i)}
              className="px-2 py-1 rounded text-xs font-mono border transition-all"
              style={{
                background: i === selectedRow ? '#8b5cf6' : (weights[i] / maxW > 0.15 ? `rgba(139,92,246,${weights[i]/maxW*0.35})` : 'transparent'),
                color: i === selectedRow ? 'white' : undefined,
                borderColor: i === selectedRow ? '#8b5cf6' : `rgba(139,92,246,${weights[i]/maxW*0.5})`,
                transform: i === selectedRow ? 'scale(1.1)' : 'scale(1)',
              }}>
              {tok}
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          {ex.tokens.map((tok, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="text-xs font-mono w-20 text-right shrink-0" style={{ color: `rgba(139,92,246,${0.4 + weights[i]/maxW*0.6})` }}>{tok}</div>
              <div className="flex-1 h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${(weights[i]/maxW)*100}%`, background: `rgba(139,92,246,${0.4 + weights[i]/maxW*0.6})` }} />
              </div>
              <div className="text-xs font-mono w-10 shrink-0" style={{ color: `rgba(139,92,246,${0.4 + weights[i]/maxW*0.6})` }}>
                {(weights[i] * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`p-3 rounded-xl text-sm ${tw(dm,'section')} border ${tw(dm,'border')}`}>
        <span className="text-violet-500 font-semibold">Insight: </span>
        <span className={tw(dm,'body')}>{ex.insight}</span>
      </div>
    </div>
  );
}

// ── Interactive: Live Tokenizer ────────────────────────────────────────────────
const TOKENIZER_PRESETS: Record<string, string> = {
  prose:    'The quick brown fox jumps over the lazy dog. ChatGPT is amazing!',
  code:     'function calculateCost(tokens: number): number {\n  return tokens * 0.000003;\n}',
  json:     '{"user":{"name":"Alice","age":30,"city":"New York City","role":"engineer"}}',
  markdown: '## Context Windows\n\n- **Size**: 200K tokens\n- **Cost**: $3/1M input tokens\n- Trade-offs exist',
  emoji:    'Hello 👋 I love 🎉 coding! Today is 2025-05-14. Cost: $1,234.56',
};

function TokenizerPanel({ dm }: { dm: boolean }) {
  const [preset, setPreset] = useState<keyof typeof TOKENIZER_PRESETS>('prose');
  const [text, setText] = useState(TOKENIZER_PRESETS.prose);
  const tokens = useMemo(() => approximateTokens(text), [text]);
  const charsPerToken = text.length > 0 ? (text.length / Math.max(tokens.length, 1)).toFixed(2) : '0';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.keys(TOKENIZER_PRESETS).map(k => (
          <button key={k} onClick={() => { setPreset(k); setText(TOKENIZER_PRESETS[k]); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${k === preset ? 'bg-violet-600 text-white' : `${tw(dm,'body')} ${tw(dm,'hover')} ${tw(dm,'card')}`}`}>
            {k}
          </button>
        ))}
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={4}
        className={`w-full rounded-xl p-3 text-sm font-mono border resize-none ${tw(dm,'input')} focus:outline-none focus:ring-2 focus:ring-violet-500`} />
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-bold text-violet-500">{tokens.length}</span>
          <span className={tw(dm,'muted')}>tokens</span>
        </div>
        <div className={`text-xs ${tw(dm,'muted')}`}>{text.length} chars · {charsPerToken} chars/token</div>
      </div>
      <div className={`rounded-xl p-4 ${tw(dm,'cardAlt')} min-h-16`}>
        <div className="flex flex-wrap gap-1">
          {tokens.map((tok, i) => (
            <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded border text-xs font-mono"
              style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] + '22', color: TOKEN_COLORS[i % TOKEN_COLORS.length], borderColor: TOKEN_COLORS[i % TOKEN_COLORS.length] + '55' }}>
              {tok === '↵' ? <span className="opacity-60">↵</span> : tok === '·' ? <span className="opacity-60">·</span> : tok}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Interactive: Context Window Sim ────────────────────────────────────────────
type SimMsg = { id: number; role: 'system' | 'user' | 'assistant'; content: string; tokens: number };

const SIM_MAX = 2048;
const SIM_INITIAL: SimMsg[] = [
  { id: 0, role: 'system', content: 'You are a helpful assistant. Answer questions clearly and concisely.', tokens: 16 },
];
const SIM_BOT_RESPONSES = [
  "Got it! I've noted that. What else would you like to share?",
  "Understood. I'll keep that in mind as we continue.",
  "Interesting — that adds helpful context to our conversation.",
  "Acknowledged! Feel free to continue.",
  "I've processed that. What would you like to do next?",
  "That's useful information. I'm tracking it.",
];
const ROLE_COLORS = { system: '#8b5cf6', user: '#3b82f6', assistant: '#10b981' };

function ContextWindowPanel({ dm }: { dm: boolean }) {
  const [messages, setMessages] = useState<SimMsg[]>(SIM_INITIAL);
  const [input, setInput] = useState('');
  const [evictedCount, setEvictedCount] = useState(0);
  const total = messages.reduce((s, m) => s + m.tokens, 0);
  const fillPct = Math.min((total / SIM_MAX) * 100, 100);

  const addMessage = () => {
    if (!input.trim()) return;
    const userTok = Math.max(3, Math.ceil(input.length / 4));
    const botIdx = messages.length % SIM_BOT_RESPONSES.length;
    const botTok = Math.ceil(SIM_BOT_RESPONSES[botIdx].length / 4);
    const nextId = messages[messages.length - 1].id + 1;
    let next: SimMsg[] = [
      ...messages,
      { id: nextId,     role: 'user',      content: input,                    tokens: userTok },
      { id: nextId + 1, role: 'assistant', content: SIM_BOT_RESPONSES[botIdx], tokens: botTok },
    ];
    let evicted = 0;
    while (next.reduce((s, m) => s + m.tokens, 0) > SIM_MAX * 0.88) {
      const i = next.findIndex(m => m.role !== 'system');
      if (i === -1) break;
      next = next.filter((_, idx) => idx !== i);
      evicted++;
    }
    setEvictedCount(c => c + evicted);
    setMessages(next);
    setInput('');
  };

  const fillColor = fillPct > 80 ? '#ef4444' : fillPct > 60 ? '#f59e0b' : '#10b981';

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border overflow-hidden ${tw(dm,'card')} ${tw(dm,'border')}`}>
        <div className="h-64 overflow-y-auto p-3 space-y-2">
          {messages.map(m => (
            <div key={m.id} className="flex gap-2 items-start">
              <span className="mt-0.5 text-xs px-1.5 py-0.5 rounded font-bold uppercase shrink-0"
                style={{ background: ROLE_COLORS[m.role] + '22', color: ROLE_COLORS[m.role] }}>
                {m.role.slice(0, 3)}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed ${tw(dm,'body')}`}>{m.content}</p>
                <span className={`text-xs ${tw(dm,'muted')}`}>{m.tokens} tok</span>
              </div>
            </div>
          ))}
        </div>
        <div className={`border-t p-3 ${tw(dm,'border')}`}>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMessage()}
              placeholder="Type a message and press Enter…"
              className={`flex-1 text-sm px-3 py-2 rounded-lg border ${tw(dm,'input')} focus:outline-none focus:ring-2 focus:ring-sky-500`} />
            <button onClick={addMessage} className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700">Send</button>
          </div>
        </div>
      </div>
      <div className={`p-3 rounded-xl ${tw(dm,'cardAlt')}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold ${tw(dm,'body')}`}>Context Window</span>
          <span className="text-xs font-mono" style={{ color: fillColor }}>{total}/{SIM_MAX} tokens ({fillPct.toFixed(0)}%)</span>
        </div>
        <div className="h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
          {messages.map(m => (
            <div key={m.id} className="h-full float-left" title={`${m.role}: ${m.tokens} tok`}
              style={{ width: `${(m.tokens / SIM_MAX) * 100}%`, background: ROLE_COLORS[m.role], opacity: 0.8 }} />
          ))}
        </div>
        <div className="mt-2 flex gap-4 text-xs">
          {(['system','user','assistant'] as const).map(r => (
            <div key={r} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: ROLE_COLORS[r] }} />
              <span className={tw(dm,'muted')} style={{ textTransform: 'capitalize' }}>{r}</span>
            </div>
          ))}
          {evictedCount > 0 && (
            <div className="ml-auto text-amber-500 font-medium">{evictedCount} message{evictedCount > 1 ? 's' : ''} evicted ⚠</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Interactive: Cost Simulator ────────────────────────────────────────────────
const MODELS = {
  haiku:  { label: 'Claude Haiku 4.5',  inputPer1M:  0.80, outputPer1M:  4.00 },
  sonnet: { label: 'Claude Sonnet 4.6', inputPer1M:  3.00, outputPer1M: 15.00 },
  opus:   { label: 'Claude Opus 4.7',   inputPer1M: 15.00, outputPer1M: 75.00 },
} as const;

function CostSimPanel({ dm }: { dm: boolean }) {
  const [inputTok, setInputTok] = useState(1500);
  const [outputTok, setOutputTok] = useState(500);
  const [callsPerDay, setCallsPerDay] = useState(1000);
  const [model, setModel] = useState<keyof typeof MODELS>('sonnet');
  const p = MODELS[model];
  const perCall = (inputTok / 1e6) * p.inputPer1M + (outputTok / 1e6) * p.outputPer1M;
  const daily = perCall * callsPerDay;
  const monthly = daily * 30;

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(Object.keys(MODELS) as Array<keyof typeof MODELS>).map(k => (
          <button key={k} onClick={() => setModel(k)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${k === model ? 'text-white shadow-sm' : `${tw(dm,'body')} ${tw(dm,'card')} border ${tw(dm,'border')}`}`}
            style={k === model ? { background: k === 'haiku' ? '#10b981' : k === 'sonnet' ? '#3b82f6' : '#8b5cf6' } : {}}>
            {MODELS[k].label.replace('Claude ', '')}
          </button>
        ))}
      </div>
      {([
        { label: 'Input tokens / call', value: inputTok, set: setInputTok, min: 100, max: 50000, step: 100 },
        { label: 'Output tokens / call', value: outputTok, set: setOutputTok, min: 50, max: 10000, step: 50 },
        { label: 'Calls / day', value: callsPerDay, set: setCallsPerDay, min: 1, max: 100000, step: 100 },
      ] as const).map(({ label, value, set, min, max, step }) => (
        <div key={label}>
          <div className="flex justify-between mb-1">
            <span className={`text-xs ${tw(dm,'muted')}`}>{label}</span>
            <span className="text-xs font-mono font-semibold">{value.toLocaleString()}</span>
          </div>
          <input type="range" min={min} max={max} step={step} value={value}
            onChange={e => set(Number(e.target.value))}
            className="w-full accent-sky-500" />
        </div>
      ))}
      <div className={`grid grid-cols-3 gap-3 p-4 rounded-xl ${tw(dm,'cardAlt')}`}>
        {[
          { label: 'Per call', value: `$${perCall < 0.001 ? perCall.toFixed(6) : perCall.toFixed(4)}` },
          { label: 'Per day', value: `$${daily.toFixed(2)}` },
          { label: 'Per month', value: `$${monthly.toFixed(2)}` },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-lg font-bold text-sky-500">{value}</div>
            <div className={`text-xs ${tw(dm,'muted')}`}>{label}</div>
          </div>
        ))}
      </div>
      <div className={`p-3 rounded-xl text-xs ${tw(dm,'section')} border ${tw(dm,'border')} space-y-1`}>
        <div className={`font-semibold ${tw(dm,'body')}`}>Model comparison at these settings</div>
        {(Object.keys(MODELS) as Array<keyof typeof MODELS>).map(k => {
          const mp = MODELS[k];
          const mc = ((inputTok / 1e6) * mp.inputPer1M + (outputTok / 1e6) * mp.outputPer1M) * callsPerDay * 30;
          return (
            <div key={k} className="flex justify-between">
              <span className={tw(dm,'muted')}>{MODELS[k].label}</span>
              <span className="font-mono font-semibold">${mc.toFixed(2)}/mo</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Interactive: Bad vs Good Prompts ──────────────────────────────────────────
function BadVsGoodPanel({ dm }: { dm: boolean }) {
  const [idx, setIdx] = useState(0);
  const c = promptComparisons[idx];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {promptComparisons.map((p, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i === idx ? 'bg-sky-600 text-white' : `${tw(dm,'body')} ${tw(dm,'card')} border ${tw(dm,'border')}`}`}>
            {p.title}
          </button>
        ))}
      </div>
      <div className={`text-xs ${tw(dm,'muted')}`}>Task: {c.task}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bad */}
        <div className="rounded-xl overflow-hidden border-2 border-red-500/40">
          <div className="flex items-center justify-between px-3 py-2 bg-red-500/10">
            <span className="text-xs font-bold text-red-500">❌ Inefficient — {c.bad.tokens} tokens</span>
          </div>
          <pre className={`p-3 text-xs font-mono whitespace-pre-wrap ${tw(dm,'body')}`}>{c.bad.prompt}</pre>
          <div className={`px-3 py-2 border-t ${tw(dm,'border')} ${tw(dm,'cardAlt')}`}>
            <div className={`text-xs font-semibold mb-1 text-red-500`}>Issues</div>
            {c.bad.issues.map((issue, i) => (
              <div key={i} className={`text-xs ${tw(dm,'muted')} flex gap-1`}>
                <span className="shrink-0">·</span>{issue}
              </div>
            ))}
          </div>
        </div>
        {/* Good */}
        <div className="rounded-xl overflow-hidden border-2 border-emerald-500/40">
          <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/10">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">✅ Optimized — {c.good.tokens} tokens</span>
          </div>
          <pre className={`p-3 text-xs font-mono whitespace-pre-wrap ${tw(dm,'body')}`}>{c.good.prompt}</pre>
          <div className={`px-3 py-2 border-t ${tw(dm,'border')} ${tw(dm,'cardAlt')}`}>
            <div className="text-xs font-semibold mb-1 text-emerald-600 dark:text-emerald-400">Why it works</div>
            {c.good.improvements.map((imp, i) => (
              <div key={i} className={`text-xs ${tw(dm,'muted')} flex gap-1`}>
                <span className="shrink-0 text-emerald-500">✓</span>{imp}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={`flex items-center justify-center gap-4 p-4 rounded-xl ${tw(dm,'cardAlt')}`}>
        <div className="text-center">
          <div className="text-3xl font-black text-emerald-500">{c.savings}%</div>
          <div className={`text-xs ${tw(dm,'muted')}`}>fewer tokens</div>
        </div>
        <div className={`text-sm ${tw(dm,'body')}`}>Same task · Same quality · {c.savings}% lower cost</div>
      </div>
    </div>
  );
}

// ── Interactive: Games ─────────────────────────────────────────────────────────
const TRIMMER_ORIGINAL = `You are an extremely helpful and knowledgeable AI assistant. Please analyze the following customer feedback very carefully and provide a detailed and thorough analysis. Please make sure to identify the main themes, determine the overall sentiment, and provide concrete actionable suggestions for improvement. Please also write a comprehensive executive summary of your findings. Be professional, detailed, and thorough in all your responses.

Customer feedback: {feedback}`;
const TRIMMER_TARGET = 38;
const REQUIRED_KW = ['analyz', 'feedback', 'theme', 'sentiment', 'improv', 'summar'];

const OVERFLOW_FACTS = [
  { id: 1, content: 'My name is Alex and I am a product manager.' },
  { id: 2, content: 'I work at a startup building developer tools.' },
  { id: 3, content: 'Our main product has 5,000 paying customers.' },
  { id: 4, content: 'We are planning to launch in Europe next quarter.' },
  { id: 5, content: 'Our biggest competitor just raised $50M.' },
  { id: 6, content: 'I prefer concise, bullet-pointed answers.' },
  { id: 7, content: 'Our tech stack is TypeScript, React, and Postgres.' },
  { id: 8, content: 'We have a 14-person engineering team.' },
];

function GamesPanel({ dm }: { dm: boolean }) {
  const [game, setGame] = useState<'trimmer' | 'overflow'>('trimmer');

  // Token Trimmer state
  const [edited, setEdited] = useState(TRIMMER_ORIGINAL);
  const origTokens = useMemo(() => approximateTokens(TRIMMER_ORIGINAL).length, []);
  const editTokens = useMemo(() => approximateTokens(edited).length, [edited]);
  const savings = Math.round(((origTokens - editTokens) / origTokens) * 100);
  const coverage = REQUIRED_KW.filter(kw => edited.toLowerCase().includes(kw)).length;
  const won = editTokens < TRIMMER_TARGET && coverage >= 5;

  // Context Overflow state
  const [visibleFacts, setVisibleFacts] = useState<number[]>([]);
  const OVERFLOW_BUDGET = 4;
  const evictedFacts = visibleFacts.length > OVERFLOW_BUDGET ? visibleFacts.slice(0, visibleFacts.length - OVERFLOW_BUDGET) : [];
  const activeFacts = visibleFacts.slice(-OVERFLOW_BUDGET);

  const addFact = (id: number) => {
    if (visibleFacts.includes(id)) return;
    setVisibleFacts(prev => [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['trimmer', 'overflow'] as const).map(g => (
          <button key={g} onClick={() => setGame(g)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${g === game ? 'bg-violet-600 text-white' : `${tw(dm,'body')} ${tw(dm,'card')} border ${tw(dm,'border')}`}`}>
            {g === 'trimmer' ? '✂️ Token Trimmer' : '🌊 Context Overflow'}
          </button>
        ))}
      </div>

      {game === 'trimmer' && (
        <div className="space-y-4">
          <div className={`p-3 rounded-xl text-sm ${tw(dm,'section')} border ${tw(dm,'border')}`}>
            <strong>Challenge:</strong> Reduce this bloated prompt below <strong>{TRIMMER_TARGET} tokens</strong> while keeping all {REQUIRED_KW.length} key concepts. Preserve: {REQUIRED_KW.map(k => `"${k}…"`).join(', ')}.
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className={`text-xs font-semibold mb-1 ${tw(dm,'muted')}`}>Original ({origTokens} tokens)</div>
              <pre className={`p-3 rounded-xl text-xs font-mono whitespace-pre-wrap border opacity-60 ${tw(dm,'cardAlt')} ${tw(dm,'border')}`}>{TRIMMER_ORIGINAL}</pre>
            </div>
            <div>
              <div className={`text-xs font-semibold mb-1 ${tw(dm,'muted')}`}>Your version ({editTokens} tokens)</div>
              <textarea value={edited} onChange={e => setEdited(e.target.value)} rows={8}
                className={`w-full rounded-xl p-3 text-xs font-mono border resize-none ${tw(dm,'input')} focus:outline-none focus:ring-2 focus:ring-violet-500`} />
            </div>
          </div>
          <div className={`p-3 rounded-xl ${tw(dm,'cardAlt')} grid grid-cols-2 lg:grid-cols-4 gap-3 text-center`}>
            <div>
              <div className={`text-lg font-bold ${editTokens < TRIMMER_TARGET ? 'text-emerald-500' : 'text-red-500'}`}>{editTokens}</div>
              <div className={`text-xs ${tw(dm,'muted')}`}>Current tokens (target: {TRIMMER_TARGET})</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${savings > 0 ? 'text-sky-500' : tw(dm,'muted')}`}>{savings}%</div>
              <div className={`text-xs ${tw(dm,'muted')}`}>Savings</div>
            </div>
            <div>
              <div className={`text-lg font-bold ${coverage >= 5 ? 'text-emerald-500' : 'text-amber-500'}`}>{coverage}/{REQUIRED_KW.length}</div>
              <div className={`text-xs ${tw(dm,'muted')}`}>Concepts kept</div>
            </div>
            <div className="flex items-center justify-center">
              {won ? (
                <div className="text-emerald-500 font-bold text-sm">🏆 Challenge complete!</div>
              ) : (
                <div className={`text-xs ${tw(dm,'muted')}`}>{editTokens >= TRIMMER_TARGET ? `${editTokens - TRIMMER_TARGET} tokens over target` : coverage < 5 ? 'Missing key concepts' : 'Almost there!'}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {game === 'overflow' && (
        <div className="space-y-4">
          <div className={`p-3 rounded-xl text-sm ${tw(dm,'section')} border ${tw(dm,'border')}`}>
            <strong>Demo:</strong> Add facts to the AI's context (budget: {OVERFLOW_BUDGET} facts). Watch what happens when the context fills — older facts get evicted.
          </div>
          <div className="grid grid-cols-2 gap-2">
            {OVERFLOW_FACTS.map(f => {
              const isActive = activeFacts.includes(f.id);
              const isEvicted = evictedFacts.includes(f.id);
              const isAdded = visibleFacts.includes(f.id);
              return (
                <button key={f.id} onClick={() => addFact(f.id)} disabled={isAdded}
                  className={`text-left p-3 rounded-xl text-xs border transition-all ${isEvicted ? 'opacity-30 line-through' : ''} ${isActive ? 'border-emerald-500/40 bg-emerald-500/10' : isAdded ? '' : `${tw(dm,'card')} ${tw(dm,'border')} hover:border-sky-500/40`}`}>
                  <span className="font-semibold mr-1">{isEvicted ? '❌' : isActive ? '✅' : isAdded ? '✅' : '📝'}</span>
                  {f.content}
                </button>
              );
            })}
          </div>
          <div className={`p-3 rounded-xl ${tw(dm,'cardAlt')}`}>
            <div className="flex justify-between text-xs mb-2">
              <span className={tw(dm,'muted')}>Context budget</span>
              <span className={visibleFacts.length > OVERFLOW_BUDGET ? 'text-red-500 font-semibold' : 'text-emerald-500'}>{Math.min(visibleFacts.length, OVERFLOW_BUDGET)}/{OVERFLOW_BUDGET} facts active</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${Math.min((visibleFacts.length / OVERFLOW_BUDGET) * 100, 100)}%`, background: visibleFacts.length > OVERFLOW_BUDGET ? '#ef4444' : '#10b981' }} />
            </div>
            {evictedFacts.length > 0 && (
              <div className="mt-2 text-xs text-red-500">⚠ {evictedFacts.length} fact{evictedFacts.length > 1 ? 's' : ''} evicted — the AI can no longer recall them</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Generic section content ────────────────────────────────────────────────────
function AnalogyCard({ analogy, detail, dm }: { analogy: string; detail: string; dm: boolean }) {
  return (
    <div className={`p-4 rounded-xl border-l-4 border-sky-500 ${tw(dm,'cardAlt')} mb-4`}>
      <div className="text-xs font-bold uppercase tracking-wider text-sky-500 mb-1">Analogy</div>
      <div className={`font-semibold text-sm mb-1 ${tw(dm,'heading')}`}>{analogy}</div>
      <div className={`text-sm ${tw(dm,'body')}`}>{detail}</div>
    </div>
  );
}

function SectionContent({ section, mode, dm }: { section: (typeof labSections)[0]; mode: LabMode; dm: boolean }) {
  const content = section.modeContent[mode];
  return (
    <div className="space-y-4">
      {mode === 'beginner' && <AnalogyCard analogy={section.analogy} detail={section.analogyDetail} dm={dm} />}
      <p className={`text-sm leading-relaxed ${tw(dm,'body')}`}>{content.overview}</p>
      <div className="space-y-2">
        {content.keyPoints.map((pt, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-sky-500 mt-0.5 shrink-0 text-sm">▸</span>
            <span className={`text-sm ${tw(dm,'body')}`}>{pt}</span>
          </div>
        ))}
      </div>
      {content.code && (
        <div className="rounded-xl overflow-hidden border border-slate-700">
          <div className={`px-3 py-1.5 text-xs font-semibold ${tw(dm,'muted')} bg-slate-800`}>Code</div>
          <pre className="bg-slate-900 text-emerald-400 text-xs p-4 overflow-x-auto font-mono leading-relaxed whitespace-pre">{content.code}</pre>
        </div>
      )}
      {content.callout && (
        <div className="rounded-xl p-4 border" style={{ borderColor: content.callout.color + '44', background: content.callout.color + '10' }}>
          <div className="flex items-center gap-2 mb-1">
            <span>{content.callout.icon}</span>
            <span className="text-sm font-bold" style={{ color: content.callout.color }}>{content.callout.title}</span>
          </div>
          <p className={`text-sm ${tw(dm,'body')}`}>{content.callout.body}</p>
        </div>
      )}
    </div>
  );
}

function SectionView({ section, mode, dm }: { section: (typeof labSections)[0]; mode: LabMode; dm: boolean }) {
  const groupMeta = LAB_GROUPS[section.group];
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="text-4xl">{section.emoji}</div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: groupMeta.color + '22', color: groupMeta.color }}>
              {LAB_GROUPS[section.group].label}
            </span>
            {section.interactiveType && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-violet-500/20 text-violet-400">LIVE</span>
            )}
          </div>
          <h2 className={`text-xl font-bold ${tw(dm,'heading')}`}>{section.title}</h2>
          <p className={`text-sm ${tw(dm,'muted')}`}>{section.tagline}</p>
        </div>
      </div>
      {section.interactiveType && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-violet-500 mb-4">Interactive Lab</div>
          {section.interactiveType === 'explosion'   && <TokenExplosionPanel dm={dm} />}
          {section.interactiveType === 'attention'   && <AttentionPanel dm={dm} />}
          {section.interactiveType === 'tokenizer'   && <TokenizerPanel dm={dm} />}
          {section.interactiveType === 'context-sim' && <ContextWindowPanel dm={dm} />}
          {section.interactiveType === 'cost-sim'    && <CostSimPanel dm={dm} />}
          {section.interactiveType === 'bad-vs-good' && <BadVsGoodPanel dm={dm} />}
          {section.interactiveType === 'games'       && <GamesPanel dm={dm} />}
        </div>
      )}
      <SectionContent section={section} mode={mode} dm={dm} />
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export function ContextLabPage() {
  const { darkMode } = useAppStore();
  const dm = darkMode;
  const [activeSection, setActiveSection] = useState<LabSectionId>('tokens');
  const [activeMode, setActiveMode] = useState<LabMode>('developer');

  const section = labSections.find(s => s.id === activeSection) ?? labSections[0];

  const grouped = useMemo(() => {
    const map: Partial<Record<LabSectionGroup, typeof labSections>> = {};
    for (const s of labSections) {
      if (!map[s.group]) map[s.group] = [];
      map[s.group]!.push(s);
    }
    return map;
  }, []);

  return (
    <div className={`flex h-full overflow-hidden ${tw(dm,'page')}`}>
      {/* Sidebar */}
      <aside className={`w-56 shrink-0 flex flex-col border-r overflow-y-auto ${tw(dm,'card')} ${tw(dm,'border')}`}>
        {/* Header */}
        <div className="p-3 border-b border-slate-700/30">
          <div className="text-sm font-bold text-sky-500">🧪 Context &amp; Token Lab</div>
          <div className={`text-xs ${tw(dm,'muted')}`}>Interactive LLM Internals</div>
        </div>

        {/* Mode selector */}
        <div className="p-2 border-b border-slate-700/30 space-y-1">
          <div className={`text-xs font-semibold uppercase tracking-wider px-1 mb-1 ${tw(dm,'muted')}`}>Learning Mode</div>
          {(Object.keys(LAB_MODES) as LabMode[]).map(m => {
            const meta = LAB_MODES[m];
            const isActive = m === activeMode;
            return (
              <button key={m} onClick={() => setActiveMode(m)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all ${isActive ? 'text-white font-semibold' : `${tw(dm,'body')} ${tw(dm,'hover')}`}`}
                style={isActive ? { background: meta.color } : {}}>
                <span className="mr-1">{meta.icon}</span>{meta.label}
              </button>
            );
          })}
        </div>

        {/* Section nav */}
        <div className="flex-1 p-2 space-y-3 overflow-y-auto">
          {GROUP_ORDER.map(group => {
            const sections = grouped[group];
            if (!sections?.length) return null;
            const meta = LAB_GROUPS[group];
            return (
              <div key={group}>
                <div className="text-xs font-bold uppercase tracking-wider px-1 mb-1" style={{ color: meta.color }}>
                  {meta.label}
                </div>
                {sections.map(s => (
                  <button key={s.id} onClick={() => setActiveSection(s.id)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${s.id === activeSection ? 'text-white font-semibold' : `${tw(dm,'body')} ${tw(dm,'hover')}`}`}
                    style={s.id === activeSection ? { background: meta.color } : {}}>
                    <span className="shrink-0">{s.emoji}</span>
                    <span className="flex-1 truncate">{s.title}</span>
                    {s.interactiveType && <span className="shrink-0 opacity-70 text-xs">⚡</span>}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer stat */}
        <div className={`p-3 border-t ${tw(dm,'border')}`}>
          <div className={`text-xs ${tw(dm,'muted')} text-center`}>20 sections · 5 modes · 7 live tools</div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div key={`${activeSection}-${activeMode}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}>
              {/* Mode badge */}
              <div className="flex items-center gap-2 mb-4">
                {(Object.keys(LAB_MODES) as LabMode[]).map(m => {
                  const meta = LAB_MODES[m];
                  const isActive = m === activeMode;
                  return (
                    <button key={m} onClick={() => setActiveMode(m)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
                      style={isActive ? { background: meta.color, color: 'white', borderColor: meta.color } : { borderColor: meta.color + '44', color: meta.color }}>
                      <span>{meta.icon}</span><span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
              <SectionView section={section} mode={activeMode} dm={dm} />
              {/* Nav arrows */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/30">
                {(() => {
                  const i = labSections.findIndex(s => s.id === activeSection);
                  const prev = labSections[i - 1];
                  const next = labSections[i + 1];
                  return (
                    <>
                      {prev ? (
                        <button onClick={() => setActiveSection(prev.id)}
                          className={`flex items-center gap-2 text-sm ${tw(dm,'muted')} hover:text-sky-500 transition-colors`}>
                          <ChevronRight size={14} className="rotate-180" />{prev.emoji} {prev.title}
                        </button>
                      ) : <div />}
                      {next ? (
                        <button onClick={() => setActiveSection(next.id)}
                          className={`flex items-center gap-2 text-sm ${tw(dm,'muted')} hover:text-sky-500 transition-colors`}>
                          {next.emoji} {next.title}<ChevronRight size={14} />
                        </button>
                      ) : <div />}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
