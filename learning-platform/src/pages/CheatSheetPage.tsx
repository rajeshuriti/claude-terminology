import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { CheatMode, CheatSectionId, CheatSectionGroup } from '@/data/cheatSheetData';
import {
  cheatSections, CHEAT_MODES, CHEAT_GROUPS, CHEAT_GROUP_ORDER,
  SECURITY_META, TOKEN_META, commonMistakes, powerRecipes,
  TERMINAL_REGISTRY,
} from '@/data/cheatSheetData';
import { tw } from '@/lib/dm';

// ── Command Browser ────────────────────────────────────────────────────────────
function CommandBrowser({ commands, dm }: { commands: NonNullable<(typeof cheatSections)[0]['commands']>; dm: boolean }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return commands;
    const q = search.toLowerCase();
    return commands.filter(c =>
      c.cmd.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some(t => t.includes(q))
    );
  }, [commands, search]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${tw(dm,'muted')}`} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search commands..."
          className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg border ${tw(dm,'input')} focus:outline-none focus:ring-2 focus:ring-sky-500`} />
      </div>
      <div className="space-y-2">
        {filtered.map(cmd => {
          const sec = SECURITY_META[cmd.securityLevel];
          const tok = TOKEN_META[cmd.tokenImpact];
          const isOpen = expanded === cmd.id;
          return (
            <div key={cmd.id} className={`rounded-xl border overflow-hidden transition-all ${isOpen ? 'border-sky-500/60' : tw(dm,'border')}`}>
              <button onClick={() => setExpanded(isOpen ? null : cmd.id)}
                className={`w-full text-left px-3 py-2.5 ${tw(dm,'card')}`}>
                <div className="flex items-center gap-2">
                  <code className={`text-xs font-mono font-bold flex-1 text-sky-500`}>{cmd.cmd}</code>
                  <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: sec.color + '22', color: sec.color }}>{sec.label}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: tok.color + '22', color: tok.color }}>tok:{cmd.tokenImpact}</span>
                  <ChevronDown size={12} className={`transition-transform shrink-0 ${tw(dm,'muted')} ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                <div className={`text-xs mt-0.5 ${tw(dm,'muted')}`}>{cmd.description}</div>
              </button>
              {isOpen && (
                <div className={`border-t ${tw(dm,'border')} ${tw(dm,'cardAlt')} p-3 space-y-3`}>
                  <div>
                    <div className="text-xs font-semibold text-sky-500 mb-1">Syntax</div>
                    <code className={`text-xs font-mono block p-2 rounded bg-slate-900 text-emerald-400`}>{cmd.syntax}</code>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-semibold text-violet-400 mb-1">Why it exists</div>
                      <p className={`text-xs ${tw(dm,'body')}`}>{cmd.whyItExists}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-amber-400 mb-1">Analogy</div>
                      <p className={`text-xs ${tw(dm,'body')}`}>{cmd.analogy}</p>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-400 mb-1">Example</div>
                    <pre className="text-xs font-mono p-2 rounded bg-slate-900 text-emerald-400 overflow-x-auto">{cmd.example}</pre>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cmd.tags.map(tag => (
                      <span key={tag} className={`text-xs px-1.5 py-0.5 rounded-full ${tw(dm,'cardAlt')} ${tw(dm,'muted')} border ${tw(dm,'border')}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className={`text-center py-6 text-xs ${tw(dm,'muted')}`}>No commands match "{search}"</div>
        )}
      </div>
    </div>
  );
}

// ── Terminal Simulator ─────────────────────────────────────────────────────────
type TermLine = { type: 'cmd' | 'output' | 'error'; text: string };

export function TerminalSimulator({ dm }: { dm: boolean }) {
  const [lines, setLines] = useState<TermLine[]>([
    { type: 'output', text: 'Claude Code Simulator — type commands to practice\nTry: claude --help  or  /help  or  claude -p "what is mcp"' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [tokensUsed, setTokensUsed] = useState(50);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [lines]);

  const execute = () => {
    const cmd = input.trim();
    if (!cmd) return;
    setHistory(h => [cmd, ...h.slice(0, 49)]);
    setHistIdx(-1);
    setLines(l => [...l, { type: 'cmd', text: `$ ${cmd}` }]);

    const parts = cmd.split(' ');
    const base = parts[0];
    const args = parts.slice(1).join(' ');

    const handler = base.startsWith('/') ? TERMINAL_REGISTRY[base] : TERMINAL_REGISTRY[base];
    if (handler) {
      const { output, tokensAdded } = handler(args, tokensUsed);
      if (output) setLines(l => [...l, { type: 'output', text: output }]);
      setTokensUsed(t => tokensAdded === -9999 ? 50 : Math.max(50, t + tokensAdded));
    } else {
      setLines(l => [...l, { type: 'error', text: `Command not found: ${base}\nTry: claude --help  or  /help` }]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { execute(); return; }
    if (e.key === 'ArrowUp') {
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setInput(history[next] ?? '');
      e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : history[next]);
      e.preventDefault();
    }
  };

  const fillPct = Math.min((tokensUsed / 200000) * 100, 100);

  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 font-mono text-sm">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border-b border-slate-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-slate-400 text-xs ml-2">Claude Code Terminal</span>
          <span className="ml-auto text-xs text-slate-500">ctx: {tokensUsed.toLocaleString()}/{(200000).toLocaleString()}</span>
        </div>
        <div ref={outputRef} className="h-56 overflow-y-auto p-3 space-y-1"
          onClick={() => inputRef.current?.focus()}>
          {lines.map((line, i) => (
            <div key={i} className={`text-xs whitespace-pre-wrap ${
              line.type === 'cmd' ? 'text-sky-400' :
              line.type === 'error' ? 'text-red-400' : 'text-slate-300'
            }`}>{line.text}</div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-700">
          <span className="text-sky-400 text-xs shrink-0">$</span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Type a command..." autoFocus
            className="flex-1 bg-transparent text-xs text-slate-100 outline-none placeholder-slate-600 font-mono" />
          <button onClick={execute} className="text-xs text-slate-500 hover:text-sky-400 transition-colors px-2">↵</button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
          <div className="h-full transition-all duration-300 rounded-full"
            style={{ width: `${fillPct}%`, background: fillPct > 80 ? '#ef4444' : fillPct > 50 ? '#f59e0b' : '#10b981' }} />
        </div>
        <span className={`text-xs font-mono ${tw(dm,'muted')}`}>Context: {fillPct.toFixed(2)}%</span>
        <button onClick={() => { setLines([{ type: 'output', text: 'Terminal cleared.' }]); setTokensUsed(50); }}
          className={`text-xs px-2 py-1 rounded border ${tw(dm,'border')} ${tw(dm,'muted')} hover:text-sky-500 transition-colors`}>
          clear
        </button>
      </div>
      <div className={`flex flex-wrap gap-2 text-xs ${tw(dm,'muted')}`}>
        {['claude --help', '/help', '/status', '/context', 'claude -p "what is mcp"', '/tree', '/init', '/run ls'].map(cmd => (
          <button key={cmd} onClick={() => { setInput(cmd); inputRef.current?.focus(); }}
            className={`px-2 py-1 rounded font-mono border ${tw(dm,'border')} hover:text-sky-500 hover:border-sky-500/40 transition-all`}>
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── MCP Flow Visualizer ────────────────────────────────────────────────────────
const MCP_FLOW_STEPS = [
  { id: 's1', label: 'User Command', detail: 'You type a task that requires external data or action', color: '#3b82f6', emoji: '👤' },
  { id: 's2', label: 'Claude Plans', detail: 'Model determines which tool to use and what arguments to pass', color: '#8b5cf6', emoji: '🤖' },
  { id: 's3', label: 'Tool Discovery', detail: 'Claude inspects available MCP tools from .claude/config.json', color: '#f59e0b', emoji: '🔍' },
  { id: 's4', label: 'tool_use Block', detail: 'Claude emits: { "type": "tool_use", "name": "...", "input": {...} }', color: '#f97316', emoji: '⚡' },
  { id: 's5', label: 'MCP Execution', detail: 'Tool server executes the action in its environment', color: '#ec4899', emoji: '🔌' },
  { id: 's6', label: 'tool_result', detail: 'Tool returns result, injected into context as next message', color: '#10b981', emoji: '📊' },
  { id: 's7', label: 'Claude Responds', detail: 'Model synthesizes tool result with task context to produce final answer', color: '#3b82f6', emoji: '💬' },
];

function MCPFlowPanel({ dm }: { dm: boolean }) {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setStepIdx(i => {
        if (i >= MCP_FLOW_STEPS.length - 1) { setPlaying(false); return i; }
        setActiveStep(MCP_FLOW_STEPS[i + 1].id);
        return i + 1;
      });
    }, 900);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);

  const reset = () => { setPlaying(false); setStepIdx(-1); setActiveStep(null); if (timerRef.current) clearInterval(timerRef.current); };
  const currentStep = MCP_FLOW_STEPS.find(s => s.id === (activeStep ?? MCP_FLOW_STEPS[0].id));

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button onClick={() => { reset(); setTimeout(() => { setStepIdx(0); setActiveStep(MCP_FLOW_STEPS[0].id); setPlaying(true); }, 50); }} disabled={playing}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${playing ? 'opacity-50 cursor-not-allowed bg-slate-700 text-slate-400' : 'bg-sky-600 hover:bg-sky-700 text-white'}`}>
          {playing ? '▶ Running...' : '▶ Animate Flow'}
        </button>
        <button onClick={reset} className={`px-4 py-2 rounded-xl text-xs ${tw(dm,'card')} border ${tw(dm,'border')} ${tw(dm,'body')}`}>↺ Reset</button>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {MCP_FLOW_STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center gap-1.5">
            <button onClick={() => setActiveStep(step.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${step.id === activeStep ? 'text-white border-transparent' : `${tw(dm,'body')} ${tw(dm,'border')} ${tw(dm,'hover')}`}`}
              style={step.id === activeStep ? { background: step.color, borderColor: step.color } : {}}>
              <span>{step.emoji}</span><span>{step.label}</span>
            </button>
            {i < MCP_FLOW_STEPS.length - 1 && <ChevronRight size={12} className={tw(dm,'muted')} />}
          </div>
        ))}
      </div>
      {currentStep && (
        <div className="rounded-xl border p-4" style={{ borderColor: currentStep.color + '44', background: currentStep.color + '0a' }}>
          <div className="text-sm font-bold mb-1" style={{ color: currentStep.color }}>{currentStep.emoji} {currentStep.label}</div>
          <p className={`text-xs ${tw(dm,'body')}`}>{currentStep.detail}</p>
          {currentStep.id === 's4' && (
            <pre className="mt-2 text-xs font-mono p-2 rounded bg-slate-900 text-emerald-400">{`{
  "type": "tool_use",
  "id": "toolu_abc123",
  "name": "filesystem",
  "input": { "path": "src/auth.ts", "operation": "read" }
}`}</pre>
          )}
          {currentStep.id === 's6' && (
            <pre className="mt-2 text-xs font-mono p-2 rounded bg-slate-900 text-emerald-400">{`{
  "type": "tool_result",
  "tool_use_id": "toolu_abc123",
  "content": "import jwt from 'jsonwebtoken';\n// ... file contents injected into context"
}`}</pre>
          )}
        </div>
      )}
    </div>
  );
}

// ── Common Mistakes Browser ────────────────────────────────────────────────────
const IMPACT_COLORS = { cost: '#f59e0b', security: '#ef4444', quality: '#8b5cf6', reliability: '#f97316' };
const SEV_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b' };

function MistakeBrowser({ dm }: { dm: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(commonMistakes[0].id);
  const [filterImpact, setFilterImpact] = useState<string>('all');

  const impacts = ['all', 'cost', 'security', 'quality', 'reliability'];
  const filtered = filterImpact === 'all' ? commonMistakes : commonMistakes.filter(m => m.impact === filterImpact);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {impacts.map(imp => (
          <button key={imp} onClick={() => setFilterImpact(imp)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${imp === filterImpact ? 'text-white' : `${tw(dm,'body')} ${tw(dm,'card')} border ${tw(dm,'border')}`}`}
            style={imp !== 'all' && imp === filterImpact ? { background: IMPACT_COLORS[imp as keyof typeof IMPACT_COLORS] } : imp === 'all' && filterImpact === 'all' ? { background: '#475569', color: 'white' } : {}}>
            {imp}
          </button>
        ))}
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filtered.map(m => (
          <div key={m.id} className={`rounded-xl border overflow-hidden ${tw(dm,'border')}`}>
            <button onClick={() => setExpanded(expanded === m.id ? null : m.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-left ${tw(dm,'card')}`}>
              <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: SEV_COLORS[m.severity] + '22', color: SEV_COLORS[m.severity] }}>{m.severity}</span>
              <span className={`flex-1 text-xs font-semibold ${tw(dm,'body')}`}>{m.title}</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-medium capitalize" style={{ background: IMPACT_COLORS[m.impact] + '22', color: IMPACT_COLORS[m.impact] }}>{m.impact}</span>
              <ChevronDown size={12} className={`transition-transform shrink-0 ${tw(dm,'muted')} ${expanded === m.id ? 'rotate-180' : ''}`} />
            </button>
            {expanded === m.id && (
              <div className={`border-t ${tw(dm,'border')} grid grid-cols-1 lg:grid-cols-2`}>
                <div className="p-3 border-r border-red-900/20 bg-red-500/5">
                  <div className="text-xs font-bold text-red-500 mb-2">❌ Wrong approach</div>
                  <pre className="text-xs font-mono p-2 rounded bg-slate-900 text-red-400 whitespace-pre-wrap mb-2">{m.bad.code}</pre>
                  <p className={`text-xs ${tw(dm,'muted')}`}>{m.bad.explanation}</p>
                </div>
                <div className="p-3 bg-emerald-500/5">
                  <div className="text-xs font-bold text-emerald-500 mb-2">✅ Correct approach</div>
                  <pre className="text-xs font-mono p-2 rounded bg-slate-900 text-emerald-400 whitespace-pre-wrap mb-2">{m.good.code}</pre>
                  <p className={`text-xs ${tw(dm,'muted')}`}>{m.good.explanation}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Recipe Book ────────────────────────────────────────────────────────────────
const DIFF_COLORS: Record<string, string> = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' };

function RecipeBook({ dm }: { dm: boolean }) {
  const [recipeIdx, setRecipeIdx] = useState(0);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const recipe = powerRecipes[recipeIdx];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {powerRecipes.map((r, i) => (
          <button key={i} onClick={() => { setRecipeIdx(i); setActiveStep(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${i === recipeIdx ? 'text-white border-transparent bg-gradient-to-r from-sky-600 to-violet-600' : `${tw(dm,'body')} ${tw(dm,'border')} ${tw(dm,'card')}`}`}>
            {r.title.length > 22 ? r.title.slice(0, 22) + '…' : r.title}
          </button>
        ))}
      </div>
      <div className={`rounded-xl border ${tw(dm,'border')} ${tw(dm,'card')} p-4`}>
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white capitalize" style={{ background: DIFF_COLORS[recipe.difficulty] }}>{recipe.difficulty}</span>
              <span className={`text-xs ${tw(dm,'muted')}`}>{recipe.tokenEstimate}</span>
            </div>
            <h3 className={`font-bold ${tw(dm,'heading')}`}>{recipe.title}</h3>
            <p className={`text-xs ${tw(dm,'muted')} mt-0.5`}>{recipe.useCase}</p>
          </div>
        </div>
        <div className="space-y-2">
          {recipe.steps.map((step, i) => (
            <button key={i} onClick={() => setActiveStep(activeStep === i ? null : i)}
              className={`w-full text-left rounded-xl border p-3 transition-all ${activeStep === i ? 'border-sky-500/50 bg-sky-500/5' : `${tw(dm,'border')} ${tw(dm,'hover')}`}`}>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0" style={{ background: '#3b82f6' }}>{i + 1}</span>
                <span className="text-sm">{step.emoji}</span>
                <span className={`flex-1 text-xs font-semibold ${tw(dm,'body')}`}>{step.actor}: {step.action}</span>
                {step.tokenCost && <span className={`text-xs font-mono ${tw(dm,'muted')}`}>{step.tokenCost}</span>}
                <ChevronDown size={12} className={`transition-transform ${tw(dm,'muted')} ${activeStep === i ? 'rotate-180' : ''}`} />
              </div>
              {activeStep === i && (
                <div className="mt-2 ml-7">
                  <code className={`text-xs font-mono block p-2 rounded bg-slate-900 text-emerald-400`}>{step.detail}</code>
                </div>
              )}
            </button>
          ))}
        </div>
        <div className={`mt-4 pt-4 border-t ${tw(dm,'border')}`}>
          <div className="text-xs font-semibold text-amber-500 mb-2">⚠ Caveats</div>
          {recipe.caveats.map((c, i) => (
            <div key={i} className={`text-xs ${tw(dm,'body')} flex gap-1.5`}><span className="text-amber-500 shrink-0">·</span>{c}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Generic section content ────────────────────────────────────────────────────
function SectionContent({ section, mode, dm }: { section: (typeof cheatSections)[0]; mode: CheatMode; dm: boolean }) {
  const content = section.modeContent[mode];
  return (
    <div className="space-y-4">
      <p className={`text-sm leading-relaxed ${tw(dm,'body')}`}>{content.overview}</p>
      <div className="space-y-2">
        {content.keyPoints.map((pt, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-sky-500 mt-0.5 shrink-0">▸</span>
            <span className={`text-sm ${tw(dm,'body')}`}>{pt}</span>
          </div>
        ))}
      </div>
      {content.tip && (
        <div className="rounded-xl p-3 border border-sky-500/30 bg-sky-500/5">
          <span className="text-xs font-bold text-sky-500">💡 Pro tip: </span>
          <span className={`text-xs ${tw(dm,'body')}`}>{content.tip}</span>
        </div>
      )}
    </div>
  );
}

function SectionView({ section, mode, dm }: { section: (typeof cheatSections)[0]; mode: CheatMode; dm: boolean }) {
  const grp = CHEAT_GROUPS[section.group];
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="text-4xl">{section.emoji}</div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: grp.color + '22', color: grp.color }}>{grp.label}</span>
            {section.interactiveType && <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-sky-500/20 text-sky-400">LIVE</span>}
            {section.commands && <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-violet-500/20 text-violet-400">{section.commands.length} commands</span>}
          </div>
          <h2 className={`text-xl font-bold ${tw(dm,'heading')}`}>{section.title}</h2>
          <p className={`text-sm ${tw(dm,'muted')}`}>{section.tagline}</p>
        </div>
      </div>
      {section.commands && section.interactiveType === 'command-browser' && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-sky-500 mb-4">Command Reference</div>
          <CommandBrowser commands={section.commands} dm={dm} />
        </div>
      )}
      {section.interactiveType === 'terminal' && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-sky-500 mb-4">Terminal Playground</div>
          <TerminalSimulator dm={dm} />
        </div>
      )}
      {section.interactiveType === 'mcp-flow' && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-violet-500 mb-4">MCP Execution Flow</div>
          <MCPFlowPanel dm={dm} />
        </div>
      )}
      {section.interactiveType === 'mistakes' && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-4">Common Mistakes</div>
          <MistakeBrowser dm={dm} />
        </div>
      )}
      {section.interactiveType === 'recipes' && (
        <div className={`rounded-xl border p-4 ${tw(dm,'card')} ${tw(dm,'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider text-pink-500 mb-4">Power User Recipes</div>
          <RecipeBook dm={dm} />
        </div>
      )}
      <SectionContent section={section} mode={mode} dm={dm} />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function CheatSheetPage() {
  const { darkMode } = useAppStore();
  const dm = darkMode;
  const [activeSection, setActiveSection] = useState<CheatSectionId>('claude-cli-basics');
  const [activeMode, setActiveMode] = useState<CheatMode>('developer');

  const section = cheatSections.find(s => s.id === activeSection) ?? cheatSections[0];
  const grouped = useMemo(() => CHEAT_GROUP_ORDER.reduce<Partial<Record<CheatSectionGroup, typeof cheatSections>>>((acc, g) => {
    acc[g] = cheatSections.filter(s => s.group === g);
    return acc;
  }, {}), []);

  return (
    <div className={`flex h-full overflow-hidden ${tw(dm,'page')}`}>
      <aside className={`w-56 shrink-0 flex flex-col border-r overflow-y-auto ${tw(dm,'card')} ${tw(dm,'border')}`}>
        <div className="p-3 border-b border-sky-900/20" style={{ background: 'linear-gradient(135deg, #0c4a6e22, #1e1b4b22)' }}>
          <div className="text-sm font-bold text-sky-500">⌨️ Claude Cheat Sheets</div>
          <div className={`text-xs ${tw(dm,'muted')}`}>Quick Operational Reference</div>
        </div>
        <div className="p-2 border-b border-slate-700/30 space-y-1">
          <div className={`text-xs font-semibold uppercase tracking-wider px-1 mb-1 ${tw(dm,'muted')}`}>Mode</div>
          {(Object.keys(CHEAT_MODES) as CheatMode[]).map(m => {
            const meta = CHEAT_MODES[m];
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
          {CHEAT_GROUP_ORDER.map(group => {
            const sections = grouped[group];
            if (!sections?.length) return null;
            const meta = CHEAT_GROUPS[group];
            return (
              <div key={group}>
                <div className="text-xs font-bold uppercase tracking-wider px-1 mb-1" style={{ color: meta.color }}>{meta.label}</div>
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
          <div className={`text-xs ${tw(dm,'muted')} text-center`}>13 sections · 3 live tools</div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div key={`${activeSection}-${activeMode}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}>
              <div className="flex flex-wrap gap-2 mb-4">
                {(Object.keys(CHEAT_MODES) as CheatMode[]).map(m => {
                  const meta = CHEAT_MODES[m];
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
                  const i = cheatSections.findIndex(s => s.id === activeSection);
                  const prev = cheatSections[i - 1];
                  const next = cheatSections[i + 1];
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
