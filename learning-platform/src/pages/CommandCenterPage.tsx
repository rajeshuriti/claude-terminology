import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { CmdMode, CmdSectionId, CmdSectionGroup } from '@/data/commandCenterData';
import {
  cmdSections, CMD_MODES, CMD_GROUPS, CMD_GROUP_ORDER,
  REASONING_MODES, PROMPT_PATTERNS, AGENT_TOPOLOGIES,
  WORKFLOW_PATTERNS, REAL_VS_FAKE,
} from '@/data/commandCenterData';
import { TerminalSimulator } from '@/pages/CheatSheetPage';
import { tw } from '@/lib/dm';

// ── Claude Internal Thinking Pipeline ─────────────────────────────────────────
const THINKING_STEPS = [
  { id: 't1', emoji: '⌨️', label: 'User Input',       color: '#3b82f6', tokens: '+15',    desc: 'Command received from terminal or script', detail: 'claude -p "fix the JWT auth bug in src/api/auth.ts"' },
  { id: 't2', emoji: '📋', label: 'Context Assembly', color: '#8b5cf6', tokens: '+2,765', desc: 'CLAUDE.md + session history + /add\'d files assembled into a single token sequence', detail: 'CLAUDE.md: 450 tok\nSession history: 2,300 tok\nUser message: 15 tok\nTotal assembled: 2,765 tokens' },
  { id: 't3', emoji: '🔢', label: 'Token Encoding',   color: '#f59e0b', tokens: 'fixed',   desc: 'Text → integer token IDs via BPE vocabulary (~100K tokens)', detail: '"fix" → 5120\n"JWT" → 41, 11156\n"auth" → 18439\n"bug" → 12516\n... 2,765 total IDs' },
  { id: 't4', emoji: '🧠', label: 'Transformer',      color: '#f97316', tokens: 'O(n²)',   desc: 'Each of the 2,765 tokens attends to all others across 96 layers', detail: 'Attention pairs: 2,765² = 7.6M\nMulti-head: 96 heads × 128 dim\nKey insight: later tokens see all earlier tokens' },
  { id: 't5', emoji: '🔌', label: 'Tool Decision',    color: '#ec4899', tokens: '~200',    desc: 'Model decides: answer directly, or call a tool first?', detail: 'stop_reason: "tool_use"\n{\n  "type": "tool_use",\n  "name": "filesystem",\n  "input": { "path": "src/api/auth.ts", "op": "read" }\n}' },
  { id: 't6', emoji: '⚡', label: 'Tool Execution',   color: '#10b981', tokens: '+3,200',  desc: 'Filesystem MCP reads auth.ts — 3,200 tokens injected into context', detail: 'Context now: 5,965 tokens\nTool result: auth.ts contents (120 lines)\nModel re-attends to full expanded context' },
  { id: 't7', emoji: '✓',  label: 'end_turn',         color: '#3b82f6', tokens: '~450',    desc: 'Model generates the fix token-by-token, stops at end_turn', detail: 'Output: 450 tokens\nContent: diff with JWT fix + explanation\nstop_reason: "end_turn"\nTotal cost: 6,415 input + 450 output' },
];

function ClaudeThinkingFlow({ dm }: { dm: boolean }) {
  const [active, setActive] = useState<string>('t1');
  const [playing, setPlaying] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentStep = THINKING_STEPS.find(s => s.id === active) ?? THINKING_STEPS[0];

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setStepIdx(i => {
        const next = i + 1;
        if (next >= THINKING_STEPS.length) { setPlaying(false); return i; }
        setActive(THINKING_STEPS[next].id);
        return next;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);

  const reset = () => { setPlaying(false); setStepIdx(0); setActive('t1'); if (timerRef.current) clearInterval(timerRef.current); };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <button onClick={() => { reset(); setTimeout(() => setPlaying(true), 50); }} disabled={playing}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${playing ? 'opacity-50 cursor-not-allowed bg-slate-700 text-slate-400' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}>
          {playing ? '▶ Processing...' : '▶ Animate Pipeline'}
        </button>
        <button onClick={reset} className={`px-3 py-2 rounded-xl text-xs ${tw(dm,'card')} border ${tw(dm,'border')} ${tw(dm,'body')}`}>↺</button>
        <span className={`text-xs ${tw(dm,'muted')}`}>Click any step to inspect</span>
      </div>
      <div className="flex flex-wrap gap-1.5 items-center">
        {THINKING_STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <button onClick={() => { setActive(s.id); setStepIdx(i); }}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${s.id === active ? 'text-white border-transparent' : `${tw(dm,'body')} ${tw(dm,'border')} ${tw(dm,'hover')}`}`}
              style={s.id === active ? { background: s.color, borderColor: s.color } : {}}>
              <span>{s.emoji}</span><span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < THINKING_STEPS.length - 1 && <ChevronRight size={10} className={tw(dm,'muted')} />}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border p-4" style={{ borderColor: currentStep.color + '44', background: currentStep.color + '08' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{currentStep.emoji}</span>
            <div>
              <div className="font-bold text-sm" style={{ color: currentStep.color }}>{currentStep.label}</div>
              <div className={`text-xs ${tw(dm,'muted')}`}>Tokens: {currentStep.tokens}</div>
            </div>
          </div>
          <p className={`text-xs ${tw(dm,'body')} leading-relaxed`}>{currentStep.desc}</p>
        </div>
        <div className="rounded-xl overflow-hidden border border-slate-700">
          <div className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-400">Internal state</div>
          <pre className="bg-slate-900 text-emerald-400 text-xs p-3 leading-relaxed whitespace-pre-wrap font-mono">{currentStep.detail}</pre>
        </div>
      </div>
      <div className={`p-3 rounded-xl text-xs ${tw(dm,'cardAlt')} border ${tw(dm,'border')}`}>
        <div className="flex gap-6 justify-center">
          {[
            { label: 'Input tokens',  value: stepIdx >= 1 ? '2,765' : stepIdx >= 0 ? '15' : '0',    color: '#3b82f6' },
            { label: 'Context total', value: stepIdx >= 5 ? '5,965' : stepIdx >= 1 ? '2,765' : '0', color: '#8b5cf6' },
            { label: 'Output tokens', value: stepIdx >= 6 ? '450'   : '0',                           color: '#10b981' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className="text-base font-black" style={{ color }}>{value}</div>
              <div className={tw(dm,'muted')}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Reasoning Mode Browser ─────────────────────────────────────────────────────
function ReasoningModeBrowser({ dm }: { dm: boolean }) {
  const [active, setActive] = useState(REASONING_MODES[0].id);
  const mode = REASONING_MODES.find(m => m.id === active) ?? REASONING_MODES[0];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {REASONING_MODES.map(m => (
          <button key={m.id} onClick={() => setActive(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${m.id === active ? 'text-white border-transparent' : `${tw(dm,'body')} ${tw(dm,'border')} ${tw(dm,'hover')}`}`}
            style={m.id === active ? { background: m.color } : {}}>
            <span>{m.emoji}</span>{m.name}
          </button>
        ))}
      </div>
      <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: mode.color + '44', background: mode.color + '08' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{mode.emoji}</span>
            <div>
              <div className="font-bold text-sm font-mono" style={{ color: mode.color }}>{mode.name}</div>
              <div className={`text-xs ${tw(dm,'muted')}`}>Cost multiplier: {mode.costMultiplier}</div>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded font-mono font-bold" style={{ background: mode.color + '22', color: mode.color }}>trigger</span>
        </div>
        <div className={`text-xs rounded-lg p-2 font-mono border ${tw(dm,'border')} ${tw(dm,'cardAlt')}`}>{mode.trigger}</div>
        <p className={`text-xs ${tw(dm,'body')} leading-relaxed`}>{mode.description}</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-semibold text-sky-500 mb-1">When to use</div>
            <p className={`text-xs ${tw(dm,'body')}`}>{mode.whenToUse}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-500 mb-1">Example</div>
            <p className={`text-xs font-mono ${tw(dm,'body')}`}>{mode.example}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Prompt Pattern Explorer ────────────────────────────────────────────────────
function PromptPatternExplorer({ dm }: { dm: boolean }) {
  const [active, setActive] = useState(PROMPT_PATTERNS[0].id);
  const pat = PROMPT_PATTERNS.find(p => p.id === active) ?? PROMPT_PATTERNS[0];
  const CAT_COLORS: Record<string, string> = { structure: '#3b82f6', reasoning: '#8b5cf6', output: '#10b981', context: '#f59e0b', constraint: '#ef4444' };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PROMPT_PATTERNS.map(p => (
          <button key={p.id} onClick={() => setActive(p.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${p.id === active ? 'text-white border-transparent' : `${tw(dm,'body')} ${tw(dm,'border')} ${tw(dm,'hover')}`}`}
            style={p.id === active ? { background: CAT_COLORS[p.category] } : {}}>
            <span>{p.emoji}</span>{p.name}
          </button>
        ))}
      </div>
      <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{pat.emoji}</span>
          <div>
            <div className={`font-bold text-sm ${tw(dm,'heading')}`}>{pat.name}</div>
            <span className="text-xs px-1.5 py-0.5 rounded capitalize font-medium" style={{ background: CAT_COLORS[pat.category] + '22', color: CAT_COLORS[pat.category] }}>{pat.category}</span>
          </div>
          {pat.tokenSavings && <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-500">{pat.tokenSavings}</span>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-bold text-red-500 mb-1">❌ Before</div>
            <pre className={`text-xs font-mono p-3 rounded-xl bg-red-500/5 border border-red-500/20 whitespace-pre-wrap ${tw(dm,'body')}`}>{pat.before}</pre>
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-500 mb-1">✅ After</div>
            <pre className={`text-xs font-mono p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 whitespace-pre-wrap ${tw(dm,'body')}`}>{pat.after}</pre>
          </div>
        </div>
        <div className={`mt-3 pt-3 border-t ${tw(dm,'border')} text-xs ${tw(dm,'body')}`}>
          <span className="font-semibold text-sky-500">Why it works: </span>{pat.improvement}
        </div>
      </div>
    </div>
  );
}

// ── Agent Topology Map ─────────────────────────────────────────────────────────
const RISK_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

function AgentTopologyMap({ dm }: { dm: boolean }) {
  const [active, setActive] = useState(AGENT_TOPOLOGIES[0].id);
  const topo = AGENT_TOPOLOGIES.find(t => t.id === active) ?? AGENT_TOPOLOGIES[0];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {AGENT_TOPOLOGIES.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className={`text-left rounded-xl border p-3 transition-all ${t.id === active ? 'border-violet-500/60 bg-violet-500/5' : `${tw(dm,'border')} ${tw(dm,'hover')}`}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{t.emoji}</span>
              <span className={`text-xs font-semibold ${tw(dm,'body')}`}>{t.name}</span>
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded capitalize font-bold" style={{ background: RISK_COLORS[t.riskLevel] + '22', color: RISK_COLORS[t.riskLevel] }}>{t.riskLevel}</span>
            </div>
            <div className={`text-xs ${tw(dm,'muted')}`}>{t.tokenCost}</div>
          </button>
        ))}
      </div>
      <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{topo.emoji}</span>
          <div className={`font-bold ${tw(dm,'heading')}`}>{topo.name}</div>
        </div>
        <p className={`text-xs ${tw(dm,'body')} mb-3`}>{topo.description}</p>
        <div className={`font-mono text-xs p-3 rounded-xl bg-slate-900 text-emerald-400 mb-3`}>{topo.structure}</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
          <div>
            <div className="font-semibold text-sky-500 mb-1">Best for</div>
            <div className={tw(dm,'body')}>{topo.bestFor}</div>
          </div>
          <div>
            <div className="font-semibold text-amber-500 mb-1">Token cost</div>
            <div className="font-mono" style={{ color: RISK_COLORS[topo.riskLevel] }}>{topo.tokenCost}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Workflow Pattern Map ───────────────────────────────────────────────────────
function WorkflowPatternMap({ dm }: { dm: boolean }) {
  const [active, setActive] = useState(WORKFLOW_PATTERNS[0].id);
  const [expanded, setExpanded] = useState<number | null>(null);
  const pat = WORKFLOW_PATTERNS.find(p => p.id === active) ?? WORKFLOW_PATTERNS[0];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {WORKFLOW_PATTERNS.map(p => (
          <button key={p.id} onClick={() => { setActive(p.id); setExpanded(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${p.id === active ? 'bg-amber-500 text-white border-amber-500' : `${tw(dm,'body')} ${tw(dm,'border')} ${tw(dm,'hover')}`}`}>
            <span>{p.emoji}</span>{p.name}
          </button>
        ))}
      </div>
      <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{pat.emoji}</span>
          <div className={`font-bold ${tw(dm,'heading')}`}>{pat.name}</div>
        </div>
        <p className={`text-xs ${tw(dm,'body')} mb-3`}>{pat.description}</p>
        <div className="space-y-2 mb-3">
          {pat.steps.map((step, i) => (
            <button key={i} onClick={() => setExpanded(expanded === i ? null : i)}
              className={`w-full text-left flex items-start gap-2 px-3 py-2 rounded-lg text-xs transition-all border ${expanded === i ? 'border-amber-500/40 bg-amber-500/5' : `${tw(dm,'border')} ${tw(dm,'hover')}`}`}>
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</span>
              <span className={tw(dm,'body')}>{step}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs">
          <div>
            <div className="font-semibold text-emerald-500 mb-1">Use case</div>
            <div className={tw(dm,'body')}>{pat.useCase}</div>
          </div>
          <div>
            <div className="font-semibold text-red-500 mb-1">⚠ Pitfall</div>
            <div className={tw(dm,'body')}>{pat.pitfall}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Token Economics Simulator ─────────────────────────────────────────────────
function TokenEconomicsSim({ dm }: { dm: boolean }) {
  const [agents, setAgents] = useState(3);
  const [retries, setRetries] = useState(2);
  const [ctxKb, setCtxKb] = useState(8);
  const [sessPerDay, setSessPerDay] = useState(500);
  const [model, setModel] = useState<'haiku' | 'sonnet' | 'opus'>('sonnet');
  const PRICES: Record<string, number> = { haiku: 0.8, sonnet: 3.0, opus: 15.0 };
  const base = ctxKb * 250;
  const retry = retries * base;
  const perSess = (base + retry) * agents;
  const dailyTok = perSess * sessPerDay;
  const cost = (dailyTok / 1e6) * PRICES[model];
  const isCrazy = dailyTok > 5_000_000;
  const bars = [
    { label: 'Base context',  v: base * agents * sessPerDay,  c: '#3b82f6' },
    { label: 'Retry overhead', v: retry * agents * sessPerDay, c: '#ef4444' },
  ];
  const maxB = Math.max(...bars.map(b => b.v), 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['haiku', 'sonnet', 'opus'] as const).map(m => (
          <button key={m} onClick={() => setModel(m)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border transition-all ${m === model ? 'text-white border-transparent' : `${tw(dm,'body')} ${tw(dm,'border')}`}`}
            style={m === model ? { background: m === 'haiku' ? '#10b981' : m === 'sonnet' ? '#3b82f6' : '#8b5cf6' } : {}}>
            {m} (${PRICES[m]}/1M)
          </button>
        ))}
      </div>
      {[
        { l: 'Agents', v: agents, s: setAgents, min: 1, max: 10 },
        { l: 'Retries/task', v: retries, s: setRetries, min: 0, max: 10 },
        { l: 'Context (KB)', v: ctxKb, s: setCtxKb, min: 1, max: 200 },
        { l: 'Sessions/day', v: sessPerDay, s: setSessPerDay, min: 10, max: 10000, step: 10 },
      ].map(({ l, v, s, min, max, step }) => (
        <div key={l}>
          <div className="flex justify-between mb-1 text-xs">
            <span className={tw(dm,'muted')}>{l}</span>
            <span className="font-mono font-bold">{v.toLocaleString()}</span>
          </div>
          <input type="range" min={min} max={max} step={step ?? 1} value={v}
            onChange={e => s(Number(e.target.value))} className="w-full accent-violet-500" />
        </div>
      ))}
      <div className="space-y-2">
        {bars.map(b => (
          <div key={b.label} className="flex items-center gap-3">
            <div className="text-xs w-28 shrink-0" style={{ color: b.c }}>{b.label}</div>
            <div className="flex-1 h-3 rounded overflow-hidden bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded transition-all" style={{ width: `${(b.v / maxB) * 100}%`, background: b.c }} />
            </div>
            <div className="text-xs font-mono w-16 text-right" style={{ color: b.c }}>{(b.v / 1000).toFixed(0)}K</div>
          </div>
        ))}
      </div>
      <div className={`grid grid-cols-3 gap-3 p-3 rounded-xl ${tw(dm,'cardAlt')}`}>
        <div className="text-center">
          <div className={`text-lg font-black ${isCrazy ? 'text-red-500' : 'text-violet-500'}`}>{(dailyTok / 1e6).toFixed(1)}M</div>
          <div className={`text-xs ${tw(dm,'muted')}`}>tokens/day</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-black ${cost > 50 ? 'text-red-500' : 'text-amber-500'}`}>${cost.toFixed(2)}</div>
          <div className={`text-xs ${tw(dm,'muted')}`}>$/day</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-black ${cost * 30 > 500 ? 'text-red-500' : 'text-amber-500'}`}>${(cost * 30 / 1000).toFixed(1)}K</div>
          <div className={`text-xs ${tw(dm,'muted')}`}>$/month</div>
        </div>
      </div>
      {isCrazy && <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-500">⚠ {(dailyTok / 1e6).toFixed(0)}M tokens/day — add model routing and caching before this goes to production</div>}
    </div>
  );
}

// ── Multi-Simulator Panel ──────────────────────────────────────────────────────
type SimTab = 'terminal' | 'tokens' | 'overflow' | 'optimizer' | 'loop';
const SIM_TABS: Array<{ id: SimTab; emoji: string; label: string; color: string }> = [
  { id: 'terminal',  emoji: '💻', label: 'Terminal',         color: '#3b82f6' },
  { id: 'tokens',    emoji: '💥', label: 'Token Explosion',  color: '#ef4444' },
  { id: 'overflow',  emoji: '🌊', label: 'Context Overflow', color: '#f97316' },
  { id: 'optimizer', emoji: '✂️',  label: 'Prompt Optimizer', color: '#10b981' },
  { id: 'loop',      emoji: '🔁', label: 'Agent Loop',       color: '#8b5cf6' },
];

type OvMsg = { role: 'system' | 'user' | 'assistant'; content: string; tokens: number };
const OV_SYSTEM: OvMsg = { role: 'system', content: 'You are a helpful assistant. Always be concise.', tokens: 12 };
const OV_MAX = 512;
const OV_BOTS = ['Got it!', 'Understood.', 'Noted — thanks.', 'I see, thanks for sharing.', 'Acknowledged!'];

function ContextOverflowDemo({ dm }: { dm: boolean }) {
  const [msgs, setMsgs] = useState<OvMsg[]>([OV_SYSTEM]);
  const [input, setInput] = useState('');
  const [evicted, setEvicted] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [msgs]);

  const totalTokens = msgs.reduce((s, m) => s + m.tokens, 0);
  const fillPct = Math.min((totalTokens / OV_MAX) * 100, 100);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: OvMsg = { role: 'user', content: input, tokens: Math.ceil(input.length / 4) + 2 };
    const botReply = OV_BOTS[msgs.length % OV_BOTS.length];
    const botMsg: OvMsg = { role: 'assistant', content: botReply, tokens: Math.ceil(botReply.length / 4) + 2 };
    let newMsgs = [...msgs, userMsg, botMsg];
    let evictCount = evicted;
    while (newMsgs.reduce((s, m) => s + m.tokens, 0) > OV_MAX * 0.88 && newMsgs.length > 2) {
      newMsgs = [newMsgs[0], ...newMsgs.slice(2)];
      evictCount++;
    }
    setMsgs(newMsgs);
    setEvicted(evictCount);
    setInput('');
  };

  return (
    <div className="space-y-3">
      <div ref={listRef} className={`h-40 overflow-y-auto rounded-xl border ${tw(dm,'border')} ${tw(dm,'card')} p-2 space-y-1`}>
        {msgs.map((m, i) => (
          <div key={i} className={`text-xs rounded-lg px-2 py-1 max-w-xs ${m.role === 'user' ? 'ml-auto bg-sky-600 text-white' : m.role === 'system' ? 'bg-violet-900/40 text-violet-300 text-xs' : `${tw(dm,'cardAlt')} ${tw(dm,'body')}`}`}>
            {m.content} <span className="opacity-50">({m.tokens}t)</span>
          </div>
        ))}
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className={tw(dm,'muted')}>Context: {totalTokens}/{OV_MAX} tokens</span>
          {evicted > 0 && <span className="text-amber-500 font-bold">⚠ {evicted} messages evicted</span>}
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
          <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, background: fillPct > 80 ? '#ef4444' : fillPct > 60 ? '#f59e0b' : '#10b981' }} />
        </div>
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..." className={`flex-1 px-3 py-1.5 text-xs rounded-lg border ${tw(dm,'input')} focus:outline-none`} />
        <button onClick={send} className="px-3 py-1.5 text-xs rounded-lg bg-sky-600 text-white">Send</button>
        <button onClick={() => { setMsgs([OV_SYSTEM]); setEvicted(0); }} className={`px-3 py-1.5 text-xs rounded-lg border ${tw(dm,'border')} ${tw(dm,'body')}`}>Reset</button>
      </div>
      <div className={`text-xs p-2 rounded-xl border ${tw(dm,'border')} ${tw(dm,'muted')}`}>
        <strong className="text-sky-500">Key insight:</strong> When context fills, the OLDEST messages are evicted first — not the least important. Design workflows to stay under 80% context fill.
      </div>
    </div>
  );
}

const BLOATED_PROMPT = `You are an extremely helpful and knowledgeable AI assistant with deep expertise. Please analyze the following error message very carefully and thoroughly. Take your time to understand all aspects of the problem. Identify the root cause, explain the issue in detail, and provide comprehensive step-by-step instructions to fix it. Make sure to be thorough and professional.\n\nError: \${'{error_message}'}`;
const REQUIRED_KW = ['analyz', 'error', 'root cause', 'fix'];

function PromptOptimizerSim({ dm }: { dm: boolean }) {
  const [edited, setEdited] = useState(BLOATED_PROMPT);
  const origTok = Math.ceil(BLOATED_PROMPT.length / 4);
  const editTok = Math.ceil(edited.length / 4);
  const saved = Math.max(0, origTok - editTok);
  const coverage = REQUIRED_KW.filter(k => edited.toLowerCase().includes(k)).length;
  const won = saved >= Math.floor(origTok * 0.45) && coverage >= 3;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
        <div className={`p-2 rounded-lg text-center border ${tw(dm,'border')}`}>
          <div className="font-black text-red-500">{origTok}</div><div className={tw(dm,'muted')}>original tok</div>
        </div>
        <div className={`p-2 rounded-lg text-center border ${tw(dm,'border')}`}>
          <div className={`font-black ${saved > 0 ? 'text-emerald-500' : tw(dm,'body')}`}>{editTok}</div><div className={tw(dm,'muted')}>current tok</div>
        </div>
        <div className={`p-2 rounded-lg text-center border ${tw(dm,'border')}`}>
          <div className={`font-black ${saved > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>-{saved} ({saved > 0 ? Math.round((saved/origTok)*100) : 0}%)</div><div className={tw(dm,'muted')}>saved</div>
        </div>
      </div>
      <textarea value={edited} onChange={e => setEdited(e.target.value)} rows={6}
        className={`w-full text-xs font-mono p-3 rounded-xl border ${tw(dm,'input')} resize-none focus:outline-none focus:ring-2 focus:ring-sky-500`} />
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className={`p-2 rounded-lg border ${tw(dm,'border')}`}>
          <div className={`text-lg font-black ${coverage >= 3 ? 'text-emerald-500' : 'text-amber-500'}`}>{coverage}/{REQUIRED_KW.length}</div>
          <div className={tw(dm,'muted')}>key concepts kept</div>
        </div>
        <div className="flex items-center justify-center">
          {won
            ? <span className="text-emerald-500 font-bold text-xs">🏆 Optimized! (-45%+ tokens, concepts kept)</span>
            : <span className={`text-xs ${tw(dm,'muted')}`}>{saved < Math.floor(origTok * 0.45) ? 'Cut more — target -45% tokens' : 'Missing key concepts'}</span>
          }
        </div>
      </div>
    </div>
  );
}

type LoopEvt = { t: number; text: string; sev: 'ok' | 'warn' | 'error' | 'crit' };
const LOOP_EVENTS: LoopEvt[] = [
  { t: 0,    sev: 'ok',    text: '⬤ Task: "Debug the production auth failure"' },
  { t: 600,  sev: 'ok',    text: '⬤ Agent reads logs — 3 errors found' },
  { t: 1200, sev: 'ok',    text: '⬤ Asks for more context: "Can you share the stack trace?"' },
  { t: 1800, sev: 'warn',  text: '⚠ Stack trace retrieved — 500 lines injected (8,000 tok)' },
  { t: 2400, sev: 'warn',  text: '⚠ Agent requests deployment history — injecting...' },
  { t: 3000, sev: 'warn',  text: '⚠ Context 71% full — still no root cause identified' },
  { t: 3600, sev: 'error', text: '✗ Agent: "I need more logs to be certain" → fetches more' },
  { t: 4200, sev: 'error', text: '✗ New logs injected — context 89%' },
  { t: 4800, sev: 'error', text: '✗ Agent re-analyzes — asks for metrics endpoint data' },
  { t: 5400, sev: 'crit',  text: '🚨 Context 97% — system prompt EVICTED' },
  { t: 6000, sev: 'crit',  text: '🚨 Agent forgets task constraints, requests full DB dump' },
  { t: 6600, sev: 'crit',  text: '🚨 LOOP DETECTED: Same analysis repeated for 3rd time' },
  { t: 7200, sev: 'crit',  text: '🚨 ABORT — 180K tokens consumed, task incomplete, $0.54 spent' },
];
const LOOP_TOK_GROWTH = [0, 500, 3000, 12000, 18000, 45000, 68000, 92000, 115000, 142000, 158000, 174000, 180000];

function AgentLoopSim({ dm }: { dm: boolean }) {
  const [events, setEvents] = useState<LoopEvt[]>([]);
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setStep(s => {
        if (s >= LOOP_EVENTS.length - 1) { setRunning(false); return s; }
        setEvents(prev => [...prev, LOOP_EVENTS[s + 1]]);
        return s + 1;
      });
    }, 700);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [events]);
  const reset = () => { setRunning(false); setEvents([]); setStep(-1); if (timerRef.current) clearInterval(timerRef.current); };
  const sev2c = (s: LoopEvt['sev']) => ({ ok: '#10b981', warn: '#f59e0b', error: '#f97316', crit: '#ef4444' }[s]);
  const tok = LOOP_TOK_GROWTH[Math.min(step + 1, LOOP_TOK_GROWTH.length - 1)];
  const pct = Math.min((tok / 180000) * 100, 100);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onClick={() => { reset(); setTimeout(() => { setEvents([LOOP_EVENTS[0]]); setRunning(true); setStep(0); }, 50); }} disabled={running}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${running ? 'opacity-50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
          {running ? '⚡ Running...' : '▶ Start Loop'}
        </button>
        <button onClick={reset} className={`px-3 py-2 rounded-xl text-xs ${tw(dm,'card')} border ${tw(dm,'border')} ${tw(dm,'body')}`}>↺</button>
      </div>
      <div ref={logRef} className={`rounded-xl border ${tw(dm,'border')} ${tw(dm,'card')} h-40 overflow-y-auto p-2 space-y-0.5 font-mono text-xs`}>
        {events.length === 0 && <div className={tw(dm,'muted')}>Click "Start Loop" to watch the agent spiral...</div>}
        {events.map((e, i) => <div key={i} style={{ color: sev2c(e.sev) }}>{e.text}</div>)}
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className={tw(dm,'muted')}>Context usage</span>
          <span className="font-mono" style={{ color: pct > 80 ? '#ef4444' : '#f59e0b' }}>{tok.toLocaleString()} / 200K</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct > 80 ? '#ef4444' : '#f59e0b' }} />
        </div>
      </div>
      <div className={`text-xs ${tw(dm,'muted')} p-2 rounded-xl border ${tw(dm,'border')}`}>
        <strong className="text-sky-500">Fix:</strong> Set max_steps=10, stop when no new information is found, /clear between unrelated tasks.
      </div>
    </div>
  );
}

function TokenExplosionPanel({ dm }: { dm: boolean }) {
  const [agents, setAgents] = useState(3);
  const [retries, setRetries] = useState(2);
  const [ctxKb, setCtxKb] = useState(8);
  const [sessPerDay, setSessPerDay] = useState(500);
  const base = ctxKb * 250;
  const retry = retries * base;
  const perSess = (base + retry) * agents;
  const dailyTok = perSess * sessPerDay;
  const cost = (dailyTok / 1e6) * 3.0;
  const isCrazy = dailyTok > 5_000_000;
  const bars = [
    { label: 'Base context',  v: base * agents * sessPerDay,  c: '#3b82f6' },
    { label: 'Retry overhead', v: retry * agents * sessPerDay, c: '#ef4444' },
  ];
  const maxB = Math.max(...bars.map(b => b.v), 1);

  return (
    <div className="space-y-4">
      {[
        { l: 'Agents', v: agents, s: setAgents, min: 1, max: 10 },
        { l: 'Retries/task', v: retries, s: setRetries, min: 0, max: 10 },
        { l: 'Context (KB)', v: ctxKb, s: setCtxKb, min: 1, max: 200 },
        { l: 'Sessions/day', v: sessPerDay, s: setSessPerDay, min: 10, max: 10000, step: 10 },
      ].map(({ l, v, s, min, max, step }) => (
        <div key={l}>
          <div className="flex justify-between mb-1 text-xs">
            <span className={tw(dm,'muted')}>{l}</span>
            <span className="font-mono font-bold">{v.toLocaleString()}</span>
          </div>
          <input type="range" min={min} max={max} step={step ?? 1} value={v}
            onChange={e => s(Number(e.target.value))} className="w-full accent-red-500" />
        </div>
      ))}
      <div className="space-y-2">
        {bars.map(b => (
          <div key={b.label} className="flex items-center gap-3">
            <div className="text-xs w-28 shrink-0" style={{ color: b.c }}>{b.label}</div>
            <div className="flex-1 h-3 rounded overflow-hidden bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded transition-all" style={{ width: `${(b.v / maxB) * 100}%`, background: b.c }} />
            </div>
            <div className="text-xs font-mono w-16 text-right" style={{ color: b.c }}>{(b.v / 1000).toFixed(0)}K</div>
          </div>
        ))}
      </div>
      <div className={`grid grid-cols-3 gap-3 p-3 rounded-xl ${tw(dm,'cardAlt')}`}>
        <div className="text-center">
          <div className={`text-lg font-black ${isCrazy ? 'text-red-500' : 'text-amber-500'}`}>{(dailyTok / 1e6).toFixed(1)}M</div>
          <div className={`text-xs ${tw(dm,'muted')}`}>tokens/day</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-black ${cost > 50 ? 'text-red-500' : 'text-orange-500'}`}>${cost.toFixed(2)}</div>
          <div className={`text-xs ${tw(dm,'muted')}`}>$/day</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-black ${cost * 30 > 500 ? 'text-red-500' : 'text-orange-500'}`}>${(cost * 30 / 1000).toFixed(1)}K</div>
          <div className={`text-xs ${tw(dm,'muted')}`}>$/month</div>
        </div>
      </div>
      {isCrazy && <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-500">⚠ {(dailyTok / 1e6).toFixed(0)}M tokens/day — this workflow needs a token budget before production</div>}
    </div>
  );
}

function MultiSimulatorPanel({ dm }: { dm: boolean }) {
  const [tab, setTab] = useState<SimTab>('terminal');
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SIM_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${t.id === tab ? 'text-white border-transparent' : `${tw(dm,'body')} ${tw(dm,'border')} ${tw(dm,'hover')}`}`}
            style={t.id === tab ? { background: t.color } : {}}>
            <span>{t.emoji}</span><span>{t.label}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {tab === 'terminal'  && <TerminalSimulator dm={dm} />}
          {tab === 'tokens'    && <TokenExplosionPanel dm={dm} />}
          {tab === 'overflow'  && <ContextOverflowDemo dm={dm} />}
          {tab === 'optimizer' && <PromptOptimizerSim dm={dm} />}
          {tab === 'loop'      && <AgentLoopSim dm={dm} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Real vs Fake Panel ─────────────────────────────────────────────────────────
function RealVsFakePanel({ dm }: { dm: boolean }) {
  const [idx, setIdx] = useState(0);
  const item = REAL_VS_FAKE[idx];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {REAL_VS_FAKE.map((r, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${i === idx ? 'bg-sky-600 text-white border-sky-600' : `${tw(dm,'body')} ${tw(dm,'border')} ${tw(dm,'hover')}`}`}>
            {r.scenario.length > 22 ? r.scenario.slice(0, 22) + '…' : r.scenario}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[item.real, item.fake].map(side => (
          <div key={side.label} className={`rounded-xl border-2 overflow-hidden ${side.icon === '✅' ? 'border-emerald-500/40' : 'border-red-500/40'}`}>
            <div className={`px-3 py-2 text-xs font-bold ${side.icon === '✅' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
              {side.icon} {side.label}
            </div>
            <pre className={`p-3 text-xs font-mono whitespace-pre-wrap ${tw(dm,'body')} bg-slate-900`}>{side.code}</pre>
            <div className={`px-3 py-2 text-xs border-t ${tw(dm,'border')} ${side.icon === '✅' ? 'text-emerald-600 dark:text-emerald-400' : tw(dm,'muted')}`}>
              → {side.result}
            </div>
          </div>
        ))}
      </div>
      <div className={`p-3 rounded-xl text-xs ${tw(dm,'section')} border ${tw(dm,'border')}`}>
        <strong className="text-sky-500">Scenario: </strong>
        <span className={tw(dm,'body')}>{item.scenario} — AI genuinely accelerates when you give it specific context and bounded tasks. It creates theater when treated as a magic oracle for vague questions.</span>
      </div>
    </div>
  );
}

// ── Generic section content ────────────────────────────────────────────────────
function SectionContent({ section, mode, dm }: { section: (typeof cmdSections)[0]; mode: CmdMode; dm: boolean }) {
  const content = section.modeContent[mode];
  return (
    <div className="space-y-4">
      <p className={`text-sm leading-relaxed ${tw(dm,'body')}`}>{content.overview}</p>
      <div className="space-y-2">
        {content.keyPoints.map((pt, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-violet-500 mt-0.5 shrink-0">▸</span>
            <span className={`text-sm ${tw(dm,'body')}`}>{pt}</span>
          </div>
        ))}
      </div>
      {content.framework && (
        <div className="rounded-xl p-3 border border-violet-500/30 bg-violet-500/5">
          <span className="text-xs font-bold text-violet-400">🔧 Framework: </span>
          <span className={`text-xs font-mono ${tw(dm,'body')}`}>{content.framework}</span>
        </div>
      )}
      {content.tip && (
        <div className="rounded-xl p-3 border border-sky-500/30 bg-sky-500/5">
          <span className="text-xs font-bold text-sky-500">💡 Pro tip: </span>
          <span className={`text-xs ${tw(dm,'body')}`}>{content.tip}</span>
        </div>
      )}
    </div>
  );
}

function SectionView({ section, mode, dm }: { section: (typeof cmdSections)[0]; mode: CmdMode; dm: boolean }) {
  const grp = CMD_GROUPS[section.group];
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="text-4xl">{section.emoji}</div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: grp.color + '22', color: grp.color }}>{grp.emoji} {grp.label}</span>
            {section.interactiveType && <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-violet-500/20 text-violet-400">LIVE</span>}
          </div>
          <h2 className={`text-xl font-bold ${tw(dm,'heading')}`}>{section.title}</h2>
          <p className={`text-sm ${tw(dm,'muted')}`}>{section.tagline}</p>
        </div>
      </div>

      {section.interactiveType === 'thinking-pipeline' && section.group === 'simulators' && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-violet-500 mb-4">Claude Processing Pipeline</div>
          <ClaudeThinkingFlow dm={dm} />
        </div>
      )}
      {section.interactiveType === 'thinking-pipeline' && section.group === 'reasoning' && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-violet-500 mb-4">Reasoning Mode Browser</div>
          <ReasoningModeBrowser dm={dm} />
        </div>
      )}
      {section.interactiveType === 'multi-sim' && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-sky-500 mb-4">Interactive Simulators</div>
          <MultiSimulatorPanel dm={dm} />
        </div>
      )}
      {section.interactiveType === 'real-vs-fake' && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-4">Real vs Fake AI Productivity</div>
          <RealVsFakePanel dm={dm} />
        </div>
      )}
      {section.interactiveType === 'agent-map' && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-4">Agent Topology Map</div>
          <AgentTopologyMap dm={dm} />
        </div>
      )}
      {section.interactiveType === 'workflow-map' && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-4">Workflow Pattern Map</div>
          <WorkflowPatternMap dm={dm} />
        </div>
      )}
      {section.interactiveType === 'token-sim' && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-violet-500 mb-4">Token Economics Simulator</div>
          <TokenEconomicsSim dm={dm} />
        </div>
      )}
      {section.id === 'prompt-patterns' && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-sky-500 mb-4">Prompt Pattern Explorer</div>
          <PromptPatternExplorer dm={dm} />
        </div>
      )}

      <SectionContent section={section} mode={mode} dm={dm} />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function CommandCenterPage() {
  const { darkMode } = useAppStore();
  const dm = darkMode;
  const [activeSection, setActiveSection] = useState<CmdSectionId>('deep-think');
  const [activeMode, setActiveMode] = useState<CmdMode>('practitioner');

  const section = cmdSections.find(s => s.id === activeSection) ?? cmdSections[0];
  const grouped = useMemo(() => CMD_GROUP_ORDER.reduce<Partial<Record<CmdSectionGroup, typeof cmdSections>>>((acc, g) => {
    acc[g] = cmdSections.filter(s => s.group === g);
    return acc;
  }, {}), []);

  return (
    <div className={`flex h-full overflow-hidden ${tw(dm,'page')}`}>
      <aside className={`w-56 shrink-0 flex flex-col border-r overflow-y-auto ${tw(dm,'card')} ${tw(dm,'border')}`}>
        <div className="p-3 border-b" style={{ background: 'linear-gradient(135deg, #4c1d9522, #1e1b4b22)', borderColor: '#7c3aed22' }}>
          <div className="text-sm font-bold text-violet-400">⚡ Command Center</div>
          <div className={`text-xs ${tw(dm,'muted')}`}>AI Thinking & Workflow OS</div>
        </div>
        <div className="p-2 border-b border-slate-700/30 space-y-1">
          <div className={`text-xs font-semibold uppercase tracking-wider px-1 mb-1 ${tw(dm,'muted')}`}>Mode</div>
          {(Object.keys(CMD_MODES) as CmdMode[]).map(m => {
            const meta = CMD_MODES[m];
            return (
              <button key={m} onClick={() => setActiveMode(m)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all ${m === activeMode ? 'text-white font-semibold' : `${tw(dm,'body')} ${tw(dm,'hover')}`}`}
                style={m === activeMode ? { background: meta.color } : {}}>
                <span className="mr-1">{meta.icon}</span>{meta.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1 p-2 space-y-3 overflow-y-auto">
          {CMD_GROUP_ORDER.map(group => {
            const sections = grouped[group];
            if (!sections?.length) return null;
            const meta = CMD_GROUPS[group];
            return (
              <div key={group}>
                <div className="text-xs font-bold uppercase tracking-wider px-1 mb-1" style={{ color: meta.color }}>
                  {meta.emoji} {meta.label}
                </div>
                {sections.map(s => (
                  <button key={s.id} onClick={() => setActiveSection(s.id)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${s.id === activeSection ? 'text-white font-semibold' : `${tw(dm,'body')} ${tw(dm,'hover')}`}`}
                    style={s.id === activeSection ? { background: meta.color } : {}}>
                    <span className="shrink-0">{s.emoji}</span>
                    <span className="flex-1 truncate">{s.title}</span>
                    {s.interactiveType && <span className="shrink-0 text-xs opacity-60">⚡</span>}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
        <div className={`p-3 border-t ${tw(dm,'border')}`}>
          <div className={`text-xs ${tw(dm,'muted')} text-center`}>18 sections · 8 live tools</div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div key={`${activeSection}-${activeMode}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}>
              <div className="flex flex-wrap gap-2 mb-4">
                {(Object.keys(CMD_MODES) as CmdMode[]).map(m => {
                  const meta = CMD_MODES[m];
                  return (
                    <button key={m} onClick={() => setActiveMode(m)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
                      style={m === activeMode ? { background: meta.color, color: 'white', borderColor: meta.color } : { borderColor: meta.color + '44', color: meta.color }}>
                      <span>{meta.icon}</span><span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
              <SectionView section={section} mode={activeMode} dm={dm} />
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/30">
                {(() => {
                  const i = cmdSections.findIndex(s => s.id === activeSection);
                  const prev = cmdSections[i - 1];
                  const next = cmdSections[i + 1];
                  return (
                    <>
                      {prev ? (
                        <button onClick={() => setActiveSection(prev.id)}
                          className={`flex items-center gap-2 text-sm ${tw(dm,'muted')} hover:text-violet-500 transition-colors`}>
                          <ChevronRight size={14} className="rotate-180" />{prev.emoji} {prev.title}
                        </button>
                      ) : <div />}
                      {next ? (
                        <button onClick={() => setActiveSection(next.id)}
                          className={`flex items-center gap-2 text-sm ${tw(dm,'muted')} hover:text-violet-500 transition-colors`}>
                          {next.emoji} {next.title}<ChevronRight size={14} />
                        </button>
                      ) : <div />}
                    </>
                  );
                })()}
              </div>
              <div className={`mt-6 p-3 rounded-xl border ${tw(dm,'border')} ${tw(dm,'cardAlt')} text-xs ${tw(dm,'muted')}`}>
                <strong className="text-sky-500">→ Quick Reference: </strong>
                Looking for CLI commands, slash commands, or quick recipes?
                <button onClick={() => window.location.href = '/cheat-sheets'} className="ml-1 text-sky-500 hover:underline">Open Claude Cheat Sheets</button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
