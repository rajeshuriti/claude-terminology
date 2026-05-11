import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ExternalLink, CheckCircle2, AlertTriangle, XCircle,
  Copy, Check, ChevronDown, ChevronUp, Zap, Star,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useAppStore } from '@/store/appStore';
import {
  internalsSections, executionSteps, promptLayers,
  internalFiles, toolSteps, mcpComponents, commonMistakes,
  bestPractices,
  type InternalsSection,
} from '@/data/internalsData';

// ─── Utility components ───────────────────────────────────────────────────────

function CodeBlock({ code, lang = 'json' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const { darkMode } = useAppStore();
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className={`relative rounded-xl overflow-hidden text-xs ${darkMode ? 'bg-slate-900' : 'bg-slate-950'}`}>
      <div className={`flex items-center justify-between px-3 py-1.5 border-b ${darkMode ? 'border-slate-800' : 'border-slate-700'}`}>
        <span className="text-slate-500 font-mono text-xs">{lang}</span>
        <button onClick={copy} className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors">
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed font-mono">{code}</pre>
    </div>
  );
}

function SectionBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: color + '25', color }}>
      {label}
    </span>
  );
}

function SectionHeader({ title, icon, badge, badgeColor, subtitle }: {
  title: string; icon: string; badge?: string; badgeColor?: string; subtitle?: string;
}) {
  const { darkMode } = useAppStore();
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-3xl">{icon}</span>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
        {badge && badgeColor && <SectionBadge label={badge} color={badgeColor} />}
      </div>
      {subtitle && <p className={`mt-1.5 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>}
    </div>
  );
}

function InfoCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  const { darkMode } = useAppStore();
  return (
    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
      </div>
      <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{value}</p>
    </div>
  );
}

// ─── SECTION 1: Overview ──────────────────────────────────────────────────────

const ARCH_NODES = [
  { id: 'user', label: 'User Input', icon: '👤', color: '#0ea5e9', detail: 'Natural language messages, file uploads, or CLI commands that initiate a Claude session.' },
  { id: 'system', label: 'System Prompt', icon: '🔒', color: '#8b5cf6', detail: 'Operator-defined instructions. Highest priority. Sets role, persona, and hard constraints.' },
  { id: 'claudemd', label: 'CLAUDE.md', icon: '📝', color: '#10b981', detail: 'Project memory files injected from the filesystem. Persists across sessions within a project.' },
  { id: 'config', label: 'claude.json', icon: '⚙️', color: '#f59e0b', detail: 'Machine-readable config: permissions, MCP servers, hooks, environment variables.' },
  { id: 'tools', label: 'Tools / MCP', icon: '🔧', color: '#6366f1', detail: 'External capabilities: filesystem, web search, GitHub, databases, custom APIs.' },
  { id: 'memory', label: 'Memory & Context', icon: '🧠', color: '#ec4899', detail: 'Assembled context window: conversation history, retrieved memories, tool results.' },
  { id: 'model', label: 'Model Execution', icon: '✨', color: '#f97316', detail: 'Claude reasons over the assembled context, potentially making multiple tool calls.' },
  { id: 'response', label: 'Response', icon: '📤', color: '#64748b', detail: 'Final output streamed or returned as JSON with token usage metadata.' },
];

function OverviewSection() {
  const { darkMode } = useAppStore();
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const active = ARCH_NODES.find(n => n.id === activeNode);
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  return (
    <div>
      <SectionHeader title="Architecture Overview" icon="🗺️" subtitle="Every Claude request flows through this pipeline. Click any node to understand its role." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flow diagram */}
        <div className={`rounded-2xl border p-6 ${cardBg}`}>
          <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#0ea5e9' }}>Request Pipeline</div>
          <div className="space-y-1.5">
            {ARCH_NODES.map((node, i) => (
              <div key={node.id}>
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    activeNode === node.id
                      ? 'shadow-md'
                      : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-100 hover:border-slate-200'
                  }`}
                  style={activeNode === node.id ? { borderColor: node.color, backgroundColor: node.color + '12' } : {}}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: node.color + '20' }}>
                    {node.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{node.label}</div>
                  </div>
                  <ChevronRight size={14} className={textMuted} style={{ color: activeNode === node.id ? node.color : undefined }} />
                </motion.button>
                {i < ARCH_NODES.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-0.5 h-3 rounded-full"
                      style={{ backgroundColor: '#64748b' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`rounded-2xl border p-6 ${cardBg}`}
                style={{ borderLeftWidth: 4, borderLeftColor: active.color }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: active.color + '20' }}>
                    {active.icon}
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{active.label}</h3>
                    <div className="text-xs" style={{ color: active.color }}>Layer {ARCH_NODES.findIndex(n => n.id === active.id) + 1} of {ARCH_NODES.length}</div>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${textMuted}`}>{active.detail}</p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-2xl border p-6 text-center ${cardBg}`}
              >
                <div className="text-3xl mb-2">👆</div>
                <p className={`text-sm ${textMuted}`}>Click any pipeline node to see what it does</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Key facts */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Priority order', value: 'System → Config → CLAUDE.md → Memory → User', color: '#8b5cf6', icon: '📊' },
              { label: 'Token budget', value: 'All layers share a single context window limit', color: '#0ea5e9', icon: '💰' },
              { label: 'Tool loops', value: 'Steps 7–8 repeat until model produces final answer', color: '#f59e0b', icon: '🔄' },
              { label: 'Safety', value: 'Constitutional AI checks apply at the model layer', color: '#10b981', icon: '🛡️' },
            ].map(item => (
              <InfoCard key={item.label} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION 2: Execution Flow ────────────────────────────────────────────────

function ExecutionFlowSection() {
  const { darkMode } = useAppStore();
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [visibleUpTo, setVisibleUpTo] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const runAnimation = useCallback(() => {
    setVisibleUpTo(0);
    setAnimating(true);
    executionSteps.forEach((_, i) => {
      timerRef.current = setTimeout(() => {
        setVisibleUpTo(i + 1);
        if (i === executionSteps.length - 1) setAnimating(false);
      }, i * 350);
    });
  }, []);

  useEffect(() => { runAnimation(); return () => clearTimeout(timerRef.current); }, [runAnimation]);

  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  return (
    <div>
      <SectionHeader title="Execution Flow" icon="⚡" badge="Animated" badgeColor="#f59e0b"
        subtitle="Every Claude response is the result of this 10-step pipeline. Click any step to dive deeper." />

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={runAnimation}
          disabled={animating}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            animating
              ? 'opacity-50 cursor-not-allowed bg-slate-200 text-slate-500'
              : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/30'
          }`}
        >
          <Zap size={15} />
          {animating ? 'Running…' : 'Replay Animation'}
        </button>
        <span className={`text-xs ${textMuted}`}>Watch the pipeline execute step by step</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Steps */}
        <div className="lg:col-span-3 space-y-2">
          {executionSteps.map((step, i) => {
            const visible = i < visibleUpTo;
            const isActive = activeStep === step.id;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setActiveStep(isActive ? null : step.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'shadow-md'
                      : darkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                  style={isActive ? { borderColor: step.color, backgroundColor: step.color + '10' } : {}}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 font-bold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold leading-snug ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{step.title}</div>
                    <div className={`text-xs mt-0.5 ${textMuted}`}>{step.description}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ backgroundColor: step.color + '20', color: step.color }}>{step.timing}</span>
                    <span className={`text-xs ${textMuted}`}>{step.layer}</span>
                  </div>
                </button>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={`overflow-hidden mx-2 rounded-b-xl border-x border-b ${darkMode ? 'border-slate-700 bg-slate-800/60' : 'border-slate-100 bg-slate-50'}`}
                    >
                      <p className={`px-4 py-3 text-xs leading-relaxed ${textMuted}`}>{step.detail}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Legend / timing chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`rounded-2xl border p-4 ${cardBg}`}>
            <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${textMuted}`}>Layer Distribution</div>
            {['System', 'Memory', 'Tools', 'MCP', 'Context', 'Model', 'Execution', 'Safety', 'Transport'].map((layer) => {
              const steps = executionSteps.filter(s => s.layer === layer);
              return steps.length > 0 ? (
                <div key={layer} className="flex items-center gap-2 mb-2">
                  <div className="w-20 text-xs font-medium truncate" style={{ color: steps[0].color }}>{layer}</div>
                  <div className="flex-1 h-5 rounded-md overflow-hidden flex gap-0.5">
                    {steps.map(s => (
                      <div key={s.id} className="flex-1 rounded flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: s.color }}>{s.id}</div>
                    ))}
                  </div>
                </div>
              ) : null;
            })}
          </div>

          <div className={`rounded-2xl border p-4 ${cardBg}`}>
            <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${textMuted}`}>Key Insights</div>
            {[
              { icon: '⚡', text: 'Steps 7–8 can repeat many times (tool loops)' },
              { icon: '💰', text: 'Each loop costs tokens — design for minimal loops' },
              { icon: '🔒', text: 'Safety checks happen AFTER generation — not before' },
              { icon: '🌊', text: 'Streaming delivers step 10 tokens as they generate' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-2 mb-2.5">
                <span className="text-sm shrink-0">{icon}</span>
                <span className={`text-xs leading-relaxed ${textMuted}`}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION 3-5: File Explorers ──────────────────────────────────────────────

function FileExplorerSection({ fileId }: { fileId: string }) {
  const { darkMode } = useAppStore();
  const [activeTab, setActiveTab] = useState<'syntax' | 'good' | 'bad' | 'tips'>('syntax');
  const [expandedMistake, setExpandedMistake] = useState<number | null>(null);

  const file = internalFiles.find(f => f.id === fileId);
  if (!file) return null;

  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  const tabs = [
    { id: 'syntax', label: 'Syntax / Template', icon: '📄' },
    { id: 'good', label: 'Good Example', icon: '✅' },
    { id: 'bad', label: 'Anti-Pattern', icon: '❌' },
    { id: 'tips', label: 'Tips', icon: '💡' },
  ] as const;

  return (
    <div>
      <SectionHeader title={file.title} icon={file.icon} badge={file.badge} badgeColor={file.badgeColor}
        subtitle={file.tagline} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <InfoCard label="Purpose" value={file.purpose} color={file.badgeColor ?? '#64748b'} icon="🎯" />
        <InfoCard label="Scope" value={file.scope} color="#0ea5e9" icon="📍" />
        <InfoCard label="When Used" value={file.whenUsed} color="#10b981" icon="⏱️" />
      </div>

      {/* Priority indicator */}
      <div className={`rounded-xl border p-4 mb-6 ${cardBg}`}>
        <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${textMuted}`}>Priority in Stack</div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {[1,2,3,4,5,6,7].map(n => (
              <div key={n} className={`h-6 w-6 rounded-md flex items-center justify-center text-xs font-bold ${
                n === file.priority ? 'text-white' : darkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'
              }`} style={n === file.priority ? { backgroundColor: file.badgeColor } : {}}>
                {n}
              </div>
            ))}
          </div>
          <span className={`text-xs ml-2 ${textMuted}`}>
            Priority {file.priority} — {file.priority === 1 ? 'Highest (overrides all)' : file.priority <= 3 ? 'High' : file.priority <= 5 ? 'Medium' : 'Low (overridden by most)'}
          </span>
        </div>
      </div>

      {/* Tabbed code examples */}
      <div className={`rounded-2xl border overflow-hidden mb-6 ${cardBg}`}>
        <div className={`flex border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? darkMode ? 'text-white border-b-2 border-sky-500' : 'text-sky-600 border-b-2 border-sky-500'
                  : `${textMuted} hover:text-slate-600`
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {activeTab === 'syntax' && file.syntax && <CodeBlock code={file.syntax} lang={fileId === 'claude-json' ? 'json' : 'markdown'} />}
              {activeTab === 'good' && file.goodExample && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className={`text-sm font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Good Example</span>
                  </div>
                  <CodeBlock code={file.goodExample} lang="markdown" />
                </div>
              )}
              {activeTab === 'bad' && file.badExample && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle size={16} className="text-rose-500" />
                    <span className={`text-sm font-semibold ${darkMode ? 'text-rose-400' : 'text-rose-700'}`}>Anti-Pattern — Avoid This</span>
                  </div>
                  <CodeBlock code={file.badExample} lang="markdown" />
                  <div className={`mt-3 p-3 rounded-xl ${darkMode ? 'bg-rose-900/15 border border-rose-700/30' : 'bg-rose-50 border border-rose-200'}`}>
                    <p className={`text-xs ${darkMode ? 'text-rose-300' : 'text-rose-700'}`}>
                      ⚠️ This example fails because it gives Claude no actionable guidance — vague instructions produce inconsistent results.
                    </p>
                  </div>
                </div>
              )}
              {activeTab === 'tips' && (
                <div className="space-y-2">
                  {file.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Star size={12} className="text-amber-400 shrink-0 mt-0.5" />
                      <span className={`text-sm ${textMuted}`}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Common mistakes */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${textMuted}`}>Common Mistakes</div>
        <div className="space-y-2">
          {file.mistakes.map((mistake, i) => (
            <button
              key={i}
              onClick={() => setExpandedMistake(expandedMistake === i ? null : i)}
              className={`w-full flex items-start gap-2 p-2.5 rounded-lg text-left transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}
            >
              <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
              <span className={`text-xs flex-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{mistake}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION 6: Prompt Layers ─────────────────────────────────────────────────

function PromptLayersSection() {
  const { darkMode } = useAppStore();
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());

  const toggleHidden = (id: string) => {
    setHiddenLayers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const active = promptLayers.find(l => l.id === activeLayer);
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  return (
    <div>
      <SectionHeader title="Prompt Layers" icon="🥞" badge="Visual" badgeColor="#8b5cf6"
        subtitle="Instructions from multiple sources are merged in priority order. Higher layers win conflicts." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual stack */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Priority Stack (1 = highest)</div>
            <span className={`text-xs ${textMuted}`}>Click to inspect · Toggle to hide</span>
          </div>
          <div className="space-y-2">
            {promptLayers.map((layer) => {
              const isHidden = hiddenLayers.has(layer.id);
              const isActive = activeLayer === layer.id;
              return (
                <motion.div
                  key={layer.id}
                  layout
                  animate={{ opacity: isHidden ? 0.35 : 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    isActive ? 'shadow-md' : darkMode ? 'border-slate-700 hover:border-slate-500' : 'border-slate-100 hover:border-slate-200'
                  }`}
                  style={isActive ? { borderColor: layer.color, backgroundColor: layer.color + '12' } : {}}
                  onClick={() => setActiveLayer(isActive ? null : layer.id)}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: layer.color }}>
                    {layer.priority}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${isHidden ? textMuted : darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{layer.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.color }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleHidden(layer.id); }}
                      className={`text-xs px-2 py-0.5 rounded-md transition-colors ${
                        isHidden
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                          : darkMode ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {isHidden ? 'Hidden' : 'Visible'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-2xl border p-5 ${cardBg}`}
                style={{ borderLeftWidth: 4, borderLeftColor: active.color }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: active.color }}>
                    {active.priority}
                  </div>
                  <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{active.name}</h3>
                </div>
                <p className={`text-sm leading-relaxed mb-4 ${textMuted}`}>{active.description}</p>
                <div className={`p-3 rounded-xl text-xs font-mono leading-relaxed ${darkMode ? 'bg-slate-900 text-sky-300' : 'bg-slate-900 text-sky-200'}`}>
                  {active.example}
                </div>
                {active.overriddenBy.length > 0 && (
                  <div className="mt-3">
                    <div className={`text-xs font-semibold mb-1 ${textMuted}`}>Overridden by:</div>
                    <div className="flex flex-wrap gap-1">
                      {active.overriddenBy.map(id => {
                        const layer = promptLayers.find(l => l.id === id);
                        return layer ? (
                          <span key={id} className="text-xs px-2 py-0.5 rounded-md font-medium"
                            style={{ backgroundColor: layer.color + '20', color: layer.color }}>
                            {layer.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`rounded-2xl border p-6 text-center ${cardBg}`}>
                <div className="text-3xl mb-2">🥞</div>
                <p className={`text-sm ${textMuted}`}>Click a layer to inspect its role and authority</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conflict resolution rules */}
          <div className={`rounded-2xl border p-4 ${cardBg}`}>
            <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${textMuted}`}>Conflict Resolution Rules</div>
            {[
              { rule: 'System prompt always wins', detail: 'No user message can override system constraints', color: '#8b5cf6' },
              { rule: 'CLAUDE.md beats user messages', detail: 'Project instructions take priority over conversation', color: '#10b981' },
              { rule: 'Later tool results win', detail: 'Fresher data from tools beats older context', color: '#f59e0b' },
              { rule: 'Explicit > Implicit', detail: 'Direct instructions override inferred behavior', color: '#0ea5e9' },
            ].map(({ rule, detail, color }) => (
              <div key={rule} className="flex items-start gap-2.5 mb-3">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                <div>
                  <div className={`text-xs font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{rule}</div>
                  <div className={`text-xs ${textMuted}`}>{detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION 7: Tool Calling ──────────────────────────────────────────────────

function ToolCallingSection() {
  const { darkMode } = useAppStore();
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  return (
    <div>
      <SectionHeader title="Tool Calling" icon="🔧" badge="Animated" badgeColor="#f59e0b"
        subtitle="How Claude discovers, selects, executes, and integrates tool results. The most common source of agent failures." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Animated flow */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${textMuted}`}>Tool Execution Pipeline</div>
          <div className="space-y-2">
            {toolSteps.map((step, i) => (
              <div key={step.id}>
                <motion.button
                  whileHover={{ x: 3 }}
                  onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                    activeStep === step.id
                      ? 'border-2 shadow-sm'
                      : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-100 hover:border-slate-200'
                  }`}
                  style={activeStep === step.id ? { borderColor: step.color, backgroundColor: step.color + '12' } : {}}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: step.color + '25' }}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`text-xs font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{step.label}</div>
                    <div className={`text-xs ${textMuted}`}>{step.description}</div>
                  </div>
                  {activeStep === step.id ? <ChevronUp size={13} className={textMuted} /> : <ChevronDown size={13} className={textMuted} />}
                </motion.button>
                {i < toolSteps.length - 1 && (
                  <div className="flex justify-center">
                    <motion.div animate={{ scaleY: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-0.5 h-3 rounded-full" style={{ backgroundColor: step.color + '60' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tool schema example */}
        <div className="space-y-4">
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="text-base">📋</div>
              <div className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Example Tool Schema</div>
            </div>
            <CodeBlock code={`{
  "name": "web_search",
  "description": "Search the web for real-time information. Use when the user asks about current events, recent data, or any topic where you might not have up-to-date knowledge. Returns URLs and summaries.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The search query. Be specific."
      },
      "num_results": {
        "type": "integer",
        "description": "Number of results (1-10)",
        "default": 5
      }
    },
    "required": ["query"]
  }
}`} lang="json" />
          </div>

          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${textMuted}`}>Critical Insights</div>
            {[
              { icon: '🎯', text: 'Tool description is HOW the model decides to call it. Vague descriptions = wrong calls.' },
              { icon: '🔄', text: 'Tool loops can repeat 5–20+ times. Always set a maximum.' },
              { icon: '⚡', text: 'Run independent tools in parallel — don\'t sequence them unnecessarily.' },
              { icon: '🛡️', text: 'Always validate arguments before execution — models hallucinate arguments.' },
              { icon: '❌', text: 'Tool failures must return structured errors, not crash — the model needs to recover.' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-2 mb-2.5">
                <span className="text-sm shrink-0">{icon}</span>
                <span className={`text-xs leading-relaxed ${textMuted}`}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* tool_choice comparison */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${textMuted}`}>tool_choice Parameter — When to Use Each</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: '"auto"', behavior: 'Model decides whether to call a tool', when: 'General assistants with optional tools', risk: 'May skip tool call when you need it', color: '#0ea5e9' },
            { value: '"any"', behavior: 'Forces at least one tool call', when: 'Structured output extraction — guarantees JSON', risk: 'May call wrong tool if descriptions are unclear', color: '#10b981' },
            { value: '{"name":"X"}', behavior: 'Forces a specific tool call', when: 'When you know exactly which tool is needed', risk: 'Inflexible — agent cannot adapt', color: '#8b5cf6' },
          ].map(({ value, behavior, when, risk, color }) => (
            <div key={value} className={`p-4 rounded-xl ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
              <div className="font-mono text-sm font-bold mb-2" style={{ color }}>{value}</div>
              <div className={`text-xs mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{behavior}</div>
              <div className={`text-xs mb-1 ${textMuted}`}><span className="text-emerald-500 font-semibold">Use: </span>{when}</div>
              <div className={`text-xs ${textMuted}`}><span className="text-amber-500 font-semibold">Risk: </span>{risk}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION 8: Memory & Context ──────────────────────────────────────────────

function MemoryContextSection() {
  const { darkMode } = useAppStore();
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  const tokenData = [
    { name: 'System Prompt', tokens: 800, fill: '#8b5cf6' },
    { name: 'CLAUDE.md', tokens: 1200, fill: '#10b981' },
    { name: 'History', tokens: 8000, fill: '#0ea5e9' },
    { name: 'Tool Defs', tokens: 2000, fill: '#f59e0b' },
    { name: 'Retrieved', tokens: 4000, fill: '#f97316' },
    { name: 'User Msg', tokens: 500, fill: '#ec4899' },
    { name: 'Available', tokens: 183500, fill: darkMode ? '#1e293b' : '#e2e8f0' },
  ];

  return (
    <div>
      <SectionHeader title="Memory & Context" icon="🧠"
        subtitle="Claude's 'memory' is just tokens in a context window. Understanding the token budget is critical for production systems." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Token budget chart */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${textMuted}`}>200k Token Budget Breakdown (Example)</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tokenData} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                <XAxis type="number" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={75} tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                <Tooltip
                  formatter={(v) => [`${Number(v).toLocaleString()} tokens`, '']}
                  contentStyle={{ background: darkMode ? '#1e293b' : '#fff', border: 'none', borderRadius: 8, fontSize: 11 }}
                />
                <Bar dataKey="tokens" radius={[0, 4, 4, 0]}>
                  {tokenData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={`text-xs text-center mt-2 ${textMuted}`}>
            Total used: ~16,500 tokens · Available: ~183,500 tokens
          </div>
        </div>

        {/* Memory types */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${textMuted}`}>Memory Types</div>
          <div className="space-y-3">
            {[
              { type: 'In-Context (Short-term)', desc: 'Conversation history within a single session. Lost when session ends.', icon: '⚡', color: '#0ea5e9', limit: '200k tokens max' },
              { type: 'CLAUDE.md (Project)', desc: 'Persists across sessions via filesystem. Manually maintained by developers.', icon: '📝', color: '#10b981', limit: 'File size limit' },
              { type: 'External Memory', desc: 'Vector DB, Mem0, or custom store. Retrieved on demand via tools.', icon: '🗄️', color: '#8b5cf6', limit: 'No hard limit' },
              { type: 'Tool State', desc: 'Results from tool calls injected into current context.', icon: '🔧', color: '#f59e0b', limit: 'Current context only' },
            ].map(({ type, desc, icon, color, limit }) => (
              <div key={type} className={`p-3 rounded-xl ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{icon}</span>
                  <span className="text-xs font-bold" style={{ color }}>{type}</span>
                  <span className="ml-auto text-xs font-mono" style={{ color: color + '99' }}>{limit}</span>
                </div>
                <p className={`text-xs ${textMuted}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Context overflow strategies */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${textMuted}`}>When Context Overflows — Strategies</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'Truncation', desc: 'Drop oldest messages. Fast but loses early context. Use /compact in Claude Code.', risk: 'Critical early context lost permanently', color: '#ef4444', icon: '✂️' },
            { name: 'Recursive Summarization', desc: 'Summarize old conversation chunks. Preserves gist but loses details.', risk: 'Each summary layer degrades information', color: '#f59e0b', icon: '📋' },
            { name: 'Selective Retrieval (RAG)', desc: 'Store all history externally, retrieve only relevant chunks per query.', risk: 'Retrieval quality determines accuracy', color: '#10b981', icon: '🔍' },
          ].map(({ name, desc, risk, color, icon }) => (
            <div key={name} className={`p-4 rounded-xl border-l-4 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`} style={{ borderLeftColor: color }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{icon}</span>
                <span className="text-sm font-bold" style={{ color }}>{name}</span>
              </div>
              <p className={`text-xs leading-relaxed mb-2 ${textMuted}`}>{desc}</p>
              <div className="flex items-start gap-1">
                <AlertTriangle size={11} className="text-amber-400 shrink-0 mt-0.5" />
                <span className={`text-xs ${textMuted}`}>{risk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION 9: MCP ───────────────────────────────────────────────────────────

function McpSection() {
  const { darkMode } = useAppStore();
  const [activeComp, setActiveComp] = useState<string | null>(null);
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  const _active = mcpComponents.find(c => c.id === activeComp);
  void _active;

  return (
    <div>
      <SectionHeader title="MCP Integration" icon="🌐"
        subtitle="Model Context Protocol standardizes how Claude connects to external tools, resources, and data sources." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Architecture diagram */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${textMuted}`}>MCP Architecture</div>
          <div className="flex flex-col gap-2">
            {mcpComponents.map((comp, i) => (
              <div key={comp.id}>
                <motion.button
                  whileHover={{ x: 3 }}
                  onClick={() => setActiveComp(activeComp === comp.id ? null : comp.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    activeComp === comp.id ? 'shadow-md' : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-100 hover:border-slate-200'
                  }`}
                  style={activeComp === comp.id ? { borderColor: comp.color, backgroundColor: comp.color + '12' } : {}}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: comp.color + '20' }}>{comp.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{comp.name}</div>
                    <div className={`text-xs ${textMuted}`}>{comp.role}</div>
                  </div>
                  {comp.connects.length > 0 && <ChevronRight size={14} className={textMuted} style={{ color: activeComp === comp.id ? comp.color : undefined }} />}
                </motion.button>
                {i < mcpComponents.length - 1 && (
                  <div className="flex justify-start pl-[22px] my-0.5">
                    <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div className="space-y-4">
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${textMuted}`}>Real-World MCP Servers</div>
            <div className="space-y-2">
              {[
                { name: 'Filesystem MCP', desc: 'Read/write files, list directories', cmd: 'npx @modelcontextprotocol/server-filesystem', icon: '📁', color: '#10b981' },
                { name: 'GitHub MCP', desc: 'Issues, PRs, code search, repos', cmd: 'npx @modelcontextprotocol/server-github', icon: '🐙', color: '#64748b' },
                { name: 'Postgres MCP', desc: 'Query databases, run SQL', cmd: 'npx @modelcontextprotocol/server-postgres', icon: '🐘', color: '#0ea5e9' },
                { name: 'Puppeteer MCP', desc: 'Web scraping, browser automation', cmd: 'npx @modelcontextprotocol/server-puppeteer', icon: '🎭', color: '#f59e0b' },
              ].map(({ name, desc, cmd, icon, color }) => (
                <div key={name} className={`p-3 rounded-xl ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{icon}</span>
                    <span className="text-xs font-bold" style={{ color }}>{name}</span>
                  </div>
                  <div className={`text-xs ${textMuted} mb-1`}>{desc}</div>
                  <div className={`text-xs font-mono px-2 py-0.5 rounded ${darkMode ? 'bg-slate-800 text-sky-300' : 'bg-slate-200 text-slate-700'}`}>{cmd}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl border p-4 ${darkMode ? 'border-rose-700/30 bg-rose-900/10' : 'border-rose-200 bg-rose-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={15} className="text-rose-500" />
              <span className={`text-xs font-bold ${darkMode ? 'text-rose-400' : 'text-rose-700'}`}>Security Warning</span>
            </div>
            <p className={`text-xs leading-relaxed ${darkMode ? 'text-rose-300/80' : 'text-rose-700'}`}>
              MCP servers execute with the permissions you grant them. Always sandbox servers, validate their outputs,
              and only install servers from trusted sources. A malicious MCP server can read your entire filesystem.
            </p>
          </div>
        </div>
      </div>

      {/* Config example */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${textMuted}`}>MCP Server Configuration (.claude/settings.json)</div>
        <CodeBlock code={`{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/projects"],
      "description": "Read/write project files"
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "\${GITHUB_TOKEN}"
      }
    },
    "custom-api": {
      "command": "node",
      "args": ["/path/to/my-mcp-server.js"],
      "env": {
        "API_KEY": "\${MY_API_KEY}",
        "BASE_URL": "https://api.example.com"
      }
    }
  }
}`} lang="json" />
      </div>
    </div>
  );
}

// ─── SECTION 10: Hooks ────────────────────────────────────────────────────────

function HooksSection() {
  const { darkMode } = useAppStore();
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  return (
    <div>
      <SectionHeader title="Hooks & Automation" icon="🪝"
        subtitle="Hooks let you run shell commands at specific points in the Claude Code lifecycle — before/after tool use, on stop, etc." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${textMuted}`}>Hook Event Types</div>
          <div className="space-y-3">
            {[
              { event: 'PreToolUse', timing: 'Before tool executes', use: 'Validate parameters, check permissions, log requests', color: '#8b5cf6', icon: '⬆️' },
              { event: 'PostToolUse', timing: 'After tool completes', use: 'Run tests, lint code, validate output, send notifications', color: '#10b981', icon: '⬇️' },
              { event: 'Stop', timing: 'When Claude finishes', use: 'Send Slack notification, update status, run post-processing', color: '#f59e0b', icon: '🛑' },
              { event: 'SubagentStop', timing: 'When a subagent completes', use: 'Aggregate subagent results, update shared state', color: '#0ea5e9', icon: '🤖' },
            ].map(({ event, timing, use, color, icon }) => (
              <div key={event} className={`p-4 rounded-xl ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{icon}</span>
                  <span className="text-sm font-bold font-mono" style={{ color }}>{event}</span>
                  <span className={`text-xs ml-auto ${textMuted}`}>{timing}</span>
                </div>
                <p className={`text-xs ${textMuted}`}>{use}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${textMuted}`}>Example: Auto-lint after Bash</div>
            <CodeBlock code={`{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint --silent 2>&1 | head -20"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Session complete' | notify-send 'Claude Done'"
          }
        ]
      }
    ]
  }
}`} lang="json" />
          </div>
          <div className={`p-4 rounded-xl border ${darkMode ? 'border-amber-700/30 bg-amber-900/10' : 'border-amber-200 bg-amber-50'}`}>
            <div className={`text-xs font-bold mb-2 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>⚠️ Hook Best Practices</div>
            <ul className={`space-y-1 text-xs ${darkMode ? 'text-amber-300/80' : 'text-amber-700'}`}>
              <li>• Hooks run synchronously — keep them fast (&lt;2s)</li>
              <li>• Failing hooks don't stop Claude — handle errors explicitly</li>
              <li>• Hook output is shown to the user — keep it clean</li>
              <li>• Too many hooks create cascading complexity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION 11: Permissions ──────────────────────────────────────────────────

function PermissionsSection() {
  const { darkMode } = useAppStore();
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  return (
    <div>
      <SectionHeader title="Permissions" icon="🔐"
        subtitle="Claude Code's permission system controls which tools and operations Claude can perform without asking for approval." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${textMuted}`}>Permission Patterns</div>
          <CodeBlock code={`{
  "permissions": {
    "allow": [
      // Bash — specific patterns only
      "Bash(npm run *)",        // Any npm script
      "Bash(git status)",       // Specific git commands
      "Bash(git add *)",
      "Bash(git commit *)",

      // File operations — scoped
      "Read(**/*.ts)",          // Read any TypeScript file
      "Read(**/*.json)",
      "Write(src/**)",          // Write inside src/
      "Write(tests/**)",

      // MCP operations
      "mcp__filesystem__read_file",
      "mcp__github__create_issue"
    ],
    "deny": [
      // Dangerous operations — always deny
      "Bash(rm -rf *)",
      "Bash(sudo *)",
      "Bash(curl * | bash)",
      "Write(**/.env)",
      "Write(**/.env.*)",
      "Write(**/secrets/**)"
    ]
  }
}`} lang="json" />
        </div>

        <div className="space-y-4">
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${textMuted}`}>Permission Levels</div>
            {[
              { level: 'Global (~/.claude/settings.json)', scope: 'All Claude Code sessions', use: 'Personal preferences, trusted tools', color: '#8b5cf6' },
              { level: 'Project (.claude/settings.json)', scope: 'This project only', use: 'Project-specific tools, CI/CD scripts', color: '#10b981' },
              { level: 'Runtime (per-session prompting)', scope: 'Current session only', use: 'One-off approvals for unexpected operations', color: '#f59e0b' },
            ].map(({ level, scope, use, color }) => (
              <div key={level} className={`p-3 rounded-xl mb-2 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <div className="text-xs font-bold mb-1" style={{ color }}>{level}</div>
                <div className={`text-xs ${textMuted}`}>Scope: {scope}</div>
                <div className={`text-xs ${textMuted}`}>Use for: {use}</div>
              </div>
            ))}
          </div>

          <div className={`rounded-2xl border p-4 ${darkMode ? 'border-rose-700/30 bg-rose-900/10' : 'border-rose-200 bg-rose-50'}`}>
            <div className={`text-xs font-bold mb-2 ${darkMode ? 'text-rose-400' : 'text-rose-700'}`}>🚨 Never Allow These</div>
            {['Bash(*) — unrestricted shell', 'Write(*) — write anywhere', 'Bash(curl * | bash) — remote code execution'].map(p => (
              <div key={p} className={`flex items-center gap-2 mb-1`}>
                <XCircle size={11} className="text-rose-500 shrink-0" />
                <code className={`text-xs font-mono ${darkMode ? 'text-rose-300' : 'text-rose-700'}`}>{p}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION 12: Common Mistakes ─────────────────────────────────────────────

function CommonMistakesSection() {
  const { darkMode } = useAppStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  const severityConfig = {
    critical: { color: '#ef4444', bg: darkMode ? 'bg-rose-900/20 border-rose-700/40' : 'bg-rose-50 border-rose-200', label: 'CRITICAL', icon: '🔴' },
    high: { color: '#f97316', bg: darkMode ? 'bg-orange-900/20 border-orange-700/40' : 'bg-orange-50 border-orange-200', label: 'HIGH', icon: '🟠' },
    medium: { color: '#f59e0b', bg: darkMode ? 'bg-amber-900/20 border-amber-700/40' : 'bg-amber-50 border-amber-200', label: 'MEDIUM', icon: '🟡' },
  };

  return (
    <div>
      <SectionHeader title="Common Mistakes" icon="⚠️" badge="Important" badgeColor="#ef4444"
        subtitle="The most frequently made mistakes when building Claude-based systems — and how to fix them." />

      <div className="space-y-3">
        {commonMistakes.map((mistake) => {
          const cfg = severityConfig[mistake.severity];
          const isExpanded = expanded === mistake.id;
          return (
            <motion.div
              key={mistake.id}
              className={`rounded-2xl border overflow-hidden ${cfg.bg}`}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : mistake.id)}
                className="w-full flex items-start gap-3 p-4 text-left"
              >
                <span className="text-lg shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.color + '25', color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.color + '15', color: cfg.color }}>
                      {mistake.category}
                    </span>
                  </div>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{mistake.mistake}</div>
                </div>
                {isExpanded ? <ChevronUp size={16} className={textMuted} /> : <ChevronDown size={16} className={textMuted} />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'} pt-3`}>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <AlertTriangle size={12} className="text-amber-500" />
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Why It's Dangerous</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${textMuted}`}>{mistake.why}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">The Fix</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${textMuted}`}>{mistake.fix}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SECTION 13: Best Practices ───────────────────────────────────────────────

function BestPracticesSection() {
  const { darkMode } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  const allCategories = ['All', ...Array.from(new Set(bestPractices.map(p => p.category)))];
  const filtered = activeCategory === 'All' ? bestPractices : bestPractices.filter(p => p.category === activeCategory);

  const impactColors = { high: '#10b981', medium: '#f59e0b', low: '#94a3b8' };
  const effortColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

  return (
    <div>
      <SectionHeader title="Best Practices" icon="✨"
        subtitle="Proven patterns from production Claude systems. Filter by area." />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {allCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-sky-500 text-white shadow-sm'
                : darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <AnimatePresence>
          {filtered.map((practice, i) => (
            <motion.div
              key={practice.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-2xl border p-4 ${cardBg}`}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  {practice.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold leading-snug ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{practice.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#0ea5e9' }}>{practice.category}</div>
                </div>
              </div>
              <p className={`text-xs leading-relaxed mb-3 ${textMuted}`}>{practice.description}</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-xs" style={{ color: textMuted as string }}>Impact:</span>
                  <span className="text-xs font-bold capitalize" style={{ color: impactColors[practice.impact] }}>{practice.impact}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs" style={{ color: textMuted as string }}>Effort:</span>
                  <span className="text-xs font-bold capitalize" style={{ color: effortColors[practice.effort] }}>{practice.effort}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── SECTION 14: Comparisons ──────────────────────────────────────────────────

function ComparisonsSection() {
  const { darkMode } = useAppStore();
  const [activeTable, setActiveTable] = useState(0);
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  const tables = [
    {
      title: 'CLAUDE.md vs claude.json',
      a: 'CLAUDE.md',
      b: 'claude.json / settings.json',
      rows: [
        { aspect: 'Format', a: 'Markdown (human-readable)', b: 'JSON (machine-readable)' },
        { aspect: 'Purpose', a: 'Project context and instructions', b: 'Behavioral configuration' },
        { aspect: 'Who reads it', a: 'The AI model (injected as context)', b: 'Claude Code CLI (before model call)' },
        { aspect: 'Affects', a: 'Model\'s understanding and behavior', b: 'Permissions, tools, hooks, env vars' },
        { aspect: 'Scope', a: 'Project + parent directory hierarchy', b: 'Project (overrides global ~/.claude/)' },
        { aspect: 'Edit by', a: 'Developers / team members', b: 'Developers / DevOps' },
        { aspect: 'Dynamic?', a: 'Static (reloaded per session)', b: 'Static (reloaded per session)' },
      ],
    },
    {
      title: 'System Prompt vs User Prompt',
      a: 'System Prompt',
      b: 'User Prompt',
      rows: [
        { aspect: 'Set by', a: 'Operator / Developer (API)', b: 'End user' },
        { aspect: 'Priority', a: 'Highest — cannot be overridden by user', b: 'Low — subject to system constraints' },
        { aspect: 'When applied', a: 'Every single request', b: 'Current request only' },
        { aspect: 'Token cost', a: 'Every request (consider caching)', b: 'Only when user sends it' },
        { aspect: 'Contents', a: 'Role, persona, hard rules, format', b: 'Task, question, data, context' },
        { aspect: 'Can contain PII?', a: 'Avoid — shared across users', b: 'Yes — user-specific data goes here' },
        { aspect: 'Visible to user?', a: 'No (by default)', b: 'Yes' },
      ],
    },
    {
      title: 'MCP vs Tool Use',
      a: 'MCP (Model Context Protocol)',
      b: 'Direct Tool Use (API)',
      rows: [
        { aspect: 'Architecture', a: 'External server process via protocol', b: 'Tools defined inline in API request' },
        { aspect: 'Discovery', a: 'Auto-discovered from MCP servers', b: 'Manually defined in each request' },
        { aspect: 'Reusability', a: 'One server, many Claude sessions', b: 'Redefined per request or per app' },
        { aspect: 'Security', a: 'Server process isolation (sandboxable)', b: 'In-process — shares app context' },
        { aspect: 'Ecosystem', a: 'Growing library of pre-built servers', b: 'Fully custom — build everything yourself' },
        { aspect: 'Best for', a: 'Claude Code, multi-tool integrations', b: 'Simple API integrations, custom tools' },
        { aspect: 'Overhead', a: 'Protocol + process startup', b: 'Just API request round-trip' },
      ],
    },
  ];

  const table = tables[activeTable];

  return (
    <div>
      <SectionHeader title="Comparisons" icon="↔️"
        subtitle="Side-by-side comparisons of commonly confused concepts." />

      <div className="flex gap-2 mb-6 flex-wrap">
        {tables.map((t, i) => (
          <button
            key={i}
            onClick={() => setActiveTable(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTable === i
                ? 'bg-sky-500 text-white shadow-sm'
                : darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTable} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
            <div className={`grid grid-cols-3 border-b ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
              <div className={`p-3 text-xs font-bold uppercase ${textMuted}`}>Aspect</div>
              <div className="p-3 text-sm font-bold text-sky-500 border-l" style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>{table.a}</div>
              <div className="p-3 text-sm font-bold text-violet-500 border-l" style={{ borderColor: darkMode ? '#1e293b' : '#f1f5f9' }}>{table.b}</div>
            </div>
            {table.rows.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 border-b last:border-0 ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
                <div className={`p-3 text-xs font-semibold ${darkMode ? 'text-slate-500 bg-slate-900/50' : 'text-slate-400 bg-slate-50/50'}`}>{row.aspect}</div>
                <div className={`p-3 text-xs leading-relaxed border-l ${darkMode ? 'border-slate-700 text-slate-300' : 'border-slate-100 text-slate-700'}`}>{row.a}</div>
                <div className={`p-3 text-xs leading-relaxed border-l ${darkMode ? 'border-slate-700 text-slate-300' : 'border-slate-100 text-slate-700'}`}>{row.b}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Section renderer ─────────────────────────────────────────────────────────

function SectionContent({ sectionId }: { sectionId: string }) {
  switch (sectionId) {
    case 'overview': return <OverviewSection />;
    case 'execution-flow': return <ExecutionFlowSection />;
    case 'claude-md': return <FileExplorerSection fileId="claude-md" />;
    case 'claude-json': return <FileExplorerSection fileId="claude-json" />;
    case 'system-prompt': return <FileExplorerSection fileId="system-prompt" />;
    case 'prompt-layers': return <PromptLayersSection />;
    case 'tool-calling': return <ToolCallingSection />;
    case 'memory-context': return <MemoryContextSection />;
    case 'mcp': return <McpSection />;
    case 'hooks': return <HooksSection />;
    case 'permissions': return <PermissionsSection />;
    case 'mistakes': return <CommonMistakesSection />;
    case 'best-practices': return <BestPracticesSection />;
    case 'comparisons': return <ComparisonsSection />;
    default: return null;
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ClaudeInternalsPage() {
  const { darkMode } = useAppStore();
  const [activeSection, setActiveSection] = useState<InternalsSection>(internalsSections[0]);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSectionChange = (section: InternalsSection) => {
    setActiveSection(section);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentIdx = internalsSections.findIndex(s => s.id === activeSection.id);
  const prevSection = currentIdx > 0 ? internalsSections[currentIdx - 1] : null;
  const nextSection = currentIdx < internalsSections.length - 1 ? internalsSections[currentIdx + 1] : null;

  const border = darkMode ? 'border-slate-700' : 'border-slate-200';
  const subBg = darkMode ? 'bg-slate-900' : 'bg-white';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`flex h-full overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>

      {/* ── Sub-navigation sidebar ── */}
      <div className={`w-56 shrink-0 flex flex-col border-r ${border} ${subBg} overflow-hidden`}>
        {/* Header */}
        <div className={`px-3 py-4 border-b ${border}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold">
              C
            </div>
            <div>
              <div className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Claude Internals</div>
              <div className={`text-xs ${textMuted}`}>{internalsSections.length} sections</div>
            </div>
          </div>
        </div>

        {/* Section list */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {internalsSections.map((section) => {
            const isActive = activeSection.id === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all mb-0.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500/20 to-sky-500/10 border border-violet-500/30'
                    : darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                }`}
              >
                <span className="text-sm leading-none shrink-0">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold leading-snug truncate ${
                    isActive ? (darkMode ? 'text-violet-300' : 'text-violet-700') : (darkMode ? 'text-slate-300' : 'text-slate-700')
                  }`}>
                    {section.title}
                  </div>
                </div>
                {section.badge && (
                  <span className="text-xs px-1.5 py-0.5 rounded-md font-bold shrink-0 bg-amber-500/20 text-amber-500" style={{ fontSize: 9 }}>
                    {section.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <div className={`px-3 py-3 border-t ${border}`}>
          <div className={`text-xs ${textMuted} mb-1.5`}>{currentIdx + 1} / {internalsSections.length}</div>
          <div className={`h-1 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-500"
              animate={{ width: `${((currentIdx + 1) / internalsSections.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div ref={contentRef} className={`flex-1 overflow-y-auto ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {/* Breadcrumb */}
        <div className={`sticky top-0 z-10 flex items-center gap-2 px-6 py-2.5 border-b text-xs ${subBg} ${border} ${textMuted}`}>
          <span>Claude Internals</span>
          <ChevronRight size={12} />
          <span className={darkMode ? 'text-violet-300' : 'text-violet-700'} style={{ fontWeight: 600 }}>
            {activeSection.icon} {activeSection.title}
          </span>
          {activeSection.badge && (
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold">{activeSection.badge}</span>
          )}
          <a
            href="https://docs.anthropic.com/en/docs/claude-code/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 hover:text-sky-500 transition-colors"
          >
            Official Docs <ExternalLink size={11} />
          </a>
        </div>

        {/* Section content */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SectionContent sectionId={activeSection.id} />
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next navigation */}
          <div className={`flex items-center justify-between mt-12 pt-6 border-t ${border}`}>
            {prevSection ? (
              <button
                onClick={() => handleSectionChange(prevSection)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                }`}
              >
                <ChevronRight size={15} className="rotate-180" />
                {prevSection.icon} {prevSection.title}
              </button>
            ) : <div />}
            {nextSection ? (
              <button
                onClick={() => handleSectionChange(nextSection)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-500 to-sky-500 text-white shadow-sm hover:shadow-md transition-shadow"
              >
                {nextSection.icon} {nextSection.title}
                <ChevronRight size={15} />
              </button>
            ) : (
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 size={16} />
                <span className="text-sm font-semibold">All sections complete!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
