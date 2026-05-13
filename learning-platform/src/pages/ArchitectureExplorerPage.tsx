import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Play, Pause, SkipForward, RotateCcw, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { tw } from '@/lib/dm';
import { SectionLabel, Badge, CollapsibleSection } from '@/components/ui';
import {
  archNodes, flowSimulations, evolutionStages, archPatterns,
  LAYER_META,
} from '@/data/architectureExplorerData';
import type { ArchNode, NodeLayer, FlowSimulation, EvolutionStage, ArchPattern } from '@/data/architectureExplorerData';

type TabId = 'map' | 'flows' | 'evolution' | 'patterns';
type ViewMode = 'beginner' | 'developer' | 'architect' | 'enterprise' | 'ai-engineering';

const TABS: Array<{ id: TabId; label: string; emoji: string }> = [
  { id: 'map', label: 'Architecture Map', emoji: '🗺️' },
  { id: 'flows', label: 'System Flows', emoji: '⚡' },
  { id: 'evolution', label: 'Evolution', emoji: '📈' },
  { id: 'patterns', label: 'Patterns', emoji: '🎯' },
];

const VIEW_MODES: Array<{ id: ViewMode; label: string; description: string }> = [
  { id: 'beginner', label: 'Beginner', description: 'Core concepts, clear analogies, no jargon' },
  { id: 'developer', label: 'Developer', description: 'Full content, sub-items, file examples' },
  { id: 'architect', label: 'Architect', description: 'Relationships, dependencies, tradeoffs' },
  { id: 'enterprise', label: 'Enterprise', description: 'Security, governance, compliance' },
  { id: 'ai-engineering', label: 'AI Engineering', description: 'Agents, MCP, orchestration depth' },
];

const COMPLEXITY_COLORS: Record<string, { bg: string; text: string; dark: string; label: string }> = {
  starter:    { bg: 'bg-emerald-100', text: 'text-emerald-700', dark: 'bg-emerald-900/30 text-emerald-300', label: 'Starter' },
  growing:    { bg: 'bg-sky-100',     text: 'text-sky-700',     dark: 'bg-sky-900/30 text-sky-300',         label: 'Growing' },
  scaling:    { bg: 'bg-amber-100',   text: 'text-amber-700',   dark: 'bg-amber-900/30 text-amber-300',     label: 'Scaling' },
  enterprise: { bg: 'bg-violet-100',  text: 'text-violet-700',  dark: 'bg-violet-900/30 text-violet-300',   label: 'Enterprise' },
};

const ACTOR_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  user:    { bg: 'bg-sky-500/10',    text: 'text-sky-600 dark:text-sky-400',    border: 'border-sky-300' },
  claude:  { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-300' },
  system:  { bg: 'bg-slate-500/10',  text: 'text-slate-600 dark:text-slate-400',  border: 'border-slate-300' },
  mcp:     { bg: 'bg-pink-500/10',   text: 'text-pink-600 dark:text-pink-400',   border: 'border-pink-300' },
  service: { bg: 'bg-emerald-500/10',text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-300' },
  agent:   { bg: 'bg-amber-500/10',  text: 'text-amber-600 dark:text-amber-400',  border: 'border-amber-300' },
  infra:   { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-300' },
};

// ── Node card in the architecture map ────────────────────────────────────────

function NodeCard({ node, selected, dm, onClick }: {
  node: ArchNode;
  selected: boolean;
  dm: boolean;
  onClick: () => void;
}) {
  const c = COMPLEXITY_COLORS[node.complexity];
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`text-left p-3 rounded-xl border-2 transition-all w-full ${
        selected
          ? 'shadow-lg'
          : dm ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-100 hover:border-slate-300'
      }`}
      style={selected ? {
        borderColor: node.color,
        boxShadow: `0 0 0 3px ${node.color}22, 0 8px 25px ${node.color}30`,
        background: node.color + '10',
      } : {}}
    >
      <div className="flex items-start gap-2">
        <span className="text-xl leading-none mt-0.5">{node.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className={`text-xs font-bold leading-tight ${dm ? 'text-white' : 'text-slate-900'}`}>{node.label}</div>
          <div className={`text-xs mt-1 leading-snug ${dm ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontSize: 10 }}>
            {node.tagline.split(' — ')[0]}
          </div>
          <span className={`inline-block text-xs mt-1.5 px-1.5 py-0.5 rounded-full font-medium ${dm ? c.dark : `${c.bg} ${c.text}`}`} style={{ fontSize: 9 }}>
            {c.label}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

// ── Rich detail panel for a selected node ────────────────────────────────────

function NodeDetailPanel({ node, allNodes, viewMode, dm, onNavigate }: {
  node: ArchNode;
  allNodes: ArchNode[];
  viewMode: ViewMode;
  dm: boolean;
  onNavigate: (id: string) => void;
}) {
  const layer = LAYER_META[node.layer];
  const relNodes = node.relationships.map(r => ({
    rel: r,
    node: allNodes.find(n => n.id === r.targetId),
  })).filter(x => x.node);

  const showWhy = viewMode !== 'beginner';
  const showSubItems = viewMode !== 'beginner';
  const showRelationships = viewMode === 'architect' || viewMode === 'enterprise' || viewMode === 'ai-engineering';
  const showSecurity = (viewMode === 'enterprise' || viewMode === 'architect') && !!node.security;

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col h-full overflow-y-auto rounded-2xl border ${tw(dm, 'card', 'border')}`}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: node.color + '40', background: node.color + '10' }}>
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none">{node.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className={`text-lg font-bold ${tw(dm, 'heading')}`}>{node.label}</div>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <Badge color={layer.color}>{layer.label}</Badge>
              <Badge color={node.color}>{COMPLEXITY_COLORS[node.complexity].label}</Badge>
            </div>
          </div>
        </div>
        <p className={`text-sm mt-3 italic leading-relaxed ${tw(dm, 'muted')}`}>{node.tagline}</p>
      </div>

      <div className="flex-1 p-4 space-y-5">
        {/* What it is */}
        <div>
          <SectionLabel dm={dm} className="mb-2">What It Is</SectionLabel>
          <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{node.whatItIs}</p>
        </div>

        {/* Why it exists */}
        {showWhy && (
          <div>
            <SectionLabel dm={dm} className="mb-2">Why It Exists</SectionLabel>
            <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{node.whyItExists}</p>
          </div>
        )}

        {/* Analogy */}
        <div className={`p-3 rounded-xl border-l-4`} style={{ borderColor: node.color, background: node.color + '10' }}>
          <div className="text-xs font-bold mb-1" style={{ color: node.color }}>💡 Analogy</div>
          <div className={`text-sm font-semibold ${tw(dm, 'heading')}`}>{node.analogy}</div>
          {viewMode !== 'beginner' && (
            <p className={`text-xs mt-1.5 leading-relaxed ${tw(dm, 'body')}`}>{node.analogyDetail}</p>
          )}
        </div>

        {/* Use cases */}
        <CollapsibleSection dm={dm} title="Real-World Use Cases" defaultOpen={true}>
          <ul className="p-3 space-y-1.5">
            {node.useCases.map((uc, i) => (
              <li key={i} className={`flex items-start gap-2 text-xs ${tw(dm, 'body')}`}>
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                <span>{uc}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        {/* Sub-items */}
        {showSubItems && node.subItems && node.subItems.length > 0 && (
          <CollapsibleSection dm={dm} title="Contents & Sub-items" defaultOpen={viewMode === 'developer'}>
            <div className="p-3 space-y-2.5">
              {node.subItems.map((item) => (
                <div key={item.name} className={`p-2.5 rounded-lg ${tw(dm, 'cardAlt')}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{item.emoji}</span>
                    <code className={`text-xs font-mono font-bold ${dm ? 'text-sky-300' : 'text-sky-700'}`}>{item.name}</code>
                  </div>
                  <p className={`text-xs leading-relaxed ${tw(dm, 'muted')}`}>{item.description}</p>
                  {item.example && (
                    <div className={`mt-1.5 text-xs font-mono px-2 py-1 rounded ${dm ? 'bg-slate-900 text-emerald-400' : 'bg-slate-900 text-emerald-400'}`} style={{ fontSize: 10 }}>
                      {item.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Relationships */}
        {showRelationships && relNodes.length > 0 && (
          <div>
            <SectionLabel dm={dm} className="mb-2">Architecture Connections</SectionLabel>
            <div className="space-y-1.5">
              {relNodes.map(({ rel, node: rn }) => rn && (
                <button
                  key={rel.targetId}
                  onClick={() => onNavigate(rel.targetId)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${tw(dm, 'cardAlt', 'hover')}`}
                >
                  <span className="text-sm">{rn.emoji}</span>
                  <span className={`font-semibold ${tw(dm, 'body')}`}>{rn.label}</span>
                  <span className={tw(dm, 'muted')}>— {rel.label}</span>
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full" style={{ background: rn.color + '20', color: rn.color }}>
                    {rel.type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Security */}
        {showSecurity && node.security && (
          <div className={`p-3 rounded-xl border ${dm ? 'bg-red-900/10 border-red-800/40' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Shield size={12} className="text-red-500" />
              <span className="text-xs font-bold text-red-500">Security Note</span>
            </div>
            <p className={`text-xs leading-relaxed ${dm ? 'text-red-300' : 'text-red-700'}`}>{node.security}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Architecture Map tab ──────────────────────────────────────────────────────

function ArchitectureMapTab({ dm }: { dm: boolean }) {
  const [selectedId, setSelectedId] = useState<string>('claude-md');
  const [viewMode, setViewMode] = useState<ViewMode>('developer');
  const [search, setSearch] = useState('');

  const selectedNode = archNodes.find(n => n.id === selectedId) ?? archNodes[0];

  const layers: NodeLayer[] = [0, 1, 2, 3, 4];

  const filteredNodes = (layer: NodeLayer) =>
    archNodes.filter(n => {
      if (n.layer !== layer) return false;
      if (search && !n.label.toLowerCase().includes(search.toLowerCase()) &&
          !n.tagline.toLowerCase().includes(search.toLowerCase())) return false;
      // Beginner mode hides deeper layers partially
      if (viewMode === 'beginner' && layer > 2 && n.id !== 'tests' && n.id !== 'github') return false;
      return true;
    });

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className={`flex flex-wrap items-center gap-3 px-4 pt-4 pb-3 border-b ${tw(dm, 'border')}`}>
        {/* View mode selector */}
        <div className="flex items-center gap-1 flex-wrap">
          {VIEW_MODES.map(vm => (
            <button
              key={vm.id}
              onClick={() => setViewMode(vm.id)}
              title={vm.description}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === vm.id
                  ? 'bg-violet-500 text-white shadow-sm'
                  : dm ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {vm.label}
            </button>
          ))}
        </div>
        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter nodes…"
          className={`px-3 py-1.5 rounded-lg text-xs border outline-none ml-auto ${tw(dm, 'input')}`}
          style={{ minWidth: 140 }}
        />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Architecture layers */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {layers.map(layer => {
            const meta = LAYER_META[layer];
            const nodes = filteredNodes(layer);
            if (nodes.length === 0) return null;
            return (
              <div key={layer} className={`rounded-xl border ${tw(dm, 'border')} overflow-hidden`}>
                {/* Layer header */}
                <div
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{ background: meta.color + '15', borderBottom: `1px solid ${meta.color}30` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.color }} />
                  <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label.toUpperCase()}</span>
                  <span className={`text-xs ${tw(dm, 'muted')}`}>{meta.description}</span>
                </div>
                {/* Nodes grid */}
                <div className={`p-3 grid gap-2 ${layer === 0 || layer === 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
                  {nodes.map(node => (
                    <NodeCard
                      key={node.id}
                      node={node}
                      selected={selectedId === node.id}
                      dm={dm}
                      onClick={() => setSelectedId(node.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Layer flow arrows */}
          <div className={`flex items-center justify-center gap-2 py-2 ${tw(dm, 'muted')}`} style={{ fontSize: 10 }}>
            <span>Config</span>
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
            <span>Claude Layer</span>
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}>→</motion.span>
            <span>Application</span>
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }}>→</motion.span>
            <span>AI Core</span>
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.9 }}>→</motion.span>
            <span>Foundation</span>
          </div>
        </div>

        {/* Right: Detail panel */}
        <div className="w-80 lg:w-96 shrink-0 p-4 overflow-hidden flex flex-col border-l" style={{ borderColor: dm ? '#334155' : '#e2e8f0' }}>
          <div className={`text-xs font-medium mb-3 ${tw(dm, 'muted')}`}>
            Click any node to explore it
          </div>
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait">
              <NodeDetailPanel
                key={selectedId}
                node={selectedNode}
                allNodes={archNodes}
                viewMode={viewMode}
                dm={dm}
                onNavigate={(id) => setSelectedId(id)}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── System Flows tab ──────────────────────────────────────────────────────────

function SystemFlowsTab({ dm }: { dm: boolean }) {
  const [selectedFlow, setSelectedFlow] = useState<FlowSimulation>(flowSimulations[0]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1800);

  const totalSteps = selectedFlow.steps.length;
  const currentStep = selectedFlow.steps[stepIdx];

  const handleSelectFlow = (flow: FlowSimulation) => {
    setSelectedFlow(flow);
    setStepIdx(0);
    setPlaying(false);
  };

  const advance = () => {
    setStepIdx(prev => {
      if (prev >= totalSteps - 1) { setPlaying(false); return prev; }
      return prev + 1;
    });
  };

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(advance, speed);
    return () => clearInterval(t);
  // advance is stable within a render; listing speed/playing/totalSteps covers re-starts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speed]);

  const handlePlay = () => {
    if (stepIdx >= totalSteps - 1) setStepIdx(0);
    setPlaying(p => !p);
  };
  const progressPct = totalSteps > 1 ? (stepIdx / (totalSteps - 1)) * 100 : 0;
  const actorStyle = ACTOR_STYLES[currentStep.actorType] ?? ACTOR_STYLES['system'];

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 h-full">
      {/* Flow selector */}
      <div className="lg:w-64 shrink-0 space-y-2">
        <SectionLabel dm={dm} className="mb-3">Select a Flow</SectionLabel>
        {flowSimulations.map(flow => {
          const c = COMPLEXITY_COLORS[flow.complexity];
          return (
            <button
              key={flow.id}
              onClick={() => handleSelectFlow(flow)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                selectedFlow.id === flow.id
                  ? 'border-violet-500 bg-violet-500/10'
                  : `border-transparent ${tw(dm, 'card')} ${tw(dm, 'hover')}`
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{flow.emoji}</span>
                <span className={`text-xs font-semibold ${tw(dm, 'heading')}`}>{flow.title}</span>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${dm ? c.dark : `${c.bg} ${c.text}`}`} style={{ fontSize: 9 }}>
                {c.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Flow player */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className={`p-4 rounded-t-2xl border-b ${tw(dm, 'card', 'border')}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{selectedFlow.emoji}</span>
            <div>
              <div className={`text-base font-bold ${tw(dm, 'heading')}`}>{selectedFlow.title}</div>
              <p className={`text-xs ${tw(dm, 'muted')}`}>{selectedFlow.description}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${dm ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <motion.div
              className="h-full rounded-full bg-violet-500"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className={`flex items-center justify-between mt-1 text-xs ${tw(dm, 'muted')}`}>
            <span>Step {stepIdx + 1} of {totalSteps}</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
        </div>

        {/* Current step */}
        <div className={`flex-1 p-5 rounded-b-2xl border border-t-0 overflow-y-auto ${tw(dm, 'card', 'border')}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedFlow.id}-${stepIdx}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {/* Actor badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-4 ${actorStyle.bg} ${actorStyle.border}`}>
                <span className={actorStyle.text}>{currentStep.actor}</span>
                <span className={`text-xs opacity-60 ${actorStyle.text}`}>({currentStep.actorType})</span>
              </div>

              {/* Action */}
              <h3 className={`text-lg font-bold mb-3 ${tw(dm, 'heading')}`}>{currentStep.action}</h3>

              {/* Detail */}
              <div className={`text-sm leading-relaxed p-4 rounded-xl border ${tw(dm, 'section', 'border')} ${tw(dm, 'body')}`}>
                {currentStep.detail}
              </div>

              {/* Step navigation */}
              <div className={`mt-4 flex gap-2 flex-wrap`}>
                {selectedFlow.steps.map((step, i) => (
                  <button
                    key={step.id}
                    onClick={() => { setStepIdx(i); setPlaying(false); }}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                      i === stepIdx
                        ? 'bg-violet-500 text-white'
                        : i < stepIdx
                          ? dm ? 'bg-emerald-700 text-emerald-200' : 'bg-emerald-100 text-emerald-700'
                          : dm ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Playback controls */}
        <div className={`flex items-center gap-2 mt-3 p-3 rounded-xl ${tw(dm, 'section')}`}>
          <button
            onClick={() => { setStepIdx(0); setPlaying(false); }}
            className={`p-2 rounded-lg transition-colors ${tw(dm, 'hover')} ${tw(dm, 'muted')}`}
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={handlePlay}
            className="px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? 'Pause' : stepIdx === totalSteps - 1 ? 'Replay' : 'Play'}
          </button>
          <button
            onClick={advance}
            disabled={stepIdx >= totalSteps - 1}
            className={`p-2 rounded-lg transition-colors ${tw(dm, 'hover')} ${tw(dm, 'muted')} disabled:opacity-30`}
          >
            <SkipForward size={16} />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className={`text-xs ${tw(dm, 'muted')}`}>Speed</span>
            {[2400, 1800, 1200, 800].map(ms => (
              <button
                key={ms}
                onClick={() => setSpeed(ms)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  speed === ms ? 'bg-violet-500 text-white' : dm ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {ms === 2400 ? '0.5×' : ms === 1800 ? '1×' : ms === 1200 ? '1.5×' : '2×'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Evolution tab ─────────────────────────────────────────────────────────────

function EvolutionTab({ dm }: { dm: boolean }) {
  const [activeStage, setActiveStage] = useState<EvolutionStage>(evolutionStages[0]);
  const [showAntiPattern, setShowAntiPattern] = useState(false);

  const c = COMPLEXITY_COLORS[activeStage.complexity];

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Stage selector — horizontal scroll */}
      <div>
        <SectionLabel dm={dm} className="mb-3">Architecture Evolution — 7 Stages</SectionLabel>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {evolutionStages.map(stage => {
            const sc = COMPLEXITY_COLORS[stage.complexity];
            const active = stage.stage === activeStage.stage;
            return (
              <button
                key={stage.stage}
                onClick={() => { setActiveStage(stage); setShowAntiPattern(false); }}
                className={`shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all min-w-[90px] ${
                  active
                    ? 'border-violet-500 bg-violet-500/10'
                    : `${tw(dm, 'card')} ${dm ? 'border-slate-700' : 'border-slate-200'} ${tw(dm, 'hover')}`
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  active ? 'bg-violet-500 text-white' : dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  {stage.stage}
                </div>
                <span className={`text-xs font-medium text-center leading-tight ${active ? (dm ? 'text-violet-300' : 'text-violet-700') : tw(dm, 'body')}`}>
                  {stage.title}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${dm ? sc.dark : `${sc.bg} ${sc.text}`}`} style={{ fontSize: 9 }}>
                  {sc.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active stage detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage.stage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {/* Main info */}
          <div className={`p-5 rounded-2xl border ${tw(dm, 'card', 'border')}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold bg-violet-500 text-white`}>
                {activeStage.stage}
              </div>
              <div>
                <div className={`text-lg font-bold ${tw(dm, 'heading')}`}>{activeStage.title}</div>
                <div className={`text-sm ${tw(dm, 'muted')}`}>{activeStage.subtitle}</div>
              </div>
              <div className="ml-auto flex flex-col gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${dm ? c.dark : `${c.bg} ${c.text}`}`}>{c.label}</span>
                <span className={`text-xs ${tw(dm, 'muted')} text-right`}>{activeStage.teamSize}</span>
              </div>
            </div>

            <p className={`text-sm leading-relaxed mb-4 ${tw(dm, 'body')}`}>{activeStage.description}</p>

            <div className="mb-4">
              <SectionLabel dm={dm} className="mb-2">What Gets Added</SectionLabel>
              <div className="flex flex-col gap-1.5">
                {activeStage.addedItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                    <code className={`text-xs font-mono ${dm ? 'text-emerald-300' : 'text-emerald-800'}`}>{item}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-3 rounded-xl ${dm ? 'bg-sky-900/20 border border-sky-800/40' : 'bg-sky-50 border border-sky-200'}`}>
              <div className={`text-xs font-bold mb-1 ${dm ? 'text-sky-300' : 'text-sky-700'}`}>⏰ When to Adopt This Stage</div>
              <p className={`text-xs leading-relaxed ${dm ? 'text-sky-200' : 'text-sky-800'}`}>{activeStage.whenToAdopt}</p>
            </div>
          </div>

          {/* Anti-pattern */}
          <div className={`p-5 rounded-2xl border ${tw(dm, 'card', 'border')}`}>
            <button
              onClick={() => setShowAntiPattern(p => !p)}
              className={`w-full flex items-center justify-between p-3 rounded-xl mb-3 ${dm ? 'bg-red-900/15 hover:bg-red-900/25' : 'bg-red-50 hover:bg-red-100'} transition-colors`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span className={`text-sm font-semibold ${dm ? 'text-red-300' : 'text-red-700'}`}>Anti-Pattern at This Stage</span>
              </div>
              {showAntiPattern ? <ChevronUp size={16} className={dm ? 'text-red-400' : 'text-red-500'} /> : <ChevronDown size={16} className={dm ? 'text-red-400' : 'text-red-500'} />}
            </button>

            <AnimatePresence>
              {showAntiPattern && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={`overflow-hidden mb-4 text-sm leading-relaxed p-3 rounded-xl ${dm ? 'bg-red-900/10 text-red-200' : 'bg-red-50 text-red-800'}`}
                >
                  {activeStage.antiPattern}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Architecture progression visual */}
            <SectionLabel dm={dm} className="mb-3">System at This Stage</SectionLabel>
            <div className="space-y-1">
              {evolutionStages.slice(0, activeStage.stage).map(prevStage => (
                <div key={prevStage.stage} className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                    prevStage.stage === activeStage.stage ? 'bg-violet-500 text-white' : dm ? 'bg-emerald-700 text-emerald-200' : 'bg-emerald-100 text-emerald-700'
                  }`}>{prevStage.stage}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold ${tw(dm, 'body')}`}>{prevStage.title}</div>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {prevStage.addedItems.slice(0, 2).map((item, i) => (
                        <span key={i} className={`text-xs px-1.5 py-0.5 rounded font-mono ${dm ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`} style={{ fontSize: 9 }}>
                          {item.split('/')[0]}/
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Patterns tab ──────────────────────────────────────────────────────────────

function PatternsTab({ dm }: { dm: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const goodPatterns = archPatterns.filter(p => p.type === 'good-pattern');
  const antiPatterns = archPatterns.filter(p => p.type === 'anti-pattern');

  const SEVERITY_COLORS: Record<string, string> = {
    low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626',
  };

  function PatternCard({ pattern }: { pattern: ArchPattern }) {
    const isOpen = expanded === pattern.id;
    const isAnti = pattern.type === 'anti-pattern';
    const sevColor = pattern.severity ? SEVERITY_COLORS[pattern.severity] : undefined;

    return (
      <motion.div
        layout
        className={`rounded-2xl border overflow-hidden ${
          isAnti
            ? dm ? 'border-red-800/50 bg-red-900/10' : 'border-red-200 bg-red-50'
            : dm ? 'border-emerald-800/50 bg-emerald-900/10' : 'border-emerald-200 bg-emerald-50'
        }`}
      >
        <button
          onClick={() => setExpanded(isOpen ? null : pattern.id)}
          className="w-full p-4 text-left flex items-start gap-3"
        >
          <span className="text-xl mt-0.5">{isAnti ? '❌' : '✅'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-sm font-bold ${tw(dm, 'heading')}`}>{pattern.title}</span>
              <Badge color={isAnti ? '#ef4444' : '#10b981'}>{pattern.category}</Badge>
              {sevColor && <Badge color={sevColor}>{pattern.severity}</Badge>}
            </div>
            <p className={`text-xs leading-relaxed ${tw(dm, 'muted')}`}>{pattern.description}</p>
          </div>
          {isOpen ? <ChevronUp size={16} className={tw(dm, 'muted')} /> : <ChevronDown size={16} className={tw(dm, 'muted')} />}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={`px-4 pb-4 space-y-3 border-t ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
                {/* Code example */}
                <div className="pt-3">
                  <SectionLabel dm={dm} className="mb-1.5">Example</SectionLabel>
                  <pre className={`text-xs rounded-xl p-3 overflow-x-auto leading-relaxed ${dm ? 'bg-slate-900 text-emerald-300' : 'bg-slate-900 text-emerald-400'}`}>
                    {pattern.example}
                  </pre>
                </div>

                {/* Consequence */}
                <div className={`p-3 rounded-xl border-l-4 ${
                  isAnti ? 'border-red-500 bg-red-500/10' : 'border-emerald-500 bg-emerald-500/10'
                }`}>
                  <div className={`text-xs font-bold mb-1 ${isAnti ? 'text-red-500' : 'text-emerald-500'}`}>
                    {isAnti ? '⚠️ What Goes Wrong' : '✓ Why This Works'}
                  </div>
                  <p className={`text-xs leading-relaxed ${tw(dm, 'body')}`}>{pattern.consequence}</p>
                </div>

                {/* Fix */}
                {pattern.fix && (
                  <div className={`p-3 rounded-xl ${dm ? 'bg-sky-900/20 border border-sky-800/40' : 'bg-sky-50 border border-sky-200'}`}>
                    <div className={`text-xs font-bold mb-1 ${dm ? 'text-sky-300' : 'text-sky-700'}`}>🔧 The Fix</div>
                    <p className={`text-xs leading-relaxed ${dm ? 'text-sky-200' : 'text-sky-800'}`}>{pattern.fix}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Good patterns */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-emerald-500" />
          <SectionLabel dm={dm}>Good Patterns — Do These</SectionLabel>
        </div>
        <div className="space-y-3">
          {goodPatterns.map(p => <PatternCard key={p.id} pattern={p} />)}
        </div>
      </div>

      {/* Anti-patterns */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-red-500" />
          <SectionLabel dm={dm}>Anti-Patterns — Avoid These</SectionLabel>
        </div>
        <div className="space-y-3">
          {antiPatterns.map(p => <PatternCard key={p.id} pattern={p} />)}
        </div>
      </div>
    </div>
  );
}

// ── Main page export ──────────────────────────────────────────────────────────

export function ArchitectureExplorerPage() {
  const { darkMode } = useAppStore();
  const dm = darkMode;
  const [activeTab, setActiveTab] = useState<TabId>('map');

  return (
    <div className={`min-h-full flex flex-col ${tw(dm, 'page')}`}>
      {/* Page header */}
      <div className={`border-b px-4 pt-5 pb-0 ${tw(dm, 'border')}`}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-lg shrink-0">
            🏗️
          </div>
          <div>
            <h1 className={`text-xl font-bold ${tw(dm, 'heading')}`}>Claude Architecture Explorer</h1>
            <p className={`text-sm mt-0.5 ${tw(dm, 'muted')}`}>
              Interactively explore how real Claude-native AI engineering systems are structured, why each layer exists, and how everything connects.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-colors border-b-2 ${
                activeTab === tab.id
                  ? dm ? 'text-white border-violet-400 bg-slate-800/50' : 'text-violet-700 border-violet-500 bg-violet-50/50'
                  : `${tw(dm, 'muted')} border-transparent hover:${dm ? 'text-slate-300' : 'text-slate-600'}`
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
            style={{ height: 'calc(100vh - 148px)', overflowY: activeTab === 'map' ? 'hidden' : 'auto' }}
          >
            {activeTab === 'map' && <ArchitectureMapTab dm={dm} />}
            {activeTab === 'flows' && <SystemFlowsTab dm={dm} />}
            {activeTab === 'evolution' && <EvolutionTab dm={dm} />}
            {activeTab === 'patterns' && <PatternsTab dm={dm} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
