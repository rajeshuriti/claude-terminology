import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Play, Square, RotateCcw, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { internalFiles, toolSteps, promptLayers } from '@/data/internalsData';

// ─── Utilities ────────────────────────────────────────────────────────────────

function CodeBlock({ code, lang = 'json', dm }: { code: string; lang?: string; dm: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="relative rounded-xl overflow-hidden text-xs bg-slate-950">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800">
        <span className="text-slate-500 font-mono">{lang}</span>
        <button onClick={copy} className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors">
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className={`p-4 overflow-x-auto font-mono leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-200'}`}>{code}</pre>
    </div>
  );
}

// ─── Tab 1: Config Files ──────────────────────────────────────────────────────

const CONFIG_INNER_TABS = ['Syntax', 'Good Example', 'Anti-Pattern', 'Tips'] as const;
type ConfigInnerTab = typeof CONFIG_INNER_TABS[number];

function ConfigFilesTab({ dm }: { dm: boolean }) {
  const [fileIdx, setFileIdx] = useState(0);
  const [inner, setInner] = useState<ConfigInnerTab>('Syntax');
  const [showStack, setShowStack] = useState(false);
  const file = internalFiles[fileIdx];

  const innerContent: Record<ConfigInnerTab, React.ReactNode> = {
    'Syntax':       file.syntax      ? <CodeBlock code={file.syntax}      lang="typescript" dm={dm} /> : null,
    'Good Example': file.goodExample ? <CodeBlock code={file.goodExample} lang="text"       dm={dm} /> : null,
    'Anti-Pattern': file.badExample  ? (
      <div>
        <div className={`flex items-center gap-2 mb-2 text-xs font-bold text-red-400`}>✗ What Not To Do</div>
        <CodeBlock code={file.badExample} lang="text" dm={dm} />
      </div>
    ) : null,
    'Tips': (
      <ul className="space-y-2">
        {file.tips.map((t, i) => (
          <li key={i} className={`flex items-start gap-2 text-sm ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>{t}
          </li>
        ))}
      </ul>
    ),
  };

  return (
    <div>
      {/* File selector */}
      <div className="flex gap-2 mb-5">
        {internalFiles.map((f, i) => (
          <button key={f.id} onClick={() => { setFileIdx(i); setInner('Syntax'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              fileIdx === i
                ? dm ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                : dm ? 'border-slate-700 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}>
            <span>{f.icon}</span>{f.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* File overview */}
        <div className={`p-5 rounded-2xl border ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{file.icon}</span>
            <div>
              <div className={`font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{file.title}</div>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: (file.badgeColor ?? '#64748b') + '25', color: file.badgeColor ?? '#64748b' }}>
                {file.badge}
              </span>
            </div>
            <div className={`ml-auto text-center ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              <div className="text-2xl font-bold" style={{ color: file.badgeColor ?? '#64748b' }}>#{file.priority}</div>
              <div className="text-xs">priority</div>
            </div>
          </div>
          <p className={`text-sm mb-3 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{file.purpose}</p>
          <div className={`text-xs p-3 rounded-lg ${dm ? 'bg-slate-900/60' : 'bg-slate-50'}`}>
            <span className={`font-semibold ${dm ? 'text-slate-400' : 'text-slate-500'}`}>When: </span>
            <span className={dm ? 'text-slate-300' : 'text-slate-600'}>{file.whenUsed}</span>
          </div>
        </div>

        {/* Inner tabs */}
        <div>
          <div className={`flex gap-1 p-1 rounded-xl mb-4 w-fit ${dm ? 'bg-slate-800' : 'bg-slate-100'}`}>
            {CONFIG_INNER_TABS.map(t => (
              <button key={t} onClick={() => setInner(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  inner === t
                    ? dm ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm'
                    : dm ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {t}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={`${file.id}-${inner}`}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}>
              {innerContent[inner]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Prompt Priority Stack toggle */}
      <button onClick={() => setShowStack(s => !s)}
        className={`flex items-center gap-2 text-sm font-medium mb-3 ${dm ? 'text-sky-400 hover:text-sky-300' : 'text-sky-600 hover:text-sky-500'}`}>
        🥞 Prompt Priority Stack
        <span className="text-xs opacity-60">{showStack ? '(hide)' : '(show)'}</span>
      </button>
      <AnimatePresence>
        {showStack && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="space-y-1 mb-4">
              {promptLayers.map((layer, i) => (
                <div key={layer.id} className={`flex items-center gap-3 p-3 rounded-xl border ${dm ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: layer.color }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${dm ? 'text-white' : 'text-slate-900'}`}>{layer.name}</div>
                    <div className={`text-xs truncate ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{layer.description}</div>
                  </div>
                  <div className={`text-xs font-mono px-2 py-0.5 rounded ${dm ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    {layer.overriddenBy.length === 0 ? 'highest' : `overrides ${layer.canOverride.length}`}
                  </div>
                </div>
              ))}
            </div>
            <div className={`p-3 rounded-xl text-xs ${dm ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
              <strong>Conflict rule:</strong> Higher priority layers always win. System Prompt (#1) cannot be overridden by users.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tab 2: Runtime ───────────────────────────────────────────────────────────

const MEMORY_TYPES = [
  { name: 'Context Window',  desc: 'Active conversation tokens — cleared each session', pct: 60, color: '#0ea5e9' },
  { name: 'CLAUDE.md Files', desc: 'Project memory injected at startup — persists across sessions', pct: 15, color: '#10b981' },
  { name: 'Tool Results',    desc: 'Outputs from tool calls appended to context', pct: 15, color: '#f59e0b' },
  { name: 'System Prompt',   desc: 'Operator instructions — fixed overhead per request', pct: 10, color: '#8b5cf6' },
];

function RuntimeTab({ dm }: { dm: boolean }) {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => { if (timerRef.current) clearInterval(timerRef.current); setPlaying(false); };
  const reset = () => { stop(); setStep(-1); };
  const play = () => {
    stop(); setStep(0); setPlaying(true);
    timerRef.current = setInterval(() => {
      setStep(prev => {
        if (prev >= toolSteps.length - 1) { stop(); return prev; }
        return prev + 1;
      });
    }, 1400);
  };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return (
    <div className="space-y-8">
      {/* Tool Lifecycle */}
      <div>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
          Tool Call Lifecycle
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {toolSteps.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <motion.div animate={i === step ? { scale: 1.1 } : { scale: 1 }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                  i === step ? 'text-white border-transparent shadow-md' :
                  i < step   ? (dm ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-600') :
                  dm ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`} style={i === step ? { background: s.color, borderColor: s.color } : {}}>
                {s.icon} {s.label}
              </motion.div>
              {i < toolSteps.length - 1 && <span className={`text-xs ${i < step ? 'text-sky-400' : dm ? 'text-slate-600' : 'text-slate-300'}`}>→</span>}
            </div>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {step >= 0 && (
            <motion.div key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`p-4 rounded-xl border mb-4 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-sm font-bold mb-1" style={{ color: toolSteps[step].color }}>
                Step {step + 1}: {toolSteps[step].label}
              </div>
              <div className={`text-xs ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{toolSteps[step].description}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex gap-2">
          {!playing && step < toolSteps.length - 1
            ? <button onClick={play} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium"><Play size={13} /> Simulate</button>
            : playing
            ? <button onClick={stop} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium"><Square size={13} /> Stop</button>
            : null}
          {step >= 0 && <button onClick={reset} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}><RotateCcw size={13} /> Reset</button>}
        </div>
      </div>

      {/* Memory & Context */}
      <div>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
          Token Budget Allocation (200K context example)
        </h3>
        <div className="space-y-3 mb-4">
          {MEMORY_TYPES.map(m => (
            <div key={m.name}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${dm ? 'text-slate-200' : 'text-slate-800'}`}>{m.name}</span>
                <span className="text-xs font-mono" style={{ color: m.color }}>{m.pct}%</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${dm ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct}%` }} transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full" style={{ background: m.color }} />
              </div>
              <div className={`text-xs mt-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{m.desc}</div>
            </div>
          ))}
        </div>
        <div className={`p-3 rounded-xl text-xs ${dm ? 'bg-amber-950/30 border border-amber-800/30 text-amber-300' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
          <strong>Lost in the middle:</strong> Information in the center of a long context window is recalled less reliably than content at the start or end. Place critical facts at context boundaries.
        </div>
      </div>
    </div>
  );
}

// ─── Tab 3: Hooks & Permissions ───────────────────────────────────────────────

const HOOK_EVENTS = [
  {
    name: 'PreToolUse',
    desc: 'Fires before any tool is called. Can block the tool call.',
    use: 'Security validation, cost checks, approval gates',
    example: `{ "PreToolUse": [{ "matcher": "Bash", "hooks": [{ "type": "command", "command": "check-permissions.sh" }] }] }`,
  },
  {
    name: 'PostToolUse',
    desc: 'Fires after a tool call completes. Cannot block but can log or trigger follow-up.',
    use: 'Linting, testing, audit logging, notifications',
    example: `{ "PostToolUse": [{ "matcher": "Bash", "hooks": [{ "type": "command", "command": "npm run lint" }] }] }`,
  },
  {
    name: 'Notification',
    desc: 'Fires when Claude generates a notification message.',
    use: 'Slack alerts, dashboard updates, progress tracking',
    example: `{ "Notification": [{ "hooks": [{ "type": "command", "command": "notify.sh" }] }] }`,
  },
  {
    name: 'Stop',
    desc: 'Fires when Claude finishes a response.',
    use: 'Cleanup, session logging, cost reporting',
    example: `{ "Stop": [{ "hooks": [{ "type": "command", "command": "log-session.sh" }] }] }`,
  },
];

const PERMISSION_LEVELS = [
  { level: 'Global', file: '~/.claude/settings.json', desc: 'Applies to all projects. Use for personal preferences and safe defaults.', color: '#8b5cf6' },
  { level: 'Project', file: '.claude/settings.json', desc: 'Project-specific. Overrides global. Checked into source control.', color: '#0ea5e9' },
  { level: 'Runtime', file: 'API flags / CLI flags', desc: 'Per-invocation. Highest specificity. Use for dynamic permission decisions.', color: '#10b981' },
];

const NEVER_ALLOW = ['Bash(*)', 'Write(**/.env)', 'Write(**/secrets*)', 'Bash(rm -rf *)', 'Bash(sudo *)', 'Bash(curl * | bash)'];

function HooksPermissionsTab({ dm }: { dm: boolean }) {
  const [openHook, setOpenHook] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Hooks */}
      <div>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Hook Events</h3>
        <div className="space-y-2">
          {HOOK_EVENTS.map((h, i) => (
            <div key={h.name} className={`rounded-xl border overflow-hidden ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
              <button onClick={() => setOpenHook(openHook === i ? null : i)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${dm ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                <div>
                  <div className={`text-sm font-semibold font-mono ${dm ? 'text-sky-400' : 'text-sky-600'}`}>{h.name}</div>
                  <div className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{h.desc}</div>
                </div>
                <ArrowRight size={14} className={`transition-transform ${openHook === i ? 'rotate-90' : ''} ${dm ? 'text-slate-500' : 'text-slate-400'}`} />
              </button>
              <AnimatePresence>
                {openHook === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className={`px-4 pb-4 pt-2 border-t ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
                      <div className={`text-xs mb-2 ${dm ? 'text-slate-400' : 'text-slate-600'}`}><strong>Common use:</strong> {h.use}</div>
                      <CodeBlock code={h.example} lang="json" dm={dm} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions */}
      <div>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Permission Levels</h3>
        <div className="space-y-3 mb-6">
          {PERMISSION_LEVELS.map(p => (
            <div key={p.level} className={`p-4 rounded-xl border ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                <span className="text-sm font-semibold" style={{ color: p.color }}>{p.level}</span>
                <code className={`ml-auto text-xs font-mono ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{p.file}</code>
              </div>
              <p className={`text-xs ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{p.desc}</p>
            </div>
          ))}
        </div>

        <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
          Never Allow These
        </h3>
        <div className={`p-4 rounded-xl border ${dm ? 'bg-red-950/20 border-red-800/30' : 'bg-red-50 border-red-200'}`}>
          <div className="space-y-1">
            {NEVER_ALLOW.map(p => (
              <div key={p} className="flex items-center gap-2">
                <span className="text-red-400 text-xs">✗</span>
                <code className={`text-xs font-mono ${dm ? 'text-red-300' : 'text-red-700'}`}>{p}</code>
              </div>
            ))}
          </div>
          <div className={`mt-3 text-xs ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
            Start with minimal permissions and add specific glob patterns as needed: <code className="font-mono">Bash(npm run *)</code> not <code className="font-mono">Bash(*)</code>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 4: Comparisons ───────────────────────────────────────────────────────

const COMPARISONS = [
  {
    title: 'CLAUDE.md vs claude.json',
    a: 'CLAUDE.md',
    b: 'claude.json / settings.json',
    rows: [
      { attr: 'Format',       a: 'Markdown prose',              b: 'JSON config'             },
      { attr: 'Read by',      a: 'Claude (as context)',         b: 'Claude Code runtime'     },
      { attr: 'Controls',     a: 'Project knowledge & norms',   b: 'Permissions & behavior'  },
      { attr: 'Scope',        a: 'Project + parent directories', b: 'Project or global'      },
      { attr: 'Checked in',   a: 'Yes — living documentation',  b: 'Usually yes'             },
      { attr: 'Use for',      a: 'What Claude should know',     b: 'What Claude can do'      },
    ],
  },
  {
    title: 'System Prompt vs User Message',
    a: 'System Prompt',
    b: 'User Message',
    rows: [
      { attr: 'Set by',       a: 'Operator (developer)',        b: 'End user'                },
      { attr: 'Priority',     a: '#1 — highest',               b: '#5 — cannot override sys' },
      { attr: 'Persistence',  a: 'Every request',              b: 'Single turn'             },
      { attr: 'Use for',      a: 'Role, constraints, format',  b: 'Dynamic task input'      },
      { attr: 'Overrideable', a: 'No',                         b: 'By system prompt'        },
      { attr: 'Token cost',   a: 'Fixed overhead per request', b: 'Variable per turn'       },
    ],
  },
  {
    title: 'MCP vs Direct Tool Use',
    a: 'MCP (Model Context Protocol)',
    b: 'Direct Tool Use (API)',
    rows: [
      { attr: 'Protocol',     a: 'Standardized JSON-RPC',      b: 'Custom JSON Schema'      },
      { attr: 'Transport',    a: 'stdio, SSE',                 b: 'Inline in API request'   },
      { attr: 'Reusability',  a: 'Any model that supports MCP', b: 'Claude-specific'        },
      { attr: 'Setup',        a: 'External process to run',    b: 'Schemas in API body'     },
      { attr: 'Best for',     a: 'Rich integrations, dev tools', b: 'Simple custom tools'  },
      { attr: 'Security',     a: 'Process isolation (can sandbox)', b: 'In-process'        },
    ],
  },
];

function ComparisonsTab({ dm }: { dm: boolean }) {
  const [activeComp, setActiveComp] = useState(0);
  const comp = COMPARISONS[activeComp];
  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {COMPARISONS.map((c, i) => (
          <button key={i} onClick={() => setActiveComp(i)}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              activeComp === i
                ? dm ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                : dm ? 'border-slate-700 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}>
            {c.title}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeComp} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className={`rounded-2xl border overflow-hidden ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
            {/* Header */}
            <div className={`grid grid-cols-3 ${dm ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <div className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${dm ? 'text-slate-500 border-r border-slate-700' : 'text-slate-400 border-r border-slate-200'}`}>Attribute</div>
              <div className={`px-4 py-3 text-sm font-semibold text-sky-400 border-r ${dm ? 'border-slate-700' : 'border-slate-200'}`}>{comp.a}</div>
              <div className="px-4 py-3 text-sm font-semibold text-violet-400">{comp.b}</div>
            </div>
            {/* Rows */}
            {comp.rows.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 border-t ${dm ? 'border-slate-700 hover:bg-slate-800/40' : 'border-slate-100 hover:bg-slate-50'}`}>
                <div className={`px-4 py-3 text-xs font-semibold ${dm ? 'text-slate-400 border-r border-slate-700' : 'text-slate-500 border-r border-slate-100'}`}>{row.attr}</div>
                <div className={`px-4 py-3 text-sm ${dm ? 'text-slate-300 border-r border-slate-700' : 'text-slate-700 border-r border-slate-100'}`}>{row.a}</div>
                <div className={`px-4 py-3 text-sm ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{row.b}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'config' | 'runtime' | 'hooks' | 'comparisons';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'config',      label: 'Config Files',         emoji: '📄' },
  { id: 'runtime',     label: 'Runtime',               emoji: '⚡' },
  { id: 'hooks',       label: 'Hooks & Permissions',   emoji: '🔐' },
  { id: 'comparisons', label: 'Comparisons',           emoji: '↔️' },
];

export function ClaudeInternalsPage() {
  const { darkMode } = useAppStore();
  const dm = darkMode;
  const [tab, setTab] = useState<Tab>('config');
  const navigate = useNavigate();

  return (
    <div className={`min-h-full ${dm ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-5xl mx-auto px-6 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold mb-1 ${dm ? 'text-white' : 'text-slate-900'}`}>
            Claude Configuration Reference
          </h1>
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
            Config files, runtime mechanics, hooks, permissions, and quick comparisons.
          </p>
        </div>

        {/* Cross-link banner */}
        <button
          onClick={() => navigate('/architecture')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 text-left transition-colors ${
            dm
              ? 'bg-sky-950/30 border-sky-800/40 hover:bg-sky-950/50'
              : 'bg-sky-50 border-sky-200 hover:bg-sky-100'
          }`}
        >
          <span className="text-xl">🏗️</span>
          <div className="flex-1">
            <div className={`text-sm font-semibold ${dm ? 'text-sky-300' : 'text-sky-700'}`}>
              Architecture Explorer
            </div>
            <div className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              For architecture diagrams, system flows, evolution stages, and visual patterns → open Architecture Explorer
            </div>
          </div>
          <ExternalLink size={16} className={dm ? 'text-sky-400' : 'text-sky-600'} />
        </button>

        {/* Tab bar */}
        <div className={`flex gap-1 p-1 rounded-2xl mb-6 w-fit ${dm ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? dm ? 'bg-slate-700 text-white shadow' : 'bg-slate-900 text-white shadow'
                  : dm ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}>
              <span>{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            {tab === 'config'      && <ConfigFilesTab      dm={dm} />}
            {tab === 'runtime'     && <RuntimeTab          dm={dm} />}
            {tab === 'hooks'       && <HooksPermissionsTab dm={dm} />}
            {tab === 'comparisons' && <ComparisonsTab      dm={dm} />}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
