import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, Bookmark, Clock, Star, Link,
  AlertTriangle, BookOpen, Globe, Scale, Play, Trophy,
  ChevronDown, Zap, TrendingUp, TrendingDown, ArrowRight,
  Shield, Code, Lightbulb, Target,
} from 'lucide-react';
import { conceptMap, concepts } from '@/data/concepts';
import { categoryMap } from '@/data/categories';
import { useAppStore } from '@/store/appStore';
import { enrichedContent, generateFallbackContent } from '@/data/enrichedConceptContent';
import type { EnrichedContent, RichAnalogy, ModeEntry } from '@/data/enrichedConceptContent';

// ─── Simulators ───────────────────────────────────────────────────────────────

function TemperatureSimulator({ dm }: { dm: boolean }) {
  const [temp, setTemp] = useState(0.7);
  const tokens = ['Paris', 'Lyon', 'London', 'Berlin', 'Rome'];
  const baseLogits = [5.0, 2.0, 1.5, 0.5, 0.3];
  const colors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

  const softmax = (logits: number[]) => {
    const max = Math.max(...logits);
    const exps = logits.map(l => Math.exp(l - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  };

  const probs = softmax(baseLogits.map(l => l / Math.max(temp, 0.001)));

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div>
        <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Scenario</div>
        <div className={`text-sm font-mono rounded-lg px-3 py-2 ${dm ? 'bg-slate-900 text-sky-300' : 'bg-slate-50 text-sky-700'}`}>
          "The capital of France is _____"
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Predictable</span>
          <span className="text-sm font-bold text-sky-500">Temperature: {temp.toFixed(2)}</span>
          <span className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Creative</span>
        </div>
        <input type="range" min="0" max="1" step="0.05" value={temp}
          onChange={e => setTemp(Number(e.target.value))} className="w-full accent-sky-500" />
      </div>
      <div className="space-y-2">
        {tokens.map((token, i) => (
          <div key={token} className="flex items-center gap-3">
            <span className={`text-xs font-mono w-14 shrink-0 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{token}</span>
            <div className={`flex-1 rounded-full overflow-hidden h-5 ${dm ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(probs[i] * 100, 0.3)}%`, backgroundColor: colors[i] }} />
            </div>
            <span className={`text-xs font-mono w-12 text-right shrink-0 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
              {(probs[i] * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      <div className={`text-xs rounded-lg p-3 ${dm ? 'bg-sky-900/20 text-sky-300 border border-sky-700/30' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>
        {temp <= 0.1
          ? '⚡ Near-deterministic: always picks the top token. Use for extraction, evals, structured outputs.'
          : temp <= 0.4
          ? '✓ Low temperature: focused and reliable. Good for Q&A and code generation.'
          : temp <= 0.7
          ? '◎ Balanced: natural variation with coherent outputs. Good for chat.'
          : '🎲 High temperature: creative but unreliable. Use for brainstorming only.'}
      </div>
    </div>
  );
}

function TopPSimulator({ dm }: { dm: boolean }) {
  const [topP, setTopP] = useState(0.9);
  const tokens = [
    { word: 'Paris', prob: 0.40 }, { word: 'Lyon', prob: 0.20 },
    { word: 'London', prob: 0.15 }, { word: 'Berlin', prob: 0.10 },
    { word: 'Rome', prob: 0.07 }, { word: 'Madrid', prob: 0.05 },
    { word: 'Vienna', prob: 0.02 }, { word: 'cheese', prob: 0.01 },
  ];

  let cum = 0;
  let done = false;
  const augmented = tokens.map(t => {
    if (done) return { ...t, inNucleus: false };
    cum += t.prob;
    if (cum >= topP) done = true;
    return { ...t, inNucleus: true };
  });

  const nucleusCount = augmented.filter(t => t.inNucleus).length;
  const lastNucleusIdx = nucleusCount - 1;

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Narrow nucleus</span>
          <span className="text-sm font-bold text-violet-500">Top-P: {topP.toFixed(2)}</span>
          <span className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Wide nucleus</span>
        </div>
        <input type="range" min="0.1" max="1.0" step="0.05" value={topP}
          onChange={e => { cum = 0; done = false; setTopP(Number(e.target.value)); }}
          className="w-full accent-violet-500" />
      </div>
      <div className={`text-xs px-3 py-2 rounded-lg ${dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
        Sampling from <strong className="text-violet-500">{nucleusCount} token{nucleusCount !== 1 ? 's' : ''}</strong> in nucleus (cumulative ≥ {(topP * 100).toFixed(0)}%)
      </div>
      <div className="space-y-2">
        {augmented.map((t, i) => (
          <div key={t.word} className={`flex items-center gap-3 transition-opacity duration-300 ${t.inNucleus ? 'opacity-100' : 'opacity-30'}`}>
            <span className={`text-xs font-mono w-14 shrink-0 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{t.word}</span>
            <div className={`flex-1 rounded-full overflow-hidden h-5 ${dm ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${t.prob * 100}%`, backgroundColor: t.inNucleus ? '#8b5cf6' : '#94a3b8' }} />
            </div>
            <span className={`text-xs font-mono w-10 text-right shrink-0 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
              {(t.prob * 100).toFixed(0)}%
            </span>
            {t.inNucleus && i === lastNucleusIdx && (
              <span className="text-xs text-violet-400 shrink-0">← cutoff</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContextWindowSimulator({ dm }: { dm: boolean }) {
  const [system, setSystem] = useState(10);
  const [history, setHistory] = useState(30);
  const [retrieved, setRetrieved] = useState(25);
  const [tools, setTools] = useState(10);
  const budgets = [4000, 8000, 16000, 32000, 100000, 200000];
  const [budgetIdx, setBudgetIdx] = useState(3);
  const total = budgets[budgetIdx];
  const output = Math.max(0, 100 - system - history - retrieved - tools);

  const segments = [
    { label: 'System Prompt', pct: system, color: '#8b5cf6', max: 30, onSet: setSystem },
    { label: 'Conv History', pct: history, color: '#0ea5e9', max: 60, onSet: setHistory },
    { label: 'Retrieved Context', pct: retrieved, color: '#10b981', max: 60, onSet: setRetrieved },
    { label: 'Tool Definitions', pct: tools, color: '#f59e0b', max: 25, onSet: setTools },
    { label: 'Output Reserve', pct: output, color: '#f43f5e', max: 100, onSet: null },
  ];

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-semibold ${dm ? 'text-white' : 'text-slate-900'}`}>
            Total Budget: {total.toLocaleString()} tokens
          </span>
          <span className={`text-xs ${output < 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {output < 10 ? '⚠ Low output reserve' : '✓ Healthy allocation'}
          </span>
        </div>
        <input type="range" min="0" max="5" step="1" value={budgetIdx}
          onChange={e => setBudgetIdx(Number(e.target.value))} className="w-full accent-sky-500" />
        <div className={`flex justify-between text-xs mt-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
          {budgets.map(b => <span key={b}>{b >= 1000 ? `${b / 1000}k` : b}</span>)}
        </div>
      </div>
      <div className="flex h-8 rounded-full overflow-hidden">
        {segments.map((s, i) => s.pct > 0 && (
          <div key={s.label}
            className={`h-full transition-all duration-500 ${i === 0 ? 'rounded-l-full' : ''} ${i === segments.length - 1 ? 'rounded-r-full' : ''}`}
            style={{ width: `${s.pct}%`, backgroundColor: s.color }} title={`${s.label}: ${s.pct}%`} />
        ))}
      </div>
      <div className="space-y-3">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
            <span className={`text-xs w-32 shrink-0 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{s.label}</span>
            <span className={`text-xs font-mono w-28 shrink-0 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              {Math.round(s.pct * total / 100).toLocaleString()} tok ({s.pct}%)
            </span>
            {s.onSet && (
              <input type="range" min="0" max={s.max} value={s.pct}
                onChange={e => s.onSet!(Number(e.target.value))}
                className="flex-1 accent-sky-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChunkingSimulator({ dm }: { dm: boolean }) {
  const [chunkSize, setChunkSize] = useState(300);
  const [overlap, setOverlap] = useState(50);

  const text = 'Claude is a large language model developed by Anthropic. It uses a transformer architecture trained with RLHF and Constitutional AI. The model excels at reasoning, code generation, and complex analysis. RAG systems chunk documents before embedding them for vector retrieval. Chunk size affects retrieval precision and context preservation. Smaller chunks give precise retrieval but lose surrounding context. Larger chunks preserve context but reduce retrieval precision. Overlap ensures boundary content is captured and not lost between chunks.';

  const chunks: Array<{ start: number; end: number }> = [];
  let pos = 0;
  while (pos < text.length) {
    const end = Math.min(pos + chunkSize, text.length);
    chunks.push({ start: pos, end });
    if (end >= text.length) break;
    pos = end - overlap;
  }

  const boundaries = new Set<number>();
  chunks.forEach(c => { boundaries.add(c.start); boundaries.add(c.end); });
  const sortedB = Array.from(boundaries).sort((a, b) => a - b);

  type Seg = { text: string; chunkIdx: number; isOverlap: boolean };
  const segs: Seg[] = [];
  const chunkColors = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];
  for (let i = 0; i < sortedB.length - 1; i++) {
    const s = sortedB[i], e = sortedB[i + 1];
    const covering = chunks.filter(c => c.start <= s && c.end >= e);
    if (covering.length > 0) {
      segs.push({ text: text.slice(s, e), chunkIdx: chunks.indexOf(covering[0]), isOverlap: covering.length > 1 });
    }
  }

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Chunk Size</span>
            <span className="text-xs font-mono text-sky-500">{chunkSize} chars</span>
          </div>
          <input type="range" min="100" max="500" value={chunkSize}
            onChange={e => { const v = Number(e.target.value); setChunkSize(v); if (overlap >= v) setOverlap(Math.floor(v / 4)); }}
            className="w-full accent-sky-500" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Overlap</span>
            <span className="text-xs font-mono text-violet-500">{overlap} chars</span>
          </div>
          <input type="range" min="0" max={Math.floor(chunkSize / 3)} value={overlap}
            onChange={e => setOverlap(Number(e.target.value))} className="w-full accent-violet-500" />
        </div>
      </div>
      <div className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
        → {chunks.length} chunk{chunks.length !== 1 ? 's' : ''} · overlap regions shown darker
      </div>
      <div className={`text-sm leading-relaxed font-mono rounded-xl p-4 ${dm ? 'bg-slate-900' : 'bg-slate-50'}`}>
        {segs.map((seg, i) => (
          <span key={i} style={{
            backgroundColor: seg.isOverlap
              ? `${chunkColors[seg.chunkIdx % chunkColors.length]}50`
              : `${chunkColors[seg.chunkIdx % chunkColors.length]}20`,
            color: dm ? '#e2e8f0' : '#1e293b',
          }}>{seg.text}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {chunkColors.slice(0, chunks.length).map((c, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
            <span className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Chunk {i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RagPipelineSimulator({ dm }: { dm: boolean }) {
  const [activeStep, setActiveStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const steps = [
    { label: 'User Query', icon: '💬', detail: 'User asks: "What is Claude\'s temperature parameter?" — raw text captured.' },
    { label: 'Embed Query', icon: '🔢', detail: 'Query → embedding model → [0.21, -0.84, 0.43, ...] (1536-dim vector representing semantic meaning).' },
    { label: 'Vector Search', icon: '🔍', detail: 'Cosine similarity search across 50,000 document vectors in the vector store.' },
    { label: 'Retrieve Docs', icon: '📄', detail: 'Top-5 chunks retrieved (similarity: 0.94, 0.91, 0.87, 0.82, 0.79).' },
    { label: 'Augment Prompt', icon: '✏️', detail: 'Prompt: system message + [5 retrieved chunks] + original user query assembled.' },
    { label: 'Generate', icon: '✨', detail: 'Claude generates answer grounded in retrieved docs. No hallucination of unsupported facts.' },
  ];

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const runPipeline = () => {
    if (running) return;
    setRunning(true);
    setActiveStep(0);
    let step = 0;
    const advance = () => {
      step++;
      if (step >= steps.length) { setRunning(false); return; }
      setActiveStep(step);
      timerRef.current = setTimeout(advance, 800);
    };
    timerRef.current = setTimeout(advance, 700);
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveStep(-1);
    setRunning(false);
  };

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex gap-2">
        <button onClick={runPipeline} disabled={running}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${running ? 'opacity-50 cursor-not-allowed bg-sky-500 text-white' : 'bg-sky-500 text-white hover:bg-sky-600'}`}>
          <Play size={14} /> {running ? 'Running…' : 'Run Pipeline'}
        </button>
        <button onClick={reset}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${dm ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          Reset
        </button>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-1 shrink-0">
            <div className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-500 ${
              i === activeStep ? 'ring-2 ring-sky-500 scale-105' : ''
            } ${i <= activeStep
              ? dm ? 'bg-sky-900/40 text-sky-300' : 'bg-sky-50 text-sky-700'
              : dm ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'
            }`}>
              <span className="text-xl">{step.icon}</span>
              <span className="text-xs font-medium text-center leading-tight max-w-14">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight size={14} className={i < activeStep ? 'text-sky-400' : dm ? 'text-slate-600' : 'text-slate-300'} />
            )}
          </div>
        ))}
      </div>
      {activeStep >= 0 && (
        <motion.div key={activeStep} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className={`text-sm rounded-xl p-4 ${dm ? 'bg-slate-700 text-slate-200' : 'bg-slate-50 text-slate-700'}`}>
          <span className="font-semibold text-sky-500">{steps[activeStep].label}: </span>
          {steps[activeStep].detail}
        </motion.div>
      )}
    </div>
  );
}

// ─── Tab Components ───────────────────────────────────────────────────────────

function UnderstandTab({ content, dm }: { content: EnrichedContent; dm: boolean }) {
  const cardBg = dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textPrimary = dm ? 'text-white' : 'text-slate-900';
  const textMuted = dm ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-6 ${dm ? 'bg-gradient-to-br from-sky-900/30 to-violet-900/20 border-sky-700/30' : 'bg-gradient-to-br from-sky-50 to-violet-50 border-sky-200'}`}>
        <div className={`text-lg font-semibold leading-relaxed ${dm ? 'text-sky-200' : 'text-sky-900'}`}>
          "{content.simpleExplanation.hook}"
        </div>
      </div>

      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-amber-500" />
          <span className={`text-sm font-semibold ${textPrimary}`}>Analogy</span>
        </div>
        <p className={`text-sm leading-relaxed ${textMuted}`}>{content.simpleExplanation.analogy}</p>
      </div>

      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <div className={`text-xs font-semibold uppercase tracking-wide mb-3 ${textMuted}`}>For Beginners</div>
        <p className={`text-sm leading-relaxed ${dm ? 'text-slate-200' : 'text-slate-700'}`}>{content.simpleExplanation.forBeginners}</p>
      </div>

      <div className="rounded-2xl border bg-slate-900 border-slate-700">
        <div className="flex items-center gap-2 p-5 border-b border-slate-700">
          <Code size={14} className="text-sky-400" />
          <span className="text-sm font-semibold text-white">Technical Deep Dive</span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Mechanics</div>
            <p className="text-sm leading-relaxed text-slate-200">{content.technicalDive.mechanics}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">API Details</div>
            <p className="text-sm leading-relaxed font-mono text-sky-300">{content.technicalDive.apiDetails}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Orchestration Implications</div>
            <p className="text-sm leading-relaxed text-amber-200">{content.technicalDive.orchestrationImplications}</p>
          </div>
        </div>
      </div>

      {content.technicalDive.productionPatterns.length > 0 && (
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-3">
            <Code size={14} className="text-emerald-500" />
            <span className={`text-sm font-semibold ${textPrimary}`}>Production Patterns</span>
          </div>
          <ul className="space-y-2">
            {content.technicalDive.productionPatterns.map((p, i) => (
              <li key={i} className={`text-sm flex items-start gap-2 ${textMuted}`}>
                <span className="text-emerald-500 mt-0.5 shrink-0">▸</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Mode Table ───────────────────────────────────────────────────────────────

function ModeTable({ modes, dm }: { modes: ModeEntry[]; dm: boolean }) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`px-4 py-3 border-b text-xs font-semibold uppercase tracking-wide ${dm ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
        Modes &amp; Values
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b text-xs font-semibold ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
              <td className={`px-4 py-2.5 ${dm ? 'text-sky-400' : 'text-sky-600'}`}>Value</td>
              <td className={`px-4 py-2.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>What it means</td>
              <td className={`px-4 py-2.5 ${dm ? 'text-amber-400' : 'text-amber-600'}`}>School analogy</td>
            </tr>
          </thead>
          <tbody>
            {modes.map((m, i) => (
              <tr key={i} className={`border-b last:border-0 ${dm ? 'border-slate-700' : 'border-slate-50'}`}>
                <td className={`px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap align-top ${dm ? 'text-sky-300' : 'text-sky-700'}`}>{m.value}</td>
                <td className={`px-4 py-3 text-xs leading-relaxed align-top ${dm ? 'text-slate-200' : 'text-slate-700'}`}>{m.meaning}</td>
                <td className={`px-4 py-3 text-xs leading-relaxed align-top ${dm ? 'text-amber-200' : 'text-amber-800'}`}>{m.schoolBehavior}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Rich Analogy Card ────────────────────────────────────────────────────────

function RichAnalogyCard({ analogy, dm }: { analogy: RichAnalogy; dm: boolean }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));
  const toggle = (i: number) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });

  const isEnterprise = !['School', 'Library', 'Hospital', 'Airport', 'Restaurant'].includes(analogy.domain);

  return (
    <div className={`rounded-2xl border overflow-hidden ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b ${
        isEnterprise
          ? dm ? 'bg-gradient-to-r from-violet-900/30 to-sky-900/20 border-violet-700/30' : 'bg-gradient-to-r from-violet-50 to-sky-50 border-violet-200'
          : dm ? 'bg-gradient-to-r from-amber-900/20 to-emerald-900/20 border-amber-700/20' : 'bg-gradient-to-r from-amber-50 to-emerald-50 border-amber-200'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{analogy.emoji}</span>
          <span className={`text-sm font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>
            {analogy.domain} Analogy
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ml-auto font-medium ${
            isEnterprise
              ? dm ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-100 text-violet-700'
              : dm ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700'
          }`}>{isEnterprise ? 'Enterprise' : 'Everyday'}</span>
        </div>
        <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{analogy.setting}</p>
      </div>

      {/* Character Mapping */}
      <div className={`px-5 py-3 border-b ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
        <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Character Mapping</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {analogy.characters.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={`font-semibold shrink-0 ${dm ? 'text-sky-300' : 'text-sky-700'}`}>{c.role}</span>
              <span className={dm ? 'text-slate-500' : 'text-slate-400'}>→</span>
              <span className={dm ? 'text-slate-300' : 'text-slate-600'}>{c.represents}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scenarios */}
      <div className="divide-y" style={{ borderColor: dm ? '#334155' : '#f1f5f9' }}>
        {analogy.scenarios.map((s, i) => (
          <div key={i}>
            <button onClick={() => toggle(i)} className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors ${dm ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/80'}`}>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 mt-0.5 ${dm ? 'bg-slate-700 text-sky-300' : 'bg-slate-100 text-sky-700'}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold mb-0.5 ${dm ? 'text-white' : 'text-slate-900'}`}>{s.mode}</div>
                {!expanded.has(i) && (
                  <div className={`text-xs truncate ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{s.behavior}</div>
                )}
              </div>
              <ChevronDown size={14} className={`shrink-0 mt-1 transition-transform ${dm ? 'text-slate-500' : 'text-slate-400'} ${expanded.has(i) ? 'rotate-180' : ''}`} />
            </button>
            {expanded.has(i) && (
              <div className={`px-5 pb-4 space-y-2`}>
                <div className={`text-xs rounded-xl p-3 leading-relaxed ${dm ? 'bg-slate-700/60 text-slate-200' : 'bg-slate-50 text-slate-700'}`}>
                  <span className={`font-semibold ${dm ? 'text-slate-400' : 'text-slate-500'}`}>What happens: </span>
                  {s.behavior}
                </div>
                <div className={`text-xs rounded-xl p-3 leading-relaxed ${
                  s.consequence.toLowerCase().includes('fail') || s.consequence.toLowerCase().includes('wrong') || s.consequence.toLowerCase().includes('break') || s.consequence.toLowerCase().includes('error')
                    ? dm ? 'bg-rose-900/20 text-rose-200 border border-rose-700/30' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    : dm ? 'bg-emerald-900/20 text-emerald-200 border border-emerald-700/30' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  <span className="font-semibold">Consequence: </span>
                  {s.consequence}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Takeaway */}
      <div className={`px-5 py-3 border-t ${dm ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
        <span className={`text-xs font-semibold ${dm ? 'text-amber-400' : 'text-amber-600'}`}>Takeaway: </span>
        <span className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{analogy.takeaway}</span>
      </div>
    </div>
  );
}

// ─── Real World Tab ───────────────────────────────────────────────────────────

function RealWorldTab({ content, dm }: { content: EnrichedContent; dm: boolean }) {
  const typeConfig = {
    enterprise: { label: 'Enterprise', color: '#0ea5e9' },
    agent: { label: 'Agent', color: '#8b5cf6' },
    production: { label: 'Production', color: '#10b981' },
    failure: { label: 'Failure Mode', color: '#f43f5e' },
  };

  const hasAnalogies = !!content.primaryAnalogy || !!content.enterpriseAnalogy;
  const hasModes = !!content.modesTable && content.modesTable.length > 0;

  return (
    <div className="space-y-5">
      {/* Mode Table */}
      {hasModes && <ModeTable modes={content.modesTable!} dm={dm} />}

      {/* Analogies */}
      {hasAnalogies && (
        <div className="space-y-4">
          {content.primaryAnalogy && <RichAnalogyCard analogy={content.primaryAnalogy} dm={dm} />}
          {content.enterpriseAnalogy && <RichAnalogyCard analogy={content.enterpriseAnalogy} dm={dm} />}
        </div>
      )}

      {/* Production Scenarios */}
      {content.realWorldScenarios.length > 0 && (
        <div>
          {hasAnalogies && (
            <div className={`text-xs font-semibold uppercase tracking-wide mb-3 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              Production Scenarios
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.realWorldScenarios.map((scenario, i) => {
              const cfg = typeConfig[scenario.type];
              return (
                <div key={i} className={`rounded-2xl border p-5 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`text-sm font-semibold ${dm ? 'text-white' : 'text-slate-900'}`}>{scenario.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                      style={{ backgroundColor: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className={`text-xs mb-3 leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{scenario.context}</p>
                  <div className="space-y-2">
                    <div>
                      <span className={`text-xs font-semibold uppercase ${dm ? 'text-slate-500' : 'text-slate-400'}`}>How: </span>
                      <span className={`text-xs ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{scenario.how}</span>
                    </div>
                    <div className={`text-xs rounded-lg p-2.5 ${dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                      <span className="font-semibold">Outcome: </span>{scenario.outcome}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!hasAnalogies && content.realWorldScenarios.length === 0 && (
        <div className={`rounded-2xl border p-8 text-center text-sm ${dm ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
          No scenarios available for this concept yet.
        </div>
      )}
    </div>
  );
}

function PitfallsTab({ content, dm }: { content: EnrichedContent; dm: boolean }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });

  const severityStyle = {
    production: { bg: '#f43f5e15', border: '#f43f5e40', badge: '#f43f5e', text: 'Production' },
    intermediate: { bg: '#f59e0b15', border: '#f59e0b40', badge: '#f59e0b', text: 'Intermediate' },
    beginner: { bg: '#0ea5e915', border: '#0ea5e940', badge: '#0ea5e9', text: 'Beginner' },
  };

  return (
    <div className="space-y-6">
      <div>
        <div className={`text-sm font-semibold mb-3 ${dm ? 'text-white' : 'text-slate-900'}`}>Common Mistakes</div>
        {content.commonMistakes.length === 0 ? (
          <div className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>No common mistakes documented for this concept yet.</div>
        ) : (
          <div className="space-y-3">
            {content.commonMistakes.map((m, i) => {
              const sty = severityStyle[m.severity];
              return (
                <div key={i} className="rounded-xl border overflow-hidden"
                  style={{ backgroundColor: sty.bg, borderColor: sty.border }}>
                  <button onClick={() => toggle(i)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                        style={{ backgroundColor: `${sty.badge}20`, color: sty.badge }}>
                        {sty.text}
                      </span>
                      <span className={`text-sm font-medium truncate ${dm ? 'text-white' : 'text-slate-900'}`}>{m.mistake}</span>
                    </div>
                    <ChevronDown size={16} className={`shrink-0 transition-transform ${dm ? 'text-slate-400' : 'text-slate-500'} ${expanded.has(i) ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded.has(i) && (
                    <div className={`px-4 pb-4 border-t ${dm ? 'border-slate-700' : 'border-slate-200/60'}`}>
                      <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <div className={`text-xs font-semibold uppercase mb-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Why</div>
                          <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{m.why}</p>
                        </div>
                        <div>
                          <div className={`text-xs font-semibold uppercase mb-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Impact</div>
                          <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{m.impact}</p>
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase mb-1 text-emerald-500">Fix</div>
                          <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{m.fix}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {content.failureModes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={15} className="text-rose-500" />
            <span className={`text-sm font-semibold ${dm ? 'text-white' : 'text-slate-900'}`}>Failure Modes</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {content.failureModes.map((f, i) => (
              <div key={i} className={`rounded-xl border p-4 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="text-sm font-semibold mb-2 text-rose-500">{f.mode}</div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className={`font-semibold ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Cause: </span>
                    <span className={dm ? 'text-slate-300' : 'text-slate-600'}>{f.cause}</span>
                  </div>
                  <div>
                    <span className={`font-semibold ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Detection: </span>
                    <span className={dm ? 'text-slate-300' : 'text-slate-600'}>{f.detection}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-500">Resolution: </span>
                    <span className={dm ? 'text-slate-300' : 'text-slate-600'}>{f.resolution}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TradeoffsTab({ content, dm }: { content: EnrichedContent; dm: boolean }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-2xl border p-5 ${dm ? 'bg-emerald-900/20 border-emerald-700/30' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-emerald-500" />
            <span className={`text-sm font-semibold ${dm ? 'text-emerald-300' : 'text-emerald-800'}`}>Advantages</span>
          </div>
          <ul className="space-y-2">
            {content.tradeoffs.advantages.map((a, i) => (
              <li key={i} className={`text-xs flex items-start gap-2 ${dm ? 'text-emerald-200' : 'text-emerald-800'}`}>
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>{a}
              </li>
            ))}
          </ul>
        </div>

        <div className={`rounded-2xl border p-5 ${dm ? 'bg-rose-900/20 border-rose-700/30' : 'bg-rose-50 border-rose-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={15} className="text-rose-500" />
            <span className={`text-sm font-semibold ${dm ? 'text-rose-300' : 'text-rose-800'}`}>Disadvantages</span>
          </div>
          <ul className="space-y-2">
            {content.tradeoffs.disadvantages.map((d, i) => (
              <li key={i} className={`text-xs flex items-start gap-2 ${dm ? 'text-rose-200' : 'text-rose-800'}`}>
                <span className="text-rose-500 mt-0.5 shrink-0">✗</span>{d}
              </li>
            ))}
          </ul>
        </div>

        <div className={`rounded-2xl border p-5 ${dm ? 'bg-amber-900/20 border-amber-700/30' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-amber-500" />
            <span className={`text-sm font-semibold ${dm ? 'text-amber-300' : 'text-amber-800'}`}>When NOT to Use</span>
          </div>
          <ul className="space-y-2">
            {content.tradeoffs.whenNotToUse.map((w, i) => (
              <li key={i} className={`text-xs flex items-start gap-2 ${dm ? 'text-amber-200' : 'text-amber-800'}`}>
                <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>{w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`rounded-2xl border p-5 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Scaling Note</div>
        <p className={`text-sm leading-relaxed ${dm ? 'text-slate-200' : 'text-slate-700'}`}>{content.tradeoffs.scalingNote}</p>
      </div>
    </div>
  );
}

function CertPrepTab({ content, conceptTerm, certPriority, dm }: {
  content: EnrichedContent;
  conceptTerm: string;
  certPriority: number;
  dm: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border-l-4 border-amber-400 p-5 ${dm ? 'bg-amber-900/10 border border-amber-700/30' : 'bg-amber-50 border border-amber-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={16} className="text-amber-500" />
          <span className={`text-sm font-semibold ${dm ? 'text-amber-300' : 'text-amber-800'}`}>Why It Matters for the Exam</span>
          <span className={`text-xs ml-auto px-2 py-0.5 rounded-full ${dm ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-200 text-amber-700'}`}>
            Priority {certPriority}/5
          </span>
        </div>
        <p className={`text-sm leading-relaxed ${dm ? 'text-amber-100' : 'text-amber-900'}`}>{content.certFocus.whyItMatters}</p>
      </div>

      <div className={`rounded-2xl border p-5 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Target size={15} className="text-violet-500" />
          <span className={`text-sm font-semibold ${dm ? 'text-white' : 'text-slate-900'}`}>Exam Thinking Patterns</span>
        </div>
        <ol className="space-y-3">
          {content.certFocus.examThinking.map((t, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${dm ? 'bg-violet-900/50 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
                {i + 1}
              </span>
              <span className={`text-sm leading-relaxed ${dm ? 'text-slate-200' : 'text-slate-700'}`}>{t}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className={`rounded-2xl border p-5 ${dm ? 'bg-sky-900/20 border-sky-700/30' : 'bg-sky-50 border-sky-200'}`}>
        <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${dm ? 'text-sky-400' : 'text-sky-600'}`}>Architecture Reasoning</div>
        <p className={`text-sm leading-relaxed ${dm ? 'text-sky-100' : 'text-sky-900'}`}>{content.certFocus.architectureReasoning}</p>
      </div>

      {content.metrics && content.metrics.length > 0 && (
        <div className={`rounded-2xl border p-5 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wide mb-3 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Production Metrics</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {content.metrics.map((metric, i) => (
              <div key={i} className={`rounded-xl p-3 ${dm ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <div className={`text-lg font-bold ${dm ? 'text-sky-300' : 'text-sky-600'}`}>{metric.value}</div>
                <div className={`text-xs font-medium mb-1 ${dm ? 'text-white' : 'text-slate-900'}`}>{metric.name}</div>
                <div className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{metric.context}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`rounded-2xl border p-5 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`text-xs font-semibold uppercase tracking-wide mb-3 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Learning Progression</div>
        <div className="flex items-start gap-3 flex-wrap">
          {content.prerequisites.length > 0 && (
            <div>
              <div className={`text-xs mb-2 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Prerequisites</div>
              <div className="flex flex-wrap gap-1">
                {content.prerequisites.map(cid => {
                  const c = conceptMap.get(cid);
                  return c ? (
                    <button key={cid} onClick={() => navigate(`/concept/${cid}`)}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors ${dm ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                      {c.term}
                    </button>
                  ) : null;
                })}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 self-center">
            <ArrowRight size={14} className={dm ? 'text-slate-600' : 'text-slate-300'} />
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-xl ${dm ? 'bg-sky-900/40 text-sky-300 border border-sky-700/40' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>
              {conceptTerm}
            </span>
            <ArrowRight size={14} className={dm ? 'text-slate-600' : 'text-slate-300'} />
          </div>
          {content.nextConcepts.length > 0 && (
            <div>
              <div className={`text-xs mb-2 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Next</div>
              <div className="flex flex-wrap gap-1">
                {content.nextConcepts.slice(0, 4).map(cid => {
                  const c = conceptMap.get(cid);
                  return c ? (
                    <button key={cid} onClick={() => navigate(`/concept/${cid}`)}
                      className={`text-xs px-2 py-1 rounded-lg transition-colors ${dm ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                      {c.term}
                    </button>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border p-5 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={15} className="text-amber-400" />
          <span className="text-sm font-semibold text-white">Advanced Insight</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-200">{content.advancedInsight}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ConceptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { darkMode, completedConcepts, bookmarkedConcepts, toggleCompleted, toggleBookmark, addRecentlyViewed } = useAppStore();
  const [activeTab, setActiveTab] = useState('understand');

  const concept = id ? conceptMap.get(id) : null;

  useEffect(() => {
    if (id) addRecentlyViewed(id);
  }, [id, addRecentlyViewed]);

  if (!concept) {
    return (
      <div className={`min-h-full flex items-center justify-center ${darkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        <div className="text-center">
          <p className="text-lg font-medium">Concept not found</p>
          <button onClick={() => navigate('/explorer')} className="mt-2 text-sky-500 hover:underline">Back to Explorer</button>
        </div>
      </div>
    );
  }

  const content = enrichedContent[concept.id] ?? generateFallbackContent(concept);
  const cat = categoryMap.get(concept.categoryId);
  const isCompleted = completedConcepts.includes(concept.id);
  const isBookmarked = bookmarkedConcepts.includes(concept.id);
  const relatedConcepts = concept.relatedConcepts.map(rid => conceptMap.get(rid)).filter(Boolean).slice(0, 6);
  const hasSimulator = !!content.simulatorType;
  const dm = darkMode;

  const TABS = [
    { id: 'understand', label: 'Understand', Icon: BookOpen },
    { id: 'realworld', label: 'Real World', Icon: Globe },
    { id: 'pitfalls', label: 'Pitfalls', Icon: AlertTriangle },
    { id: 'tradeoffs', label: 'Tradeoffs', Icon: Scale },
    ...(hasSimulator ? [{ id: 'simulate', label: 'Simulate', Icon: Play }] : []),
    { id: 'certprep', label: 'Cert Prep', Icon: Trophy },
  ];

  const tabActiveClass: Record<string, string> = {
    understand: 'bg-sky-500 text-white',
    realworld: 'bg-emerald-500 text-white',
    pitfalls: 'bg-rose-500 text-white',
    tradeoffs: 'bg-amber-500 text-white',
    simulate: 'bg-violet-500 text-white',
    certprep: 'bg-amber-500 text-white',
  };

  const diffColor = concept.difficulty === 'beginner' ? 'text-emerald-500' : concept.difficulty === 'intermediate' ? 'text-sky-500' : 'text-violet-500';
  const diffBg = concept.difficulty === 'beginner'
    ? dm ? 'bg-emerald-900/30' : 'bg-emerald-50'
    : concept.difficulty === 'intermediate'
    ? dm ? 'bg-sky-900/30' : 'bg-sky-50'
    : dm ? 'bg-violet-900/30' : 'bg-violet-50';

  return (
    <div className={`min-h-full ${dm ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-6">

        <button onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-sm mb-4 transition-colors ${dm ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-5 mb-4 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: (cat?.color ?? '#0ea5e9') + '20' }}>
                {cat?.icon}
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{concept.term}</h1>
                <div className={`text-sm mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{concept.category}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${diffBg} ${diffColor}`}>
                    {concept.difficulty}
                  </span>
                  <span className={`flex items-center gap-1 text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Clock size={11} /> {concept.estimatedTime} min
                  </span>
                  <span className={`flex items-center gap-1 text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Star size={11} className="text-amber-400" /> Priority {concept.certificationPriority}/5
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => toggleBookmark(concept.id)}
                className={`p-2 rounded-xl transition-colors ${isBookmarked ? 'text-amber-500 bg-amber-500/10' : dm ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}>
                <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
              <button onClick={() => toggleCompleted(concept.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isCompleted ? 'bg-emerald-500 text-white' : dm ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <CheckCircle2 size={15} />
                {isCompleted ? 'Completed' : 'Mark Done'}
              </button>
            </div>
          </div>
          <p className={`mt-4 text-sm leading-relaxed ${dm ? 'text-slate-200' : 'text-slate-700'}`}>{concept.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {concept.tags.map(tag => (
              <span key={tag} className={`text-xs px-2.5 py-1 rounded-lg ${dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Tab navigation */}
        <div className={`flex gap-1 mb-4 p-1 rounded-2xl overflow-x-auto ${dm ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {TABS.map(({ id: tabId, label, Icon }) => (
            <button key={tabId} onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tabId
                  ? tabActiveClass[tabId]
                  : dm ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
              }`}>
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}>
            {activeTab === 'understand' && <UnderstandTab content={content} dm={dm} />}
            {activeTab === 'realworld' && <RealWorldTab content={content} dm={dm} />}
            {activeTab === 'pitfalls' && <PitfallsTab content={content} dm={dm} />}
            {activeTab === 'tradeoffs' && <TradeoffsTab content={content} dm={dm} />}
            {activeTab === 'simulate' && content.simulatorType === 'temperature' && <TemperatureSimulator dm={dm} />}
            {activeTab === 'simulate' && content.simulatorType === 'top-p' && <TopPSimulator dm={dm} />}
            {activeTab === 'simulate' && content.simulatorType === 'context-window' && <ContextWindowSimulator dm={dm} />}
            {activeTab === 'simulate' && content.simulatorType === 'chunking' && <ChunkingSimulator dm={dm} />}
            {activeTab === 'simulate' && content.simulatorType === 'rag-pipeline' && <RagPipelineSimulator dm={dm} />}
            {activeTab === 'certprep' && (
              <CertPrepTab content={content} conceptTerm={concept.term} certPriority={concept.certificationPriority} dm={dm} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Related concepts */}
        {relatedConcepts.length > 0 && (
          <div className="mt-6">
            <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              <Link size={12} /> Related Concepts
            </div>
            <div className="flex flex-wrap gap-2">
              {relatedConcepts.map(rel => {
                if (!rel) return null;
                const relCat = categoryMap.get(rel.categoryId);
                return (
                  <button key={rel.id} onClick={() => navigate(`/concept/${rel.id}`)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-colors ${dm ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'}`}>
                    <span className="text-base leading-none">{relCat?.icon}</span>
                    {rel.term}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* More in category */}
        <div className="mt-4 mb-8">
          <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            More in {concept.category}
          </div>
          <div className="flex flex-wrap gap-2">
            {concepts.filter(c => c.categoryId === concept.categoryId && c.id !== concept.id).map(c => (
              <button key={c.id} onClick={() => navigate(`/concept/${c.id}`)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${dm ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'}`}>
                {c.term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
