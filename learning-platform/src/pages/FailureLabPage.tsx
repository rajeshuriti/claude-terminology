import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { FailureMode, FailureSectionId, FailureSectionGroup } from '@/data/failureLabData';
import {
  failureSections, FAILURE_MODES, FAILURE_GROUPS, FAILURE_GROUP_ORDER,
  SEVERITY_META, hallucinationScenarios, injectionAttacks,
  failurePatterns, productionIncidents, debugTrace,
} from '@/data/failureLabData';
import { tw } from '@/lib/dm';

// ── Hallucination Simulator ────────────────────────────────────────────────────
function HallucinationSim({ dm }: { dm: boolean }) {
  const [idx, setIdx] = useState(0);
  const sc = hallucinationScenarios[idx];

  const highlightResponse = (text: string, hallucinations: string[]) => {
    const parts: Array<{ text: string; isHallucination: boolean }> = [];
    let remaining = text;
    while (remaining.length > 0) {
      let earliest = remaining.length;
      let matchedHall = '';
      for (const h of hallucinations) {
        const pos = remaining.toLowerCase().indexOf(h.toLowerCase());
        if (pos !== -1 && pos < earliest) { earliest = pos; matchedHall = h; }
      }
      if (earliest === remaining.length) {
        parts.push({ text: remaining, isHallucination: false });
        break;
      }
      if (earliest > 0) parts.push({ text: remaining.slice(0, earliest), isHallucination: false });
      const actualMatch = remaining.slice(earliest, earliest + matchedHall.length);
      parts.push({ text: actualMatch, isHallucination: true });
      remaining = remaining.slice(earliest + matchedHall.length);
    }
    return parts;
  };

  const parts = highlightResponse(sc.response, sc.hallucinations);
  const bars = [
    { label: 'Ambiguity', value: sc.riskFactors.ambiguity, color: '#f59e0b' },
    { label: 'Context Gap', value: sc.riskFactors.contextGap, color: '#ef4444' },
    { label: 'Overconfidence', value: sc.riskFactors.overconfidence, color: '#f97316' },
    { label: 'Domain Gap', value: sc.riskFactors.domainGap, color: '#8b5cf6' },
  ];
  const riskScore = Math.round(Object.values(sc.riskFactors).reduce((a, b) => a + b, 0) / 4);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {hallucinationScenarios.map((s, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i === idx ? 'bg-amber-600 text-white' : `${tw(dm,'body')} ${tw(dm,'card')} border ${tw(dm,'border')}`}`}>
            {s.title}
          </button>
        ))}
      </div>
      <div className={`p-3 rounded-xl ${tw(dm,'cardAlt')}`}>
        <div className="text-xs font-bold text-amber-500 mb-1 uppercase tracking-wider">Prompt (weak context)</div>
        <p className={`text-sm italic ${tw(dm,'body')}`}>"{sc.prompt}"</p>
      </div>
      <div className="rounded-xl border-2 border-red-500/40 overflow-hidden">
        <div className="bg-red-500/10 px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-bold text-red-500">AI Response — hallucinations highlighted</span>
          <span className="text-xs font-bold text-red-500">🔴 {sc.hallucinations.length} hallucinated element{sc.hallucinations.length > 1 ? 's' : ''}</span>
        </div>
        <div className={`p-3 text-sm leading-relaxed ${tw(dm,'body')}`}>
          {parts.map((p, i) => p.isHallucination
            ? <mark key={i} className="bg-red-500/30 text-red-600 dark:text-red-400 rounded px-0.5 font-semibold">{p.text}</mark>
            : <span key={i}>{p.text}</span>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-xl ${tw(dm,'cardAlt')} grid grid-cols-2 gap-3`}>
        {bars.map(b => (
          <div key={b.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className={tw(dm,'muted')}>{b.label}</span>
              <span className="font-mono font-semibold" style={{ color: b.color }}>{b.value}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full" style={{ width: `${b.value}%`, background: b.color }} />
            </div>
          </div>
        ))}
      </div>
      <div className={`p-3 rounded-xl flex items-start gap-3 border ${tw(dm,'border')}`}
        style={{ borderColor: '#ef4444' + '44', background: '#ef4444' + '0a' }}>
        <div className="text-2xl font-black mt-1" style={{ color: '#ef4444' }}>{riskScore}%</div>
        <div>
          <div className="text-xs font-bold text-red-500 mb-0.5">Hallucination Risk Score</div>
          <p className={`text-xs ${tw(dm,'body')}`}>{sc.reason}</p>
        </div>
      </div>
    </div>
  );
}

// ── Prompt Injection Arena ─────────────────────────────────────────────────────
function InjectionArena({ dm }: { dm: boolean }) {
  const [idx, setIdx] = useState(0);
  const atk = injectionAttacks[idx];
  const sev = SEVERITY_META[atk.severity];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {injectionAttacks.map((a, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i === idx ? 'bg-red-600 text-white' : `${tw(dm,'body')} ${tw(dm,'card')} border ${tw(dm,'border')}`}`}>
            {a.type}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className={`rounded-xl p-3 border-2 border-emerald-500/30`}>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">① Legitimate Context</div>
          <div className={`text-xs ${tw(dm,'muted')} mb-1`}>Victim: {atk.victim}</div>
          <p className={`text-xs ${tw(dm,'body')} leading-relaxed`}>{atk.legitimateContext}</p>
        </div>
        <div className="rounded-xl p-3 border-2 border-red-500/40">
          <div className="text-xs font-bold text-red-500 mb-2">② Malicious Payload</div>
          <div className={`text-xs ${tw(dm,'muted')} mb-1`}>Location: {atk.payloadLocation}</div>
          <p className="text-xs text-red-500 font-mono leading-relaxed bg-red-500/10 p-2 rounded">{atk.payload}</p>
        </div>
        <div className="rounded-xl p-3 border-2 border-orange-500/40">
          <div className="text-xs font-bold text-orange-500 mb-2">③ Attack Effect</div>
          <p className={`text-xs ${tw(dm,'body')} leading-relaxed mb-2`}>{atk.effect}</p>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: sev.color + '22', color: sev.color }}>
            {sev.label} SEVERITY
          </span>
        </div>
      </div>
      <div className={`p-3 rounded-xl text-xs ${tw(dm,'section')} border ${tw(dm,'border')}`}>
        <span className="font-bold text-red-500">⚠ No complete defense exists.</span>
        <span className={` ${tw(dm,'body')}`}> Mitigate with: structural context isolation (XML delimiters), external content classification, minimal tool permissions, and behavioral monitoring for anomalous actions.</span>
      </div>
    </div>
  );
}

// ── Agent Chaos Simulator ──────────────────────────────────────────────────────
type ChaosEvent = { time: number; text: string; severity: 'ok' | 'warn' | 'error' | 'critical' };

const CHAOS_SCRIPT: ChaosEvent[] = [
  { time: 0,    severity: 'ok',       text: '⬤ Task received: "Research and summarize competitor pricing"' },
  { time: 600,  severity: 'ok',       text: '⬤ Planner agent starts. Plan: search → retrieve → analyze → summarize' },
  { time: 1200, severity: 'ok',       text: '⬤ web_search() called — results returned (2,400 tokens injected)' },
  { time: 1800, severity: 'warn',     text: '⚠ web_fetch() timeout on competitor-1.com → retry 1/3' },
  { time: 2400, severity: 'warn',     text: '⚠ web_fetch() timeout on competitor-1.com → retry 2/3' },
  { time: 3000, severity: 'warn',     text: '⚠ web_fetch() timeout on competitor-1.com → retry 3/3 FAILED' },
  { time: 3600, severity: 'error',    text: '✗ Planner cannot complete without all data → REPLAN' },
  { time: 4200, severity: 'error',    text: '✗ Spawning sub-agent-1 for competitor-1 (new context: 3,200 tokens)' },
  { time: 4800, severity: 'error',    text: '✗ Spawning sub-agent-2 for competitor-2 (new context: 3,200 tokens)' },
  { time: 5400, severity: 'error',    text: '✗ sub-agent-1: tool result too large → context compressed (lossy)' },
  { time: 6000, severity: 'error',    text: '✗ sub-agent-2: retrieval returned stale 2023 data → replan' },
  { time: 6600, severity: 'critical', text: '🚨 sub-agent-2 spawns sub-sub-agent-2a for fresh retrieval' },
  { time: 7200, severity: 'critical', text: '🚨 5 concurrent agents active — token rate: 12,000 tok/min' },
  { time: 7800, severity: 'critical', text: '🚨 Orchestrator context filling (87%) — dropping early instructions' },
  { time: 8400, severity: 'critical', text: '🚨 RATE LIMIT HIT — all agents retrying simultaneously' },
  { time: 9000, severity: 'critical', text: '🚨 SYSTEM FAILURE — 2.3M tokens consumed, $11.50 spent, task incomplete' },
];

const EVENT_TOKENS = [0, 2400, 5200, 6800, 9100, 11200, 14800, 20500, 28200, 35800, 42100, 52000, 68000, 89000, 140000, 230000];
const EVENT_COST = EVENT_TOKENS.map(t => (t / 1e6) * 3.0);

function AgentChaosPanel({ dm }: { dm: boolean }) {
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<ChaosEvent[]>([]);
  const [step, setStep] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setStep(s => {
        if (s >= CHAOS_SCRIPT.length - 1) {
          setRunning(false);
          return s;
        }
        const nextEvent = CHAOS_SCRIPT[s + 1];
        setEvents(prev => [...prev, nextEvent]);
        return s + 1;
      });
    }, 700);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [events]);

  const reset = () => { setRunning(false); setEvents([]); setStep(0); if (timerRef.current) clearInterval(timerRef.current); };
  const tokens = EVENT_TOKENS[Math.min(step, EVENT_TOKENS.length - 1)];
  const cost = EVENT_COST[Math.min(step, EVENT_COST.length - 1)];
  const agentCount = step < 7 ? 1 : step < 8 ? 2 : step < 11 ? 3 : step < 12 ? 4 : 5;
  const severityColor = (s: ChaosEvent['severity']) => ({ ok: '#10b981', warn: '#f59e0b', error: '#f97316', critical: '#ef4444' }[s]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <button onClick={() => { reset(); setTimeout(() => { setEvents([CHAOS_SCRIPT[0]]); setRunning(true); setStep(0); }, 50); }}
          disabled={running}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${running ? 'opacity-50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
          {running ? '⚡ Running...' : '▶ Start Simulation'}
        </button>
        <button onClick={reset} className={`px-4 py-2 rounded-xl text-sm transition-all ${tw(dm,'card')} border ${tw(dm,'border')} ${tw(dm,'body')}`}>↺ Reset</button>
      </div>
      <div className={`grid grid-cols-4 gap-3`}>
        {[
          { label: 'Agents', value: agentCount, color: '#f97316' },
          { label: 'Tokens', value: tokens.toLocaleString(), color: '#ef4444' },
          { label: 'Cost', value: `$${cost.toFixed(2)}`, color: '#f59e0b' },
          { label: 'Events', value: events.length, color: '#8b5cf6' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-3 text-center ${tw(dm,'cardAlt')}`}>
            <div className="text-xl font-black" style={{ color }}>{value}</div>
            <div className={`text-xs ${tw(dm,'muted')}`}>{label}</div>
          </div>
        ))}
      </div>
      <div ref={logRef} className={`rounded-xl border ${tw(dm,'border')} ${tw(dm,'card')} h-48 overflow-y-auto p-3 space-y-1 font-mono text-xs`}>
        {events.length === 0 && <div className={tw(dm,'muted')}>Click "Start Simulation" to watch the cascade...</div>}
        {events.map((e, i) => (
          <div key={i} className="flex gap-2">
            <span className={tw(dm,'muted')} style={{ minWidth: 36 }}>{(i * 0.7).toFixed(1)}s</span>
            <span style={{ color: severityColor(e.severity) }}>{e.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Token Explosion Panel ──────────────────────────────────────────────────────
function TokenExplosionPanel({ dm }: { dm: boolean }) {
  const [agents, setAgents] = useState(3);
  const [retries, setRetries] = useState(2);
  const [mcpCalls, setMcpCalls] = useState(4);
  const [contextKb, setContextKb] = useState(8);
  const [dailySessions, setDailySessions] = useState(1000);

  const baseTokens = contextKb * 250;
  const mcpTokens = mcpCalls * 500;
  const retryTokens = retries * (baseTokens + mcpTokens);
  const perSession = (baseTokens + mcpTokens + retryTokens) * agents;
  const dailyTokens = perSession * dailySessions;
  const dailyCost = (dailyTokens / 1e6) * 3.0;
  const monthlyCost = dailyCost * 30;
  const breakdown = [
    { label: 'Base context', tokens: baseTokens * agents * dailySessions, color: '#3b82f6' },
    { label: 'MCP results', tokens: mcpTokens * agents * dailySessions, color: '#8b5cf6' },
    { label: 'Retry overhead', tokens: retryTokens * agents * dailySessions, color: '#f97316' },
  ];
  const totalDisplay = dailyTokens;
  const maxBar = Math.max(...breakdown.map(b => b.tokens));

  return (
    <div className="space-y-4">
      {[
        { label: 'Agents', value: agents, set: setAgents, min: 1, max: 10, step: 1 },
        { label: 'Retries / task', value: retries, set: setRetries, min: 0, max: 10, step: 1 },
        { label: 'MCP calls / turn', value: mcpCalls, set: setMcpCalls, min: 1, max: 20, step: 1 },
        { label: 'Context size (KB)', value: contextKb, set: setContextKb, min: 1, max: 200, step: 1 },
        { label: 'Sessions / day', value: dailySessions, set: setDailySessions, min: 100, max: 100000, step: 100 },
      ].map(({ label, value, set, min, max, step }) => (
        <div key={label}>
          <div className="flex justify-between mb-1">
            <span className={`text-xs ${tw(dm,'muted')}`}>{label}</span>
            <span className="text-xs font-mono font-semibold">{value.toLocaleString()}</span>
          </div>
          <input type="range" min={min} max={max} step={step} value={value}
            onChange={e => set(Number(e.target.value))} className="w-full accent-red-500" />
        </div>
      ))}
      <div className="space-y-2">
        {breakdown.map(b => (
          <div key={b.label} className="flex items-center gap-3">
            <div className="text-xs w-28 shrink-0" style={{ color: b.color }}>{b.label}</div>
            <div className="flex-1 h-4 rounded overflow-hidden bg-slate-200 dark:bg-slate-700">
              <div className="h-full transition-all duration-300" style={{ width: `${(b.tokens / maxBar) * 100}%`, background: b.color }} />
            </div>
            <div className="text-xs font-mono w-24 text-right" style={{ color: b.color }}>{(b.tokens / 1000).toFixed(0)}K</div>
          </div>
        ))}
      </div>
      <div className={`grid grid-cols-3 gap-3 p-4 rounded-xl ${tw(dm,'cardAlt')}`}>
        <div className="text-center">
          <div className={`text-lg font-black ${totalDisplay > 10_000_000 ? 'text-red-500' : totalDisplay > 1_000_000 ? 'text-orange-500' : 'text-amber-500'}`}>
            {(totalDisplay / 1e6).toFixed(1)}M
          </div>
          <div className={`text-xs ${tw(dm,'muted')}`}>tokens/day</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-black ${dailyCost > 100 ? 'text-red-500' : 'text-orange-500'}`}>${dailyCost.toFixed(2)}</div>
          <div className={`text-xs ${tw(dm,'muted')}`}>cost/day</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-black ${monthlyCost > 1000 ? 'text-red-500' : 'text-orange-500'}`}>${(monthlyCost / 1000).toFixed(1)}K</div>
          <div className={`text-xs ${tw(dm,'muted')}`}>cost/month</div>
        </div>
      </div>
    </div>
  );
}

// ── Debug Workbench ────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = { input: '#3b82f6', llm: '#8b5cf6', tool: '#f59e0b', retrieval: '#f97316', output: '#ef4444' };
const STATUS_COLORS = { ok: '#10b981', warn: '#f59e0b', error: '#ef4444' };

function DebugWorkbenchPanel({ dm }: { dm: boolean }) {
  const [expanded, setExpanded] = useState<string | null>('n4');

  return (
    <div className="space-y-2">
      <div className={`text-xs ${tw(dm,'muted')} mb-3`}>Execution trace for: <strong>Autonomous Research Agent — Citation Hallucination</strong>. Click any node to inspect.</div>
      {debugTrace.map((node, i) => (
        <div key={node.id}>
          <button onClick={() => setExpanded(expanded === node.id ? null : node.id)}
            className={`w-full text-left rounded-xl border transition-all ${expanded === node.id ? 'border-violet-500' : tw(dm,'border')} ${tw(dm,'card')} overflow-hidden`}>
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="text-xs font-bold w-20 shrink-0 px-1.5 py-0.5 rounded text-center"
                style={{ background: TYPE_COLORS[node.type] + '22', color: TYPE_COLORS[node.type] }}>
                {node.type.toUpperCase()}
              </div>
              <span className={`flex-1 text-xs font-semibold ${tw(dm,'body')}`}>{node.label}</span>
              {node.tokens && <span className={`text-xs ${tw(dm,'muted')}`}>{node.tokens} tok</span>}
              <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[node.status] }} />
              <span className="text-xs" style={{ color: STATUS_COLORS[node.status] }}>
                {node.status === 'ok' ? '✓' : node.status === 'warn' ? '⚠' : '✗'}
              </span>
              <ChevronDown size={12} className={`transition-transform ${expanded === node.id ? 'rotate-180' : ''} ${tw(dm,'muted')}`} />
            </div>
          </button>
          {expanded === node.id && (
            <div className={`mx-2 mb-1 rounded-b-xl border-x border-b p-3 ${tw(dm,'border')} ${tw(dm,'cardAlt')}`}>
              <div className={`text-xs font-mono mb-2 ${tw(dm,'muted')}`}>{node.content}</div>
              <div className="text-xs" style={{ color: STATUS_COLORS[node.status] }}>{node.detail}</div>
            </div>
          )}
          {i < debugTrace.length - 1 && (
            <div className="flex justify-center my-1">
              <div className="w-0.5 h-3 bg-slate-300 dark:bg-slate-600" />
            </div>
          )}
        </div>
      ))}
      <div className={`p-3 rounded-xl border border-red-500/40 bg-red-500/10 text-xs`}>
        <strong className="text-red-500">Root Cause: </strong>
        <span className={tw(dm,'body')}>Search API returned truncated results. Model completed missing DOIs probabilistically from training distribution. No citation verification gate before output delivery.</span>
      </div>
    </div>
  );
}

// ── Failure Pattern Library ────────────────────────────────────────────────────
function FailurePatternLib({ dm }: { dm: boolean }) {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(failurePatterns.map(p => p.category)))];
  const filtered = failurePatterns.filter(p => {
    const matchesCat = cat === 'all' || p.category === cat;
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.symptoms.some(s => s.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patterns..."
          className={`flex-1 text-xs px-3 py-2 rounded-lg border ${tw(dm,'input')} focus:outline-none focus:ring-2 focus:ring-violet-500`} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {categories.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all capitalize ${c === cat ? 'bg-violet-600 text-white' : `${tw(dm,'body')} ${tw(dm,'card')} border ${tw(dm,'border')}`}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filtered.map(p => {
          const sev = SEVERITY_META[p.severity];
          return (
            <div key={p.id} className={`rounded-xl border ${tw(dm,'border')} ${tw(dm,'card')} overflow-hidden`}>
              <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left">
                <span className="text-xs px-1.5 py-0.5 rounded font-bold capitalize" style={{ background: sev.color + '22', color: sev.color }}>{p.severity}</span>
                <span className={`flex-1 text-xs font-semibold ${tw(dm,'body')}`}>{p.name}</span>
                <span className={`text-xs capitalize ${tw(dm,'muted')}`}>{p.category}</span>
                <ChevronDown size={12} className={`transition-transform ${expanded === p.id ? 'rotate-180' : ''} ${tw(dm,'muted')}`} />
              </button>
              {expanded === p.id && (
                <div className={`border-t ${tw(dm,'border')} p-3 space-y-2`}>
                  <div>
                    <div className="text-xs font-semibold text-amber-500 mb-1">Symptoms</div>
                    {p.symptoms.map((s, i) => <div key={i} className={`text-xs ${tw(dm,'body')} flex gap-1`}><span className="text-amber-500 shrink-0">·</span>{s}</div>)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-red-500 mb-1">Root Cause</div>
                    <p className={`text-xs ${tw(dm,'body')}`}>{p.rootCause}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-500 mb-1">Mitigation</div>
                    <p className={`text-xs ${tw(dm,'body')}`}>{p.mitigation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className={`text-xs text-center py-4 ${tw(dm,'muted')}`}>No patterns match your search</div>}
      </div>
    </div>
  );
}

// ── Production Incidents ───────────────────────────────────────────────────────
function IncidentPanel({ dm }: { dm: boolean }) {
  const [idx, setIdx] = useState(0);
  const inc = productionIncidents[idx];
  const sev = SEVERITY_META[inc.severity];
  const statusColor = { ok: '#10b981', warn: '#f59e0b', error: '#ef4444', critical: '#dc2626' };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {productionIncidents.map((p, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i === idx ? 'bg-red-600 text-white' : `${tw(dm,'body')} ${tw(dm,'card')} border ${tw(dm,'border')}`}`}>
            {p.title.length > 28 ? p.title.slice(0, 28) + '…' : p.title}
          </button>
        ))}
      </div>
      <div className="flex items-start gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: sev.color + '22', color: sev.color }}>{sev.label}</span>
            <span className={`text-xs ${tw(dm,'muted')}`}>{inc.industry}</span>
          </div>
          <h3 className={`font-bold text-sm ${tw(dm,'heading')}`}>{inc.title}</h3>
          <p className="text-xs text-red-500 mt-0.5">{inc.impact}</p>
        </div>
      </div>
      <div className={`rounded-xl border ${tw(dm,'border')} ${tw(dm,'card')} overflow-hidden`}>
        <div className={`text-xs font-bold px-3 py-2 border-b ${tw(dm,'border')} ${tw(dm,'muted')} uppercase tracking-wider`}>Incident Timeline</div>
        <div className="p-3 space-y-1.5">
          {inc.timeline.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="font-mono text-xs w-10 shrink-0" style={{ color: statusColor[step.status] }}>{step.time}</span>
              <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: statusColor[step.status] }} />
              <span className={`text-xs ${tw(dm,'body')}`}>{step.event}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {[
          { label: 'Root Cause', text: inc.rootCause, color: '#ef4444' },
          { label: 'Architectural Flaw', text: inc.architecturalFlaw, color: '#f97316' },
          { label: 'Mitigation', text: inc.mitigation, color: '#10b981' },
        ].map(({ label, text, color }) => (
          <div key={label} className="rounded-xl p-3 border" style={{ borderColor: color + '33', background: color + '0a' }}>
            <div className="text-xs font-bold mb-1" style={{ color }}>{label}</div>
            <p className={`text-xs ${tw(dm,'body')}`}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Retrieval Failure Viz ──────────────────────────────────────────────────────
const RETRIEVAL_DOCS = [
  { id: 'd1', title: 'Q2 2024 Pricing Policy', date: '2024-01-15', relevance: 0.91, isStale: false, isCorrect: true },
  { id: 'd2', title: 'Q3 2021 Pricing Policy (archived)', date: '2021-08-20', relevance: 0.88, isStale: true, isCorrect: false },
  { id: 'd3', title: 'Enterprise Discount Framework', date: '2024-03-01', relevance: 0.74, isStale: false, isCorrect: true },
  { id: 'd4', title: 'Competitor Analysis 2022', date: '2022-11-10', relevance: 0.71, isStale: true, isCorrect: false },
  { id: 'd5', title: 'Product Catalog v8', date: '2023-06-12', relevance: 0.68, isStale: false, isCorrect: true },
];

function RetrievalVizPanel({ dm }: { dm: boolean }) {
  const [k, setK] = useState(3);
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');

  const sorted = [...RETRIEVAL_DOCS].sort((a, b) => {
    if (sortBy === 'relevance') return b.relevance - a.relevance;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  const top = sorted.slice(0, k);
  const hasStale = top.some(d => d.isStale);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <div>
          <div className="text-xs mb-1 text-amber-500">Retrieve top-k</div>
          <div className="flex gap-1">
            {[2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setK(n)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${n === k ? 'bg-amber-600 text-white' : `${tw(dm,'body')} ${tw(dm,'card')} border ${tw(dm,'border')}`}`}>
                k={n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs mb-1 text-amber-500">Sort by</div>
          <div className="flex gap-1">
            {(['relevance', 'date'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded text-xs font-bold capitalize transition-all ${s === sortBy ? 'bg-violet-600 text-white' : `${tw(dm,'body')} ${tw(dm,'card')} border ${tw(dm,'border')}`}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {sorted.map((doc, i) => {
          const inTop = i < k;
          return (
            <div key={doc.id} className={`rounded-xl border p-3 transition-all ${inTop ? (doc.isStale ? 'border-red-500/50 bg-red-500/5' : 'border-emerald-500/50 bg-emerald-500/5') : `${tw(dm,'border')} opacity-40`}`}>
              <div className="flex items-center gap-2">
                {inTop && <span className="text-xs font-bold w-5 text-center" style={{ color: doc.isStale ? '#ef4444' : '#10b981' }}>#{i + 1}</span>}
                {!inTop && <span className="text-xs w-5 text-center text-slate-400">—</span>}
                <div className="flex-1">
                  <div className={`text-xs font-semibold ${tw(dm,'body')}`}>{doc.title}</div>
                  <div className={`text-xs ${tw(dm,'muted')}`}>{doc.date} {doc.isStale && <span className="text-red-500 ml-1">⚠ STALE</span>}</div>
                </div>
                <div className="text-xs font-mono" style={{ color: doc.isStale ? '#ef4444' : '#10b981' }}>
                  sim: {doc.relevance.toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {hasStale && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs">
          <strong className="text-red-500">⚠ Stale document retrieved!</strong>
          <span className={` ${tw(dm,'body')}`}> When sorted by relevance, a 2021 document ranks above a 2024 document. The model will answer using outdated pricing data — confidently and incorrectly. Add date-weighted scoring or staleness filters to your retrieval pipeline.</span>
        </div>
      )}
    </div>
  );
}

// ── Section content ────────────────────────────────────────────────────────────
function SectionContent({ section, mode, dm }: { section: (typeof failureSections)[0]; mode: FailureMode; dm: boolean }) {
  const content = section.modeContent[mode];
  return (
    <div className="space-y-4">
      <p className={`text-sm leading-relaxed ${tw(dm,'body')}`}>{content.overview}</p>
      <div className="space-y-2">
        {content.keyPoints.map((pt, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-red-500 mt-0.5 shrink-0">▸</span>
            <span className={`text-sm ${tw(dm,'body')}`}>{pt}</span>
          </div>
        ))}
      </div>
      {content.code && (
        <div className="rounded-xl overflow-hidden border border-slate-700">
          <div className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-400">Code</div>
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

function SectionView({ section, mode, dm }: { section: (typeof failureSections)[0]; mode: FailureMode; dm: boolean }) {
  const sev = SEVERITY_META[section.severity];
  const grp = FAILURE_GROUPS[section.group];
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="text-4xl">{section.emoji}</div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: grp.color + '22', color: grp.color }}>{grp.label}</span>
            <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: sev.color + '22', color: sev.color }}>{sev.label}</span>
            {section.interactiveType && <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-500/20 text-red-400">LIVE</span>}
          </div>
          <h2 className={`text-xl font-bold ${tw(dm,'heading')}`}>{section.title}</h2>
          <p className={`text-sm ${tw(dm,'muted')}`}>{section.tagline}</p>
        </div>
      </div>
      {section.interactiveType && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')}`} style={{ borderColor: sev.color + '33' }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: sev.color }}>Interactive Simulation</div>
          {section.interactiveType === 'hallucination'  && <HallucinationSim dm={dm} />}
          {section.interactiveType === 'injection'      && <InjectionArena dm={dm} />}
          {section.interactiveType === 'chaos'          && <AgentChaosPanel dm={dm} />}
          {section.interactiveType === 'token-explosion'&& <TokenExplosionPanel dm={dm} />}
          {section.interactiveType === 'debug'          && <DebugWorkbenchPanel dm={dm} />}
          {section.interactiveType === 'patterns'       && <FailurePatternLib dm={dm} />}
          {section.interactiveType === 'incidents'      && <IncidentPanel dm={dm} />}
          {section.interactiveType === 'retrieval-viz'  && <RetrievalVizPanel dm={dm} />}
        </div>
      )}
      <SectionContent section={section} mode={mode} dm={dm} />
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export function FailureLabPage() {
  const { darkMode } = useAppStore();
  const dm = darkMode;
  const [activeSection, setActiveSection] = useState<FailureSectionId>('hallucination-lab');
  const [activeMode, setActiveMode] = useState<FailureMode>('developer');

  const section = failureSections.find(s => s.id === activeSection) ?? failureSections[0];

  const grouped = FAILURE_GROUP_ORDER.reduce<Partial<Record<FailureSectionGroup, typeof failureSections>>>((acc, g) => {
    acc[g] = failureSections.filter(s => s.group === g);
    return acc;
  }, {});

  return (
    <div className={`flex h-full overflow-hidden ${tw(dm,'page')}`}>
      {/* Sidebar */}
      <aside className={`w-56 shrink-0 flex flex-col border-r overflow-y-auto ${tw(dm,'card')} ${tw(dm,'border')}`}>
        <div className="p-3 border-b border-red-900/20" style={{ background: 'linear-gradient(135deg, #7f1d1d22, #78350f22)' }}>
          <div className="text-sm font-bold text-red-500">🔥 AI Failure Lab</div>
          <div className={`text-xs ${tw(dm,'muted')}`}>Chaos Engineering Academy</div>
        </div>
        <div className="p-2 border-b border-slate-700/30 space-y-1">
          <div className={`text-xs font-semibold uppercase tracking-wider px-1 mb-1 ${tw(dm,'muted')}`}>Learning Mode</div>
          {(Object.keys(FAILURE_MODES) as FailureMode[]).map(m => {
            const meta = FAILURE_MODES[m];
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
        <div className="flex-1 p-2 space-y-3 overflow-y-auto">
          {FAILURE_GROUP_ORDER.map(group => {
            const sections = grouped[group];
            if (!sections?.length) return null;
            const meta = FAILURE_GROUPS[group];
            return (
              <div key={group}>
                <div className="text-xs font-bold uppercase tracking-wider px-1 mb-1" style={{ color: meta.color }}>{meta.label}</div>
                {sections.map(s => {
                  const sev = SEVERITY_META[s.severity];
                  return (
                    <button key={s.id} onClick={() => setActiveSection(s.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${s.id === activeSection ? 'text-white font-semibold' : `${tw(dm,'body')} ${tw(dm,'hover')}`}`}
                      style={s.id === activeSection ? { background: meta.color } : {}}>
                      <span className="shrink-0">{s.emoji}</span>
                      <span className="flex-1 truncate">{s.title}</span>
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: sev.color }} />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className={`p-3 border-t ${tw(dm,'border')}`}>
          <div className={`text-xs ${tw(dm,'muted')} text-center`}>20 failure modes · 8 live simulations</div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div key={`${activeSection}-${activeMode}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}>
              <div className="flex flex-wrap gap-2 mb-4">
                {(Object.keys(FAILURE_MODES) as FailureMode[]).map(m => {
                  const meta = FAILURE_MODES[m];
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
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/30">
                {(() => {
                  const i = failureSections.findIndex(s => s.id === activeSection);
                  const prev = failureSections[i - 1];
                  const next = failureSections[i + 1];
                  return (
                    <>
                      {prev ? (
                        <button onClick={() => setActiveSection(prev.id)}
                          className={`flex items-center gap-2 text-sm ${tw(dm,'muted')} hover:text-red-500 transition-colors`}>
                          <ChevronRight size={14} className="rotate-180" />{prev.emoji} {prev.title}
                        </button>
                      ) : <div />}
                      {next ? (
                        <button onClick={() => setActiveSection(next.id)}
                          className={`flex items-center gap-2 text-sm ${tw(dm,'muted')} hover:text-red-500 transition-colors`}>
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
