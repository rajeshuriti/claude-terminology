import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ChevronRight, Play, Pause, SkipForward, RotateCcw, Shield, Zap, CheckCircle2, Lock } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { tw } from '@/lib/dm';
import { SectionLabel, Badge, CollapsibleSection } from '@/components/ui';
import {
  archNodes, flowSimulations, evolutionStages, archPatterns,
  LAYER_META, nodeDeepContent, learningPath,
} from '@/data/architectureExplorerData';
import type { ArchNode, FlowSimulation, EvolutionStage, ArchPattern, DeepNodeContent } from '@/data/architectureExplorerData';

type TabId = 'map' | 'flows' | 'evolution' | 'patterns' | 'learn';
type ViewMode = 'beginner' | 'developer' | 'architect' | 'enterprise' | 'ai-engineering';
type DTab = 'overview' | 'files' | 'usage' | 'patterns';
type ChildTab = 'overview' | 'code';

const TABS: Array<{ id: TabId; label: string; emoji: string }> = [
  { id: 'map', label: 'Architecture Map', emoji: '🗺️' },
  { id: 'flows', label: 'System Flows', emoji: '⚡' },
  { id: 'evolution', label: 'Evolution', emoji: '📈' },
  { id: 'patterns', label: 'Patterns', emoji: '🎯' },
  { id: 'learn', label: 'Learning Path', emoji: '🎓' },
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

// ── VS Code-style file tree ───────────────────────────────────────────────────

const VIEW_MODE_BANNERS: Record<ViewMode, { label: string; color: string; hint: string }> = {
  'beginner':       { label: '📚 Conceptual',    color: '#10b981', hint: 'Focus: what is each piece and why does it exist?' },
  'developer':      { label: '💻 Developer',      color: '#0ea5e9', hint: 'Focus: how to work with each piece, file structure, examples.' },
  'architect':      { label: '🏗️ Architect',     color: '#8b5cf6', hint: 'Focus: how everything connects and why dependencies exist.' },
  'enterprise':     { label: '🏢 Enterprise',     color: '#ef4444', hint: 'Focus: security risks, governance, compliance implications.' },
  'ai-engineering': { label: '🤖 AI Engineering', color: '#f59e0b', hint: 'Focus: how agents, MCP, and orchestration layers interact.' },
};

function FileTree({ selectedNodeId, selectedSubIdx, selectedChildName, onSelectNode, onSelectSubItem, onSelectChild, viewMode, search, dm }: {
  selectedNodeId: string;
  selectedSubIdx: number | null;
  selectedChildName: string | null;
  onSelectNode: (id: string) => void;
  onSelectSubItem: (nodeId: string, idx: number) => void;
  onSelectChild: (nodeId: string, idx: number, childName: string) => void;
  viewMode: ViewMode;
  search: string;
  dm: boolean;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['claude-dir', 'agents', 'mcp']));
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(() => new Set(['claude-dir/0', 'claude-dir/1']));

  useEffect(() => {
    if (viewMode === 'beginner') {
      setExpanded(new Set());
      setExpandedSubs(new Set());
    } else {
      setExpanded(new Set(['claude-dir', 'agents', 'mcp']));
      setExpandedSubs(new Set(['claude-dir/0', 'claude-dir/1']));
    }
  }, [viewMode]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSubExpand = (key: string) => {
    setExpandedSubs(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const visibleNodes = archNodes.filter(n => {
    if (viewMode === 'beginner' && n.layer > 2) return false;
    const q = search.toLowerCase();
    if (q) return (
      n.label.toLowerCase().includes(q) ||
      n.tagline.toLowerCase().includes(q) ||
      (n.subItems ?? []).some(s => s.name.toLowerCase().includes(q))
    );
    return true;
  });

  const treeBg = dm ? '#0f172a' : '#f1f5f9';
  const selectedBg = dm ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)';
  const hoverBg = dm ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

  return (
    <div
      className="shrink-0 h-full flex flex-col overflow-hidden border-r select-none"
      style={{ width: 260, background: treeBg, borderColor: dm ? '#1e293b' : '#e2e8f0' }}
    >
      {/* Explorer header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: dm ? '#1e293b' : '#e2e8f0', background: treeBg }}
      >
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: dm ? '#64748b' : '#94a3b8', fontSize: 10 }}>Explorer</span>
        <span className="text-xs font-mono" style={{ color: dm ? '#475569' : '#94a3b8', fontSize: 9 }}>claude-native-project</span>
      </div>

      {/* Root folder label */}
      <div className="flex items-center gap-1.5 px-2 py-1.5" style={{ color: dm ? '#94a3b8' : '#64748b' }}>
        <ChevronDown size={11} />
        <span className="text-xs font-bold uppercase tracking-wide" style={{ fontSize: 10 }}>CLAUDE-NATIVE-PROJECT</span>
      </div>

      {/* Tree items */}
      <div className="flex-1 overflow-y-auto">
        {visibleNodes.map(node => {
          const isNodeSelected = selectedNodeId === node.id && selectedSubIdx === null;
          const isExpanded = expanded.has(node.id);
          const hasChildren = (node.subItems?.length ?? 0) > 0 && viewMode !== 'beginner';
          const layer = LAYER_META[node.layer];
          const isAiCore = node.type === 'agent' || node.type === 'mcp-node';

          return (
            <div key={node.id}>
              {/* Node row */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectNode(node.id)}
                onKeyDown={e => e.key === 'Enter' && onSelectNode(node.id)}
                className="flex items-center gap-0 py-0.5 cursor-pointer transition-colors"
                style={{
                  paddingLeft: 8,
                  background: isNodeSelected ? selectedBg : undefined,
                  borderLeft: isNodeSelected ? `2px solid #6366f1` : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!isNodeSelected) (e.currentTarget as HTMLElement).style.background = hoverBg; }}
                onMouseLeave={e => { if (!isNodeSelected) (e.currentTarget as HTMLElement).style.background = ''; }}
              >
                {/* Expand chevron */}
                <span
                  onClick={e => { e.stopPropagation(); if (hasChildren) toggleExpand(node.id); }}
                  className="flex items-center justify-center shrink-0 transition-colors"
                  style={{ width: 18, height: 22, color: dm ? '#475569' : '#94a3b8', cursor: hasChildren ? 'pointer' : 'default', opacity: hasChildren ? 1 : 0 }}
                >
                  {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                </span>

                {/* Emoji icon */}
                <span style={{ fontSize: 13, lineHeight: 1, marginRight: 5 }}>{node.emoji}</span>

                {/* Label */}
                <span
                  className="flex-1 truncate font-mono"
                  style={{
                    fontSize: 12,
                    color: isNodeSelected
                      ? (dm ? '#e2e8f0' : '#1e293b')
                      : isAiCore && viewMode === 'ai-engineering'
                        ? node.color
                        : (dm ? '#cbd5e1' : '#475569'),
                    fontWeight: isNodeSelected ? 600 : 400,
                  }}
                >
                  {node.label}
                </span>

                {/* View-mode badges */}
                {viewMode === 'architect' && node.relationships.length > 0 && (
                  <span className="shrink-0 mr-2 font-mono" style={{ fontSize: 10, color: '#6366f1', opacity: 0.8 }}>
                    →{node.relationships.length}
                  </span>
                )}
                {viewMode === 'enterprise' && node.security && (
                  <Lock size={9} className="shrink-0 mr-2" style={{ color: '#ef4444' }} />
                )}
                {viewMode === 'ai-engineering' && isAiCore && (
                  <span className="shrink-0 mr-2 w-1.5 h-1.5 rounded-full" style={{ background: node.color }} />
                )}
                {viewMode === 'developer' && (
                  <span className="shrink-0 mr-2 font-mono" style={{ fontSize: 9, color: layer.color, opacity: 0.7 }}>
                    {COMPLEXITY_COLORS[node.complexity].label.toLowerCase()}
                  </span>
                )}
              </div>

              {/* Sub-items (level 2) */}
              <AnimatePresence>
                {isExpanded && hasChildren && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    {node.subItems?.map((item, idx) => {
                      const isSubSelected = selectedNodeId === node.id && selectedSubIdx === idx;
                      const subKey = `${node.id}/${idx}`;
                      const hasSubChildren = (item.children?.length ?? 0) > 0;
                      const isSubExpanded = expandedSubs.has(subKey);
                      return (
                        <div key={item.name}>
                          {/* Sub-item row */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              onSelectSubItem(node.id, idx);
                              if (hasSubChildren) toggleSubExpand(subKey);
                            }}
                            onKeyDown={e => e.key === 'Enter' && onSelectSubItem(node.id, idx)}
                            className="flex items-center gap-0 py-0.5 cursor-pointer transition-colors"
                            style={{
                              paddingLeft: 30,
                              background: isSubSelected ? selectedBg : undefined,
                              borderLeft: isSubSelected ? `2px solid #6366f1` : '2px solid transparent',
                            }}
                            onMouseEnter={e => { if (!isSubSelected) (e.currentTarget as HTMLElement).style.background = hoverBg; }}
                            onMouseLeave={e => { if (!isSubSelected) (e.currentTarget as HTMLElement).style.background = ''; }}
                          >
                            {/* Expand chevron for sub-folder */}
                            <span
                              onClick={e => { e.stopPropagation(); if (hasSubChildren) toggleSubExpand(subKey); }}
                              style={{ width: 16, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: dm ? '#475569' : '#94a3b8', cursor: hasSubChildren ? 'pointer' : 'default', opacity: hasSubChildren ? 1 : 0 }}
                            >
                              {isSubExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                            </span>
                            <span style={{ fontSize: 12, lineHeight: 1, marginRight: 5 }}>{item.emoji}</span>
                            <span
                              className="flex-1 truncate font-mono"
                              style={{
                                fontSize: 12,
                                color: isSubSelected
                                  ? (dm ? '#e2e8f0' : '#1e293b')
                                  : (dm ? '#94a3b8' : '#64748b'),
                                fontWeight: isSubSelected ? 600 : 400,
                              }}
                            >
                              {item.name}
                            </span>
                          </div>

                          {/* Children (level 3) */}
                          <AnimatePresence>
                            {isSubExpanded && hasSubChildren && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.12 }}
                                className="overflow-hidden"
                              >
                                {item.children?.map(child => {
                                  const isChildSelected = selectedNodeId === node.id && selectedSubIdx === idx && selectedChildName === child.name;
                                  return (
                                    <div
                                      key={child.name}
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => onSelectChild(node.id, idx, child.name)}
                                      onKeyDown={e => e.key === 'Enter' && onSelectChild(node.id, idx, child.name)}
                                      className="flex items-center gap-0 py-0.5 cursor-pointer"
                                      style={{
                                        paddingLeft: 52,
                                        background: isChildSelected ? selectedBg : undefined,
                                        borderLeft: isChildSelected ? '2px solid #6366f1' : '2px solid transparent',
                                      }}
                                      onMouseEnter={e => { if (!isChildSelected) (e.currentTarget as HTMLElement).style.background = hoverBg; }}
                                      onMouseLeave={e => { if (!isChildSelected) (e.currentTarget as HTMLElement).style.background = ''; }}
                                    >
                                      <span style={{ width: 16, height: 18, flexShrink: 0 }} />
                                      <span style={{ fontSize: 11, lineHeight: 1, marginRight: 4 }}>{child.emoji}</span>
                                      <span
                                        className="flex-1 truncate font-mono"
                                        style={{
                                          fontSize: 11,
                                          color: isChildSelected ? (dm ? '#e2e8f0' : '#1e293b') : (dm ? '#64748b' : '#94a3b8'),
                                          fontWeight: isChildSelected ? 600 : 400,
                                        }}
                                      >
                                        {child.name}
                                      </span>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom legend */}
      <div className="px-3 py-2 border-t" style={{ borderColor: dm ? '#1e293b' : '#e2e8f0' }}>
        <div className="text-xs" style={{ color: dm ? '#475569' : '#94a3b8', fontSize: 10 }}>
          {archNodes.length} items · {viewMode === 'beginner' ? 'simplified view' : 'full tree'}
        </div>
      </div>
    </div>
  );
}

// ── Shared tab bar used inside detail panels ─────────────────────────────────

function DetailTabBar<T extends string>({ tabs, active, onSelect, dm }: {
  tabs: Array<{ id: T; label: string }>;
  active: T;
  onSelect: (t: T) => void;
  dm: boolean;
}) {
  return (
    <div className={`flex border-b shrink-0 ${tw(dm, 'border')}`}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)}
          className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px shrink-0 ${
            active === t.id
              ? 'border-violet-500 text-violet-500'
              : `border-transparent ${tw(dm, 'muted')}`
          }`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Shared deep-content tab bodies ───────────────────────────────────────────

function DeepFilesTab({ deep, dm }: { deep: DeepNodeContent; dm: boolean }) {
  return (
    <div className="p-4 space-y-5">
      {deep.sampleFiles.map((file, fi) => (
        <div key={fi}>
          <code className={`text-xs font-mono font-bold block mb-1 ${dm ? 'text-sky-300' : 'text-sky-700'}`}>{file.name}</code>
          <p className={`text-xs mb-2 ${tw(dm, 'muted')}`}>{file.description}</p>
          <pre className={`text-xs rounded-xl p-3 overflow-x-auto leading-relaxed font-mono whitespace-pre ${dm ? 'bg-[#0d1117] text-emerald-300' : 'bg-slate-900 text-emerald-400'}`} style={{ fontSize: 11 }}>
            {file.content}
          </pre>
        </div>
      ))}
    </div>
  );
}

function DeepUsageTab({ deep, nodeColor, dm }: { deep: DeepNodeContent; nodeColor: string; dm: boolean }) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <SectionLabel dm={dm} className="mb-2">How Claude Uses This</SectionLabel>
        <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{deep.claudeUsage}</p>
      </div>
      <div>
        <SectionLabel dm={dm} className="mb-2">Step-by-Step Workflow</SectionLabel>
        <div className="space-y-2">
          {deep.workflow.map((step, i) => (
            <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${tw(dm, 'cardAlt')}`}>
              <span className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5" style={{ background: nodeColor, minWidth: 20 }}>{i + 1}</span>
              <div className="min-w-0">
                <span className={`text-xs font-semibold ${tw(dm, 'body')}`}>{step.actor}: </span>
                <span className={`text-xs ${tw(dm, 'muted')}`}>{step.action}</span>
                {step.detail && <p className={`text-xs mt-0.5 italic ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{step.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 rounded-xl border-l-4" style={{ borderColor: nodeColor, background: nodeColor + '10' }}>
        <div className="text-xs font-bold mb-1" style={{ color: nodeColor }}>Key Insight</div>
        <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{deep.keyInsight}</p>
      </div>
    </div>
  );
}

function DeepPatternsTab({ deep, dm }: { deep: DeepNodeContent; dm: boolean }) {
  return (
    <div className="p-4 space-y-4">
      <div className={`rounded-xl border overflow-hidden ${dm ? 'border-emerald-800/50 bg-emerald-900/10' : 'border-emerald-200 bg-emerald-50'}`}>
        <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: dm ? 'rgba(6,78,59,0.4)' : '#a7f3d0' }}>
          <span>✅</span>
          <span className={`text-xs font-bold ${dm ? 'text-emerald-300' : 'text-emerald-700'}`}>{deep.goodPattern.title}</span>
        </div>
        <div className="p-3 space-y-2">
          <pre className={`text-xs rounded-lg p-2.5 overflow-x-auto font-mono whitespace-pre ${dm ? 'bg-[#0d1117] text-emerald-300' : 'bg-slate-900 text-emerald-400'}`}>{deep.goodPattern.content}</pre>
          <p className={`text-xs leading-relaxed ${tw(dm, 'body')}`}>{deep.goodPattern.explanation}</p>
        </div>
      </div>
      <div className={`rounded-xl border overflow-hidden ${dm ? 'border-red-800/50 bg-red-900/10' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: dm ? 'rgba(127,29,29,0.4)' : '#fca5a5' }}>
          <span>❌</span>
          <span className={`text-xs font-bold ${dm ? 'text-red-300' : 'text-red-700'}`}>{deep.antiPattern.title}</span>
        </div>
        <div className="p-3 space-y-2">
          <pre className={`text-xs rounded-lg p-2.5 overflow-x-auto font-mono whitespace-pre ${dm ? 'bg-[#0d1117] text-red-300' : 'bg-slate-900 text-red-400'}`}>{deep.antiPattern.content}</pre>
          <div className={`p-2.5 rounded-lg text-xs ${dm ? 'bg-red-900/15 text-red-200' : 'bg-red-50 text-red-700'}`}>
            <span className="font-bold">⚠️ What goes wrong: </span>{deep.antiPattern.consequence}
          </div>
          <div className={`p-2.5 rounded-lg text-xs ${dm ? 'bg-sky-900/15 text-sky-200' : 'bg-sky-50 text-sky-700'}`}>
            <span className="font-bold">🔧 The fix: </span>{deep.antiPattern.fix}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-item detail panel ─────────────────────────────────────────────────────

function SubItemDetail({ nodeId, idx, dm }: { nodeId: string; idx: number; dm: boolean }) {
  const [dTab, setDTab] = useState<DTab>('overview');
  const node = archNodes.find(n => n.id === nodeId);
  if (!node || !node.subItems) return null;
  const item = node.subItems[idx];
  const layer = LAYER_META[node.layer];
  const deepKey = `${nodeId}/${item.name}`;
  const deep = nodeDeepContent[deepKey];

  useEffect(() => setDTab('overview'), [nodeId, idx]);

  const tabs: Array<{ id: DTab; label: string }> = [
    { id: 'overview', label: '📖 Overview' },
    ...(deep ? [
      { id: 'files' as DTab, label: '📄 Files' },
      { id: 'usage' as DTab, label: '⚡ Usage' },
      { id: 'patterns' as DTab, label: '🎯 Patterns' },
    ] : []),
  ];

  return (
    <motion.div
      key={`${nodeId}-${idx}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col h-full ${tw(dm, 'card')}`}
    >
      {/* Breadcrumb header */}
      <div className="p-4 border-b" style={{ borderColor: node.color + '40', background: node.color + '10' }}>
        <div className={`flex items-center gap-1.5 text-xs font-mono mb-2 ${tw(dm, 'muted')}`}>
          <span>{node.emoji}</span><span>{node.label}</span>
          <ChevronRight size={10} /><span style={{ color: node.color }}>{item.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{item.emoji}</span>
          <code className={`text-base font-mono font-bold ${tw(dm, 'heading')}`}>{item.name}</code>
        </div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge color={layer.color}>{layer.label}</Badge>
          <Badge color={node.color}>{node.label}</Badge>
        </div>
      </div>

      {deep && <DetailTabBar tabs={tabs} active={dTab} onSelect={setDTab} dm={dm} />}

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {dTab === 'overview' && (
            <motion.div key="sub-overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <div className="p-4 space-y-5">
                <DescriptionRenderer text={item.description} dm={dm} />
                {item.example && (
                  <div>
                    <SectionLabel dm={dm} className="mb-1.5">Quick Example</SectionLabel>
                    <pre className={`text-xs rounded-xl p-3 overflow-x-auto leading-relaxed font-mono ${dm ? 'bg-[#0d1117] text-emerald-300' : 'bg-slate-900 text-emerald-400'}`}>{item.example}</pre>
                  </div>
                )}
                <div className="p-3 rounded-xl border-l-4" style={{ borderColor: node.color, background: node.color + '10' }}>
                  <div className="text-xs font-bold mb-1" style={{ color: node.color }}>Part of {node.label}</div>
                  <p className={`text-xs leading-relaxed ${tw(dm, 'body')}`}>{node.tagline}</p>
                </div>
              </div>
            </motion.div>
          )}
          {dTab === 'files' && deep && (
            <motion.div key="sub-files" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <DeepFilesTab deep={deep} dm={dm} />
            </motion.div>
          )}
          {dTab === 'usage' && deep && (
            <motion.div key="sub-usage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <DeepUsageTab deep={deep} nodeColor={node.color} dm={dm} />
            </motion.div>
          )}
          {dTab === 'patterns' && deep && (
            <motion.div key="sub-patterns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <DeepPatternsTab deep={deep} dm={dm} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Structured description renderer ─────────────────────────────────────────

function DescriptionRenderer({ text, dm }: { text: string; dm: boolean }) {
  const blocks = text.trim().split('\n\n');
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        const first = lines[0];

        if (first.startsWith('## ')) {
          const heading = first.slice(3);
          const rest = lines.slice(1).filter(Boolean);
          const isBulletBlock = rest.length > 0 && rest.every(l => l.startsWith('- '));
          return (
            <div key={i}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${dm ? 'text-violet-400' : 'text-violet-600'}`}>
                {heading}
              </div>
              {isBulletBlock ? (
                <ul className="space-y-1.5">
                  {rest.map((l, j) => (
                    <li key={j} className={`flex items-start gap-2 text-sm ${tw(dm, 'body')}`}>
                      <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">{l.slice(2)}</span>
                    </li>
                  ))}
                </ul>
              ) : rest.length > 0 ? (
                <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{rest.join(' ')}</p>
              ) : null}
            </div>
          );
        }

        const allBullets = lines.every(l => l.startsWith('- ') || l === '');
        if (allBullets) {
          return (
            <ul key={i} className="space-y-1.5">
              {lines.filter(Boolean).map((l, j) => (
                <li key={j} className={`flex items-start gap-2 text-sm ${tw(dm, 'body')}`}>
                  <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{l.slice(2)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return <p key={i} className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{block}</p>;
      })}
    </div>
  );
}

// ── Child file detail panel ───────────────────────────────────────────────────

function ChildFileDetail({ nodeId, subIdx, childName, dm }: {
  nodeId: string;
  subIdx: number;
  childName: string;
  dm: boolean;
}) {
  const [tab, setTab] = useState<ChildTab>('overview');
  const node = archNodes.find(n => n.id === nodeId);
  useEffect(() => setTab('overview'), [nodeId, subIdx, childName]);

  if (!node?.subItems) return null;
  const subItem = node.subItems[subIdx];
  const child = subItem.children?.find(c => c.name === childName);
  if (!child) return null;

  const tabs: Array<{ id: ChildTab; label: string }> = [
    { id: 'overview', label: '📖 Overview' },
    ...(child.sampleCode ? [{ id: 'code' as ChildTab, label: '💻 Sample Code' }] : []),
  ];

  return (
    <motion.div
      key={`${nodeId}-${subIdx}-${childName}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col h-full ${tw(dm, 'card')}`}
    >
      {/* Breadcrumb header */}
      <div className="p-4 border-b" style={{ borderColor: node.color + '40', background: node.color + '10' }}>
        <div className={`flex items-center gap-1.5 text-xs font-mono mb-2 ${tw(dm, 'muted')}`}>
          <span>{node.emoji}</span><span>{node.label}</span>
          <ChevronRight size={10} />
          <span style={{ color: node.color }}>{subItem.name}</span>
          <ChevronRight size={10} />
          <span className={tw(dm, 'heading')}>{child.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{child.emoji}</span>
          <code className={`text-base font-mono font-bold ${tw(dm, 'heading')}`}>{child.name}</code>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge color={node.color}>{node.label}</Badge>
          {child.language && <Badge color="#64748b">{child.language}</Badge>}
        </div>
      </div>

      {tabs.length > 1 && <DetailTabBar tabs={tabs} active={tab} onSelect={setTab} dm={dm} />}

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div key="child-overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <div className="p-4 space-y-5">
                <DescriptionRenderer text={child.description ?? subItem.description} dm={dm} />
                <div className="p-3 rounded-xl border-l-4" style={{ borderColor: node.color, background: node.color + '10' }}>
                  <div className="text-xs font-bold mb-1" style={{ color: node.color }}>Part of {subItem.name}</div>
                  <p className={`text-xs leading-relaxed ${tw(dm, 'body')}`}>{subItem.description}</p>
                </div>
              </div>
            </motion.div>
          )}
          {tab === 'code' && child.sampleCode && (
            <motion.div key="child-code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <div className="p-4">
                <SectionLabel dm={dm} className="mb-2">Sample Code — {child.name}</SectionLabel>
                <pre
                  className={`text-xs rounded-xl p-4 overflow-x-auto leading-relaxed font-mono whitespace-pre ${
                    dm ? 'bg-[#0d1117] text-emerald-300' : 'bg-slate-900 text-emerald-400'
                  }`}
                  style={{ fontSize: 11 }}
                >
                  {child.sampleCode}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Node detail panel — each view mode shows a completely different angle ─────

function NodeDetailPanel({ node, viewMode, dm, onNavigate }: {
  node: ArchNode;
  viewMode: ViewMode;
  dm: boolean;
  onNavigate: (id: string) => void;
}) {
  const layer = LAYER_META[node.layer];
  const banner = VIEW_MODE_BANNERS[viewMode];
  const relNodes = node.relationships
    .map(r => ({ rel: r, rn: archNodes.find(n => n.id === r.targetId) }))
    .filter(x => x.rn);

  const Header = () => (
    <div className="p-4 border-b" style={{ borderColor: node.color + '40', background: node.color + '12' }}>
      {/* View-mode banner */}
      <div
        className="flex items-center gap-2 px-2 py-1 rounded-lg mb-3 text-xs font-medium"
        style={{ background: banner.color + '18', color: banner.color }}
      >
        <span>{banner.label}</span>
        <span className="opacity-60">— {banner.hint}</span>
      </div>
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none">{node.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className={`text-base font-bold font-mono ${tw(dm, 'heading')}`}>{node.label}</div>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <Badge color={layer.color}>{layer.label}</Badge>
            <Badge color={node.color}>{COMPLEXITY_COLORS[node.complexity].label}</Badge>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── BEGINNER: analogy-first, no jargon ── */
  if (viewMode === 'beginner') {
    return (
      <motion.div key={`${node.id}-beginner`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className={`flex flex-col h-full overflow-y-auto ${tw(dm, 'card')}`}>
        <Header />
        <div className="p-4 space-y-4">
          <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{node.whatItIs.split('.')[0]}.</p>
          <div className="p-4 rounded-2xl border-2" style={{ borderColor: node.color, background: node.color + '10' }}>
            <div className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: node.color }}>💡 Think of it like…</div>
            <div className={`text-base font-bold mb-2 ${tw(dm, 'heading')}`}>{node.analogy}</div>
            <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{node.analogyDetail}</p>
          </div>
          <div>
            <SectionLabel dm={dm} className="mb-2">What it helps you do</SectionLabel>
            <ul className="space-y-2">
              {node.useCases.slice(0, 3).map((uc, i) => (
                <li key={i} className={`flex items-start gap-2 text-sm ${tw(dm, 'body')}`}>
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>{uc}
                </li>
              ))}
            </ul>
          </div>
          <div className={`p-3 rounded-xl text-xs ${dm ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
            Switch to <strong>Developer</strong> mode to see file structure and examples →
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── DEVELOPER: what + file structure + examples ── */
  if (viewMode === 'developer') {
    return (
      <motion.div key={`${node.id}-developer`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className={`flex flex-col h-full overflow-y-auto ${tw(dm, 'card')}`}>
        <Header />
        <div className="p-4 space-y-4">
          <div>
            <SectionLabel dm={dm} className="mb-1.5">What It Is</SectionLabel>
            <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{node.whatItIs}</p>
          </div>
          {node.subItems && node.subItems.length > 0 && (
            <div>
              <SectionLabel dm={dm} className="mb-2">File Structure</SectionLabel>
              <div className={`rounded-xl overflow-hidden border font-mono ${tw(dm, 'border')}`}>
                <div className={`px-3 py-1.5 text-xs font-bold border-b ${tw(dm, 'borderSub')} ${tw(dm, 'muted')}`}>
                  {node.label}
                </div>
                {node.subItems.map((item, i) => (
                  <div
                    key={item.name}
                    className={`flex items-start gap-2 px-3 py-2 border-b last:border-0 ${tw(dm, 'borderSub')}`}
                  >
                    <span className="text-sm shrink-0 mt-0.5">{item.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <code className={`text-xs font-mono font-semibold ${dm ? 'text-sky-300' : 'text-sky-700'}`}>{item.name}</code>
                      <p className={`text-xs mt-0.5 leading-relaxed ${tw(dm, 'muted')}`}>{item.description}</p>
                      {item.example && (
                        <span className={`text-xs font-mono mt-1 block ${dm ? 'text-emerald-400' : 'text-emerald-700'}`} style={{ fontSize: 10 }}>
                          eg: {item.example}
                        </span>
                      )}
                    </div>
                    <span className="text-xs shrink-0 mt-0.5" style={{ color: node.color, fontSize: 10 }}>{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <CollapsibleSection dm={dm} title={`Use Cases (${node.useCases.length})`} defaultOpen>
            <ul className="p-3 space-y-1.5">
              {node.useCases.map((uc, i) => (
                <li key={i} className={`flex items-start gap-2 text-xs ${tw(dm, 'body')}`}>
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>{uc}
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        </div>
      </motion.div>
    );
  }

  /* ── ARCHITECT: connections-first, dependency map ── */
  if (viewMode === 'architect') {
    return (
      <motion.div key={`${node.id}-architect`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className={`flex flex-col h-full overflow-y-auto ${tw(dm, 'card')}`}>
        <Header />
        <div className="p-4 space-y-4">
          <div>
            <SectionLabel dm={dm} className="mb-1.5">Why It Exists</SectionLabel>
            <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{node.whyItExists}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SectionLabel dm={dm}>Architecture Connections</SectionLabel>
              <Badge color={node.color}>{relNodes.length} links</Badge>
            </div>
            {relNodes.length > 0 ? (
              <div className="space-y-2">
                {relNodes.map(({ rel, rn }) => rn && (
                  <button
                    key={rel.targetId}
                    onClick={() => onNavigate(rel.targetId)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${tw(dm, 'cardAlt', 'border', 'hover')}`}
                  >
                    <span className="text-lg shrink-0">{rn.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-mono font-semibold ${tw(dm, 'heading')}`}>{rn.label}</div>
                      <div className={`text-xs ${tw(dm, 'muted')}`}>{rel.label}</div>
                    </div>
                    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: rn.color + '20', color: rn.color }}>
                      {rel.type}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className={`text-xs ${tw(dm, 'muted')}`}>No outgoing relationships defined.</p>
            )}
          </div>
          <CollapsibleSection dm={dm} title="What It Is">
            <p className={`p-3 text-sm leading-relaxed ${tw(dm, 'body')}`}>{node.whatItIs}</p>
          </CollapsibleSection>
          <div className={`p-3 rounded-xl border-l-4`} style={{ borderColor: node.color, background: node.color + '10' }}>
            <div className="text-xs font-bold mb-1" style={{ color: node.color }}>Analogy</div>
            <div className={`text-sm font-semibold ${tw(dm, 'heading')}`}>{node.analogy}</div>
            <p className={`text-xs mt-1 leading-relaxed ${tw(dm, 'body')}`}>{node.analogyDetail}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── ENTERPRISE: security-first, governance focus ── */
  if (viewMode === 'enterprise') {
    return (
      <motion.div key={`${node.id}-enterprise`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className={`flex flex-col h-full overflow-y-auto ${tw(dm, 'card')}`}>
        <Header />
        <div className="p-4 space-y-4">
          {node.security ? (
            <div className={`p-4 rounded-xl border-2 ${dm ? 'bg-red-900/15 border-red-700/50' : 'bg-red-50 border-red-300'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} className="text-red-500 shrink-0" />
                <span className="text-sm font-bold text-red-500">Security Consideration</span>
              </div>
              <p className={`text-sm leading-relaxed ${dm ? 'text-red-200' : 'text-red-800'}`}>{node.security}</p>
            </div>
          ) : (
            <div className={`p-3 rounded-xl border ${dm ? 'bg-emerald-900/15 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span className={`text-xs font-semibold ${dm ? 'text-emerald-300' : 'text-emerald-700'}`}>No specific security concerns documented for this component.</span>
              </div>
            </div>
          )}
          <div>
            <SectionLabel dm={dm} className="mb-1.5">Why It Exists (Governance Context)</SectionLabel>
            <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{node.whyItExists}</p>
          </div>
          <div>
            <SectionLabel dm={dm} className="mb-2">Enterprise Use Cases</SectionLabel>
            <ul className="space-y-1.5">
              {node.useCases.map((uc, i) => (
                <li key={i} className={`flex items-start gap-2 text-xs ${tw(dm, 'body')}`}>
                  <span className="text-slate-400 mt-0.5 shrink-0 font-mono">{String(i + 1).padStart(2, '0')}.</span>{uc}
                </li>
              ))}
            </ul>
          </div>
          <div className={`p-3 rounded-xl ${tw(dm, 'section', 'border')} border`}>
            <SectionLabel dm={dm} className="mb-1.5">Complexity Tier</SectionLabel>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${dm ? COMPLEXITY_COLORS[node.complexity].dark : `${COMPLEXITY_COLORS[node.complexity].bg} ${COMPLEXITY_COLORS[node.complexity].text}`}`}>
                {COMPLEXITY_COLORS[node.complexity].label}
              </span>
              <span className={`text-xs ${tw(dm, 'muted')}`}>— adopt when your team size and system complexity justify it</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── AI ENGINEERING: orchestration + AI context ── */
  return (
    <motion.div key={`${node.id}-ai`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={`flex flex-col h-full overflow-y-auto ${tw(dm, 'card')}`}>
      <Header />
      <div className="p-4 space-y-4">
        <div className={`p-3 rounded-xl border-l-4`} style={{ borderColor: node.color, background: node.color + '10' }}>
          <div className="text-xs font-bold mb-1" style={{ color: node.color }}>AI Role</div>
          <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{node.whatItIs}</p>
        </div>
        <div>
          <SectionLabel dm={dm} className="mb-1.5">Why AI Systems Need This</SectionLabel>
          <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{node.whyItExists}</p>
        </div>
        {node.subItems && node.subItems.length > 0 && (
          <div>
            <SectionLabel dm={dm} className="mb-2">AI-Relevant Sub-components</SectionLabel>
            <div className="space-y-2">
              {node.subItems.map((item) => (
                <div key={item.name} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${tw(dm, 'cardAlt')}`}>
                  <span className="text-base shrink-0">{item.emoji}</span>
                  <div>
                    <code className={`text-xs font-mono font-bold ${dm ? 'text-amber-300' : 'text-amber-700'}`}>{item.name}</code>
                    <p className={`text-xs mt-0.5 leading-relaxed ${tw(dm, 'muted')}`}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {relNodes.length > 0 && (
          <div>
            <SectionLabel dm={dm} className="mb-2">Orchestration Connections</SectionLabel>
            <div className="space-y-1.5">
              {relNodes.map(({ rel, rn }) => rn && (
                <button key={rel.targetId} onClick={() => onNavigate(rel.targetId)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${tw(dm, 'section', 'hover')}`}>
                  <span>{rn.emoji}</span>
                  <span className={`font-mono font-semibold ${tw(dm, 'body')}`}>{rn.label}</span>
                  <span className={`${tw(dm, 'muted')} flex-1`}>— {rel.label}</span>
                  <span className="shrink-0 font-mono" style={{ color: rn.color, fontSize: 10 }}>{rel.type}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Architecture Map tab ──────────────────────────────────────────────────────

function ArchitectureMapTab({ dm }: { dm: boolean }) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('claude-md');
  const [selectedSubIdx, setSelectedSubIdx] = useState<number | null>(null);
  const [selectedChildName, setSelectedChildName] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('developer');
  const [search, setSearch] = useState('');

  const selectedNode = archNodes.find(n => n.id === selectedNodeId) ?? archNodes[0];

  const handleSelectNode = (id: string) => { setSelectedNodeId(id); setSelectedSubIdx(null); setSelectedChildName(null); };
  const handleSelectSubItem = (nodeId: string, idx: number) => { setSelectedNodeId(nodeId); setSelectedSubIdx(idx); setSelectedChildName(null); };
  const handleSelectChild = (nodeId: string, idx: number, childName: string) => { setSelectedNodeId(nodeId); setSelectedSubIdx(idx); setSelectedChildName(childName); };

  return (
    <div className="flex flex-col h-full">
      {/* Top controls */}
      <div className={`flex flex-wrap items-center gap-2 px-4 py-2.5 border-b ${tw(dm, 'border')}`}>
        <div className="flex items-center gap-1 flex-wrap">
          {VIEW_MODES.map(vm => {
            const b = VIEW_MODE_BANNERS[vm.id];
            return (
              <button
                key={vm.id}
                onClick={() => setViewMode(vm.id)}
                title={vm.description}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === vm.id ? 'text-white shadow-sm' : dm ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={viewMode === vm.id ? { background: b.color } : {}}
              >
                {b.label}
              </button>
            );
          })}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search files…"
          className={`px-3 py-1.5 rounded-lg text-xs border outline-none ml-auto font-mono ${tw(dm, 'input')}`}
          style={{ minWidth: 150 }}
        />
      </div>

      {/* Main: tree + detail */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <FileTree
          selectedNodeId={selectedNodeId}
          selectedSubIdx={selectedSubIdx}
          selectedChildName={selectedChildName}
          onSelectNode={handleSelectNode}
          onSelectSubItem={handleSelectSubItem}
          onSelectChild={handleSelectChild}
          viewMode={viewMode}
          search={search}
          dm={dm}
        />

        {/* Detail panel */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {selectedChildName !== null && selectedSubIdx !== null ? (
              <ChildFileDetail key={`${selectedNodeId}-${selectedSubIdx}-${selectedChildName}`} nodeId={selectedNodeId} subIdx={selectedSubIdx} childName={selectedChildName} dm={dm} />
            ) : selectedSubIdx !== null ? (
              <SubItemDetail key={`${selectedNodeId}-${selectedSubIdx}`} nodeId={selectedNodeId} idx={selectedSubIdx} dm={dm} />
            ) : (
              <NodeDetailPanel
                key={`${selectedNodeId}-${viewMode}`}
                node={selectedNode}
                viewMode={viewMode}
                dm={dm}
                onNavigate={handleSelectNode}
              />
            )}
          </AnimatePresence>
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

// ── Learning path guided tour ─────────────────────────────────────────────────

function LearningPathTab({ dm, onSwitchToMap }: { dm: boolean; onSwitchToMap: () => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const current = learningPath[stepIdx];
  const node = archNodes.find(n => n.id === current.nodeId);

  const markComplete = () => {
    setCompletedSteps(prev => new Set([...prev, stepIdx]));
    if (stepIdx < learningPath.length - 1) { setStepIdx(stepIdx + 1); setShowAnswer(false); }
  };
  const goNext = () => { if (stepIdx < learningPath.length - 1) { setStepIdx(stepIdx + 1); setShowAnswer(false); } };
  const goPrev = () => { if (stepIdx > 0) { setStepIdx(stepIdx - 1); setShowAnswer(false); } };

  const progressPct = (completedSteps.size / learningPath.length) * 100;

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={`text-lg font-bold ${tw(dm, 'heading')}`}>🎓 Learn Claude Architecture</h2>
          <p className={`text-xs mt-0.5 ${tw(dm, 'muted')}`}>10 steps · ~27 minutes · beginner to enterprise</p>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-sm font-bold ${tw(dm, 'heading')}`}>{completedSteps.size}/{learningPath.length}</div>
          <div className={`text-xs ${tw(dm, 'muted')}`}>{Math.round(progressPct)}% done</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`h-2 rounded-full overflow-hidden ${dm ? 'bg-slate-800' : 'bg-slate-200'}`}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Step pills */}
      <div className="flex gap-1.5 flex-wrap">
        {learningPath.map((step, i) => (
          <button key={i} onClick={() => { setStepIdx(i); setShowAnswer(false); }}
            title={step.title}
            className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
              i === stepIdx ? 'bg-violet-500 text-white scale-110 shadow-lg shadow-violet-500/30'
              : completedSteps.has(i) ? dm ? 'bg-emerald-700 text-emerald-200' : 'bg-emerald-100 text-emerald-700'
              : dm ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}>
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIdx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className={`rounded-2xl border overflow-hidden ${tw(dm, 'card', 'border')}`}
        >
          {/* Step header */}
          <div className="p-4 border-b" style={{ borderColor: (node?.color ?? '#6366f1') + '40', background: (node?.color ?? '#6366f1') + '10' }}>
            <div className={`flex items-center gap-3`}>
              <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {current.stepNum}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-base font-bold ${tw(dm, 'heading')}`}>{current.title}</div>
                <div className={`flex items-center gap-2 text-xs mt-0.5 ${tw(dm, 'muted')}`}>
                  <span>{node?.emoji} {node?.label}</span>
                  <span>·</span>
                  <span>⏱ {current.estimatedTime}</span>
                </div>
              </div>
              {completedSteps.has(stepIdx) && <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />}
            </div>
          </div>

          {/* Lesson content */}
          <div className="p-5 space-y-4">
            <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{current.lesson}</p>

            {/* Key takeaway */}
            <div className="p-3 rounded-xl border-l-4 border-violet-500" style={{ background: '#7c3aed15' }}>
              <div className="text-xs font-bold text-violet-500 mb-1 uppercase tracking-wide">💡 Key Takeaway</div>
              <p className={`text-sm font-medium leading-relaxed ${tw(dm, 'heading')}`}>{current.keyTakeaway}</p>
            </div>

            {/* Q&A accordion */}
            <div className={`rounded-xl border overflow-hidden ${tw(dm, 'border')}`}>
              <button
                onClick={() => setShowAnswer(p => !p)}
                className={`w-full flex items-center gap-2 p-3 text-left transition-colors ${tw(dm, 'cardAlt', 'hover')}`}
              >
                <span className="text-lg">❓</span>
                <span className={`flex-1 text-sm font-medium ${tw(dm, 'body')}`}>{current.question}</span>
                {showAnswer ? <ChevronUp size={14} className={tw(dm, 'muted')} /> : <ChevronDown size={14} className={tw(dm, 'muted')} />}
              </button>
              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`px-4 py-3 border-t text-sm leading-relaxed ${tw(dm, 'body', 'border')}`}>
                      <span className="text-emerald-500 font-semibold">✅ </span>{current.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action bar */}
          <div className={`flex items-center gap-2 p-4 border-t ${tw(dm, 'border', 'section')}`}>
            <button onClick={goPrev} disabled={stepIdx === 0}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-30 ${tw(dm, 'cardAlt', 'hover')} ${tw(dm, 'body')}`}>
              ← Prev
            </button>
            <button onClick={onSwitchToMap}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${tw(dm, 'cardAlt', 'hover')} ${tw(dm, 'muted')}`}>
              View in Map →
            </button>
            <div className="flex-1" />
            {!completedSteps.has(stepIdx) && (
              <button onClick={markComplete}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                Got it ✓
              </button>
            )}
            {stepIdx < learningPath.length - 1 && (
              <button onClick={goNext}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-violet-500 hover:bg-violet-600 text-white transition-colors">
                Next →
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
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
            {activeTab === 'learn' && <LearningPathTab dm={dm} onSwitchToMap={() => setActiveTab('map')} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
