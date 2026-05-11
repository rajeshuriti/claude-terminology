import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Search, Play, RotateCcw, CheckCircle2,
  AlertTriangle, Copy, Check, ArrowRight, Star,
  ChevronDown, ChevronUp, Terminal, X,
} from 'lucide-react';
import ReactFlow, {
  type Node, type Edge, Background, Controls,
  useNodesState, useEdgesState, MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import { useAppStore } from '@/store/appStore';
import {
  slashCommands, workflowTemplates, studioSections,
  categoryConfig, commandChains,
  type SlashCommand, type StudioSection, type WorkflowTemplate,
} from '@/data/slashCommandsData';

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function CodeLine({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const { darkMode } = useAppStore();
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm ${darkMode ? 'bg-slate-900 text-sky-300' : 'bg-slate-950 text-sky-200'}`}>
      <span className="text-slate-500 select-none">$</span>
      <span className="flex-1">{code}</span>
      <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
        className="text-slate-500 hover:text-slate-300 transition-colors">
        {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      </button>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const cfg = { safe: { color: '#10b981', label: 'Safe' }, caution: { color: '#f59e0b', label: 'Caution' }, dangerous: { color: '#ef4444', label: 'Dangerous' } };
  const c = cfg[level as keyof typeof cfg] ?? cfg.safe;
  return <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: c.color + '22', color: c.color }}>{c.label}</span>;
}

function DiffBadge({ value, label }: { value: number; label: string }) {
  const { darkMode } = useAppStore();
  const positive = value > 0;
  const zero = value === 0;
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
      <span className="text-xs font-bold" style={{ color: zero ? '#64748b' : positive ? '#ef4444' : '#10b981' }}>
        {zero ? '±0' : positive ? `+${value}%` : `${value}%`}
      </span>
      <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
    </div>
  );
}

// ─── Command Card (mini, for overview grid) ───────────────────────────────────

function CommandCard({ cmd, onClick, active }: { cmd: SlashCommand; onClick: () => void; active: boolean }) {
  const { darkMode } = useAppStore();
  const cat = categoryConfig[cmd.category];
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-4 rounded-2xl border text-left transition-all hover:shadow-md w-full ${
        active
          ? 'shadow-md border-2'
          : darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
      }`}
      style={active ? { borderColor: cat.color, backgroundColor: cat.color + '12' } : {}}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
          style={{ backgroundColor: cat.color + '20' }}>{cat.icon}</div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-bold font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>{cmd.name}</div>
          <div className="text-xs font-medium capitalize" style={{ color: cat.color }}>{cat.label}</div>
        </div>
        <RiskBadge level={cmd.riskLevel} />
      </div>
      <p className={`text-xs leading-relaxed ${textMuted}`}>{cmd.tagline}</p>
      <div className="flex items-center gap-2 mt-2">
        <DiffBadge value={cmd.tokenImpact} label="tokens" />
        <span className={`text-xs capitalize px-2 py-0.5 rounded-md ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
          {cmd.difficulty}
        </span>
      </div>
    </motion.button>
  );
}

// ─── Command Detail Panel ─────────────────────────────────────────────────────

function CommandDetail({ cmd, onClose }: { cmd: SlashCommand; onClose: () => void }) {
  const { darkMode } = useAppStore();
  const cat = categoryConfig[cmd.category];
  const [activeTab, setActiveTab] = useState<'overview' | 'mechanics' | 'workflow'>('overview');
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'mechanics', label: 'State Changes' },
    { id: 'workflow', label: 'Workflow Usage' },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
    >
      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: darkMode ? '#334155' : '#f1f5f9', borderLeftWidth: 4, borderLeftColor: cat.color }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: cat.color + '20' }}>{cat.icon}</div>
            <div>
              <div className={`text-lg font-bold font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>{cmd.name}</div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs font-medium" style={{ color: cat.color }}>{cat.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium" style={{ backgroundColor: cat.color + '15', color: cat.color }}>{cmd.type}</span>
                <span className={`text-xs capitalize ${textMuted}`}>{cmd.difficulty}</span>
                <RiskBadge level={cmd.riskLevel} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}>
            <X size={14} />
          </button>
        </div>
        <p className={`mt-3 text-sm leading-relaxed ${textMuted}`}>{cmd.purpose}</p>
        <div className="mt-3">
          <CodeLine code={cmd.syntax} />
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-semibold transition-colors ${activeTab === tab.id ? 'text-sky-500 border-b-2 border-sky-500' : textMuted}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: '⏱️', label: 'Timing', value: cmd.executionTiming },
                    { icon: '📍', label: 'Scope', value: cmd.scope },
                    { icon: '💥', label: 'Session Impact', value: cmd.sessionImpact },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className={`p-3 rounded-xl border ${cardBg} ${label === 'Session Impact' ? 'col-span-2' : ''}`}>
                      <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${textMuted}`}>{icon} {label}</div>
                      <div className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{value}</div>
                    </div>
                  ))}
                </div>
                {cmd.sideEffects.length > 0 && (
                  <div className={`p-3 rounded-xl border ${cardBg}`}>
                    <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${textMuted}`}>⚡ Side Effects</div>
                    <div className="space-y-1">
                      {cmd.sideEffects.map((e, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          <span className={`text-xs ${textMuted}`}>{e}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {cmd.unsafePatterns.length > 0 && (
                  <div className={`p-3 rounded-xl border ${darkMode ? 'border-rose-700/30 bg-rose-900/10' : 'border-rose-200 bg-rose-50'}`}>
                    <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${darkMode ? 'text-rose-400' : 'text-rose-700'}`}>🚫 Anti-Patterns</div>
                    {cmd.unsafePatterns.map((p, i) => (
                      <div key={i} className="flex items-start gap-1.5 mb-1">
                        <AlertTriangle size={11} className="text-rose-500 shrink-0 mt-0.5" />
                        <span className={`text-xs ${darkMode ? 'text-rose-300' : 'text-rose-700'}`}>{p}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className={`p-3 rounded-xl border ${darkMode ? 'border-sky-700/30 bg-sky-900/10' : 'border-sky-200 bg-sky-50'}`}>
                  <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>💡 Real-World Scenario</div>
                  <p className={`text-xs leading-relaxed italic ${darkMode ? 'text-sky-300' : 'text-sky-800'}`}>{cmd.realWorldScenario}</p>
                </div>
              </div>
            )}

            {activeTab === 'mechanics' && (
              <div className="space-y-3">
                <div className={`text-xs font-bold uppercase tracking-wide ${textMuted}`}>Before → After State Changes</div>
                {cmd.stateChanges.length === 0 ? (
                  <div className={`p-4 rounded-xl text-center ${cardBg} border`}>
                    <CheckCircle2 size={20} className="text-emerald-500 mx-auto mb-2" />
                    <p className={`text-xs ${textMuted}`}>This command is read-only — no state changes</p>
                  </div>
                ) : (
                  cmd.stateChanges.map((sc, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${cardBg}`}>
                      <div className={`text-xs font-bold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sc.field}</div>
                      <div className="flex items-center gap-3">
                        <div className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-mono ${darkMode ? 'bg-rose-900/20 text-rose-300' : 'bg-rose-50 text-rose-700'}`}>
                          {String(sc.before)}
                        </div>
                        <ArrowRight size={14} className="text-slate-400 shrink-0" />
                        <div className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-mono ${darkMode ? 'bg-emerald-900/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                          {String(sc.after)}
                        </div>
                        {sc.delta !== undefined && (
                          <span className="text-xs font-bold shrink-0" style={{ color: sc.delta < 0 ? '#10b981' : '#ef4444' }}>
                            {sc.delta > 0 ? `+${sc.delta}` : sc.delta}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div className={`p-3 rounded-xl border ${cardBg}`}>
                  <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${textMuted}`}>🔧 Internal Note</div>
                  <p className={`text-xs leading-relaxed ${textMuted}`}>{cmd.internalNote}</p>
                </div>
              </div>
            )}

            {activeTab === 'workflow' && (
              <div className="space-y-3">
                <div className={`text-xs font-bold uppercase tracking-wide ${textMuted}`}>When to Use</div>
                <div className="space-y-2">
                  {cmd.workflowUsage.map((w, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Star size={12} className="text-amber-400 shrink-0 mt-0.5" />
                      <span className={`text-xs leading-relaxed ${textMuted}`}>{w}</span>
                    </div>
                  ))}
                </div>
                {cmd.compatibleWith.length > 0 && (
                  <div className={`p-3 rounded-xl border ${cardBg}`}>
                    <div className={`text-xs font-bold mb-2 ${textMuted}`}>Works Well With</div>
                    <div className="flex flex-wrap gap-1.5">
                      {cmd.compatibleWith.map(id => {
                        const other = slashCommands.find(c => c.id === id);
                        const otherCat = other ? categoryConfig[other.category] : null;
                        return other ? (
                          <span key={id} className="text-xs px-2.5 py-1 rounded-lg font-mono font-semibold"
                            style={{ backgroundColor: (otherCat?.color ?? '#64748b') + '20', color: otherCat?.color ?? '#64748b' }}>
                            {other.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── SECTION: Overview ────────────────────────────────────────────────────────

function OverviewSection() {
  const { darkMode } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState<string | null>(null);
  const [selectedCmd, setSelectedCmd] = useState<SlashCommand | null>(null);
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  const filtered = useMemo(() => slashCommands.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch = !q || c.name.includes(q) || c.tagline.toLowerCase().includes(q) || c.purpose.toLowerCase().includes(q);
    const matchesCat = !filterCat || c.category === filterCat;
    const matchesRisk = !filterRisk || c.riskLevel === filterRisk;
    return matchesSearch && matchesCat && matchesRisk;
  }), [search, filterCat, filterRisk]);

  const cats = Object.entries(categoryConfig);

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Command Overview</h2>
        <p className={`mt-1 text-sm ${textMuted}`}>Every Claude Code slash command — click any card to inspect its behavior, state changes, and workflows.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Commands', value: slashCommands.length, color: '#0ea5e9' },
          { label: 'Built-in', value: slashCommands.filter(c => c.type === 'built-in').length, color: '#10b981' },
          { label: 'Skills/Custom', value: slashCommands.filter(c => c.type !== 'built-in').length, color: '#8b5cf6' },
          { label: 'Safe', value: slashCommands.filter(c => c.riskLevel === 'safe').length, color: '#10b981' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`p-4 rounded-2xl border text-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="text-2xl font-black" style={{ color }}>{value}</div>
            <div className={`text-xs mt-0.5 ${textMuted}`}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-48 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <Search size={14} className={textMuted} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search commands…"
            className={`flex-1 text-sm bg-transparent outline-none ${darkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`} />
          {search && <button onClick={() => setSearch('')}><X size={13} className={textMuted} /></button>}
        </div>
        <button onClick={() => setFilterRisk(filterRisk === 'caution' ? null : 'caution')}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${filterRisk === 'caution' ? 'bg-amber-500 text-white border-amber-500' : darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
          ⚠️ Caution only
        </button>
        {filterCat && (
          <button onClick={() => setFilterCat(null)} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
            <X size={12} /> Clear filter
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {cats.map(([id, cat]) => (
          <button key={id} onClick={() => setFilterCat(filterCat === id ? null : id)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
            style={filterCat === id
              ? { backgroundColor: cat.color, color: '#fff' }
              : { backgroundColor: cat.color + '18', color: cat.color }
            }>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Grid + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
          {filtered.map(cmd => (
            <CommandCard key={cmd.id} cmd={cmd} onClick={() => setSelectedCmd(selectedCmd?.id === cmd.id ? null : cmd)} active={selectedCmd?.id === cmd.id} />
          ))}
          {filtered.length === 0 && (
            <div className={`col-span-2 py-12 text-center ${textMuted}`}>
              <Terminal size={32} className="mx-auto mb-2 opacity-30" />
              <p>No commands match your search</p>
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedCmd ? (
              <CommandDetail key={selectedCmd.id} cmd={selectedCmd} onClose={() => setSelectedCmd(null)} />
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`rounded-2xl border p-8 text-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <Terminal size={32} className={`mx-auto mb-3 ${textMuted}`} />
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>Select a command</p>
                <p className={`text-xs mt-1 ${textMuted}`}>Click any card to see purpose, state changes, and workflow patterns</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION: Interactive Playground ─────────────────────────────────────────

interface SessionState {
  tokens: number; maxTokens: number; model: string; activeAgents: number;
  mcpServers: number; backgroundTasks: number; planMode: boolean;
  messages: number; cost: number; memoryFiles: number;
}

const INITIAL_STATE: SessionState = {
  tokens: 24500, maxTokens: 200000, model: 'claude-sonnet-4-6',
  activeAgents: 1, mcpServers: 2, backgroundTasks: 0,
  planMode: false, messages: 14, cost: 0.18, memoryFiles: 1,
};

interface ExecResult {
  success: boolean;
  output: string[];
  stateChanges: Array<{ field: string; from: string | number; to: string | number }>;
}

function simulateCommand(input: string, state: SessionState): { result: ExecResult; newState: SessionState } {
  const cmd = input.trim().toLowerCase().split(' ')[0].replace('/', '');
  const newState = { ...state };
  const result: ExecResult = { success: true, output: [], stateChanges: [] };

  switch (cmd) {
    case 'clear':
      newState.tokens = 0; newState.messages = 0; newState.activeAgents = 1; newState.backgroundTasks = 0; newState.planMode = false;
      result.output = ['✓ Conversation cleared.', 'Context: 0 tokens | Fresh session ready.', 'Note: CLAUDE.md and settings.json preserved.'];
      result.stateChanges = [{ field: 'Tokens', from: state.tokens, to: 0 }, { field: 'Messages', from: state.messages, to: 0 }];
      break;
    case 'compact':
      const reduced = Math.floor(state.tokens * 0.1);
      newState.tokens = reduced; newState.messages = 1;
      result.output = [`✓ Compacted ${state.messages} messages into 1 summary.`, `Tokens: ${state.tokens.toLocaleString()} → ${reduced.toLocaleString()} (−${Math.round((1 - reduced / state.tokens) * 100)}%)`, 'Context preserved: key decisions, current task, recent changes.'];
      result.stateChanges = [{ field: 'Tokens', from: state.tokens, to: reduced }, { field: 'Messages', from: state.messages, to: 1 }];
      break;
    case 'status':
      result.output = [
        `Model:    ${state.model}`, `Tokens:   ${state.tokens.toLocaleString()} / ${state.maxTokens.toLocaleString()} (${Math.round(state.tokens / state.maxTokens * 100)}%)`,
        `Agents:   ${state.activeAgents} active`, `MCP:      ${state.mcpServers} servers connected`,
        `Tasks:    ${state.backgroundTasks} background`, `Cost:     $${state.cost.toFixed(3)} this session`,
      ];
      break;
    case 'plan':
      newState.planMode = true; newState.tokens += 800;
      result.output = ['✓ Entering planning mode…', 'File writes are BLOCKED until plan is approved.', 'Claude will design an approach before any implementation.', '📋 Planning mode active — describe your task to begin.'];
      result.stateChanges = [{ field: 'Mode', from: 'Execution', to: 'Planning' }, { field: 'Tokens', from: state.tokens, to: newState.tokens }];
      break;
    case 'agents':
      newState.activeAgents = 4; newState.tokens += 2000;
      result.output = ['✓ Multi-agent mode enabled.', 'Spawning 3 worker agents…', '  Agent 1 (Research)  → Running', '  Agent 2 (Implement)  → Running', '  Agent 3 (Test)       → Running', 'Orchestrator ready. Agents run in parallel.'];
      result.stateChanges = [{ field: 'Agents', from: state.activeAgents, to: 4 }, { field: 'Cost Rate', from: '1x', to: '4x' }];
      break;
    case 'model':
      const parts = input.trim().split(' ');
      const newModel = parts[1] ?? 'claude-opus-4-5';
      newState.model = newModel;
      result.output = [`✓ Model switched to: ${newModel}`, 'All subsequent messages will use this model.', newModel.includes('opus') ? '⚡ Note: Higher capability, higher cost.' : ''];
      result.stateChanges = [{ field: 'Model', from: state.model, to: newModel }];
      break;
    case 'background':
      newState.backgroundTasks += 1; newState.tokens += 500;
      result.output = ['✓ Background task started.', `Task ID: bg-${Date.now().toString(36)}`, 'Main session is now free. Use /tasks to check progress.'];
      result.stateChanges = [{ field: 'Background Tasks', from: state.backgroundTasks, to: newState.backgroundTasks }];
      break;
    case 'tasks':
      result.output = [`Background Tasks (${state.backgroundTasks} running):`, ...Array.from({ length: state.backgroundTasks }, (_, i) => `  bg-task-${i + 1}  [RUNNING]  Started 3m ago`), state.backgroundTasks === 0 ? '  No active background tasks.' : ''];
      break;
    case 'memory':
      result.output = ['✓ Opening CLAUDE.md for editing…', 'File: ./CLAUDE.md', 'Changes will persist across all future sessions.'];
      break;
    case 'mcp':
      result.output = [`Connected MCP Servers (${state.mcpServers}):`, '  filesystem  → Connected  (14 tools)', '  github      → Connected  (22 tools)', 'Use /mcp add <server> to connect more.'];
      break;
    case 'cost':
      result.output = [`Session Cost Breakdown:`, `  Input tokens:   ${Math.floor(state.tokens * 0.8).toLocaleString()} ($${(state.tokens * 0.8 * 0.000003).toFixed(4)})`, `  Output tokens:  ${Math.floor(state.tokens * 0.2).toLocaleString()} ($${(state.tokens * 0.2 * 0.000015).toFixed(4)})`, `  Total session:  $${state.cost.toFixed(3)}`];
      break;
    case 'resume':
      result.output = ['Recent sessions:', '  payment-integration   2h ago    38k tokens', '  auth-refactor         Yesterday  45k tokens', '  database-migration    3 days ago 22k tokens', 'Use /resume <name> to restore.'];
      break;
    case 'review':
      newState.tokens += 2000;
      result.output = ['✓ Reviewing recent changes…', '━━━ Code Review ━━━', '⚠️  3 issues found:', '  [medium] src/auth.ts:42 — potential timing attack in token comparison', '  [low]    src/api.ts:88 — unhandled promise rejection', '  [info]   package.json — 2 outdated dependencies', '━━━━━━━━━━━━━━━━━━━'];
      break;
    case 'doctor':
      result.output = ['🏥 Running diagnostics…', '✓ API key: Valid (claude-3-5-sonnet)', '✓ Node.js: v22.1.0 (compatible)', '✓ MCP servers: 2/2 healthy', '✓ Permissions: Configured', '⚠️  CLAUDE.md: 3,420 tokens — consider trimming for efficiency', 'Overall: Healthy'];
      break;
    default:
      result.success = false;
      result.output = [`Unknown command: /${cmd}`, `Type /help to see available commands.`];
  }

  if (result.success) {
    newState.messages += 1;
    newState.tokens = Math.min(newState.tokens + 50, newState.maxTokens);
    newState.cost = parseFloat((newState.cost + newState.tokens * 0.000003 / 100).toFixed(4));
  }

  return { result, newState };
}

interface HistoryEntry { input: string; result: ExecResult; timestamp: number }

function PlaygroundSection() {
  const { darkMode } = useAppStore();
  const [state, setState] = useState<SessionState>(INITIAL_STATE);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [suggestion, setSuggestion] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  const knownCommands = slashCommands.map(c => c.name);

  const execute = useCallback(() => {
    if (!input.trim()) return;
    const { result, newState } = simulateCommand(input, state);
    setState(newState);
    setHistory(prev => [...prev, { input, result, timestamp: Date.now() }]);
    setInput('');
    setSuggestion('');
  }, [input, state]);

  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  const handleInput = (val: string) => {
    setInput(val);
    if (val.startsWith('/') && val.length > 1) {
      const partial = val.toLowerCase();
      const match = knownCommands.find(c => c.startsWith(partial) && c !== partial);
      setSuggestion(match ? match.slice(val.length) : '');
    } else {
      setSuggestion('');
    }
  };

  const tokenPct = Math.round((state.tokens / state.maxTokens) * 100);
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  const radarData = [
    { name: 'Tokens', value: Math.round(tokenPct) },
    { name: 'Agents', value: Math.round((state.activeAgents / 8) * 100) },
    { name: 'Tasks', value: Math.round((state.backgroundTasks / 5) * 100) },
    { name: 'MCP', value: Math.round((state.mcpServers / 6) * 100) },
    { name: 'Cost', value: Math.round((state.cost / 2) * 100) },
  ];

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Interactive Playground</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold">LIVE</span>
        </div>
        <p className={`text-sm ${textMuted}`}>Type any slash command to simulate its execution and see real-time state changes. Try: /compact, /agents, /plan, /status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Terminal */}
        <div className="lg:col-span-2 space-y-3">
          {/* Session state bar */}
          <div className={`rounded-2xl border p-4 ${cardBg}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`text-xs font-bold uppercase tracking-wide ${textMuted}`}>Live Session State</div>
              <button onClick={() => { setState(INITIAL_STATE); setHistory([]); }}
                className={`flex items-center gap-1 text-xs ${textMuted} hover:text-rose-400 transition-colors`}>
                <RotateCcw size={11} /> Reset
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Model', value: state.model.split('-').slice(1, 3).join('-'), color: '#8b5cf6' },
                { label: 'Agents', value: `${state.activeAgents} active`, color: '#f97316' },
                { label: 'BG Tasks', value: state.backgroundTasks, color: '#0ea5e9' },
                { label: 'Cost', value: `$${state.cost.toFixed(3)}`, color: '#10b981' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`p-2.5 rounded-xl ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                  <div className="text-sm font-bold" style={{ color }}>{value}</div>
                  <div className={`text-xs ${textMuted}`}>{label}</div>
                </div>
              ))}
            </div>
            {/* Token bar */}
            <div>
              <div className={`flex items-center justify-between text-xs mb-1.5 ${textMuted}`}>
                <span>Context Window</span>
                <span className="font-mono">{state.tokens.toLocaleString()} / {state.maxTokens.toLocaleString()} tokens ({tokenPct}%)</span>
              </div>
              <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} overflow-hidden`}>
                <motion.div animate={{ width: `${tokenPct}%` }} transition={{ duration: 0.4 }}
                  className="h-full rounded-full transition-all"
                  style={{ backgroundColor: tokenPct > 80 ? '#ef4444' : tokenPct > 60 ? '#f59e0b' : '#10b981' }} />
              </div>
            </div>
            {state.planMode && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/15 text-violet-400 text-xs font-semibold">
                🧩 Planning mode ACTIVE — file writes blocked until plan approved
              </motion.div>
            )}
          </div>

          {/* Terminal output */}
          <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-950 border-slate-700'}`}>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700">
              <div className="flex gap-1.5">
                {['#ef4444','#f59e0b','#10b981'].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />)}
              </div>
              <span className="text-slate-500 text-xs font-mono ml-1">claude-code — bash</span>
            </div>
            <div ref={terminalRef} className="h-64 overflow-y-auto p-4 font-mono text-xs space-y-3">
              {history.length === 0 && (
                <div className="text-slate-600">
                  <p className="text-slate-400 mb-2">Claude Code Simulator — type a command below</p>
                  <p>$ <span className="text-slate-500">Try: /status, /compact, /agents, /plan, /cost</span></p>
                </div>
              )}
              {history.map((h, i) => (
                <div key={i}>
                  <div className="text-slate-400">$ <span className="text-sky-300">{h.input}</span></div>
                  {h.result.output.filter(Boolean).map((line, j) => (
                    <div key={j} className={line.startsWith('✓') ? 'text-emerald-400' : line.startsWith('✗') || line.startsWith('Error') ? 'text-rose-400' : line.startsWith('⚠') ? 'text-amber-400' : 'text-slate-300'}>{line}</div>
                  ))}
                </div>
              ))}
              {history.length > 0 && <div className="text-slate-600">$&nbsp;<span className="animate-pulse">▌</span></div>}
            </div>
            {/* Input */}
            <div className={`flex items-center gap-2 px-4 py-3 border-t border-slate-700`}>
              <span className="text-slate-500 font-mono text-sm">$</span>
              <div className="relative flex-1">
                <input
                  value={input}
                  onChange={e => handleInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') execute();
                    if (e.key === 'Tab' && suggestion) { e.preventDefault(); setInput(input + suggestion); setSuggestion(''); }
                  }}
                  placeholder="Type a command (e.g. /compact, /agents, /plan)…"
                  className="w-full bg-transparent font-mono text-sm text-sky-300 outline-none placeholder-slate-600 relative z-10"
                />
                {suggestion && (
                  <span className="absolute left-0 top-0 font-mono text-sm pointer-events-none select-none text-slate-600">
                    {input}<span>{suggestion}</span>
                  </span>
                )}
              </div>
              <button onClick={execute}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold transition-colors">
                <Play size={11} /> Run
              </button>
            </div>
          </div>

          {/* Quick command palette */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs self-center ${textMuted}`}>Quick run:</span>
            {['/status', '/compact', '/agents', '/plan', '/cost', '/review', '/doctor'].map(cmd => (
              <button key={cmd} onClick={() => { setInput(cmd); }}
                className={`text-xs font-mono px-2.5 py-1 rounded-lg transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-sky-400' : 'bg-slate-100 hover:bg-slate-200 text-sky-600'}`}>
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* State radar + history */}
        <div className="space-y-3">
          <div className={`rounded-2xl border p-4 ${cardBg}`}>
            <div className={`text-xs font-bold uppercase tracking-wide mb-3 ${textMuted}`}>Session Health Radar</div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <PolarGrid stroke={darkMode ? '#334155' : '#e2e8f0'} />
                  <PolarAngleAxis dataKey="name" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                  <Radar name="Usage" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {history.length > 0 && (
            <div className={`rounded-2xl border p-4 ${cardBg}`}>
              <div className={`text-xs font-bold uppercase tracking-wide mb-3 ${textMuted}`}>Command History</div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {[...history].reverse().map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${h.result.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-xs font-mono text-sky-400 flex-1 truncate">{h.input}</span>
                    <span className={`text-xs ${textMuted}`}>{new Date(h.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`rounded-2xl border p-4 ${darkMode ? 'border-sky-700/30 bg-sky-900/10' : 'border-sky-200 bg-sky-50'}`}>
            <div className={`text-xs font-bold mb-2 ${darkMode ? 'text-sky-400' : 'text-sky-700'}`}>💡 Pro Tips</div>
            {[
              'Tab to autocomplete commands',
              '/status before long tasks',
              '/compact when tokens > 70%',
              '/plan before big changes',
            ].map(tip => (
              <div key={tip} className="flex items-start gap-1.5 mb-1">
                <Star size={10} className="text-sky-400 shrink-0 mt-0.5" />
                <span className={`text-xs ${darkMode ? 'text-sky-300' : 'text-sky-700'}`}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION: Command Chaining ────────────────────────────────────────────────

function ChainingSection() {
  const { darkMode } = useAppStore();
  const [activeChain, setActiveChain] = useState<string | null>(null);
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  const CHAINS = [
    { id: 'refactor', label: 'Large Refactor', commands: ['status', 'compact', 'plan', 'agents', 'diff', 'review'], color: '#8b5cf6' },
    { id: 'feature', label: 'New Feature', commands: ['plan', 'background', 'tasks', 'diff', 'review', 'security-review'], color: '#10b981' },
    { id: 'debug', label: 'Debug Session', commands: ['status', 'doctor', 'diff', 'review', 'compact'], color: '#ef4444' },
    { id: 'multi-agent', label: 'Multi-Agent', commands: ['plan', 'mcp', 'agents', 'tasks', 'diff', 'review'], color: '#0ea5e9' },
    { id: 'onboard', label: 'Onboarding', commands: ['init', 'memory', 'mcp', 'permissions', 'doctor'], color: '#f59e0b' },
  ];

  const active = CHAINS.find(c => c.id === activeChain) ?? CHAINS[0];

  return (
    <div>
      <div className="mb-5">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Command Chaining</h2>
        <p className={`mt-1 text-sm ${textMuted}`}>Command order matters. These sequences represent proven real-world workflows.</p>
      </div>

      {/* Chain selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CHAINS.map(chain => (
          <button key={chain.id} onClick={() => setActiveChain(chain.id === activeChain ? null : chain.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeChain === chain.id || (!activeChain && chain.id === CHAINS[0].id) ? 'text-white shadow-md' : darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            style={activeChain === chain.id || (!activeChain && chain.id === CHAINS[0].id) ? { backgroundColor: chain.color } : {}}>
            {chain.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={active.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <div className={`rounded-2xl border p-6 ${cardBg} mb-4`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
              {active.commands.map((cmdId, i) => {
                const cmd = slashCommands.find(c => c.id === cmdId);
                const cat = cmd ? categoryConfig[cmd.category] : null;
                return (
                  <div key={cmdId} className="flex items-center gap-3">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                      className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl border-2"
                        style={{ backgroundColor: (cat?.color ?? active.color) + '20', borderColor: cat?.color ?? active.color }}>
                        {cat?.icon ?? '⚡'}
                      </div>
                      <div className="text-xs font-mono font-bold" style={{ color: cat?.color ?? active.color }}>{cmd?.name ?? `/${cmdId}`}</div>
                      <div className={`text-xs text-center max-w-20 ${textMuted}`} style={{ fontSize: 9 }}>
                        {cmd?.tagline.split('—')[0].trim().slice(0, 22)}
                      </div>
                    </motion.div>
                    {i < active.commands.length - 1 && (
                      <motion.div animate={{ opacity: [0.4, 1, 0.4], x: [0, 2, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <ArrowRight size={18} style={{ color: active.color }} />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Why this order matters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {active.commands.map((cmdId, i) => {
              const cmd = slashCommands.find(c => c.id === cmdId);
              if (!cmd) return null;
              const cat = categoryConfig[cmd.category];
              return (
                <motion.div key={cmdId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className={`flex gap-3 p-3 rounded-xl border ${cardBg}`}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                    style={{ backgroundColor: cat.color + '20' }}>{cat.icon}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-bold font-mono" style={{ color: cat.color }}>{cmd.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold`} style={{ backgroundColor: active.color + '20', color: active.color }}>Step {i + 1}</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${textMuted}`}>{cmd.tagline}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Relationship hint */}
      <div className={`mt-6 p-4 rounded-2xl border ${darkMode ? 'border-amber-700/30 bg-amber-900/10' : 'border-amber-200 bg-amber-50'}`}>
        <div className={`text-xs font-bold mb-2 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>⚡ Why Order Matters</div>
        <p className={`text-xs leading-relaxed ${darkMode ? 'text-amber-300/80' : 'text-amber-700'}`}>
          Skipping /plan before /agents creates uncoordinated work. Running /review before /diff means Claude may miss recent changes.
          /compact before /plan ensures Claude has maximum context for the planning step. Each command sets up the next.
        </p>
      </div>
    </div>
  );
}

// ─── SECTION: Workflow Templates ──────────────────────────────────────────────

function WorkflowsSection() {
  const { darkMode } = useAppStore();
  const [selectedWf, setSelectedWf] = useState<WorkflowTemplate>(workflowTemplates[0]);
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  return (
    <div>
      <div className="mb-5">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Workflow Templates</h2>
        <p className={`mt-1 text-sm ${textMuted}`}>Pre-built professional workflows. Each combines multiple commands into a proven sequence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Template cards */}
        <div className="space-y-2">
          {workflowTemplates.map(wf => (
            <motion.button key={wf.id} whileHover={{ x: 3 }} onClick={() => setSelectedWf(wf)}
              className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
                selectedWf.id === wf.id
                  ? 'shadow-md border-2'
                  : darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
              style={selectedWf.id === wf.id ? { borderColor: wf.color, backgroundColor: wf.color + '10' } : {}}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: wf.color + '20' }}>{wf.icon}</div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{wf.title}</div>
                <div className={`text-xs ${textMuted} mt-0.5`}>{wf.commands.length} steps · {wf.estimatedTime}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                    style={{ backgroundColor: wf.color + '20', color: wf.color }}>{wf.difficulty}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Selected workflow detail */}
        <AnimatePresence mode="wait">
          <motion.div key={selectedWf.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: selectedWf.color + '20' }}>{selectedWf.icon}</div>
                <div>
                  <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedWf.title}</h3>
                  <div className={`text-xs ${textMuted}`}>{selectedWf.estimatedTime}</div>
                </div>
              </div>

              <p className={`text-sm leading-relaxed mb-4 ${textMuted}`}>{selectedWf.description}</p>

              <div className={`text-xs font-bold uppercase tracking-wide mb-3 ${textMuted}`}>Use Case</div>
              <p className={`text-xs leading-relaxed mb-4 italic ${textMuted}`}>{selectedWf.useCase}</p>

              {/* Steps */}
              <div className={`text-xs font-bold uppercase tracking-wide mb-3 ${textMuted}`}>Command Sequence</div>
              <div className="space-y-2">
                {selectedWf.commands.map(({ id, note }, i) => {
                  const cmd = slashCommands.find(c => c.id === id);
                  const cat = cmd ? categoryConfig[cmd.category] : null;
                  return (
                    <div key={id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: selectedWf.color }}>
                          {i + 1}
                        </div>
                        {i < selectedWf.commands.length - 1 && <div className="w-px flex-1 mt-1" style={{ backgroundColor: selectedWf.color + '40', minHeight: 16 }} />}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold font-mono" style={{ color: cat?.color ?? selectedWf.color }}>{cmd?.name ?? `/${id}`}</span>
                          <span>{cat?.icon}</span>
                        </div>
                        <p className={`text-xs ${textMuted}`}>{note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── SECTION: Category Deep Dive ──────────────────────────────────────────────

function CategorySection({ commandIds }: { commandIds: string[] }) {
  const { darkMode } = useAppStore();
  const [selectedCmd, setSelectedCmd] = useState<SlashCommand | null>(null);
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  const commands = commandIds.map(id => slashCommands.find(c => c.id === id)).filter(Boolean) as SlashCommand[];

  const tokenImpactData = commands.map(cmd => ({
    name: cmd.name.replace('/', ''),
    impact: cmd.tokenImpact,
    fill: cmd.tokenImpact > 0 ? '#ef4444' : cmd.tokenImpact < 0 ? '#10b981' : '#94a3b8',
  }));

  if (commands.length === 0) {
    return <div className={`text-sm ${textMuted}`}>No commands in this category.</div>;
  }

  const cat = categoryConfig[commands[0].category];

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: cat.color + '20' }}>{cat.icon}</div>
        <div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{cat.label} Commands</h2>
          <p className={`text-sm ${textMuted}`}>{commands.length} commands · Click any to inspect</p>
        </div>
      </div>

      {/* Token impact chart */}
      <div className={`rounded-2xl border p-4 mb-5 ${cardBg}`}>
        <div className={`text-xs font-bold uppercase tracking-wide mb-3 ${textMuted}`}>Token Impact per Command</div>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tokenImpactData} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
              <XAxis dataKey="name" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10 }} />
              <Tooltip formatter={(v) => [`${v ?? 0}%`, 'Token Change']}
                contentStyle={{ background: darkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="impact" radius={[4, 4, 0, 0]}>
                {tokenImpactData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Commands + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {commands.map(cmd => (
            <motion.button key={cmd.id} whileHover={{ x: 3 }} onClick={() => setSelectedCmd(selectedCmd?.id === cmd.id ? null : cmd)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                selectedCmd?.id === cmd.id ? 'shadow-md border-2' : darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
              style={selectedCmd?.id === cmd.id ? { borderColor: cat.color, backgroundColor: cat.color + '10' } : {}}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                <span className="text-base">{cat.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold font-mono" style={{ color: cat.color }}>{cmd.name}</div>
                <div className={`text-xs truncate ${textMuted}`}>{cmd.tagline.split('—')[0].trim()}</div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <RiskBadge level={cmd.riskLevel} />
                <span className={`text-xs capitalize ${textMuted}`}>{cmd.difficulty}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selectedCmd ? (
              <CommandDetail key={selectedCmd.id} cmd={selectedCmd} onClose={() => setSelectedCmd(null)} />
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`rounded-2xl border p-8 text-center ${cardBg}`}>
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>Select a command</p>
                <p className={`text-xs mt-1 ${textMuted}`}>Click any command to inspect its behavior</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION: Relationship Graph ──────────────────────────────────────────────

function buildGraphLayout(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const catGroups: Record<string, SlashCommand[]> = {};
  slashCommands.forEach(cmd => {
    if (!catGroups[cmd.category]) catGroups[cmd.category] = [];
    catGroups[cmd.category].push(cmd);
  });

  const catEntries = Object.entries(catGroups);
  const CX = 700, CY = 400, CAT_R = 500;

  catEntries.forEach(([catId, cmds], ci) => {
    const cat = categoryConfig[catId as keyof typeof categoryConfig];
    const catAngle = (ci / catEntries.length) * 2 * Math.PI - Math.PI / 2;
    const cx = CX + Math.cos(catAngle) * CAT_R;
    const cy = CY + Math.sin(catAngle) * CAT_R;
    const nodeR = Math.max(cmds.length * 40, 90);

    cmds.forEach((cmd, ni) => {
      const a = (ni / Math.max(cmds.length, 1)) * 2 * Math.PI;
      nodes.push({
        id: cmd.id,
        position: { x: cx + Math.cos(a) * nodeR, y: cy + Math.sin(a) * nodeR },
        data: { label: cmd.name, color: cat.color, icon: cat.icon, risk: cmd.riskLevel },
        type: 'default',
        style: {
          background: cat.color + '20',
          border: `2px solid ${cat.color}`,
          borderRadius: 12,
          padding: '6px 10px',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'monospace',
          color: cat.color,
          minWidth: 90,
          textAlign: 'center',
        },
      });
    });
  });

  commandChains.forEach(chain => {
    const src = nodes.find(n => n.id === chain.from);
    const tgt = nodes.find(n => n.id === chain.to);
    if (!src || !tgt) return;
    const srcCat = slashCommands.find(c => c.id === chain.from);
    const catColor = srcCat ? categoryConfig[srcCat.category].color : '#64748b';
    edges.push({
      id: chain.id, source: chain.from, target: chain.to,
      label: chain.label,
      type: 'bezier',
      animated: chain.strength === 'strong',
      style: { stroke: catColor, strokeWidth: chain.strength === 'strong' ? 2 : 1.5, opacity: chain.strength === 'optional' ? 0.4 : 0.7 },
      markerEnd: { type: MarkerType.ArrowClosed, color: catColor, width: 12, height: 12 },
      labelStyle: { fontSize: 9, fill: '#94a3b8', fontWeight: 600 },
      labelBgStyle: { fill: 'transparent' },
    });
  });

  return { nodes, edges };
}

function RelationshipGraphSection() {
  const { darkMode } = useAppStore();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { nodes: initNodes, edges: initEdges } = useMemo(() => buildGraphLayout(), []);
  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  const selectedCmd = selectedNode ? slashCommands.find(c => c.id === selectedNode) : null;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 520 }}>
      <div className="mb-4 shrink-0">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Command Relationship Graph</h2>
        <p className={`mt-1 text-sm ${textMuted}`}>Animated edges = strong relationships. Click any node to see the command detail.</p>
      </div>
      <div className="flex flex-1 gap-4 min-h-0">
        <div className="flex-1 rounded-2xl overflow-hidden border" style={{ minHeight: 460, borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => setSelectedNode(node.id === selectedNode ? null : node.id)}
            fitView fitViewOptions={{ padding: 0.2 }} minZoom={0.2} maxZoom={2} proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color={darkMode ? '#1e293b' : '#e8edf3'} />
            <Controls style={{ background: darkMode ? '#1e293b' : '#fff', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, borderRadius: 10 }} showInteractive={false} />
          </ReactFlow>
        </div>
        {selectedCmd && (
          <motion.div initial={{ x: 240, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 240 }}
            className={`w-64 shrink-0 rounded-2xl border overflow-y-auto ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="p-4">
              <div className={`text-base font-bold font-mono mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedCmd.name}</div>
              <div className="text-xs mb-2" style={{ color: categoryConfig[selectedCmd.category].color }}>{categoryConfig[selectedCmd.category].label}</div>
              <p className={`text-xs leading-relaxed mb-3 ${textMuted}`}>{selectedCmd.purpose}</p>
              <RiskBadge level={selectedCmd.riskLevel} />
              {selectedCmd.compatibleWith.length > 0 && (
                <div className="mt-3">
                  <div className={`text-xs font-bold mb-1.5 ${textMuted}`}>Connects to:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedCmd.compatibleWith.map(id => {
                      const other = slashCommands.find(c => c.id === id);
                      const otherCat = other ? categoryConfig[other.category] : null;
                      return other ? (
                        <button key={id} onClick={() => setSelectedNode(id)}
                          className="text-xs px-2 py-0.5 rounded-md font-mono font-semibold"
                          style={{ backgroundColor: (otherCat?.color ?? '#64748b') + '20', color: otherCat?.color ?? '#64748b' }}>
                          {other.name}
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── SECTION: Anti-Patterns ───────────────────────────────────────────────────

function AntiPatternsSection() {
  const { darkMode } = useAppStore();
  const [expanded, setExpanded] = useState<number | null>(null);
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  const antiPatterns = slashCommands
    .filter(cmd => cmd.unsafePatterns.length > 0)
    .flatMap(cmd => cmd.unsafePatterns.map(p => ({
      cmd: cmd.name, pattern: p, riskLevel: cmd.riskLevel,
      fix: cmd.workflowUsage[0] ?? 'Use this command with clear intention and bounded scope',
      catColor: categoryConfig[cmd.category].color,
      catIcon: categoryConfig[cmd.category].icon,
    })));

  return (
    <div>
      <div className="mb-5">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Anti-Patterns</h2>
        <p className={`mt-1 text-sm ${textMuted}`}>Command misuse patterns that cause real problems. Expand each to see the fix.</p>
      </div>
      <div className="space-y-2">
        {antiPatterns.map((ap, i) => (
          <motion.div key={i} className={`rounded-2xl border overflow-hidden ${
            ap.riskLevel === 'dangerous' ? (darkMode ? 'border-rose-700/40 bg-rose-900/10' : 'border-rose-200 bg-rose-50') :
            ap.riskLevel === 'caution' ? (darkMode ? 'border-amber-700/30 bg-amber-900/10' : 'border-amber-200 bg-amber-50') :
            (darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100')
          }`}>
            <button onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-start gap-3 p-4 text-left">
              <span className="text-base shrink-0 mt-0.5">{ap.catIcon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold font-mono" style={{ color: ap.catColor }}>{ap.cmd}</span>
                  <RiskBadge level={ap.riskLevel} />
                </div>
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{ap.pattern}</p>
              </div>
              {expanded === i ? <ChevronUp size={16} className={textMuted} /> : <ChevronDown size={16} className={textMuted} />}
            </button>
            <AnimatePresence>
              {expanded === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className={`px-4 pb-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'} pt-3`}>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className={`text-xs font-bold mb-1 text-emerald-500`}>Better Approach</div>
                        <p className={`text-xs leading-relaxed ${textMuted}`}>{ap.fix}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Section dispatcher ───────────────────────────────────────────────────────

function SectionContent({ section }: { section: StudioSection }) {
  switch (section.id) {
    case 'overview': return <OverviewSection />;
    case 'playground': return <PlaygroundSection />;
    case 'chaining': return <ChainingSection />;
    case 'workflows': return <WorkflowsSection />;
    case 'graph': return <RelationshipGraphSection />;
    case 'anti-patterns': return <AntiPatternsSection />;
    default:
      if (section.commandIds && section.commandIds.length > 0) return <CategorySection commandIds={section.commandIds} />;
      return <div>Coming soon…</div>;
  }
}

// ─── All studio sections with extras ─────────────────────────────────────────

const ALL_SECTIONS: StudioSection[] = [
  ...studioSections,
  { id: 'graph', title: 'Relationship Graph', icon: '🕸️', badge: 'React Flow' },
  { id: 'anti-patterns', title: 'Anti-Patterns', icon: '🚫' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SlashCommandsStudioPage() {
  const { darkMode } = useAppStore();
  const [activeSection, setActiveSection] = useState<StudioSection>(ALL_SECTIONS[0]);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSectionChange = (s: StudioSection) => {
    setActiveSection(s);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentIdx = ALL_SECTIONS.findIndex(s => s.id === activeSection.id);
  const prev = currentIdx > 0 ? ALL_SECTIONS[currentIdx - 1] : null;
  const next = currentIdx < ALL_SECTIONS.length - 1 ? ALL_SECTIONS[currentIdx + 1] : null;

  const border = darkMode ? 'border-slate-700' : 'border-slate-200';
  const subBg = darkMode ? 'bg-slate-900' : 'bg-white';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`flex h-full overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>

      {/* Sub-nav sidebar */}
      <div className={`w-52 shrink-0 flex flex-col border-r ${border} ${subBg} overflow-hidden`}>
        <div className={`px-3 py-4 border-b ${border}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
              /
            </div>
            <div>
              <div className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Commands Studio</div>
              <div className={`text-xs ${textMuted}`}>{ALL_SECTIONS.length} sections</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {ALL_SECTIONS.map(section => {
            const isActive = activeSection.id === section.id;
            return (
              <button key={section.id} onClick={() => handleSectionChange(section)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                  isActive ? 'bg-gradient-to-r from-sky-500/20 to-emerald-500/10 border border-sky-500/25' : darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                }`}>
                <span className="text-sm leading-none shrink-0">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold leading-snug truncate ${isActive ? (darkMode ? 'text-sky-300' : 'text-sky-700') : (darkMode ? 'text-slate-300' : 'text-slate-700')}`}>
                    {section.title}
                  </div>
                </div>
                {section.badge && (
                  <span className="text-xs px-1.5 py-0.5 rounded-md font-bold shrink-0 bg-sky-500/20 text-sky-500" style={{ fontSize: 9 }}>
                    {section.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className={`px-3 py-3 border-t ${border}`}>
          <div className={`text-xs ${textMuted} mb-1.5`}>{currentIdx + 1} / {ALL_SECTIONS.length}</div>
          <div className={`h-1 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
              animate={{ width: `${((currentIdx + 1) / ALL_SECTIONS.length) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div ref={contentRef} className={`flex-1 overflow-y-auto ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {/* Breadcrumb */}
        <div className={`sticky top-0 z-10 flex items-center gap-2 px-6 py-2.5 border-b text-xs ${subBg} ${border} ${textMuted}`}>
          <span className="text-sky-500 font-bold font-mono">/</span>
          <span>Commands Studio</span>
          <ChevronRight size={12} />
          <span className={`font-semibold ${darkMode ? 'text-sky-300' : 'text-sky-700'}`}>{activeSection.icon} {activeSection.title}</span>
          {activeSection.badge && (
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-500 font-bold">{activeSection.badge}</span>
          )}
          <span className="ml-auto">{slashCommands.length} commands documented</span>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              <SectionContent section={activeSection} />
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next */}
          <div className={`flex items-center justify-between mt-12 pt-6 border-t ${border}`}>
            {prev ? (
              <button onClick={() => handleSectionChange(prev)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'}`}>
                <ChevronRight size={15} className="rotate-180" /> {prev.icon} {prev.title}
              </button>
            ) : <div />}
            {next ? (
              <button onClick={() => handleSectionChange(next)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-sm hover:shadow-md transition-shadow">
                {next.icon} {next.title} <ChevronRight size={15} />
              </button>
            ) : (
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 size={16} />
                <span className="text-sm font-semibold">All sections explored!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
