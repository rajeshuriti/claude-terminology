import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug, Search, Shield, Zap, ChevronDown, ChevronUp,
  Play, Pause, RotateCcw, ChevronRight, X, ArrowRight,
  CheckCircle, AlertTriangle, Lock, Eye, GitBranch
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import {
  connectors, connectorCategories, workflowSimulations, enterpriseScenarios,
  mcpContent, securityContent,
} from '@/data/connectorsData';
import type { ConnectorData, ConnectorCategory, WorkflowSimulation, EnterpriseScenario } from '@/data/connectorsData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const actorStyles: Record<string, { emoji: string; color: string; bg: string; label: string }> = {
  user:      { emoji: '👤', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  label: 'User' },
  claude:    { emoji: '🤖', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', label: 'Claude' },
  connector: { emoji: '🔌', color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Connector' },
  external:  { emoji: '🌐', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'External' },
  output:    { emoji: '✅', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)',  label: 'Output' },
};

const severityColor: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#0ea5e9',
  low: '#10b981',
};

const difficultyColor: Record<string, string> = {
  beginner: '#10b981',
  intermediate: '#0ea5e9',
  advanced: '#8b5cf6',
  enterprise: '#ef4444',
};

function getCategoryMeta(id: string) {
  return connectorCategories.find(c => c.id === id) ?? { color: '#94a3b8', emoji: '🔧', label: id };
}

// ─── Connector Detail Drawer ──────────────────────────────────────────────────

function ConnectorDetail({ connector, onClose, dm }: { connector: ConnectorData; onClose: () => void; dm: boolean }) {
  const [tab, setTab] = useState<'overview' | 'capabilities' | 'usecases' | 'internals'>('overview');
  const catMeta = getCategoryMeta(connector.category);
  const relatedList = connectors.filter(c => connector.relatedConnectors.includes(c.id));

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'capabilities', label: 'Claude Can' },
    { id: 'usecases', label: 'Use Cases' },
    { id: 'internals', label: 'Internals' },
  ] as const;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 40 }}
      className={`fixed right-0 top-0 bottom-0 w-full max-w-xl z-50 shadow-2xl flex flex-col overflow-hidden ${dm ? 'bg-slate-900' : 'bg-white'}`}
    >
      {/* Header */}
      <div style={{ borderColor: dm ? '#334155' : '#e2e8f0' }} className={`flex items-start gap-4 p-5 border-b shrink-0 ${dm ? 'bg-slate-800' : 'bg-slate-50'}`}>
        <span className="text-4xl shrink-0">{connector.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className={`text-lg font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{connector.name}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: catMeta.color + '22', color: catMeta.color }}>{catMeta.emoji} {connector.category}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: difficultyColor[connector.difficulty] + '22', color: difficultyColor[connector.difficulty] }}>{connector.difficulty}</span>
          </div>
          <p className={`text-sm mt-1 leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{connector.tagline}</p>
        </div>
        <button onClick={onClose} className={`p-1.5 rounded-lg shrink-0 transition-colors ${dm ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}>
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ borderColor: dm ? '#334155' : '#e2e8f0' }} className={`flex border-b shrink-0 ${dm ? 'bg-slate-800' : 'bg-white'}`}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === t.id ? 'text-sky-500 border-b-2 border-sky-500' : dm ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {tab === 'overview' && (
          <>
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>What It Is</h3>
              <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{connector.whatItIs}</p>
            </div>
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Why It Exists</h3>
              <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{connector.whyItExists}</p>
            </div>
            <div className={`rounded-xl p-4 border ${dm ? 'bg-amber-900/20 border-amber-700/30' : 'bg-amber-50 border-amber-200'}`}>
              <div className="text-xl mb-1">💡</div>
              <p className={`text-xs font-semibold mb-1 ${dm ? 'text-amber-300' : 'text-amber-800'}`}>Analogy</p>
              <p className={`text-sm italic leading-relaxed ${dm ? 'text-amber-200' : 'text-amber-900'}`}>{connector.analogy}</p>
              <p className={`text-xs mt-2 leading-relaxed ${dm ? 'text-amber-400' : 'text-amber-700'}`}>{connector.analogyDetail}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {connector.tags.map(tag => (
                <span key={tag} className={`text-xs px-2 py-1 rounded-full ${dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>#{tag}</span>
              ))}
            </div>
            {relatedList.length > 0 && (
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Related Connectors</h3>
                <div className="flex gap-2 flex-wrap">
                  {relatedList.map(r => (
                    <span key={r.id} className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border ${dm ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                      <span>{r.emoji}</span> {r.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'capabilities' && (
          <div className="space-y-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>What Claude Can Do With {connector.name}</h3>
            {connector.claudeCapabilities.map((cap, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${dm ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{cap}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'usecases' && (
          <div className="space-y-4">
            {connector.useCases.map((uc, i) => (
              <div key={i} className={`rounded-xl border overflow-hidden ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className={`px-4 py-3 border-b ${dm ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`font-semibold text-sm ${dm ? 'text-white' : 'text-slate-900'}`}>{uc.title}</div>
                  <div className={`text-xs mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{uc.industry}</div>
                </div>
                <div className="p-4 space-y-3">
                  <p className={`text-xs leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{uc.scenario}</p>
                  <div className="space-y-1.5">
                    {uc.workflow.map((step, j) => (
                      <div key={j} className="flex items-start gap-2 text-xs">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 font-bold" style={{ background: '#0ea5e9', fontSize: 9 }}>{j + 1}</span>
                        <span className={dm ? 'text-slate-300' : 'text-slate-700'}>{step}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`text-xs rounded-lg px-3 py-2 font-medium ${dm ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-800'}`}>
                    <span className="font-bold">Outcome: </span>{uc.outcome}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'internals' && (
          <div className="space-y-4">
            {[
              { key: 'authentication', label: '🔐 Authentication', value: connector.internals.authentication },
              { key: 'permissions', label: '🔒 Permissions', value: connector.internals.permissions },
              { key: 'dataFlow', label: '🔄 Data Flow', value: connector.internals.dataFlow },
              { key: 'rateLimits', label: '⏱️ Rate Limits', value: connector.internals.rateLimits },
              { key: 'securityConsiderations', label: '🛡️ Security Considerations', value: connector.internals.securityConsiderations },
              { key: 'mcpFlow', label: '🤖 MCP Flow', value: connector.internals.mcpFlow },
            ].map(item => (
              <div key={item.key} className={`rounded-xl p-4 ${dm ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div className={`text-xs font-bold mb-1.5 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{item.label}</div>
                <p className={`text-xs leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{item.value}</p>
              </div>
            ))}
            <div className={`flex items-center gap-2 p-3 rounded-lg text-xs ${dm ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'}`}>
              <AlertTriangle size={14} className="shrink-0" />
              <span className="font-medium">Security Level: </span>
              <span style={{ color: severityColor[connector.securityLevel] }} className="font-bold uppercase">{connector.securityLevel}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Connector Library Tab ────────────────────────────────────────────────────

function ConnectorLibraryTab({ dm }: { dm: boolean }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ConnectorCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedConnector, setSelectedConnector] = useState<ConnectorData | null>(null);

  const filtered = connectors.filter(c => {
    const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchDiff = selectedDifficulty === 'all' || c.difficulty === selectedDifficulty;
    const matchSearch = search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.includes(search.toLowerCase())) || c.tagline.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchDiff && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border text-sm ${dm ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
          <Search size={15} className={dm ? 'text-slate-500' : 'text-slate-400'} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search connectors..." className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'inherit' }} />
        </div>
        <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)}
          className={`px-3 py-2 rounded-xl border text-sm ${dm ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${selectedCategory === 'all' ? 'bg-sky-500 text-white' : dm ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          All ({connectors.length})
        </button>
        {connectorCategories.map(cat => {
          const count = connectors.filter(c => c.category === cat.id).length;
          const isActive = selectedCategory === cat.id;
          return (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id as ConnectorCategory)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors`}
              style={isActive ? { background: cat.color, color: 'white' } : { background: dm ? '#1e293b' : '#f1f5f9', color: dm ? '#94a3b8' : '#64748b' }}>
              {cat.emoji} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(connector => {
          const catMeta = getCategoryMeta(connector.category);
          return (
            <motion.button key={connector.id} layout onClick={() => setSelectedConnector(connector)}
              className={`text-left p-4 rounded-xl border transition-all hover:scale-[1.02] ${dm ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'}`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl shrink-0">{connector.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`font-semibold text-sm ${dm ? 'text-white' : 'text-slate-900'}`}>{connector.name}</span>
                    {connector.enterpriseReady && <span className="text-xs px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-500 font-bold" style={{ fontSize: 9 }}>ENTERPRISE</span>}
                  </div>
                  <p className={`text-xs leading-relaxed mt-1 line-clamp-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{connector.tagline}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: catMeta.color + '22', color: catMeta.color }}>{catMeta.emoji} {connector.category}</span>
                    <span className="text-xs" style={{ color: difficultyColor[connector.difficulty] }}>● {connector.difficulty}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className={`text-center py-12 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
          No connectors match your filters. Try broadening the search.
        </div>
      )}

      {/* Connector Detail Drawer */}
      <AnimatePresence>
        {selectedConnector && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedConnector(null)} />
            <ConnectorDetail connector={selectedConnector} onClose={() => setSelectedConnector(null)} dm={dm} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Workflow Simulator ───────────────────────────────────────────────────────

function WorkflowSimulatorTab({ dm }: { dm: boolean }) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowSimulation>(workflowSimulations[0]);
  const [activeStep, setActiveStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = () => {
    setPlaying(false);
    setActiveStep(-1);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkflow]);

  useEffect(() => {
    if (!playing) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= selectedWorkflow.steps.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, speed);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, selectedWorkflow.steps.length]);

  const step = (dir: 1 | -1) => {
    setPlaying(false);
    setActiveStep(prev => Math.min(Math.max(prev + dir, -1), selectedWorkflow.steps.length - 1));
  };

  const complexityColor = { simple: '#10b981', 'multi-step': '#0ea5e9', complex: '#8b5cf6' };

  return (
    <div className="space-y-5">
      {/* Workflow Selector */}
      <div className="flex flex-wrap gap-2">
        {workflowSimulations.map(w => (
          <button key={w.id} onClick={() => setSelectedWorkflow(w)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${selectedWorkflow.id === w.id ? 'bg-sky-500 text-white shadow-md' : dm ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            <span>{w.emoji}</span> {w.title}
          </button>
        ))}
      </div>

      {/* User Query */}
      <div className={`rounded-xl border p-4 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-200'}`}>
        <div className={`text-xs font-bold mb-2 ${dm ? 'text-blue-400' : 'text-blue-700'}`}>USER QUERY</div>
        <p className={`text-sm font-mono ${dm ? 'text-slate-200' : 'text-slate-800'}`}>"{selectedWorkflow.userQuery}"</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: complexityColor[selectedWorkflow.complexity] + '22', color: complexityColor[selectedWorkflow.complexity] }}>
            {selectedWorkflow.complexity}
          </span>
          <span className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{selectedWorkflow.industry} · {selectedWorkflow.steps.length} steps</span>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="flex gap-1">
        {selectedWorkflow.steps.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= activeStep ? actorStyles[selectedWorkflow.steps[i].actorType]?.color ?? '#0ea5e9' : dm ? '#334155' : '#e2e8f0' }} />
        ))}
      </div>

      {/* Step Cards */}
      <div className="space-y-2">
        {selectedWorkflow.steps.map((s, i) => {
          const style = actorStyles[s.actorType];
          const isActive = i === activeStep;
          const isPast = i < activeStep;
          return (
            <motion.div key={s.id} layout
              className={`rounded-xl border p-4 transition-all duration-300 cursor-pointer`}
              style={{
                borderColor: isActive ? style.color : dm ? '#334155' : '#e2e8f0',
                background: isActive ? style.bg : dm ? 'rgba(30,41,59,0.5)' : 'white',
                opacity: activeStep === -1 ? 0.6 : isPast ? 0.5 : isActive ? 1 : 0.35,
                transform: isActive ? 'scale(1.01)' : 'scale(1)',
              }}
              onClick={() => setActiveStep(i === activeStep ? -1 : i)}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: style.color + '22' }}>
                  {style.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: style.color }}>{s.actor}</span>
                    <ArrowRight size={10} style={{ color: style.color }} />
                    <span className={`text-xs font-semibold ${dm ? 'text-white' : 'text-slate-900'}`}>{s.action}</span>
                  </div>
                  <p className={`text-xs leading-relaxed mt-1 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{s.detail}</p>
                  {s.data && isActive && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className={`mt-2 text-xs font-mono rounded-lg p-2 overflow-x-auto ${dm ? 'bg-slate-900 text-emerald-400' : 'bg-slate-900 text-emerald-300'}`}>
                      {s.data}
                    </motion.div>
                  )}
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: isPast ? '#10b981' : style.color }}>
                  {isPast ? '✓' : i + 1}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Outcome */}
      {activeStep >= selectedWorkflow.steps.length - 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-4 ${dm ? 'bg-emerald-900/30 border-emerald-700/40' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className={`text-xs font-bold mb-1 ${dm ? 'text-emerald-400' : 'text-emerald-700'}`}>OUTCOME</div>
          <p className={`text-sm ${dm ? 'text-emerald-300' : 'text-emerald-800'}`}>{selectedWorkflow.outcome}</p>
        </motion.div>
      )}

      {/* Controls */}
      <div className={`flex items-center gap-3 p-4 rounded-xl ${dm ? 'bg-slate-800' : 'bg-slate-50'}`}>
        <button onClick={reset} className={`p-2 rounded-lg transition-colors ${dm ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}><RotateCcw size={16} /></button>
        <button onClick={() => step(-1)} className={`p-2 rounded-lg transition-colors ${dm ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}>
          <ChevronRight size={16} className="rotate-180" />
        </button>
        <button onClick={() => setPlaying(p => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors">
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? 'Pause' : activeStep >= selectedWorkflow.steps.length - 1 ? 'Replay' : 'Play'}
        </button>
        <button onClick={() => step(1)} className={`p-2 rounded-lg transition-colors ${dm ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}>
          <ChevronRight size={16} />
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <span className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Speed</span>
          <select value={speed} onChange={e => setSpeed(Number(e.target.value))}
            className={`text-xs px-2 py-1 rounded-lg border ${dm ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
            <option value={2500}>Slow</option>
            <option value={1500}>Normal</option>
            <option value={800}>Fast</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── MCP Deep Dive Tab ────────────────────────────────────────────────────────

function MCPDeepDiveTab({ dm }: { dm: boolean }) {
  const [activeComponent, setActiveComponent] = useState<number | null>(null);
  const [activeStep, setActiveLifecycleStep] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className={`rounded-xl p-6 border ${dm ? 'bg-gradient-to-br from-violet-900/30 to-sky-900/30 border-violet-700/30' : 'bg-gradient-to-br from-violet-50 to-sky-50 border-violet-200'}`}>
        <div className="flex items-center gap-3 mb-3">
          <GitBranch className="text-violet-500" size={22} />
          <h2 className={`text-xl font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{mcpContent.overview.title}</h2>
        </div>
        <p className={`text-sm font-medium mb-3 ${dm ? 'text-violet-300' : 'text-violet-700'}`}>{mcpContent.overview.tagline}</p>
        <p className={`text-sm leading-relaxed mb-4 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{mcpContent.overview.whatItIs}</p>
        <p className={`text-sm leading-relaxed mb-4 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{mcpContent.overview.whyCreated}</p>
        <div className="space-y-2">
          {mcpContent.overview.keyBenefits.map((b, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <span className={dm ? 'text-slate-300' : 'text-slate-700'}>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Diagram */}
      <div>
        <h3 className={`text-base font-bold mb-4 ${dm ? 'text-white' : 'text-slate-900'}`}>MCP Architecture</h3>
        <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0">
          {mcpContent.architecture.map((comp, i) => (
            <div key={i} className="flex sm:flex-col items-center sm:flex-1">
              <button onClick={() => setActiveComponent(activeComponent === i ? null : i)}
                className={`flex-1 sm:w-full p-4 rounded-xl border-2 transition-all text-center ${activeComponent === i ? 'shadow-lg scale-105' : 'hover:scale-102'}`}
                style={{
                  borderColor: activeComponent === i ? comp.color : dm ? '#334155' : '#e2e8f0',
                  background: activeComponent === i ? comp.color + '22' : dm ? '#1e293b' : 'white',
                }}>
                <span className="text-2xl block mb-1">{comp.emoji}</span>
                <span className="text-xs font-bold block" style={{ color: comp.color }}>{comp.name}</span>
              </button>
              {i < mcpContent.architecture.length - 1 && (
                <div className="sm:hidden flex items-center justify-center w-8">
                  <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                </div>
              )}
              {i < mcpContent.architecture.length - 1 && (
                <div className="hidden sm:flex items-center justify-center h-8 w-full">
                  <ArrowRight size={16} style={{ color: '#94a3b8' }} />
                </div>
              )}
            </div>
          ))}
        </div>
        <AnimatePresence>
          {activeComponent !== null && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className={`mt-3 rounded-xl border p-4 overflow-hidden`}
              style={{ borderColor: mcpContent.architecture[activeComponent].color + '44', background: mcpContent.architecture[activeComponent].color + '11' }}>
              <h4 className="font-bold text-sm mb-2" style={{ color: mcpContent.architecture[activeComponent].color }}>{mcpContent.architecture[activeComponent].name}</h4>
              <p className={`text-sm leading-relaxed mb-3 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{mcpContent.architecture[activeComponent].description}</p>
              <div className="space-y-1">
                {mcpContent.architecture[activeComponent].examples.map((ex, j) => (
                  <div key={j} className={`text-xs font-mono px-2 py-1 rounded ${dm ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-600'}`}>{ex}</div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tool Lifecycle */}
      <div>
        <h3 className={`text-base font-bold mb-4 ${dm ? 'text-white' : 'text-slate-900'}`}>Tool Call Lifecycle</h3>
        <div className="space-y-2">
          {mcpContent.toolLifecycle.map((s, i) => (
            <div key={i}>
              <button onClick={() => setActiveLifecycleStep(activeStep === i ? null : i)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${activeStep === i ? dm ? 'bg-sky-900/30 border-sky-700/50' : 'bg-sky-50 border-sky-200' : dm ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                <span className="w-7 h-7 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{s.step}</span>
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold text-sm ${dm ? 'text-white' : 'text-slate-900'}`}>{s.phase}</span>
                  <p className={`text-xs mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{s.description}</p>
                </div>
                {activeStep === i ? <ChevronUp size={14} className={dm ? 'text-slate-400' : 'text-slate-500'} /> : <ChevronDown size={14} className={dm ? 'text-slate-400' : 'text-slate-500'} />}
              </button>
              <AnimatePresence>
                {activeStep === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className={`mx-3 px-4 pb-3 text-xs leading-relaxed rounded-b-xl overflow-hidden ${dm ? 'bg-sky-900/20 text-slate-300' : 'bg-sky-50 text-slate-600'}`}>
                    {s.detail}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div>
        <h3 className={`text-base font-bold mb-4 ${dm ? 'text-white' : 'text-slate-900'}`}>Connector vs API vs MCP</h3>
        <div className={`rounded-xl border overflow-hidden text-sm ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className={`grid grid-cols-6 gap-0 text-xs font-bold uppercase tracking-wider px-4 py-3 ${dm ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
            <div className="col-span-1">Concept</div>
            <div className="col-span-2">Definition</div>
            <div className="col-span-1">Strength</div>
            <div className="col-span-1">Limitation</div>
            <div className="col-span-1">Enterprise</div>
          </div>
          {mcpContent.vsComparison.map((row, i) => (
            <div key={i} className={`grid grid-cols-6 gap-0 px-4 py-3 border-t text-xs ${dm ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-100 text-slate-700 hover:bg-slate-50'}`}>
              <div className="col-span-1 font-bold">{row.concept}</div>
              <div className="col-span-2">{row.definition}<div className={`font-mono mt-0.5 ${dm ? 'text-sky-400' : 'text-sky-600'}`}>{row.example}</div></div>
              <div className="col-span-1 text-emerald-600">{row.strength}</div>
              <div className="col-span-1 text-red-500">{row.limitation}</div>
              <div className="col-span-1">{row.enterprise}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Security & Enterprise Tab ────────────────────────────────────────────────

function SecurityTab({ dm }: { dm: boolean }) {
  const [openMistake, setOpenMistake] = useState<string | null>(null);
  const [openScenario, setOpenScenario] = useState<string | null>(null);

  const scenarioEmojiFor = (s: EnterpriseScenario) => s.emoji;

  return (
    <div className="space-y-8">
      {/* Common Mistakes */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-red-500" size={18} />
          <h3 className={`text-base font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>Common Production Mistakes</h3>
        </div>
        <div className="space-y-2">
          {securityContent.commonMistakes.map(m => (
            <div key={m.id} className={`rounded-xl border overflow-hidden ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
              <button onClick={() => setOpenMistake(openMistake === m.id ? null : m.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${dm ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                <span className="text-xl shrink-0">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold text-sm ${dm ? 'text-white' : 'text-slate-900'}`}>{m.title}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: severityColor[m.severity] + '22', color: severityColor[m.severity] }}>{m.severity}</span>
                {openMistake === m.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <AnimatePresence>
                {openMistake === m.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className={`px-4 pb-4 space-y-3 overflow-hidden border-t ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
                    <p className={`text-sm leading-relaxed pt-3 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{m.description}</p>
                    <div className={`rounded-lg p-3 text-xs leading-relaxed ${dm ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'}`}>
                      <span className="font-bold">Real Example: </span>{m.example}
                    </div>
                    <div className={`rounded-lg p-3 text-xs leading-relaxed ${dm ? 'bg-emerald-900/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                      <span className="font-bold">Fix: </span>{m.fix}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Security Principles */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="text-sky-500" size={18} />
          <h3 className={`text-base font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>Security Principles for AI Connectors</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {securityContent.principles.map((p, i) => (
            <div key={i} className={`rounded-xl p-4 border ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{p.icon}</span>
                <span className={`font-semibold text-sm ${dm ? 'text-white' : 'text-slate-900'}`}>{p.principle}</span>
              </div>
              <p className={`text-xs leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{p.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise Scenarios */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Eye className="text-violet-500" size={18} />
          <h3 className={`text-base font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>Real Enterprise Deployments</h3>
        </div>
        <div className="space-y-3">
          {enterpriseScenarios.map(scenario => {
            const isOpen = openScenario === scenario.id;
            const usedConnectors = connectors.filter(c => scenario.connectors.includes(c.id));
            return (
              <div key={scenario.id} className={`rounded-xl border overflow-hidden ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
                <button onClick={() => setOpenScenario(isOpen ? null : scenario.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-colors ${dm ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                  <span className="text-3xl shrink-0">{scenarioEmojiFor(scenario)}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`font-bold text-sm block ${dm ? 'text-white' : 'text-slate-900'}`}>{scenario.title}</span>
                    <span className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{scenario.industry}</span>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {usedConnectors.slice(0, 4).map(c => (
                        <span key={c.id} className={`text-xs px-1.5 py-0.5 rounded-full ${dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{c.emoji} {c.name}</span>
                      ))}
                      {usedConnectors.length > 4 && <span className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>+{usedConnectors.length - 4} more</span>}
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className={`border-t px-4 pb-4 overflow-hidden ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
                      <p className={`text-sm leading-relaxed pt-4 mb-4 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{scenario.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: '🏗️ Architecture', items: scenario.architecture, color: '#0ea5e9' },
                          { label: '⚡ Key Workflows', items: scenario.workflows, color: '#10b981' },
                          { label: '⚠️ Risks', items: scenario.risks, color: '#ef4444' },
                          { label: '📈 Scaling Concerns', items: scenario.scalingConcerns, color: '#8b5cf6' },
                        ].map(section => (
                          <div key={section.label}>
                            <div className="text-xs font-bold mb-2" style={{ color: section.color }}>{section.label}</div>
                            <ul className="space-y-1.5">
                              {section.items.map((item, j) => (
                                <li key={j} className={`text-xs leading-relaxed flex items-start gap-1.5 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
                                  <span className="shrink-0 mt-0.5" style={{ color: section.color }}>▸</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ dm, onTabChange }: { dm: boolean; onTabChange: (t: string) => void }) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className={`rounded-2xl p-8 ${dm ? 'bg-gradient-to-br from-sky-900/40 to-violet-900/40 border border-sky-700/30' : 'bg-gradient-to-br from-sky-50 to-violet-50 border border-sky-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <Plug className="text-sky-500" size={28} />
          <h2 className={`text-2xl font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>Claude Connectors & Integrations</h2>
        </div>
        <p className={`text-base leading-relaxed mb-6 max-w-2xl ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
          Claude becomes dramatically more powerful when connected to real enterprise systems. Connectors bridge the gap between AI reasoning and live business data — enabling Claude to take actions, retrieve real-time information, and orchestrate complex workflows across your entire technology stack.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: `${connectors.length}+`, label: 'Connectors', color: '#0ea5e9' },
            { value: `${connectorCategories.length}`, label: 'Categories', color: '#8b5cf6' },
            { value: `${workflowSimulations.length}`, label: 'Live Workflows', color: '#10b981' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl p-4 text-center ${dm ? 'bg-slate-900/60' : 'bg-white/70'}`}>
              <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Grid */}
      <div>
        <h3 className={`text-base font-bold mb-4 ${dm ? 'text-white' : 'text-slate-900'}`}>Connector Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {connectorCategories.map(cat => {
            const count = connectors.filter(c => c.category === cat.id).length;
            return (
              <button key={cat.id} onClick={() => onTabChange('library')}
                className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${dm ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 hover:shadow-md'}`}>
                <span className="text-2xl block mb-2">{cat.emoji}</span>
                <div className="font-semibold text-sm" style={{ color: cat.color }}>{cat.label}</div>
                <div className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{cat.description}</div>
                <div className="text-xs font-bold mt-2" style={{ color: cat.color }}>{count} connectors</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* How Connectors Work */}
      <div className={`rounded-xl p-6 border ${dm ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <h3 className={`text-base font-bold mb-4 ${dm ? 'text-white' : 'text-slate-900'}`}>How Connectors Work in Practice</h3>
        <div className="flex flex-col sm:flex-row items-center gap-2 text-sm">
          {[
            { label: 'User Request', emoji: '👤', color: '#3b82f6' },
            { label: 'Claude Reasons', emoji: '🤖', color: '#8b5cf6' },
            { label: 'Calls Connector', emoji: '🔌', color: '#10b981' },
            { label: 'External System', emoji: '🌐', color: '#f59e0b' },
            { label: 'Claude Synthesizes', emoji: '🤖', color: '#8b5cf6' },
            { label: 'Final Response', emoji: '✅', color: '#0ea5e9' },
          ].map((node, i, arr) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <span className="text-xl">{node.emoji}</span>
                <span className="text-xs font-medium mt-1 text-center" style={{ color: node.color }}>{node.label}</span>
              </div>
              {i < arr.length - 1 && <ArrowRight size={14} style={{ color: '#94a3b8' }} className="shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start Tiles */}
      <div>
        <h3 className={`text-base font-bold mb-4 ${dm ? 'text-white' : 'text-slate-900'}`}>Explore This Module</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { tab: 'library', emoji: '🗂️', title: 'Connector Library', desc: `Browse all ${connectors.length} connectors with rich detail on capabilities, use cases, and internals.`, color: '#0ea5e9' },
            { tab: 'workflows', emoji: '⚡', title: 'Workflow Simulations', desc: 'Watch animated step-by-step AI workflows across real enterprise scenarios.', color: '#10b981' },
            { tab: 'mcp', emoji: '🔗', title: 'MCP Deep Dive', desc: 'Understand the Model Context Protocol architecture and tool lifecycle.', color: '#8b5cf6' },
            { tab: 'security', emoji: '🛡️', title: 'Security & Enterprise', desc: 'Learn common mistakes, security principles, and full enterprise deployment patterns.', color: '#ef4444' },
          ].map(tile => (
            <button key={tile.tab} onClick={() => onTabChange(tile.tab)}
              className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all hover:scale-[1.01] ${dm ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 hover:shadow-md'}`}>
              <span className="text-3xl shrink-0">{tile.emoji}</span>
              <div>
                <div className="font-semibold text-sm" style={{ color: tile.color }}>{tile.title}</div>
                <p className={`text-xs leading-relaxed mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{tile.desc}</p>
              </div>
              <ChevronRight size={16} className="shrink-0 mt-1" style={{ color: tile.color }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',   label: 'Overview',           emoji: '🏠', icon: Plug },
  { id: 'library',   label: 'Connector Library',   emoji: '🗂️', icon: Search },
  { id: 'workflows', label: 'Workflow Simulations', emoji: '⚡', icon: Zap },
  { id: 'mcp',       label: 'MCP Deep Dive',       emoji: '🔗', icon: GitBranch },
  { id: 'security',  label: 'Security & Enterprise',emoji: '🛡️', icon: Shield },
] as const;

type TabId = typeof TABS[number]['id'];

export function ConnectorsPage() {
  const { darkMode } = useAppStore();
  const dm = darkMode;
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className={`flex flex-col h-full ${dm ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Page Header */}
      <div className={`px-6 py-5 border-b shrink-0 ${dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3 mb-1">
          <Plug size={22} className="text-sky-500" />
          <h1 className={`text-xl font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>Claude Connectors & Integrations</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-500 font-bold">ADVANCED</span>
        </div>
        <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
          Enterprise AI orchestration — real-time data access, tool calling, and production workflow automation
        </p>
      </div>

      {/* Tab Bar */}
      <div className={`flex gap-0 border-b shrink-0 overflow-x-auto ${dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === t.id
                ? 'border-sky-500 text-sky-500'
                : `border-transparent ${dm ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`
            }`}>
            <span>{t.emoji}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {activeTab === 'overview'   && <OverviewTab dm={dm} onTabChange={t => setActiveTab(t as TabId)} />}
            {activeTab === 'library'   && <ConnectorLibraryTab dm={dm} />}
            {activeTab === 'workflows' && <WorkflowSimulatorTab dm={dm} />}
            {activeTab === 'mcp'       && <MCPDeepDiveTab dm={dm} />}
            {activeTab === 'security'  && <SecurityTab dm={dm} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
